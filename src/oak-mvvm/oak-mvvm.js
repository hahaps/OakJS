(function(window, document, oak) {
    var $ = jQuery = oak.lib.jQuery;
    oak.extend.define('mvvm', ['binding'], function (options) {
        return {
            vm: function(dom, model) {
                this.$data = model;
                this.$ele = dom instanceof jQuery ? dom :$(dom);
                var _binder = oak.lib.binding.dataBind(dom, model);
                _binder.$dirtyChecking();
            }
        }
    });
})(window, document, oak);