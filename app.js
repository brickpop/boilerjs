
// PARAMETERS
var parameters = {

	// FEATURES
	useHttp: true,
	useHttps: false,

	// PORTS
	httpPort: 8080,
	httpsPort: 8443,

	// Mongo DB
	dbHost: "localhost",
	dbName: "combate",
	dbUser: "",
	dbPassword: "",

	// HTTP Authentication
	httpUser: "",
	httpPassword: "",

	// SSL Certificates
	keyFile: '/etc/pki/tls/private/localhost.key',
	certFile: '/etc/pki/tls/certs/localhost.crt'
};

// DEPENDENCIES 
var fs = require('fs');
var http = require('http');
var https = require('https');
var express = require('express');
var mongoose = require('mongoose');
var api = require('./controllers/api.js');

var app = module.exports = express();

// DATABASE
if(parameters.dbUser && parameters.dbPassword)
	mongoose.connect('mongodb://' + parameters.dbUser + ':' + parameters.dbPassword + '@' + parameters.dbHost + '/' + parameters.dbName);
else
	mongoose.connect('mongodb://' + parameters.dbHost + '/' + parameters.dbName);

// SERVER SETTINGS
app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  if(parameters.httpUser && parameters.httpPassword) {
	  app.use(express.basicAuth(parameters.httpUser, parameters.password));
  }
  app.use(express.static('./compiled_www'));
});

// REST CALLS
app.get('/api/users', api.users);
app.get('/api/users/:username', api.user);
app.get('/api/events', api.events);


// SSL
if(parameters.useHttps) {
	var privateKey  = fs.readFileSync(parameters.keyFile, 'utf8');
	var certificate = fs.readFileSync(parameters.certFile, 'utf8');
	var credentials = {key: privateKey, cert: certificate};
}

// START SERVER
var httpServer, httpServer;
if(parameters.useHttp) {
	httpServer = http.createServer(app);
	httpServer.listen(parameters.httpPort);
}
if(parameters.useHttps) {
	httpsServer = https.createServer(credentials, app);
	httpsServer.listen(parameters.httpsPort);
}

console.log("Server listening on ", parameters.useHttp ? parameters.httpPort : "", parameters.useHttps ? parameters.httpsPort : "");
