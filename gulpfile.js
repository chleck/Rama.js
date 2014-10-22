'use strict';

var fs = require('fs');
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var mainBowerFiles = require('main-bower-files');
var nib = require('nib');
var open = require('open');

var js = './js/*.js';
var stylus = './stylus/*.styl';
var jade = './jade/**.jade';
var images = './img/**/*';

var copyright = fs.readFileSync('./Copyright', 'utf-8');

gulp.task('clean:dist', function() {
  return gulp.src('./dist', { read: false })
    .pipe(plugins.rimraf());
});

gulp.task('clean:bower',  function() {
  return gulp.src('./bower', { read: false })
    .pipe(plugins.rimraf());
});

gulp.task('clean:docs',  function() {
  return gulp.src('./docs', { read: false })
    .pipe(plugins.rimraf());
});

gulp.task('clean:all', [ 'clean:dist', 'clean:bower', 'clean:docs' ]);

gulp.task('bower-install', function() {
  return plugins.bower();
});

gulp.task('bower', [ 'bower-install' ], function() {
  gulp.src(mainBowerFiles())
    .pipe(plugins.concat('scripts.min.js'))
    .pipe(plugins.uglify())
    .pipe(gulp.dest('./dist/js'))
    .pipe(plugins.livereload());
});

gulp.task('js', function() {
  gulp.src(js)
    .pipe(plugins.plumber())
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('default'))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.header('(function() {\n'))
    .pipe(plugins.footer('})();\n'))
    .pipe(plugins.concat('app.min.js'))
    .pipe(plugins.header('\'use strict\';\n'))
    .pipe(plugins.uglify())
    .pipe(plugins.header(copyright))
    .pipe(plugins.sourcemaps.write('maps/', { sourceRoot: '..' }))
    .pipe(gulp.dest('./dist/js'))
    .pipe(plugins.livereload());
});

gulp.task('stylus', function() {
  gulp.src(stylus)
    .pipe(plugins.plumber())
    .pipe(plugins.stylus({
      use: nib(),
      sourcemap: {
        inline: true,
        sourceRoot: '..'
      },
      compress: true
    }))
    .pipe(plugins.sourcemaps.init({
      loadMaps: true
    }))
    .pipe(plugins.concat('styles.css'))
    .pipe(plugins.sourcemaps.write('maps/', { sourceRoot: '..' }))
    .pipe(gulp.dest('./dist/css'))
    .pipe(plugins.livereload());
});

gulp.task('jade', function() {
  gulp.src(jade)
    .pipe(plugins.plumber())
    .pipe(plugins.jade({ pretty: true }))
    .pipe(gulp.dest('./dist/'))
    .pipe(plugins.livereload());
});

gulp.task('images', function() {
  gulp.src(images)
    .pipe(plugins.plumber())
    .pipe(plugins.imagemin())
    .pipe(gulp.dest('./dist/img'))
    .pipe(plugins.livereload());
});

gulp.task('build', [ 'clean:dist', 'bower' ], function() {
  gulp.start('js', 'stylus', 'jade', 'images');
});

gulp.task('watch', function() {
  gulp.watch(js, [ 'js' ]);
  gulp.watch(stylus, [ 'stylus' ]);
  gulp.watch(jade, [ 'jade' ]);
  gulp.watch(images, [ 'images' ]);
  // Running static server
  var connect = require('connect');
  var serveStatic = require('serve-static');
  connect()
    .use(serveStatic('./dist'))
    .listen(3000, function() {
      open('http://127.0.0.1:3000');
    });
  // Enabling livereload
  plugins.livereload.listen();
});

gulp.task('docs', [ 'clean:docs' ], function(){
  // TODO: Exec jsdoc -c jsdoc.json here.
});

gulp.task('default', [ 'build' ], function() {
  gulp.start('watch');
});
