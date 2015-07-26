;(function (win, doc) {
    var callbackList = {};

    win.LSJSBridge = {
        invoke: function(evt, params, callback) {
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


        },
        callback: function(params) {
            var callbackId = params.callbackId,
                data = params.data,
                callbackHandler = callbackList[callbackId];

            callbackHandler && callbackHandler.call(null, data);
            delete callbackList[callbackId];
        }
    };
})(window, document);