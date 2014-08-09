// ANGULAR
var app = angular.module('admin', ['ui.bootstrap', 'ngCookies', 'ngRoute', 'ngAnimate', 'admin.services']);

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
	.when('/users', {
		templateUrl: 'views/jugadors.html',
		controller: 'ListCtrl'
	})
	.when('/users/:nick', {
		templateUrl: 'views/jugador.html',
		controller: 'PlayerCtrl'
	})
	.when('/activity', {
		templateUrl: 'views/activity.html',
		controller: 'ActivityCtrl'
	})
	.when('/referers', {
		templateUrl: 'views/referers.html',
		controller: 'ReferersCtrl'
	})
	.when('/referers/:nick', {
		templateUrl: 'views/jugador.html',
		controller: 'RefererCtrl'
	})
	.otherwise({
		redirectTo:'/summary'
	});
});

app.directive('loading', function () {
    return {
        restrict: 'AE',
        replace: 'false',
        template: '<div class="loading"><div class="double-bounce1"></div><div class="double-bounce2"></div></div>'
    }
});

app.controller('MainCtrl', function($scope, $cookieStore, API, DATA) {

    var toggleThreshold = 992;
    $scope.breadcrumbs = "Home / Summary";

    $scope.getWidth = function() { return window.innerWidth; };

    $scope.$watch($scope.getWidth, function(newValue, oldValue)
    {
        if(newValue >= toggleThreshold)
        {
            if(angular.isDefined($cookieStore.get('toggle')))
                $scope.toggle = !!$cookieStore.get('toggle');
            else 
                $scope.toggle = true;
        }
        else
            $scope.toggle = false;

    });

    $scope.toggleSidebar = function() 
    {
        $scope.toggle = ! $scope.toggle;

        $cookieStore.put('toggle', $scope.toggle);
    };

    window.onresize = function() { $scope.$apply(); };
});


app.controller('SplashCtrl', function($scope, API, DATA) {

    $scope.$parent.breadcrumbs = "Home";

});

app.controller('SummaryCtrl', function($scope, API, DATA) {

    $scope.$parent.breadcrumbs = "Home / Summary";

});

app.controller('ListCtrl', function($scope, API, DATA) {

    $scope.$parent.breadcrumbs = "Home / Users";

	API.users()
	.success(function(obj, status, headers, config) {
		if(status != 200) {
			location.hash = "/";
			return;
		}
		if(typeof obj == "object") {

			$scope.users = [];

			for(var i = 0; i < obj.length; i++) {
				obj[i].data = new Date(obj[i].data);
				
				$scope.users.push(obj[i]);
			}
			DATA.users = obj;
		}
	})
	.error(function(obj, status, headers, config) {
		// Error de servidor o de xarxa
		// location.hash = "/welcome";
		alert("Unable to connect to the server");
	});
});

app.controller('ReferersCtrl', function($scope, API, DATA) {
	
	$scope.$parent.breadcrumbs = "Home / Referers";

});

// NOTA:  PlayerCtrl i RefererCtrl  són el mateix, però amb diferent origen
var makeUserController = function(sectionOrigin) {

	return function($scope, $routeParams, API, DATA) {
		
		$scope.user = null;
		$scope.referers = [];
		$scope.origin = sectionOrigin;
		if(sectionOrigin == 'users')
		    $scope.$parent.breadcrumbs = "Home / Users / " + $routeParams.nick;
		else
		    $scope.$parent.breadcrumbs = "Home / Referers / " + $routeParams.nick;

	    API.user($routeParams.nick)
	    .success(function(obj, status, headers, config) {
	    	if(status == 200 && typeof obj == "object") {
	    		$scope.user = obj;
	    		$scope.user.created = new Date($scope.user.created);
	    	}
	    	else {
	    		location.hash = "/users";
	    		return;
	    	}
	    })
		.error(function(obj, status, headers, config) {
			// Error de servidor o de xarxa
			// location.hash = "/welcome";
			alert("Unable to connect to the server");
		});
	}
}

app.controller('PlayerCtrl', makeUserController('users'));

app.controller('RefererCtrl', makeUserController('referers'));


app.controller('ActivityCtrl', function($scope, API, DATA) {
	
	$scope.gameEvents = DATA.gameEvents || [];
	$scope.accountEvents = DATA.accountEvents || [];
    $scope.$parent.breadcrumbs = "Home / Activity";

    $scope.loadData = function (){

		API.events()
		.success(function(obj, status, headers, config) {
			if(status != 200) {
				location.hash = "/";
				return;
			}
			if(typeof obj == "object") {
				$scope.gameEvents = [];
				$scope.accountEvents = [];
				for(var i = 0; i < obj.length; i++) {
					obj[i].data = new Date(obj[i].data);

					if(obj[i].tipus == 'registre' || obj[i].tipus == 'dades')
						$scope.accountEvents.push(obj[i]);
					else
						$scope.gameEvents.push(obj[i]);
				}

				DATA.gameEvents = $scope.gameEvents;
				DATA.accountEvents = $scope.accountEvents;
			}
		})
		.error(function(obj, status, headers, config) {
			// Error de servidor o de xarxa
			alert("Unable to connect to the server");
		});
    };
    $scope.loadData();
});
