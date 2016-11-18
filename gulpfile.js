// GULPFILE - https://css-tricks.com/gulp-for-beginners/


//REQUIRES
var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');


//SASS
gulp.task('sass', function(){
  return gulp.src('app/scss/**/*.scss') //Gets all files ending with .scss in app/scss and children dirs
    .pipe(sass().on('error', sass.logError)) //Task does not stop on error, just log it
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});
//TODO: add sourcemaps 



//WATCH
gulp.task('watch', ['browserSync', 'sass'], function(){
  gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch('app/*.html', browserSync.reload); 
  gulp.watch('app/js/**/*.js', browserSync.reload);
});


//BROWSERSYNC
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'app'
    },
  })
});

//CONCATENATION + MINIFICATION = 
//"lib" folder and main.js will be merged in the order of HTML declaration
//"lib" folder and main.scss will be merged in the order of HTML declaration
gulp.task('useref', function(){
  return gulp.src('app/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
});

//IMAGE OPTIMIZATION with CACHE
gulp.task('images', function(){
  return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
  // Caching images that ran through imagemin
  .pipe(cache(imagemin({
      progressive: true,
      interlaced: true
    })))
  .pipe(gulp.dest('dist/images'));
});


//CLEAN DIST FOLDER
gulp.task('clean:dist', function() {
  return del.sync('dist');
});
//CLEAN CACHE FOLDER
gulp.task('cache:clear', function (callback) {
  return cache.clearAll(callback)
});


//SEQUENCED BUILD: clean dist folder, then do the build | PROD
gulp.task('build', function (callback) {
  runSequence('clean:dist', 
    ['sass', 'useref', 'images'],
    callback
  )
});

//SEQUENCED DEFAULT: "gulp" task | DEV
gulp.task('default', function (callback) {
  runSequence(['sass', 'browserSync', 'watch'],
    callback
  )
});