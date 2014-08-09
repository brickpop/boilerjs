
// SERVEI DE L'API

angular.module('admin.services', [])

.factory('API', function($http) {
  return {
    users: function(){
		return $http.get("/api/users");
    },
    user: function(username){
		return $http.get("/api/users/" + username);
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
