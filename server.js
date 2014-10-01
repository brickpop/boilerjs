#!/bin/env node

var fs = require('fs');
var http = require('http');
var https = require('https');
var express = require('express');
var mongoose = require('mongoose');
var api = require(__dirname + '/server.api.js');
var cache = require(__dirname + '/server.cache.js');


var TemplateApp = function() {

    var self = this;

    self.setupVariables = function() {

        self.path = __dirname;

        self.httpPort = 8080;
        self.httpsPort = 8443;

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
		self.keyFile = '/etc/pki/tls/private/localhost.key';
        self.certFile = '/etc/pki/tls/certs/localhost.crt';
		self.caFile = '/etc/pki/tls/certs/ca-bundle.crt';
    };

    // LIFECYCLE
    self.terminator = function(signal){
        if(!signal || typeof signal != "string") return console.log('%s: The app is terminating...', Date(Date.now()));
        
        console.log('%s: Received %s...', Date(Date.now()), signal);
        process.exit(1);
    }
 };

 self.initializeTerminationHandlers = function(){

	process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
        'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV'/*, 'SIGUSR2'*/, 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };

    // SERVER
    self.initializeCacheRoutes = function() {

        // see server.cache.js
        var cacheRoutes = cache.getRoutes();
        for (var c in cacheRoutes) {
            if(cacheRoutes.hasOwnProperty(c)) {
                self.app.get(c, cacheRoutes[c]);
            }
        }
    }; 

    self.initializeAPIRoutes = function() {

        // see server.api.js
        // automatic generator for app.get('/api/users', func_name), ...

        var apiRoutes = api.getRoutes();
        for(var g in apiRoutes.get) {
            if(apiRoutes.get.hasOwnProperty(g)) {
                self.app.get(g, apiRoutes.get[g]);
            }
        }
        for(var p in apiRoutes.post) {
            if(apiRoutes.post.hasOwnProperty(g)) {
                self.app.post(p, apiRoutes.post[p]);
            }
        }
        for(var t in apiRoutes.put) {
            if(apiRoutes.put.hasOwnProperty(g)) {
                self.app.put(t, apiRoutes.put[t]);
            }
        }
        for(var d in apiRoutes.delete) {
            if(apiRoutes.delete.hasOwnProperty(g)) {
                self.app.delete(d, apiRoutes.delete[d]);
            }
        }
    };

    self.initializeServer = function() {

        self.app = express();

        // SERVER SETTINGS
        self.app.configure(function(){
            self.app.use(express.bodyParser());
            self.app.use(express.methodOverride());
            self.app.use(self.app.router);

            if(self.httpUser && self.httpPassword) {
                self.app.use(express.basicAuth(self.httpUser, self.password));
            }
            self.app.use(express.static('./public'));
        });

        self.initializeCacheRoutes();
        self.initializeAPIRoutes();

        // SSL
        if(self.useHttps) {
            self.privateKey  = fs.readFileSync(parameters.keyFile, 'utf8');
            self.certificate = fs.readFileSync(parameters.certFile, 'utf8');

            self.sslCredentials = {key: privateKey, cert: certificate};
            
            if(self.caFile)
                self.ca = fs.readFileSync(parameters.caFile, 'utf8');
        }

        // DATABASE
        if(self.useMongoDB && self.dbUser && self.dbPassword)
            mongoose.connect('mongodb://' + self.dbUser + ':' + self.dbPassword + '@' + self.dbHost + '/' + self.dbName);
        else if(self.useMongoDB)
            mongoose.connect('mongodb://' + self.dbHost + '/' + self.dbName);
    };

    self.initialize = function() {
        self.setupVariables();
        cache.populate();
        self.initializeTerminationHandlers();
        self.initializeServer();
    };

    self.start = function() {

        // START SERVER
        var httpServer, httpsServer;
        if(self.useHttp) {
         httpServer = http.createServer(self.app);
         httpServer.listen(self.httpPort);
     }
     if(self.useHttps) {
         httpsServer = https.createServer(sslCredentials, self.app);
         httpsServer.listen(self.httpsPort);
     }

     console.log("Server listening on port", self.useHttp ? self.httpPort : "", self.useHttps ? self.httpsPort : "");
 };
};

// MAIN
var zapp = new TemplateApp();
zapp.initialize();
zapp.start();

