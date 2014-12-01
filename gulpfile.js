// Load plugins
var gulp = require('gulp'),
    shell = require('gulp-shell');


// Media
gulp.task('images', function() {
  // var imagemin = require('gulp-imagemin');
  // var cache = require('gulp-cache');

  return gulp.src(['src/media/**/*.jpg', 'src/media/**/*.jpeg', 'src/media/**/*.png', 'src/media/**/*.svg', 'src/media/**/*.gif', 'src/media/**/*.tiff'])
    // .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('www/media'));
});

// STYLE
gulp.task('scss', function() {
  var sass = require('gulp-sass');
  var autoprefixer = require('gulp-autoprefixer');
  var minifycss = require('gulp-minify-css');
  var rename = require('gulp-rename');
  var concat = require('gulp-concat');

  return gulp.src(['src/styles/themes/blue.css', 'src/styles/index.scss'])
    .pipe(sass())
    .pipe(concat('index.css'))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 2.3'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest('www/styles'));
});

// MARKUP
gulp.task('jade', function() {
  var localSymbols = {};
  var jade = require('gulp-jade');

  return gulp.src('src/**/*.jade')
  .pipe(jade({
    locals: localSymbols
  }))
  .pipe(gulp.dest('www/'))
});

gulp.task('html', function() {
  // var htmlmin = require('gulp-htmlmin');

  return gulp.src(['src/**/*.html'])
  //.pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('www/'));
});

// JAVASCRIPT
gulp.task('jshint', function() {
  var jshint = require('gulp-jshint');

  return gulp.src(['server.js', 'models/**/*.js', 'src/scripts/**/*.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'));
});

gulp.task('javascript', function() {
  var uglify = require('gulp-uglify');
  var rename = require('gulp-rename');
  var concat = require('gulp-concat');

  return gulp.src(['src/scripts/**/*.js'])
    .pipe(concat('index.js'))
    .pipe(gulp.dest('www/scripts'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify({mangle: false}))
    .pipe(gulp.dest('www/scripts'));
});

// VENDOR
gulp.task('modernizr', function() {
  return gulp.src(['src/vendor/modernizr.min.js'])
    .pipe(gulp.dest('www/scripts'));
});

gulp.task('jsVendor', function() {
  var concat = require('gulp-concat');

  gulp.src('src/vendor/*.map')
  .pipe(gulp.dest('www/scripts'));

  return gulp.src([
    'src/vendor/angular.min.js', 
    'src/vendor/angular-animate.min.js', 
    'src/vendor/angular-cookies.min.js', 
    'src/vendor/angular-route.min.js',
    'src/vendor/ng-bootstrap-tpls.min.js'
    ])
    .pipe(concat('vendor.min.js'))
    .pipe(gulp.dest('www/scripts'));
});

gulp.task('cssVendor', function() {
  var concat = require('gulp-concat');
  var minifycss = require('gulp-minify-css');
  
  return gulp.src(['src/vendor/**/*.css'])
    .pipe(concat('vendor.min.css'))
    .pipe(minifycss())
    .pipe(gulp.dest('www/styles'));
});

gulp.task('fontVendor', function() {
  return gulp.src(['src/fonts/*'])
    .pipe(gulp.dest('www/fonts'));
});

// Clean
gulp.task('clean', function() {
  var clean = require('gulp-clean');

  return gulp.src(['www/*'], {read: false})
    .pipe(clean());
});

// Groups
gulp.task('vendor', ['modernizr', 'jsVendor', 'cssVendor', 'fontVendor'], function(){});

gulp.task('scripts', ['jshint', 'javascript'], function(){});

gulp.task('markup', ['jade', 'html'], function(){});

gulp.task('styles', ['scss'], function(){});

gulp.task('make', ['clean'], function() {
  return gulp.start('makeFiles');
});

gulp.task('makeFiles', ['scripts', 'markup', 'styles', 'images', 'vendor'], function(){});

// Default task
gulp.task('default', function() {
  console.log("\nAvailable actions:\n");
  console.log("   $ gulp make       Compile the web files to 'www'");
  console.log("   $ gulp debug      Compile, start the app locally and reload with Nodemon");
  console.log("   $ gulp test       Run the test suite located on test/index.js\n");
  console.log("  ");
  console.log("   $ gulp start      Start the server as a daemon (implies gulp make)");
  console.log("   $ gulp restart    Restart the server (implies gulp make)");
  console.log("   $ gulp stop       Stop the server\n");
  console.log("  ");
});

// MAIN TASKS
gulp.task('debug', ['make'], function () {
  var nodemon = require('gulp-nodemon');

  nodemon({ script: 'server.js', ext: 'html jade js css scss ', ignore: ['www', 'node_modules'], nodeArgs: ['--debug']  })
    .on('change', ['make'])
    .on('restart', function () {
      console.log('App restarted')
    })
});

gulp.task('start', ['make'], shell.task([
  'forever start server.js 2>/dev/null || node server.js'
]));

gulp.task('restart', ['make'], shell.task([
  'forever restart server.js 2>/dev/null || echo "The forever command is not installed.\nTo stop the server, just hit Ctrl+C in the terminal where your Node app is running and launch it again" '
]));

gulp.task('stop', shell.task([
  'forever stop server.js 2>/dev/null || echo "The forever command is not installed.\nTo stop the server, just hit Ctrl+C in the terminal where your Node app is running" '
]));

gulp.task('test', ['make'], function () {
  var mocha = require('gulp-mocha');
  gulp.src('test/index.js')
      .pipe(mocha({reporter: 'nyan'}));
});
