var path = require('path');
var fs = require('fs');

var through = require('through2');
var gutil = require('gulp-util');

var _ = require('lodash');
var glob = require('glob');

var tmpl = require('lodash.template');

var PluginError = gutil.PluginError;

var PLUGIN_NAME = 'gulp-fillnode';


var scriptText = ['<script>',
	'window.BigPipe = function(id,html){',
	'	if(!id || !html){',
	'		return;',
	'	}',
	'	document.getElementById(id).innerHTML = html;',
	'}',
	'window.BigPipe = function(id,html){',
	'	if(!id || !html){',
	'		return;',
	'	}',
	'	document.getElementById(id).innerHTML = html;',
	'}',
'</script></head>'];

module.exports = function(options){

    options = options || {};

    var tmplReg = /<!--\s*tmpl:pack \d*\s*-->/gim;


    var _escape = 'var _ = {};\n\
        var escapeMap = {\n\
            \'&\': \'&amp;\',\n\
            \'<\': \'&lt;\',\n\
            \'>\': \'&gt;\',\n\
            \'"\': \'&quot;\',\n\
            "\'": \'&#x27;\'\n\
        };\n\
        var escapeRegexp = new RegExp(\'[\' + Object.keys(escapeMap).join(\'\') + \']\', \'g\');\n\
        _.escape = function(string) {\n\
            if (!string) return \'\';\n\
            return String(string).replace(escapeRegexp, function(match) {\n\
                return escapeMap[match];\n\
            });\n\
        };\n';


    function compiler(name,content) {
        var template = tmpl(content.toString(), false, options.templateSettings).source;

        var strict = options.strict ? '\'use strict;\'\n' : '';
        var escape = options.noescape ? 'var _ = {};\n' : _escape;

        var prefix;
        var postfix = '';

        if(options.commonjs) prefix = strict + escape + 'module.exports = ';
        else if(options.amd) {
            prefix = 'define(function() {\n' + strict + escape + 'return ';
            postfix = '});';
        } else {
            //var name = typeof options.name === 'function' && options.name(file) || name;
            var namespace = options.namespace || 'JST';
            prefix = '(function() {\n' + strict + escape + '(window[\''+ namespace +'\'] = window[\''+ namespace +'\'] || {})[\''+ name.replace(/\\/g, '/') +'\'] = ';
            postfix = '})();';
        }

        return prefix + template + postfix;
    }


    function createFile(name, content) {
        console.log(name,extName);
        return new gutil.File({
            path: path.join(path.relative(basePath, mainPath), name),
            contents: new Buffer(compiler(name,content))
        });
    };

    /*
    分块关键字<!--tmpl:pack 0-->
    */
	function process(content, push, callback) {
		//bigpip方式.这里添加相关js代码.
		if(options && options.bigpip){
            var tmp = content.split('</head>');
            tmp[0] += scriptText.join('');
            content = tmp.join('');
		}

        var packList = content.split(tmplReg);
		if(options && options.pack && packList.length > 1){
            for(var i =0,l=packList.length;i<l;i++){
                try{
                    var file = createFile(mainName.replace(/(.html|.ejs)/ig,'_'+i+'.js'), packList[i]);
                    push(file);             
                }catch(e){
                    console.log(e);
                }
            }
		}else{
            var file = createFile(mainName.replace(/(.html|.ejs)/ig,'.js'), content);
            push(file);
		}
        callback(); 
	}

    return through.obj(function(file, enc, callback) {

        if (file.isNull()) {
            this.push(file); // Do nothing if no contents
            callback();
        } else if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-fillnode', 'Streams are not supported!'));
            callback();
        } else {
            basePath = file.base;
            mainPath = path.dirname(file.path);
            mainName = path.basename(file.path);//.replace('.html','.ejs');
            extName = path.extname(file.path);
            pathName = file.path;

            process(String(file.contents), this.push.bind(this), callback);
        }
    });
}