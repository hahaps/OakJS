/**
 * @license oak-requester v0.1
 * (c) 2015 Totoro-Po
 * License: MIT
 */
(function(window, document, oak) {
    var $ = jQuery = oak.lib.jQuery;
    oak.extend.define('requester', function(options) {
        /***
         *
         * @description
         *
         * request object which provide post/put/delete/get method.
         * multi requests are also supported.
         *
         * @param config
         * @private
         */
        var _request = function(config) {
            this.config = config;
            this.$global = {};
        };

        /***
         *
         * @description
         *
         * Get http request result when call this method.
         *
         * @param func
         */
        _request.prototype.then = function(func) {
            var _data = this.$global;
            if(this.$ajax) {
                this.$ajax.then(function() {
                   func(_data);
                });
            }
        };
        /***
         *
         * @description
         *
         * Handle multi request.
         *
         * @param requests
         */
        _request.prototype.multi = function(requests) {
            var key_pre = "",
                global = this.$global,
                keys = oak.utils.keys(requests);
            if(requests instanceof Array) {
                key_pre = "index_";
            }
            $.forEach(keys, function (index, ele) {
                requests[ele].done(function(data) {
                    global[key_pre + ele].data = data;
                }).error(function (err) {
                    global[key_pre + ele].error = err;
                });
            });
            this.$global = global;
            this.$ajax = $.when.apply(requests);
        };

        /***
         *
         * @param _this
         * @param conf
         * @returns {{global: ({}|*), ajax: *}}
         * @private
         */
        function _req (_this, conf) {
            // TODO(Li Xipeng): set global config properties.
            var global = _this.$global;
            conf.success = function (data) {
                global.data = data;
            };
            conf.error = function (data) {
                global.error = data;
            };
            return {
                global: global,
                ajax: $.ajax(conf)
            }
        }

        /***
         *
         * @description
         *
         * Handle with http get request.
         *
         * @param conf
         */
        _request.prototype.get = function(conf) {
            conf.method = 'GET';
            var res = _req(this, conf);
            this.$global = res.global;
            this.$ajax = res.ajax;
        };
        /***
         *
         * @description
         *
         * Handle with http put request.
         *
         * @param conf
         */
        _request.prototype.put = function(conf) {
            conf.method = 'PUT';
            var res = _req(this, conf);
            this.$global = res.global;
            this.$ajax = res.ajax;
        };
        /***
         *
         * @description
         *
         * Handle with http delete request.
         *
         * @param conf
         */
        _request.prototype.delete = function (conf) {
            conf.method = 'DELETE';
            var res = _req(this, conf);
            this.$global = res.global;
            this.$ajax = res.ajax;
        };
        /***
         *
         * @description
         *
         * Handle with http post request.
         *
         * @param conf
         */
        _request.prototype.post = function (conf) {
            conf.method = 'POST';
            var res = _req(this, conf);
            this.$global = res.global;
            this.$ajax = res.ajax;
        };
        return {
            globalSetup: {},
            request: function(config) {
                return new _request(config);
            }
        }
    });
})(window, document, oak);