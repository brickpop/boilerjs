var localCache = {};
var fs = require('fs');

exports.populate = function() {
    // localCache['/'] = fs.readFileSync(__dirname + '/www/index.html');
    // localCache['/index.html'] = fs.readFileSync(__dirname + '/www/index.html');
};

exports.get = function(key) {
    return localCache[key];
};

exports.getRoutes = function() {
    var result = {};
    for(var key in localCache) {
        result[key] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send( localCache[key] );
        };
    }
    return result;
};
