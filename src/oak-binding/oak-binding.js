(function(window, document, oak) {
    var $ = jQuery = oak.lib.jQuery,
        DIRTY_CHECKING_INTERVAL = 5000;
    oak.extend.define('binding', ['render'], function (options) {
        var _dataBind = function(dom, jsonData) {
            this.$data = jsonData;
            this.$ele = dom instanceof jQuery ? dom : $(dom);
            this.$previous =  {};
            this.$applied = false;
            this.$use_shadow = false;
        };
        _dataBind.prototype.$check = function() {
            var check = oak.utils.equals(this.$previous, this.$data);
            if (!check) {
                this.$applied = false;
            }
            return check;
        };
        _dataBind.prototype.$watch = function() {
            // TODO(Li Xipeng): not implemented.
        };
        _dataBind.prototype.$apply = function() {
            if(this.$applied) {
                // TODO(Li Xipeng) applied, raise false.
                return;
            }
            var options = {
                use_shadow: this.$use_shadow
            }
            oak.lib.render.rend(this.$ele, this.$data, options);
            this.$previous =  jQuery.extend(true, {}, this.$data);
            this.$applied = true;
            this.use_shadow = true;
        };
        _dataBind.prototype.$dirtyChecking = function () {
            var _this = this;
            var aa = 0;
            var _checking = function() {
                var check = _this.$check();
                if(!check) {
                    _this.$apply();
                }
            }, _interval = function () {
                setTimeout(function() {
                    _checking();
                    _interval();
                }, DIRTY_CHECKING_INTERVAL);
            };
            _checking();
            _interval();
        };

        return {
            dataBind: function (dom, jsonData) {
                return new _dataBind(dom, jsonData);
            },
            eventBind: function() {

            }
        }
    });
})(window, document, oak);