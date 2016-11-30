import {gulpAddStaticFiles} from '@angular/service-worker/build/gulp';
import {genAppShell} from './src/app/universal/main';

const gulp = require('gulp');
const fs = require('fs');
const runSequence = require('run-sequence');

gulp.task('enhance', done => runSequence(
  'task:app-shell',
  'task:service-worker',
  'task:copy-sw',
  done,
))
gulp.task('task:copy-sw', () => gulp
   .src(['node_modules/@angular/service-worker/bundles/worker-basic.js'])
   .pipe(gulp.dest('dist')));

gulp.task('task:app-shell', done => {
  const index = fs.readFileSync('dist/index.html').toString();
  genAppShell(index).then(html => {
    fs.writeFileSync('dist/index.html', html);
    done();
  })
});

gulp.task('task:service-worker', () => gulp
  .src('ngsw-manifest.json')
  .pipe(gulpAddStaticFiles(gulp.src([
    'dist/**/*.html',
    'dist/**/*.css',
    'dist/**/*.js',
    'dist/**/*.ico',
  ]), {}))
  .pipe(gulp.dest('dist')));