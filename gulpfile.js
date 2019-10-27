var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream'); // required to dest() for browserify
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var notifier = require('node-notifier');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var babel = require('gulp-babel');

gulp.task('sass', function () {
	return gulp.src('./assets/sass/main.scss')
	.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError)) // .on('error', sass.logError) prevents gulp from crashing when saving a typo or syntax error
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('./assets/sass'))
	.pipe(browserSync.stream()); // causes injection of styles on save
});

gulp.task('sync', ['sass'], function() {
	browserSync.init({
		open: true,
		server: {
			baseDir: "./",
		}
	});
});

var vendors = {
	merge: [
		//'./assets/vendors/js/three.js'
		
		'./assets/vendors/js/three.js/build/three.min.js',
		'./assets/vendors/js/three.js/examples/js/controls/OrbitControls.js'
	]
};

gulp.task('vendors', function() {
	return gulp.src(vendors.merge)
		.pipe(concat('vendors.js'))
		.pipe(gulp.dest('./assets/vendors/js/'));
});

gulp.task('javascript', function() {
		
	var bundleStream = browserify('./assets/js/main.js')
		.transform("babelify", {presets: ["@babel/preset-env"]})
		.bundle()
		.on('error', function(err) {
			console.log(err.stack);
			notifier.notify({
				'title': 'Browserify Compilation Error',
				'message': err.message
			});
			this.emit('end');
		});

	return bundleStream
		.pipe(source('main.js'))
		.pipe(rename('bundle.js'))
		.pipe(gulp.dest('./assets/js/'))
		.pipe(browserSync.stream());
});

gulp.task('validateJS', function() {
	return gulp.src(['./assets/js/**/*.js', '!./assets/js/bundle.js'])
		.pipe(jshint())
		.pipe(jshint.reporter(stylish));
});

gulp.task('HTML', function() {
	return gulp.src(['./index.html'])
		.pipe(browserSync.stream()); // causes injection of html changes on save
});

gulp.task('watch', function() {

	watch('./assets/sass/**/*.scss', function() {
		gulp.start('sass');
	});
	watch(['./assets/js/**/*.js', '!./assets/js/bundle.js'], function() {
		gulp.start('javascript');
	});
	watch('./**/*.html', function() {
		gulp.start('HTML');
	});	
});

// Default Task
gulp.task('default', ['vendors', 'validateJS', 'javascript', 'sass', 'watch', 'sync']);