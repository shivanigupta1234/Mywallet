# Example use

Using `shared-gulpfile.js` as the common build source from your own `gulpfile.js`. Please note that the example assumes you've installed this repository as a sub-repo to your own. You can install it with NPM or just copy everything over. Whatever works for your workflow.

First: 

```
npm install javascript-build-essentials --save
npm install --save-dev babel-preset-es2015
```

Create file `.babelrc` with content in the root of project:

```
{
    "presets": [ "es2015" ]
}
```


Gulpfile.js content:

```js
// ES6 specific example.
// Just think of all the 'const' definitions as 'var' and the '() => ' as 'function() {}'

"use strict";

const gulp = require("gulp");
const sequence = require("run-sequence").use(gulp);
const buildSteps = require("./node_modules/javascript-build-essentials/build/shared-gulpfile");

// Creating shared build steps closure for use, passing in the local gulp.
const build = buildSteps(gulp);
const outputDirectory = "./foo/to/the/bar/";

gulp.task("typescript", () => build.createPlainTypeScriptTask([ "./**/*.ts" ], outputDirectory));
gulp.task("jade", () => build.createJadeTask([ "./**/*.jade" ], outputDirectory));
gulp.task("less", () => build.createLessTask([ "./**/*.less" ], outputDirectory));

gulp.task("default", () => {
    build.globalEmitOn();
    return sequence([ "typescript", "jade", "less" ]);
});

```
Above example compiles Typescript files, Jade files and LESS files into given output directories.
