(function(window, document, oak) {
    var $ = jQuery = oak.lib.jQuery,
        DIRTY_CHECKING_INTERVAL = 50;
    oak.extend.define('binding', ['render'], function (options) {
        var _dataBind = function(dom, func) {
            var _func = func;
            _func.prototype.$ele = dom instanceof jQuery ? dom : $(dom);
            _func.prototype.$previous =  {};
            _func.prototype.$applied = false;
            _func.prototype.$use_shadow = false;
            _func.prototype.$check = function() {
                var check = oak.utils.equals(this.$previous, this.$data);
                if (!check) {
                    this.$applied = false;
                }
                return check;
            };
            _func.prototype.$watch = function() {
                // TODO(Li Xipeng): not implemented.
            };
            _func.prototype.$apply = function() {
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
            _func.prototype.$dirtyChecking = function () {
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
            (new func()).$dirtyChecking();
        };

        return {
            dataBind: function (dom, func) {
                _dataBind(dom, func);
            },
            eventBind: function() {

            }
        }
    });
})(window, document, oak);
