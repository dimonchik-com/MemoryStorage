var gulp = require('gulp'),
    concat = require('gulp-concat'),
    del = require('del');

gulp.task('clean', function() {
    return del(['bunch.js']);
});

var paths_frontend=["script_frontend/firebase.js","script_frontend/md5.js","script_frontend/content_script.js"];
var paths_backend=["script_backend/popup.js"];

gulp.task('scripts_frontend', ['clean'], function() {
    return gulp.src(paths_frontend)
        .pipe(concat('bunch.js'))
        .pipe(gulp.dest(""));
});

gulp.task('scripts_backend', ['clean'], function() {
    return gulp.src(paths_backend)
        .pipe(concat('popup.js'))
        .pipe(gulp.dest(""));
});

gulp.task('watch', function() {
    gulp.watch([paths_frontend,paths_backend], ['scripts_frontend','scripts_backend']);
});

gulp.task('default',['scripts_frontend','scripts_backend','watch']);