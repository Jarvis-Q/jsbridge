;(function (win, doc) {
    var callbackList = {};
    
    var modules,
        define,
        require;
    
    (function() {
        var modules = {},
            // 当前正在构造的moduleIds的堆栈信息
            requireStack = [],
            // module ID的映射 -> 当前正在构建的模块的堆栈映射的索引
            inProgressModules = {},
            SEPARATOR = ".";

        // 构建模块
        function build(module) {
            var factory = module.factory,
                localRequire = function(id) {
                    var resultantId = id;
                    //Its a relative path, so lop off the last portion and add the id (minus "./")
                    if (id.charAt(0) === ".") {
                        resultantId = module.id.slice(0, module.id.lastIndexOf(SEPARATOR)) + SEPARATOR + id.slice(2);
                    }
                    return require(resultantId);
                };
            module.exports = {};
            delete module.factory;
            factory(localRequire, module.exports, module);
            return module.exports;
        }
         
        define = function(id, factory) {
            if (modules[id]) {
                throw "module " + id + " already defined";
            }

            modules[id] = {
                id: id,
                factory: factory
            };
        };

        require = function(id) {
            if (!modules[id]) {
                throw "module " + id + " not found";
            } else if (id in inProgressModules) {
                var cycle = requireStack.slice(inProgressModules[id]).join('->') + '->' + id;
                throw "require的生命周期视图: " + cycle;
            }
            if (modules[id].factory) {
                try {
                    inProgressModules[id] = requireStack.length;
                    requireStack.push(id);
                    return build(modules[id]);
                } finally {
                    delete inProgressModules[id];
                    requireStack.pop();
                }
            }
            return modules[id].exports;
        };

        define.remove = function(id) {
            delete modules[id];
        };

        define.moduleMap = modules;

    })();

    /**
     * 桥接模块
     */
    define('kunlun/jsbridge', function(require, exports, module) {
        var jsbridge = {
            jsInvokeNative: function(evt, params, callback) {
                if (typeof evt != 'string') {
                    return;
                }

                if (typeof params == 'function') {
                    callback = params;
                    params = null;
                } else if (typeof params != 'object') {
                    params = null;
                }

                var callbackId = new Date().getTime() + Math.floor(Math.random() * 256).toString(16);

                if (typeof callback == 'function') {
                    callbackList[callbackId] = callback;
                }

                var msg = {
                    callbackId: callbackId,
                    action: evt,
                    data: params || {}
                }
                var iOS_SCHEME = "jsbridge://";

                win.location.href = iOS_SCHEME + JSON.stringify(msg);

            },
            /**
             * [nativeInvokeJs description]
             * @param  {Object} params 回调Id
             * @return {void}
             */
            nativeInvokeJs: function(params) {
                var callbackId = params.callbackId,
                    data = params.data,
                    callbackHandler = callbackList[callbackId];

                callbackHandler && callbackHandler.call(null, data);
                delete callbackList[callbackId];
            }
        };

        module.exports = jsbridge;
    });
    

    /**
     * 调用IOS输入框
     */
    define('kunlun/plugin/callTypeKeyBoard', function(require, exports, module) {
        var jsbridge = require('kunlun/jsbridge');

        jsbridge['callTypeKeyBoard'] = function(params, callback) {
            jsbridge.jsInvokeNative('callTypeKeyBoard', params, callback);
        }

        module.exports = 
    });

    var kunlun = require('kunlun/jsbridge');
    
    win.LSJSBridge = kunlun;

})(window, document);