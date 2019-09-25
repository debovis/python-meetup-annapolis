var _ = require('underscore'),
    gulp = require('gulp'),
    replace = require('gulp-replace'),
    rjs = require('gulp-requirejs'),
    rename = require("gulp-rename"),
    templateCache = require('gulp-angular-templatecache'),
    template = require('gulp-template'),
    git = require('git-rev'),
    q = require('q'),
    del = require('del');

// http://stackoverflow.com/questions/23978361/using-gulp-to-build-requirejs-project-gulp-requirejs

gulp.task('partials', function() {
    del.sync(['app/build/*.js']);
    console.log('deleting all js files in app/build/')

    gulp.src('app/partials/*.html')
          .pipe(templateCache('templates.js', { 
            module:'templatesCache',
            standalone:true 
          }))
          .pipe(replace("$templateCache.put('" , "$templateCache.put('/app/partials/"))
          .pipe(gulp.dest('app/build'));
})

var getHash = function() {
  var deferred = q.defer();
  // use git hash for file name
    git.long(function (hash) {
      deferred.resolve(hash);
    })
  return deferred.promise;
};


gulp.task('production',['partials'], function() {
  setTimeout(function(){
      getHash().then(function(data) {
        return data;
      }).then(function(git_hash) {

        gulp.src('app/partials/git-hash.js.tpl')
          .pipe(template({'git_hash': git_hash}))
          .pipe(rename("git-hash.js"))
          .pipe(gulp.dest('app/build'))

        var configRequire = require('./app/main.js'),
          configBuild = {
            baseUrl: './lib/',
            deps: ['../app/bootstrap'],
            name: '../app/main',
            optimize: 'none',
            out: 'app.js',
            wrap: true,
            local: false
          };
          var config = _(configRequire).extend(configBuild);
          config.paths['templatesCache'] = '../app/build/templates';

        console.log('creating file ' + "main_prod_" + git_hash + ".js")
        return rjs(config)
          .pipe(replace("../app/directives", "directives"))
          .pipe(replace("../app/filters", "filters"))
          .pipe(replace("../app/services", "services"))
          .pipe(replace("../app/controllers", "controllers"))
          .pipe(replace("../app/app", "app"))
          .pipe(replace("'../app/bootstrap',",""))
          .pipe(replace("../app/routes", "routes"))
          
          .pipe(rename("main_prod_" + git_hash + ".js"))
          .pipe(gulp.dest('app/build'));
        
    })
  },1000)
  
})


gulp.task('default', function(){});




// - allow regions.name to be editable


