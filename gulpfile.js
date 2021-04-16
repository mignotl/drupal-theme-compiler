'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const fs = require('fs');

// Paths
let themePath = 'web/themes/custom/';

// Dynamically add the theme directory's name.
try {
    const files = fs.readdirSync(
        themePath,
        {withFileTypes: true}
    );
    const themeDirectory = files.find((file) => {
        return (file.isDirectory() && !isUnixHiddenPath(file.name));
    });
    themePath += themeDirectory.name + '/';
}
catch (err) {
    console.error(err);
}

function isUnixHiddenPath(path) {
    return (/(^|\/)\.[^\/\.]/g).test(path);
}

const sources = themePath + 'sources/';
const styleSources = sources + 'scss/*.scss';
const scriptSources = sources + 'js/*.js';
const assets = themePath + 'assets/';
const styleAssets = assets + 'css/';
const scriptAssets = assets + 'js/';

/*
 * Styles
 * ===============================================
 */
gulp.task('scss', () => {
    return gulp.src(styleSources)
        .pipe($.sass())
        .pipe($.autoprefixer())
        .pipe($.csso())
        .pipe(gulp.dest(styleAssets));
});

// Remove minify, add sourcemap and livereload
gulp.task('scss-dev', () => {
    return gulp.src(styleSources)
        .pipe($.sourcemaps.init())
        .pipe($.sass().on('error', $.sass.logError))
        .pipe($.autoprefixer())
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(styleAssets))
        .pipe($.wait(500))
        .pipe($.livereload());
});

/*
 * Scripts
 * ===============================================
 */
gulp.task('js', () => {
    return gulp.src(scriptSources)
        .pipe($.babel({
            presets: ['@babel/env'],
        }))
        .pipe($.babelMinify())
        .pipe(gulp.dest(scriptAssets));
});

// Remove minify, add sourcemap and livereload
gulp.task('js-dev', () => {
    return gulp.src(scriptSources)
        .pipe($.sourcemaps.init())
        .pipe($.babel({
            presets: ['@babel/env'],
        }))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(scriptAssets))
        .pipe($.livereload());
});

/*
 * Global tasks
 * ===============================================
 */
gulp.task('watch', () => {
    $.livereload.listen({basePath: assets});
    gulp.watch(sources + 'scss/**/*.scss', gulp.series('scss-dev'))
        .on('change', () => console.clear());
    gulp.watch(sources + 'js/**/*.js', gulp.series('js-dev'))
        .on('change', () => console.clear());
});

gulp.task('dev', gulp.parallel('scss-dev', 'js-dev'));

gulp.task('dev-watch', gulp.series('dev', 'watch'));

gulp.task('prod', gulp.parallel('scss', 'js'));

gulp.task('default', gulp.series('prod'));
