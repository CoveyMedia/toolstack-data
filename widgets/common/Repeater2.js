define([
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/dom-attr",
    "dojo/query",
    "dojo/on",
    "dojo/dom-construct",
    "dojo/parser",
    "dijit",
    // Mixins
    "dijit/_Widget",
    "citrix/common/_BoundContainerMixin2",
    "citrix/common/_EditableMixin",
    "citrix/common/_CitrixWidgetMixin"
],
function(dojo, declare, array, lang, attr, query, on, construct, parser, dijit, _widget, _boundContainerMixin, _editableMixin, _citrixWidgetMixin) {
return declare("citrix.common.Repeater2", [_widget, _boundContainerMixin, _editableMixin, _citrixWidgetMixin], {

    dojoEventHandler: "", // this is often a reference to the parent widget, set in the markup
    name: "",
    unbindDisabled: false,
    uniqueId: "id",
    templateAttr: "template",
    bindAttr: "bind",
    emptyAttr: "empty",
    templateHtml: "",
    emptyHtml: "",
    options: {},
    _connectHandles: [],
    _proxyEvents: ["_handleOnChange", "onKeyUp"],

    constructor: function(args) {
        // set values with constructor
        args = args || {};
        for( var i in args){
            if (typeof this[i] !== "undefined"){
                this[i] = args[i];
            }
        }

        this._connectHandles = [];
        function proxyEvent(/*Event*/ event){}
        array.forEach(this._proxyEvents, function(event) {
            this[event] = proxyEvent;
        }, this);
    },

    buildRendering: function() {
        this.inherited(arguments);
        this._getNodes();
        this._bindDijit();
    },

    destroy: function() {
        array.forEach(this.getChildren(), function(widget) {
            widget.destroyRecursive();
        });
        array.forEach(this._connectHandles, function(handle) {
            handle.remove();
        });
        this.inherited(arguments);
    },

    setOptions: function(key, value) {
        this.options[key] = value;
        this._bindDijit();
    },

    _getValueAttr: function() {
        if (!this.value || this.value.length == 0) {
            return null;
        }
        var results = [];
        array.forEach(this._getChildNodeList(), function(node, i) {
            var obj = this.unbind(node, this.unbindDisabled, true, this.bindAttr);
            obj[this.uniqueId] = this.value[i][this.uniqueId];
            results.push(obj);
        }, this);
        return results;
	},

    _setValueAttr: function(newValue) {
        this.value = newValue;
        this._bindDijit();
	},

    
    _getNodes: function() {
        var templateNode = query('[' + this.templateAttr + ']', this.srcNodeRef)[0] || null;
        var emptyNode = query('[' + this.emptyAttr + ']', this.srcNodeRef)[0] || null;

        if (templateNode) {
            this.containerNode = templateNode.parentNode;
            this.containerNode.removeChild(templateNode);
            attr.remove(templateNode, this.templateAttr);
            this.templateHtml = templateNode.outerHTML;
        }

        if (emptyNode) {
            this.containerNode = emptyNode.parentNode;
            this.containerNode.removeChild(emptyNode);
            attr.remove(emptyNode, this.emptyAttr);
            this.emptyHtml = emptyNode.outerHTML;
        }
    },

    _bindDijit: function() {
        this._clearItems();
        this._addItems();
    },

    _clearItems: function() {
        array.forEach(this.getDecendantWidgets(), function(widget) {
            widget.destroyRecursive();
        });
        array.forEach(this._connectHandles, function(handle) {
            handle.remove();
        });
        this._childWidgets = [];
        this.containerNode.innerHTML = "";
        this.optionWidgets = {};
    },

    _addItems: function() {
        if ((this.templateHtml || this.emptyHtml) && this.containerNode && this.value  ){
            if (this.value.length == 0) {
                this._addItem(this.emptyHtml);
                return;
            }
            array.forEach(this.value, function(item) {
                this._addItem(this.templateHtml, item);
            }, this);
            
            this.bind(this.value, this.containerNode, true, this.bindAttr);
             
             
        }

        array.forEach(this.getChildren(), function(widget) {
            if (typeof widget.editing !== "undefined") {
                widget.set("editing", this.editing);
            }
            array.forEach(this._proxyEvents, function(event) {
                if(widget[event]) {
                    if(event == "_handleOnChange") {
                        // in this case we want the context to be that of the widget initiating the event
                        this._connectHandles.push(on(widget, event, widget, lang.hitch(this, this[event])));
                        //this._connectHandles.push(dojo.connect(widget, event, widget, this[event]));
                    } else {
                        this._connectHandles.push(on(widget, event, this, event));
                        //this._connectHandles.push(dojo.connect(widget, event, this, event));
                    }
                }
            }, this);
        }, this);
    },

    _addItem: function(html, item) {
        if (item) {
            if (typeof(item) != "object") {
                item = [item];
            }
            html = lang.replace(html, item, /%([^%]+)%/g);
        }
        var node = construct.toDom(html);
        if(item){
            var widgets = parser.parse(node, {
                scope: "template"
            });
            var _widgets = [];
            for (var p = 0; p < widgets.length; p++){
                this.addChildWidget(widgets[p]);
            }
            
            this._attachTemplateNodes(widgets);
            this._setupOptions(widgets);
        }
        //this.bind(item, node, true, this.bindAttr);
        this.containerNode.appendChild(node);
    },

    _setupOptions: function(widgets) {
        array.forEach(widgets, function(widget) {
            if (widget.optionskey) {
                if (this.options[widget.optionskey]) {

                    function getSelectOption(value) {
                        var result = null;
                        array.some(widget._getChildren(), function(child) {
                            if (child.option.value == value) {
                                result = child;
                                return true;
                            }
                        });
                        return result;
                    }

                    var opts = lang.clone(this.options[widget.optionskey]);
                    widget.set("options", opts);

                    array.forEach(opts, function(option) {
                        if (option.disabled) {
                            var node = getSelectOption(option.value);
                            if (node) {
                                this._setEnabled(node, false);
                            }
                        }
                    }, this);
                }
            }
        }, this);
    },

    _attachTemplateNodes: function(rootNode){
        if (this.dojoEventHandler) {
            var getAttrFunc = function(n,p) {
                return n[p];
            };
            var nodes = rootNode instanceof Array ? rootNode : (rootNode.all || rootNode.getElementsByTagName("*"));
            var x = rootNode instanceof Array ? 0 : -1;
            for(; x<nodes.length; x++){
                var baseNode = (x == -1) ? rootNode : nodes[x];
                // Process dojoAttachEvent
                var attachEvent = getAttrFunc(baseNode, "dojoAttachEvent") || getAttrFunc(baseNode, "data-dojo-attach-event");
                if(attachEvent) {
                    // NOTE: we want to support attributes that have the form
                    // "domEvent: nativeEvent; ..."
                    var event, events = attachEvent.split(/\s*,\s*/);
                    var trim = lang.trim;
                    while((event = events.shift())){
                        if(event){
                            var thisFunc = null;
                            if(event.indexOf(":") != -1){
                                // oh, if only JS had tuple assignment
                                var funcNameArr = event.split(":");
                                event = trim(funcNameArr[0]);
                                thisFunc = trim(funcNameArr[1]);
                            }else{
                                event = trim(event);
                            }
                            if(!thisFunc){
                                thisFunc = event;
                            }
                            this._connectHandles.push(on(baseNode, event, lang.hitch(this.dojoEventHandler, thisFunc)));
                            //this._connectHandles.push(dojo.connect(baseNode, event, this.dojoEventHandler, thisFunc));
                        }
                    }
                }
            }
        }
    },

    _getChildNodeList: function(node) {
        node = node || this.containerNode;
        return new query.NodeList(node).children();
    }
});
});
