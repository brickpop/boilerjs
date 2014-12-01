/*jslint node: true */

var nconf = require( 'nconf' );

nconf.env().argv();

// nconf.file( '/path/to/config.json' );

var defaults = {
    BOILERJS_IS_PRODUCTION: false,

    BOILERJS_APP_NAME: 'Boiler JS',
    BOILERJS_DOMAIN: 'domain.com',  // without 'www'

    BOILERJS_HTTP_PORT: 8080,
    BOILERJS_HTTPS_PORT: 8443,

    BOILERJS_USE_HTTP: true,
    BOILERJS_USE_HTTPS: false,
    BOILERJS_USE_MONGODB: true,

    BOILERJS_MONGODB_HOST: 'localhost',
    BOILERJS_MONGODB_PORT: '27017',
    BOILERJS_MONGODB_DB: 'boilerjs',
    BOILERJS_MONGODB_USER: '',
    BOILERJS_MONGODB_PASSWORD: '',

    BOILERJS_HTTP_USER: '',
    BOILERJS_HTTP_PASSWORD: '',

    BOILERJS_KEY_FILE: '/etc/pki/tls/private/localhost.key',
    BOILERJS_CERT_FILE: '/etc/pki/tls/certs/localhost.crt',
    BOILERJS_CA_FILE: '/etc/pki/tls/certs/ca-bundle.crt'
};

nconf.defaults(defaults);

// Export the final values
var k;
for(k in defaults) {
    if(defaults.hasOwnProperty(k)) {
        exports[k] = nconf.get(k);
    }
}
