
// SERVEI DE L'API

angular.module('boilerjs.services', [])

.factory('API', function($http) {
  return {
    listUsers: function() {
		return $http.get("/api/users");
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
    },
    events: function(){
		return $http.get("/api/events");
    }
  }
})
.factory('DATA', function() {
	try {
		localStorage.dataTestValue = 0;
		delete localStorage.dataTestValue;
	}
	catch(e) {
		alert("Unable to access the browser local storage. Check that the incognito mode is disabled.");
		return;
	}

	var data = {};
	var persist = function(){
		localStorage.myAppPersistentData = JSON.stringify(data);
	};
	var restore = function(){
		if(localStorage.myAppPersistentData) {
			data = JSON.parse(localStorage.myAppPersistentData);
		}
	};
	restore();
	data.persist = persist;
	data.restore = restore;
	return data;
});
