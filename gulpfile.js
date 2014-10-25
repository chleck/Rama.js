'use strict';

// var fs = require('fs');
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

// var copyright = fs.readFileSync('./Copyright', 'utf-8');

gulp.task('js', function() {
  gulp.src([ 'lib/*.js', 'test/*.js', 'index.js' ])
    // .pipe(plugins.plumber())
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('default'));
});

gulp.task('docs', function(){
  return gulp.src('lib/*.js')
    .pipe(plugins.concat('all.md'))
    .pipe(plugins.jsdocToMarkdown())
    .pipe(gulp.dest('api'));
});

gulp.task('default', [ 'js' ]);

// gulp.task('default', function() {
//   gulp.start('js');
// });
