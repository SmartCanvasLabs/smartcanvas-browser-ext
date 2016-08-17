// generated on 2016-05-04 using generator-chrome-extension 0.5.6
// https://github.com/yeoman/generator-chrome-extension
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import runSequence from 'run-sequence';
import {stream as wiredep} from 'wiredep';

const $ = gulpLoadPlugins();

var ENV = 'dev';

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    'app/_locales/**',
    'app/scripts.babel/libs/**',
    '!app/scripts.babel/*.*',
    '!app/*.json',
    '!app/*.html',
  ], {
    base: 'app',
    dot: true
  }).pipe(gulp.dest(ENV));
});

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe($.eslint(options))
      .pipe($.eslint.format());
  };
}

gulp.task('lint', lint('app/scripts.babel/**/*.js', {
  env: {
    es6: true
  }
}));

gulp.task('images', () => { 
  return gulp.src('app/images/**/*')
    .pipe(gulp.dest(ENV + '/images'));
});

gulp.task('html',  () => {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.sourcemaps.init())
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cleanCss({compatibility: '*'})))
    .pipe($.sourcemaps.write())
    .pipe($.if('*.html', $.htmlmin({removeComments: true, collapseWhitespace: true})))
    .pipe(gulp.dest(ENV));
});

gulp.task('chromeManifest', () => {
  return gulp.src('app/manifest.json')
    .pipe($.chromeManifest({
      buildnumber: true,
      background: {
        target: 'scripts/background.js',
        exclude: [
          'scripts/chromereload.js'
        ]
      }
  }))
  .pipe($.if('*.css', $.cleanCss({compatibility: '*'})))
  .pipe($.if('*.js', $.sourcemaps.init()))
  .pipe($.if('*.js', $.uglify()))
  .pipe($.if('*.js', $.sourcemaps.write('.')))
  .pipe(gulp.dest(ENV));
});

gulp.task('babel', () => {
  return gulp.src('app/scripts.babel/**/*.js')
      .pipe($.babel({
        presets: ['es2015']
      }))
      .pipe(gulp.dest('app/scripts'));
});

gulp.task('clean', function(){
  return del.sync(['.tmp', ENV]);
});

gulp.task('serve', () => {
  ENV = getArg('--env') ? getArg('--env') : ENV;

  runSequence('copyIcons', 'copyEnvironmentFile', 'lint', 'babel', 'watch');
});

gulp.task('watch', () => {
  $.livereload.listen();

  gulp.watch([
    'app/*.html',
    'app/vars/**/*.js',
    'app/scripts/**/*.js',
    'app/images/**/*',
    'app/styles/**/*',
    'app/_locales/**/*.json'
  ]).on('change', $.livereload.reload);

  gulp.watch('app/scripts.babel/**/*.js', ['lint', 'babel']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('size', () => {
  return gulp.src(ENV + '/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('wiredep', () => {
  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('package', function () {
  var manifest = require('./' + ENV + '/manifest.json');
  return gulp.src(ENV + '/**')
      .pipe($.zip('smart-canvas-' + ENV + '.zip'))
      .pipe(gulp.dest(ENV + '-package'));
});

gulp.task('build', () => {
  runSequence(
    'lint', 'babel', 'copyIcons', 'copyEnvironmentFile', 'chromeManifest',
    ['html', 'images', 'extras'],
    'size',
    'package');
});

gulp.task('copyEnvironmentFile', () => {
  return gulp.src('app/vars/' + ENV + '/environment.js')
      .pipe(gulp.dest('app/vars/'));
});

gulp.task('copyIcons', () => {
  return gulp.src('app/images/' + ENV + '/icons/*')
      .pipe(gulp.dest('app/images/icons'));
});

gulp.task('default', () => {
  ENV = getArg('--env') ? getArg('--env') : ENV;
  
  runSequence('clean', 'build');
});

function getArg(key) {
  var index = process.argv.indexOf(key);
  var next = process.argv[index + 1];
  return (index < 0) ? null : (!next || next[0] === "-") ? true : next;
}
