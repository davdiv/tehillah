/*
    Tehillah: Web-based application to manage and display worship songs.
    https://github.com/davdiv/tehillah
    Copyright (C) 2014 DivDE <divde@free.fr>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var gulp = require("gulp");
var path = require("path");
var concat = require("gulp-concat");
var rename = require("gulp-rename");
var merge = require("event-stream").merge;
var uglify = require("gulp-uglify");
var preprocessor = require("./src/build/preprocessor");
var hspCompile = require("hashspace/hsp/compiler/compile");
var hspTranspile = require("hashspace/hsp/transpiler/transpile");
var noderPackage = require("./src/build/noder-package");
var version = "v" + require("./package.json").version;

var staticsDevDirectory = "build/public/" + version + "-dev";
var staticsDirectory = "build/public/" + version;

gulp.task("build-statics-dev", function () {
    var clientFiles = gulp.src("src/client/**/*");
    var commonFiles = gulp.src("src/common/**/*.js", {
        base : "src"
    });
    var pageFile = gulp.src(require.resolve("page")).pipe(rename("page.js"));
    var qsFiles = gulp.src("**/*.js", {
        cwd : path.dirname(require.resolve("qs/lib/index"))
    }).pipe(rename({
        dirname : "qs"
    }));
    return merge(clientFiles, commonFiles, pageFile, qsFiles).pipe(gulp.dest(staticsDevDirectory));
});

gulp.task("build-statics", [ "build-statics-dev" ], function () {
    var jsFiles = gulp.src(staticsDevDirectory + "/**/*.js");
    var hspHtmlFiles = gulp.src(staticsDevDirectory + "/**/*.hsp.html").pipe(preprocessor(hspCompile));
    var jsProcessing = merge(jsFiles, hspHtmlFiles).pipe(preprocessor(hspTranspile)).pipe(preprocessor(noderPackage))
        .pipe(concat("tehillah.js")).pipe(uglify());
    var otherFiles = gulp.src([ staticsDevDirectory + "/**/*.*", "!" + staticsDevDirectory + "/**/*.js",
        "!" + staticsDevDirectory + "/**/*.hsp.html" ]);
    return merge(jsProcessing, otherFiles).pipe(gulp.dest(staticsDirectory));
});

gulp.task("prepublish", [ "build-statics" ]);

gulp.task("dev", [ "prepublish" ], function () {
    var server = require('gulp-develop-server');
    var livereload = require('gulp-livereload');
    var runSequence = require('run-sequence');

    server.listen({
        path : "bin/tehillah"
    }, livereload.listen);

    var reloadServer = function (file) {
        server.changed(function (error) {
            if (!error) {
                livereload.changed(file);
                running = false;
            }
        });
    };
    var buildAndNotifyReload = function (notifyFunction) {
        return function (file) {
            runSequence("build-statics", notifyFunction.bind(null, file.path));
        };
    };

    gulp.watch([ "src/server/**/*" ]).on('change', function (file) {
        reloadServer(file.path)
    });
    gulp.watch([ "src/common/**/*" ]).on('change', buildAndNotifyReload(reloadServer));
    gulp.watch([ "src/client/**/*" ]).on('change', buildAndNotifyReload(livereload.changed));
});
