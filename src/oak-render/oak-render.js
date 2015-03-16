/**
 * @license oak-render v0.1
 * (c) 2015 Totoro-Po
 * License: MIT
 */
(function(window, document, oak) {
    var $ = jQuery = oak.lib.jQuery;
    oak.extend.define('render', function(options) {
        var _utils = {
            _MAX_RENDER_LEN_: 1000000,
            // default compile tag.
            defaultCompileTag: ["{{", "}}"],
            // attribute used as logic directive.
            logicAttr: 'oak-logic',
            /**
             * @description
             *
             * To judge if a object has specified property.
             *
             * @param {object} obj judgement target.
             * @param {string} prop property.
             * @returns {bool}
             */
            hasOwnProperty: function(obj, prop) {
                var proto = obj.__proto__ || obj.constructor.prototype;
                return (prop in obj) &&
                    (!(prop in proto) || proto[prop] !== obj[prop]);
            },
            /**
             *
             * @description
             *
             * Handle expression of javascript and
             * get result with exception handle.
             *
             * @returns {object}
             */
            safeEval: function() {
                if(arguments.length < 2) return "";
                if(typeof arguments[1] !== "object") return "";
                for(arguments[2] in arguments[1]) {
                    eval("var " + arguments[2] + "=arguments[1][arguments[2]];");
                }
                try {
                    return eval(arguments[0]);
                } catch (e) {
                    console.error("Failed to analysis expression", e)
                }
            },
            /**
             * @description
             *
             * Get keys from a object.
             *
             * @param {object} obj
             * @returns {object} a keys array.
             */
            keys: function(obj) {
                if(typeof obj !== 'object') {
                    // TODO(Li Xipeng): raise error.
                    return;
                }
                if(typeof Object.keys === 'function') {
                    return Object.keys(obj);
                }
                var keys = [];
                for(var index in obj) {
                    keys.push(index);
                }
                return keys;
            },
            /**
             * @description
             *
             * Compile logic express in dom attribute.
             * Here we logic fragment:
             *   if logic:  used as `if obj.test || objs.t`.
             *              If return true, remove target dom.
             *   for logic: used as `for item in obj`/`for k,v in obj`.
             *              Generate new dom list.
             *
             * @param {string} val javascript expression.
             * @param {object} dom dom object.
             * @param {object} model
             * @param {object} options
             * @returns null
             */
            _logic_compile: function(val, dom, model, options) {
                var if_reg = /^if\s(.*?)$/,
                    for_reg = /^for\s(.*?)\sin\s(.*?)$/;
                val = $.trim(val);
                var matcher = if_reg.exec(val);
                if(matcher) {
                  var matched = matcher[1];
                  _utils._logic_if(val, dom, model);
                  return;
                }
                matcher = for_reg.exec(val);
                if(!matcher) {
                  // TODO(Li Xipeng): raise error.
                  return;
                }
                var matched_k_v = matcher[1],
                    items = matcher[2];
                _utils._logic_for(matched_k_v, items, dom, model, options);
            },
            // Implemented `if` logic.
            _logic_if: function(matched, dom, model, options) {
                var show = _utils.safeEval(matched, model),
                    tag = options.compileTag || _utils.defaultCompileTag;
                if(!show) {
                  $(dom).remove();
                }
                _utils.render(dom, model, options);
            },
            // Implemented `for` logic.
            _logic_for: function(k_v, items, dom, model, options) {
                items = _utils.safeEval($.trim(items), model) || [];
                k_v = $.trim(k_v);
                if($.isEmptyObject(items)) {
                    $(dom).remove();
                    return;
                }
                var reg = /^([_a-zA-Z][_a-zA-Z0-9]*?)\s*?,\s*?([_a-zA-Z][_a-zA-Z0-9]*?)$/,
                    matcher = reg.exec(k_v), key = null, val = null;
                if(!matcher) {
                    matcher = /^([_a-zA-Z][_a-zA-Z0-9]*?)$/.test(k_v);
                    if(!matcher) {
                        // TODO(Li Xipeng): raise error.
                        return;
                    }
                    key = k_v;
                } else {
                    key = $.trim(matcher[1]);
                    val = $.trim(matcher[2]);
                }
                var keys = _utils.keys(items),
                    len = keys.length - 1;
                $.each(keys, function(index, e) {
                    if(key && val) {
                        model[key] = e;
                        model[val] = items[e];
                    } else if(key) {
                        model[key] = items[e];
                    } else {
                        return false;
                    }
                    model.$index = index;
                    if(index === len) {
                        _utils.render(dom, model, options);
                        return true;
                    }
                    var $clone = $(dom).clone();
                    $clone.insertBefore($(dom));
                    _utils.render($clone[0], model, options);
                });
            },
            // Analysis expression between spec tag and replace them.
            _getValueFromModel: function(val, model) {
                // TODO(Li Xipeng): filter method will be implemented.
                var val = _utils.safeEval(val, model);
                return val === undefined || val === null ? "" : val;
            },
            // Analysis text string and get value between tag.
            _matchAndReplace: function(text, tag, model) {
                var tagExp = new RegExp(tag[0] + "(.*?)" + tag[1]),
                    repExp = new RegExp(tag[0] + ".*?" + tag[1]);
                while (true){
                    var match = tagExp.exec(text);
                    if(!match) break;
                    var matcher = match[1],
                        replacer = _utils._getValueFromModel(matcher, model);
                    text = text.replace(repExp, replacer);
                }
                return text;
            },
            // Analysis content.
            _contextRend: function(text, model, tag) {
                return _utils._matchAndReplace(text, tag, model);
            },
            /**
             * @description
             *
             * Analysis attributes and textContent of dom
             * and nodes inner dom.
             *
             * @param {object} dom
             * @param {object} model
             * @param {object} options
             */
            render: function(dom, model, options) {
                options = options || {};
                var $dom = $(dom),
                    attrs = dom.attributes,
                    tag = options.compileTag || _utils.defaultCompileTag;
                // Handle logic attr with expression.
                $dom.find(">*[" + _utils.logicAttr + "]").each(function(i, e) {
                    _utils._logic_compile($(e).attr(_utils.logicAttr), e, model, options);
                });
                // Analysis expression in attributes.
                $.each(attrs, function(i, e) {
                    if(e === _utils.logicAttr) {
                        return true;
                    }
                    var val = $dom.attr(e.name);
                    if(typeof val != "string") return;
                    $dom.attr(e.name, _utils._contextRend(val, model, tag));
                });
                // Handle all childNodes.
                nodes = dom.childNodes;
                $.each(nodes, function (i, e) {
                    if(!e) return true;
                    var nodeType = e.nodeType;
                    if(nodeType === 3) {
                        e.textContent = _utils._contextRend(e.textContent, model, tag);
                    } else if(nodeType === 1 || nodeType === 9 || nodeType === 11) {
                        if($(e).attr(_utils.logicAttr) !== undefined) {return true;}
                        _utils.render(e, model, options);
                    }
                });
            }
        };
        return {
            /**
             * @description
             *
             * Set compile tag of oak-render.
             *
             * @param {object} tag a list with start and end tag.
             */
            setCompileTag: function (tag) {
                if (!(tag && typeof tag[0] === "string" && typeof tag[1] === "string")) {
                    if (oak.lib && oak.lib.render) {
                        oak.lib.render.compileTag = tag;
                    }
                }
                // TODO(Li Xipeng): notice info.
            },
            /**
             * @description
             *
             * Render dom with binding with model.
             *
             * @param {object} dom
             * @param {object} model
             */
            rend: function(dom, model) {
                if(dom instanceof jQuery && dom.length) {
                    dom = dom[0];
                } else if (dom instanceof jQuery) {
                    // TODO(Li Xipeng): raise error.
                    return ;
                }
                var options = {
                    compileTag: oak.lib && oak.lib.compileTag ? oak.lib.compileTag : _utils.defaultCompileTag
                };
                _utils.render(dom, model, options);
            }
        }
    });
})(window, document, oak);
