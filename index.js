var caroot = require('caroot'),
    Module = require('module'),
    originalLoad = Module._load,
    originalResolve = Module._resolveFilename,
    pathScopes = {},
    defaultScope = '_default';

function getPathScope(parent){
    var pathScope = pathScopes[defaultScope],
        parts = parent ? parent.filename.split('/') : [];

    while(parts.length){
        var currentScopePath = parts.join('/');

        if(currentScopePath in pathScopes){
            pathScope = pathScopes[currentScopePath];
            break;
        }

        parts.pop();
    }

    return pathScope;
}

function init(rootPath, scope){
    pathScopes[scope || defaultScope] = rootPath;

    Module._resolveFilename = function(path, passedModule){
        var pathScope = getPathScope(passedModule);
        return originalResolve(caroot(path, passedModule.filename, pathScope), passedModule);
    };

    Module._load = function(request, parent, isMain) {
        var pathScope = getPathScope(parent);
        return originalLoad(caroot(request, parent.filename, pathScope), parent, isMain);
    };
}

module.exports = init;