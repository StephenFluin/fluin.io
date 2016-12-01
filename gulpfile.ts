import { gulpAddStaticFiles } from '@angular/service-worker/build/gulp';

const gulp = require('gulp');
const fs = require('fs');
const runSequence = require('run-sequence');

gulp.task('enhance', done => runSequence(
    'task:service-worker',
    'task:copy-sw',
    done,
))
gulp.task('task:copy-sw', () => gulp
    .src(['node_modules/@angular/service-worker/bundles/worker-basic.js'])
    .pipe(gulp.dest('dist')))

gulp.task('task:service-worker', () => gulp
    .src('ngsw-manifest.json')
    .pipe(gulpAddStaticFiles(gulp.src([
        'dist/**/*.html',
        'dist/**/*.css',
        'dist/**/*.js',
        'dist/**/*.ico',
        'dist/**/*.jpg',
        'dist/**/*.svg',
    ]), {}))
    .pipe(gulp.dest('dist')));