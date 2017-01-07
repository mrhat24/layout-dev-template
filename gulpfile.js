let gulp = require('gulp'),
    watch = require('gulp-watch'),
    sass = require('gulp-sass'),
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util'),
    fileinc = require('gulp-file-include'),
    clean = require('gulp-clean'),
    server =  require('gulp-server-livereload'),
    webserver = require('gulp-webserver'),
    babel =  require('gulp-babel'),
    bourbon = require('node-bourbon'),
    neat = require('node-neat');

gulp.task('clean', function() {
    return gulp.src('./dist')
        .pipe(clean());
});

gulp.task('server', function () {
    gulp.src('dev').pipe(webserver({
        livereload: true,
        directoryListing: true,
        open: "./index.html",
        port: 5001
    }));
});


gulp.task('production',['clean'],function(){

    gulp.src("./src/*.html")
        .pipe(fileinc({
            prefix: '@@',
            basepath: '@file'
        }))
        .on('error', gutil.log)
        .pipe(gulp.dest('./dist'));

    gulp.src('./src/sass/*.sass')
        .pipe(sass({
            // includePaths: require('node-bourbon').with('other/path', 'another/path')
            // - or -
            includePaths: [].concat(bourbon.includePaths, neat.includePaths)
        }))
        .on('error', gutil.log)
        .pipe(gulp.dest('./dev/css'))
        .pipe(gulp.dest('app/assets/temp'));

    gulp.src(['./src/img/**/**/*.png','./src/img/**/**/*.jpg'], {cwd: './'})
        .pipe(gulp.dest('./dist/img'));

    gulp.src('./src/js/**/**/*js', {cwd: './'})
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('./dist/scripts'));
});

gulp.task('images', function () {
    return watch(['./src/img/**/**/*.png','./src/img/**/**/*.jpg'],function () {
        gulp.src(['./src/img/**/**/*.png','./src/img/**/**/*.jpg'], {cwd: './'})
            .pipe(gulp.dest('./dev/img'));
    }).on('change', function (file) {
        console.log("File " + file + " was modified!");
    });
});

gulp.task('img-cpy', function () {
    return gulp.src(['./src/img/**/**/*.png','./src/img/**/**/*.jpg'], {cwd: './'})
        .pipe(gulp.dest('./dev/img'));
});

gulp.task('scripts', function () {
    return watch('./src/js/*.js', function (e) {
        gulp.src('./src/js/*.js')
            .pipe(babel({
                presets: ['es2015']
            }))
            .on('error', gutil.log)
            .pipe(gulp.dest('./dev/js'));
    }).on('change', function (file) {
        console.log("File " + file + " was modified!");
    });
});

gulp.task('fileinc', function() {
    return watch('./src/**/*.html', function(e) {
        gulp.src("./src/*.html")
            .pipe(fileinc({
                prefix: '@@',
                basepath: '@file'
            }))
            .on('error', gutil.log)
            .pipe(gulp.dest('./dev'));
    }).on('change', function (file) {
        console.log("File " + file + " was modified!");
    });
});

gulp.task('sass', function() {
    return watch('./src/sass/**/*.sass', function() {
        gulp.src('./src/sass/*.sass')
            .pipe(sass({
                // includePaths: require('node-bourbon').with('other/path', 'another/path')
                // - or -
                includePaths: [].concat(bourbon.includePaths, neat.includePaths)
            }))
            .pipe(sass({outputStyle: 'compressed'}))
            .on('error', gutil.log)
            .pipe(gulp.dest('./dev/css'));
    }).on('change', function (file) {
        console.log("File " + file + " was modified!");
    });
});


gulp.task('default',function() {
    gulp.run('sass');
    gulp.run('fileinc');
    gulp.run('scripts');
    gulp.run('images');
    gulp.run('server');
});