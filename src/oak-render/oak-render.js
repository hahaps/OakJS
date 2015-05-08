/**
 * @license oak-render v0.1
 * (c) 2015 Totoro-Po
 * License: MIT
 */
(function(window, document, oak) {
    var $ = jQuery = oak.lib.jQuery;
    oak.extend.define('render', [], function(options) {
        var _utils = {
            _MAX_RENDER_LEN_: 1000000,
            // default compile tag.
            defaultCompileTag: ["{{", "}}"],
            // attribute used as logic directive.
            logicAttr: 'oak-logic',
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
                  return _utils._logic_if(val, dom, model, options);
                }
                matcher = for_reg.exec(val);
                if(!matcher) {
                  // TODO(Li Xipeng): raise error.
                  return;
                }
                var matched_k_v = matcher[1],
                    items = matcher[2];
                return _utils._logic_for(matched_k_v, items, dom, model, options);
            },
            // Implemented `if` logic.
            _logic_if: function(matched, dom, model, options, cc) {
                var show = _utils.safeEval(matched, model),
                    tag = options.compileTag || _utils.defaultCompileTag;
                if(!show) {
                  $(dom).remove();
                }
                return _utils.render(dom, model, options);
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
                var keys = oak.utils.keys(items),
                    len = keys.length - 1,
                    finder = [];
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
                        finder['node_' + index] = _utils.render(dom, model, options);
                        return true;
                    }
                    var $clone = $(dom).clone();
                    $clone.insertBefore($(dom));
                    finder[index] = _utils.render($clone[0], model, options);
                });
                return finder;
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
                    repExp = new RegExp(tag[0] + ".*?" + tag[1]),
                    match = tagExp.exec(text);
                if(!match) return [true, text];
                while (true){
                    var matcher = match[1],
                        replacer = _utils._getValueFromModel(matcher, model);
                    text = text.replace(repExp, replacer);
                    match = tagExp.exec(text);
                    if(!match) break;
                }
                return [false, text];
            },
            // Analysis content.
            _contextRend: function(text, model, tag) {
                return _utils._matchAndReplace(text, tag, model);
            },
            _render_use_shadow: function(dom, model, finder, options) {
                var tag = options.compileTag || _utils.defaultCompileTag;
                $(dom).data('oak-data', '');
                finder = _utils._render_shadow(dom, model, finder, tag, options);
                return finder;
            },
            _render_shadow: function(dom, model, finder, tag, options) {
                // This will be improve latter!!!
                /*var attrs = finder.attr || {},
                    contexts = finder.context || {},
                    children = dom.childNodes,
                    nodes = finder.node || {};
                for(var attr in attrs) {
                    var val = _utils._contextRend(attrs[attr], model, tag);
                    if(val[0]) continue;
                    $(dom).attr(attr, val[1])
                }
                for(var context in contexts) {
                    var val = _utils._contextRend(contexts[context], model, tag);
                    if(val[0]) continue;
                    var index = parseInt(context);
                    children[index].textContent = val[1];
                }
                for(var node in nodes) {
                    // TODO(Li Xipeng): important!!!!
                    var index = parseInt(node);
                    if(node.lastIndexOf('node_logic') != -1) {
                        $(dom).find(">*[oak-logic=" + nodes[node].val + "]").remove();
                        nodes[node].node = _utils._logic_compile(node[node].val, dom, model, options);
                    } else {
                        nodes[node].node = _utils._render_shadow(children[index], model, nodes[node].node, tag, options);
                    }
                }
                finder.node = nodes;*/
                $(dom).html(finder.html);
                options.use_shadow = false;
                finder = _utils.render(dom, model, options);
                return finder;
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
                var finder = $(dom).data('oak-data'),
                    use_shadow = finder ? true : false,
                    selector = options.selector ||  '';
                if(use_shadow) {
                    return _utils._render_use_shadow(dom, model, finder, options);
                }
                if(!use_shadow) {
                  finder = {
                        html: $(dom).html(),
                        attr: {},
                        context: {},
                        node: {}
                  };
                }
                var $dom = $(dom),
                    attrs = dom.attributes,
                    tag = options.compileTag || _utils.defaultCompileTag;
                // Handle logic attr with expression.
                var sub_counter = 0;
                $dom.find(">*[" + _utils.logicAttr + "]").each(function(i, e) {
                    if(!use_shadow) {
                        var val = $(e).attr(_utils.logicAttr);
                        var sub_finder = _utils._logic_compile(val, e, model, options);
                        if(sub_finder) {
                            finder.node[sub_counter + '_node_logic'] = {
                                val: val,
                                node: sub_finder
                            };
                            sub_counter += 1;
                        }
                    }
                });
                // Analysis expression in attributes.
                $.each(attrs, function(i, e) {
                    if(e.name.toLowerCase().indexOf('oak') === 0) {
                        return true;
                    }
                    var val =e.value;
                    if(typeof val != "string") return;
                    var final = _utils._contextRend(val, model, tag);
                    if(!final[0]) {
                        $dom.attr(e.name, final[1]);
                        finder.attr[e.name] = val;
                    }
                });
                // Handle all childNodes.
                var nodes = dom.childNodes;
                $.each(nodes, function (i, e) {
                    if(!e) return true;
                    var nodeType = e.nodeType;
                    if(nodeType === 3) {
                        var final = _utils._contextRend(e.textContent, model, tag);
                        if(!final[0]) {
                            finder.context[i + '_con'] = e.textContent;
                            e.textContent = final[1];
                        }
                    } else if(nodeType === 1 || nodeType === 9 || nodeType === 11) {
                        if($(e).attr(_utils.logicAttr) !== undefined) {return true;}
                        var sub_finder = _utils.render(e, model, options);
                        if(sub_finder) finder.node[i + '_node'] = sub_finder;
                    }
                });
                if($.isEmptyObject(finder.attr)) {
                    delete finder.attr;
                }
                if($.isEmptyObject(finder.context)) {
                    delete finder.context;
                }
                if($.isEmptyObject(finder.node)) {
                    delete finder.node;
                }
                if($.isEmptyObject(finder)) {
                    return;
                }
                return finder;
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
             * @param {object} opts
             */
            rend: function(dom, model, opts) {
                if(dom instanceof jQuery && dom.length) {
                    dom = dom[0];
                } else if (dom instanceof jQuery) {
                    // TODO(Li Xipeng): raise error.
                    return ;
                }
                var options = {
                    compileTag: oak.lib && oak.lib.compileTag ? oak.lib.compileTag : _utils.defaultCompileTag
                };
                var finder = _utils.render(dom, model, opts);
                $(dom).data('oak-data', finder);
            }
        }
    });
})(window, document, oak);
