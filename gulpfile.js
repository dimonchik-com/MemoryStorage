var gulp = require('gulp'),
    concat = require('gulp-concat'),
    del = require('del'),
    archiver = require('gulp-zip'),
    babel = require('gulp-babel'),
    shell = require('shelljs'),
    gulpMerge = require('gulp-merge');

gulp.task('clean', function() {
    return del(['bunch.js']);
});

var paths_firebase=["script_frontend/md5.js","frontend.js"];
var paths_frontend=["script_frontend/content_script.js","common_functions/common.js"];
var paths_backend=["script_backend/popup.js","common_functions/common.js"];

gulp.task('scripts_firebase', function() {
    return gulp.src(paths_frontend)
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('frontend.js'))
        .pipe(gulp.dest(""));
});

gulp.task('scripts_frontend', ['clean','scripts_firebase'], function() {
    return gulp.src(paths_firebase)
        .pipe(concat('bunch.js'))
        .pipe(gulp.dest(""));
});

gulp.task('scripts_backend', function() {
    return gulp.src(paths_backend)
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('popup.js'))
        .pipe(gulp.dest(""));
});

gulp.task('archive', () =>
    setTimeout(function () {
        gulp.src([
            "manifest.json",
            "memorytraining-128.png",
            "memorytraining-16.png",
            "memorytraining-48.png",
            "popup.css",
            "popup.js",
            "popup.html",
            "bunch.js",
            "node_modules/bootstrap/dist/fonts/*",
            "node_modules/ion-rangeslider/img/*",
            "node_modules/bootstrap/dist/css/bootstrap.min.css",
            "node_modules/bootstrap/dist/css/bootstrap-theme.min.css",
            "node_modules/jquery/dist/jquery.js",
            "node_modules/bootstrap-table/dist/bootstrap-table.js",
            "node_modules/bootstrap-select/dist/js/bootstrap-select.js",
            "node_modules/bootstrap-select/dist/css/bootstrap-select.min.css",
            "node_modules/bootstrap-table/dist/extensions/cookie/bootstrap-table-cookie.js",
            "bower_components/x-editable/dist/jquery-editable/css/jquery-editable.css",
            "node_modules/ion-rangeslider/css/ion.rangeSlider.css",
            "node_modules/ion-rangeslider/css/ion.rangeSlider.skinSimple.css",
            "node_modules/ion-rangeslider/js/ion.rangeSlider.js",
            "node_modules/bootstrap-table/dist/bootstrap-table.min.css",
            "node_modules/bootstrap/dist/js/bootstrap.min.js",
            "node_modules/bootbox/bootbox.min.js",
            "node_modules/moment/min/moment.min.js"
        ]).pipe(archiver('MemoryStorage.zip',{compress:true,category_merge:false}))
            .pipe(gulp.dest(''));
    },2000)
);


gulp.task('watch', function() {
    gulp.watch([paths_frontend,paths_backend], ['scripts_frontend','scripts_backend', 'archive']);
});

gulp.task('default',['scripts_frontend','scripts_backend','watch','archive']);


