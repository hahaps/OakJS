/**
 * @license OakJS v0.1
 * (c) 2015 Totoro-Po
 * License: MIT
 */
(function(window, document, jQuery) {
    // define oak namespace.
    window.oak = window.oak || {};
    // oak library.
    oak.lib = {};

    /**
     * @description
     *
     * This object is used to provide extend method.
     */
    oak.extend = {
        define: function(lib, func) {
            oak.lib[lib] = func();
        },
        inherit: function(lib, requirements, func) {
            // TODO(Li Xipeng): we want to implement
            // a object which base on some required objects
            // in oak lib.
            console.error("Not implemented error.");
        }
    };
    // Add jQuery/$ object in to oak lib.
    oak.extend.define('$', function() {
        return jQuery;
    });
    oak.extend.define('jQuery', function() {
        return jQuery;
    });
})(window, document, jQuery);
