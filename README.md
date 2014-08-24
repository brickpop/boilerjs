BoilerJS
========

This project is a boilerplate of a web site built on AngularJS, Node/Express, MongoDB and Gulp.

# Get Started
Clone the project into your computer:

	$ git clone https://github.com/jmoraleda/boilerjs.git .
	$ cd boilerjs

## Dependencies
To start the application with fail safety, you will need to install ```forever``` on the server.

	$ sudo npm install -g forever
	
To manage the app in development and production environments, we will make use of ```gulp```.

	$ sudo npm install -g gulp

Finally, we will need to install the local dependencies of the project.

	$ npm install

## Usage
To manage the app, the following actions are available

	$ cd boilerjs
	$ gulp
	
	Usage:
	
	   $ gulp make      Compile the web files to 'public'
	   $ gulp debug     Start the app locally and reload with Nodemon
	   $ gulp test      Run the test suite located on test/index.js
	 
	   $ gulp start     Start the server as a daemon (implies gulp make)
	   $ gulp restart   Restart the server (implies gulp make)
	   $ gulp stop      Stop the server

The first three ones are intended for the **development environment**. The last three ones are intended to manage the application in a **server**.

## Folder structure
These are the files and folders of the project

	README.md               The present file
	gulpfile.js             Scripts to compile and serve the application

	models/                 Data models (bound to MongoDB collections)
	node_modules/           (managed by npm)
	package.json            Dependencies list

	public/                 (Compiled folder from where the web is served)
	resources/              (Convenience folder to put certificates, keys, etc.)

	server.api.js           API handlers definitions
	server.cache.js         Caching routes/files definition
	server.js               Server executable
	
	test/                   Folder with the test suites
	www/                    Source code of the HTML application (compiled to 'public')


# Development workflow
## Backend
### Configuring the project
The parameters of the server are defined in ```server.js```

	self.setupVariables = function() {
	
		self.path = __dirname;
		
		self.httpPort = 8080;
		self.httpsPort = 8443;
		
		// Features
		self.useHttp = true;
		self.useHttps = false;
		self.useMongoDB = true;
		
		// Mongo DB
		self.dbHost = "localhost";
		self.dbName = "dbname";
		self.dbUser = "";
		self.dbPassword = "";
		
		// HTTP Authentication
		self.httpUser = "";
		self.httpPassword = "";
		
		// SSL Certificates
		self.keyFile = './resources/host';
		self.certFile = './resources/host.crt';
    };

##### Notes:

* HTTP/HTTPS ports must be greater than ```1024``` (unless you plan to run the app with root privileges)
	* Normally you'll set up a proxy server (Apache/nginx) binding the ports 80/443 to the ones you define above
* If the MongoDB user/password are empty, the server will attempt to connect without authentication
* Unless you set an HTTP user/password, no HTTP authentication will be requested
* If ```useHttp``` is false, the keyFile/certFile files will be ignored

### Creating a model

Let's create (or edit) a file inside the ```models/``` folder with the data schema that we want to store on the DB. For example ```user.js```

	// User Model
	var mongoose = require('mongoose'),
	   Schema = mongoose.Schema,
	   ObjectId = Schema.ObjectId;
	
	var userSchema = new Schema({
	    state: {
	        type: 'String',
	        required: true,
	        enum: ['active', 'temporary', 'inactive'],
	        lowercase: true
	    },
	    name: String,
	    lastName: String,
	    username: String,
	    nick: String,
	    email: String,
	    score: { type: Number, min: 0, max: 10000, required: true },
	    created: Date,
	    notificacions: [ String ]
	}, {
	    collection: 'users'
	});
	
	module.exports = mongoose.model('User', userSchema);

We just created a model called ```User``` which will use the ```users``` collection on the server. 

### Using the model in an API callback 
In the file ```server.api.js``` let's import our new model. Next, we will export a function that generates a list of all the registered users.

	var User = require('./models/user.js');
	
	exports.listUsers = function(req, res) {
	  User.find()
	  .where('state').equals('active')
	  .sort('-score')
	  .exec(function(err, users){
	    if(err)
	      res.send({error: err});
	    else
	      res.send(users);
	  });
	};


This callback will send a JSON response with a list of the users whose status is ```'active'``` and sort them by the field ```score``` in reverse order. 

[More information about querying with Mongoose](http://mongoosejs.com/docs/queries.html)

### Assigning an API route to the new callback
At the bottom of the same file (```server.api.js```), let's locate the function ```getRoutes``` and declare a route+callback(s) for the function we just added.

Depending on the HTTP method we need, we will add it in its corresponding section (GET, POST, PUT, DELETE).

    // API ROUTE LIST
    exports.getRoutes = function () {
      return {
        get: {
          '/api/users': [ exports.listUsers ],    // <<<  Our new callback
          '/api/users/:id': [ exports.getUser ],
          '/api/events': [ exports.events ]
        },
        post: {
          '/api/users': [ checkLogin, exports.createUser ],
          '/api/upload': [ exports.upload ]
        },
        put: {
          '/api/users/:id': [ exports.updateUser ]
        },
        'delete': {
          '/api/users/:id': [ exports.removeUser ]
        }
      };
    };

Now, when a request is made to ```/api/users``` the new function in ```server.api.js``` will handle the result.

Some functions may need to check various conditions before they serve the actual data (authentication status). That's why instead of assigning the path to a single callback, this block allows to define an (ordered) array of them. 

This allows us to perform validation checks in earlier callbacks that will interrupt the request if something is wrong. For example, if we added a callback before handling the user creation:

	post: {
          '/api/users': [ checkLogin, exports.createUser ],
          ...

```checkLogin``` would handle the request before passing the control to ```exports.createUser```. So the first function might look like that: 

	function checkLogin(req, res, next) {
	  if (req.session.user) {
	    next();
	  } else {
	    req.session.error = 'Access is denied!';
	    res.redirect('/login');
	  }
	}
When an ExpressJS callback ends with ```next()```, the next callback is executed (in this case ```exports.createUser```). If a response is sent instead, no further processing is performed. 

[See this link](https://github.com/strongloop/express/blob/master/examples/auth/app.js) for a complete ExpressJS session management example. 




## Frontend
### API calls
To use the API we defined on the backend, first we need to edit ```www/scripts/api.js``` and create a new entry on the API factory. It must match the URL path we chose previously and include the necessary parameters (if any).

	.factory('API', function($http) {
	  return {
	    listUsers: function() {                  // <<< THE NEW FUNCTION
			return $http.get("/api/users");      // <<< THE NEW API
	    },
	    getUser: function(id) {
			return $http.get("/api/users/" + id);
	    },
	    newUser: function(user) {
			return $http.post("/api/users", user);
	    },
	    updateUser: function(id, user) {
			return $http.put("/api/users/" + id, user);
	    },
	    deleteUser: function(id) {
			return $http.delete("/api/users/" + id);
	    }
	    // ...
	  }
	})

From now on, any Angular controller where the ```API``` service is injected, will allow us to invoke the new server call like this: 


	app.controller('ListCtrl', function($scope, API, DATA) {
	
		$scope.users = [];

		API.listUsers()
		.success(function(users, status, headers, config) {
			if(status != 200) {
				location.hash = "/";
				return;
			}
			if(typeof users == "object") {
				if(users.error) {
					alert("Error: " + users.error);
					return;
				}
				$scope.users = [];
	
				for(var i = 0; i < users.length; i++) {
					users[i].data = new Date(users[i].data);
					
					$scope.users.push(users[i]);
				}
				DATA.users = users;
			}
		})
		.error(function(object, status, headers, config) {
			// Network or server error
			alert("Unable to connect to the server");
		});
	});

```API.listUsers()``` is the new function we added on ```api.js``` and it returns a **promise**. When the promise is resolved, the function inside the ```success``` block will be executed. In case of a network error (unrelated to the application logic), the function inside the ```error``` block will be executed.

[More information about promises](https://docs.angularjs.org/api/ng/service/$q).

### View templates
Once our data is in the ```$scope``` of a controller, we will create an html file on the ```www/views``` folder. For example ```user.html```

	<!-- USER LIST -->
	
	<div id="users" class="row">
	
	  <div class="col-lg-12">
	    <div class="widget">
	      <div class="widget-title">
	        <i class="fa fa-users"></i> Active users
	        <div class="clearfix"></div>
	      </div>
	      <div class="widget-body medium no-padding">
	        <div class="table-responsive">
	          <table class="table">
	            <thead>
	              <tr ng-if="users">
	                <th>#</th>
	                <th>Name</th>
	                <th>Nick</th>
	                <th>Score</th>
	              </tr>
	            </thead>
	            <tbody>
	              <loading ng-if="!users"></loading>
	
	              <tr ng-repeat="user in users">
	                <td><a ng-href="#/users/{{user.nick}}">{{($index+1)}}</a></td>
	                <td><a ng-href="#/users/{{user.nick}}">{{user.name + ' ' + user.lastname}}</a></td>
	                <td><a ng-href="#/users/{{user.nick}}">{{user.nick}}</a></td>
	                <td><a ng-href="#/users/{{user.nick}}">{{user.score.toFixed(0)}}</a></td>
	              </tr>
	            </tbody>
	          </table>
	        </div>
	      </div>
	    </div>
	  </div>
	
	</div>

**NOTE:** You don't need to indicate the ```ng-controller``` on the markup. This is being handled in another file. (See below)

When the URL is ```http://hostname/#/users```, we want that the new template is injected inside the following HTML tag in ```www/index.html```. 

	<div ng-view autoscroll="true" class="view-slide-in"></div>

So let's edit ```www/scripts/index.js``` (at the top of it) to add an entry for that:

	app.config(function($routeProvider) {
		$routeProvider
		.when('/', {
			templateUrl: 'views/splash.html',
			controller: 'SplashCtrl'
		})
		.when('/summary', {
			templateUrl: 'views/summary.html',
			controller: 'SummaryCtrl'
		})
		.when('/users', {                       // << THE NEW ENTRY
			templateUrl: 'views/users.html',
			controller: 'ListCtrl'
		})

When the hash is ```#/user``` Angular will load the new template and will pass its control to the ```ListCtrl``` controller we showed previously (so no need to specify an ```ng-controller``` in the markup).

Now we can navigate to any template we define by jumping to its corresponding route on the URL hash. 

### Sharing data among controllers
Content loaded from the server is stored in the ```$scope``` of the controller requesting them. However, if we leave the controller and jump to another one, this information is lost. 

If we want to share content among controllers, we can use the ```DATA``` service (```www/scripts/api.js```), injecting it wherever we need to access global (or persistent) content. 

	app.controller('StartCtrl', function($scope, API, DATA) {
	
	    DATA.users = [ {name: "Jordi"}, {name: "John"} ];
	    DATA.persist();  // save the state to the localStorage
	});
	
	app.controller('MainCtrl', function($scope, API, DATA) {
	
	    console.log(DATA.users);  // will print [ {name: "Jordi"}, {name: "John"} ]
	});

First we assign any value from a controller. When we switch to another one, our values will stay and will remain accessible regardless of the ```$scope```.

However, if we exit or reload the page, these contents will be lost. To keep them in memory we can call ```DATA.persist()```. Now, the next controller injecting the ```DATA``` service, will have them restored automagically. 


# Other
## WYSWYG Node friendly editors
* https://github.com/jejacks0n/mercury
* http://nicedit.com/
* http://www.aloha-editor.org/
* https://www.raptor-editor.com/demo
