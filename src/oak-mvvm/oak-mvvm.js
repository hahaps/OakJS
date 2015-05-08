(function(window, document, oak) {
    var $ = jQuery = oak.lib.jQuery;
    oak.extend.define('mvvm', ['binding'], function (options) {
        var _vm = function(dom, func) {
            oak.lib.binding.dataBind(dom, func);
        };
        return {
            vm: function(dom, func) {
                return new _vm(dom, func);
            }
        }
    });
})(window, document, oak);
