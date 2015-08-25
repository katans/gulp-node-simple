gulp-node-simple
====================

> gulp插件，将lodash模板文件或html文件预编译成function，支持JST、AMD和CommonJS输出

> Precompile lodash.template to a function.

## Install
```
npm install gulp-node-simple --save-dev
```

## Example
### `gulpfile.js`
```js
var template = require('gulp-node-simple');

gulp.task('tmpl', function() {
  return gulp.src('./tmpl/*.html')
    .pipe(template({
      commonjs: true,
      // amd: true,
      strict: true
    }))
    .pipe(gulp.dest('./tmpl/'));
});
```

### template(options)

### options

Type: `Object`

#### options.bigpip
Type: `Boolean`
Default: false
自动添加bigpip相关代码

#### options.pack
Type: `Boolean`
Default: false
文件分块生成模板


#### options.strict
Type: `Boolean`
Default: false

Add `use strict;` at the first line of the compiled template function.

#### options.commonjs
Type: `Boolean`
Default: false

#### options.amd
Type: `Boolean`
Default: false

#### options.namespace
Type: `String`
Default: 'JST'
