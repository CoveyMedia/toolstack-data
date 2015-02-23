define([
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/_base/event",
    "dojo/query",
    "dojo/on",
    "dojo/aspect",
    "dojo/json",
    "dijit",
    "dijit/registry"
],
function(dojo, declare, array, lang, event, query, on, aspect, json, dijit, registry) {
return declare("citrix.common._BoundContainerMixin2", null, {

    _getPrefix: "get_",
    _setPrefix: "set_",
    _handles: [],

    constructor: function() {
        this._handles = [];
        this._childWidgets = [];
    },

    postCreate: function() {
        this.inherited(arguments);
        this._setupSave();
    },

    bind: function(source, rootNode, includeTemplates, attribute) {
        this._binding = true;
        var ignoreAttr = (includeTemplates) ? "" : "templateType";
        attribute = attribute || "name";
        var map = {};
        //array.forEach(this._decendantWidgets, function(widget) {
        array.forEach(this.getDecendantWidgets(), function(widget){
            if (!widget[attribute] || widget["bindIgnore"]) {
                return;
            }
            var entry = map[widget[attribute]] || (map[widget[attribute]] = []);
            entry.push(widget);
        });
        

        

        for(var name in map){
            if (!map.hasOwnProperty(name)) {
                continue;
            }
            var widgets = map[name];
            if (source[this._getPrefix + name]) {
                name = this._getPrefix + name;
            }
            var values = lang.getObject(name, false, source);
            if (values === undefined){
                continue;
            }
            if (typeof(values) === "function") {
                values = values(this);
            }
            if (typeof widgets[0].checked == 'boolean') {
                // for checkbox/radio, values is a list of which widgets should be checked
                var value = (!(values instanceof Array)) ? [values] : values;
                array.forEach(widgets, function(widget){
                    widget.set('value', array.indexOf(value, widget.value) != -1);
                    widget.set("lastBoundValue", array.indexOf(value, widget.value) != -1);
                });
                continue;
            }
            array.forEach(widgets, function(widget) {
                if (widget.containerNode || widget.srcNodeRef || widget.domNode){
                    var value = (widget.multiple && !(values instanceof Array)) ? [values] : values;
                    widget.set('value', value);
                    widget.set("lastBoundValue", value);
                }
            });
        }
        this._binding = false;
    },

    unbind: function(rootNode, unbindDisabled, includeTemplates, attribute) {
        unbindDisabled = unbindDisabled || false;
        var ignoreAttr = (includeTemplates) ? "" : "templateType";
        attribute = attribute || "name";
        var obj = {};
        array.forEach(this.getDescendants(rootNode, ignoreAttr), function(widget) {
            if ((!unbindDisabled && widget.disabled) || !widget[attribute] || widget["bindIgnore"]) {
                return;
            }
            var name = widget[attribute];
            // Single value widget (checkbox, radio, or plain <input> type widget)
            var value = widget.get('value');

            // Store widget's value(s) as a scalar, except for checkboxes which are automatically arrays
            if (typeof widget.checked == 'boolean') {
                if (/Radio/.test(widget.declaredClass)) {
                    // radio button
                    if (value !== false) {
                        lang.setObject(name, value, obj);
                    } else {
                        // give radio widgets a default of null
                        value = lang.getObject(name, false, obj);
                        if (value === undefined) {
                            lang.setObject(name, null, obj);
                        }
                    }
                } else {
                    // checkbox/toggle button
                    var ary=lang.getObject(name, false, obj);
                    if(!ary) {
                        ary=[];
                        lang.setObject(name, ary, obj);
                    }
                    if(value !== false) {
                        ary.push(value);
                    }
                }
            } else {
                var previous = lang.getObject(name, false, obj);
                if (typeof previous != "undefined") {
                    if (previous instanceof Array) {
                        previous.push(value);
                    } else {
                        lang.setObject(name, [previous, value], obj);
                    }
                } else {
                    lang.setObject(name, value, obj);
                }
            }
        });
        return obj;
    },

    saveValues: function(model, values, fn) {

        var setterUsed = false;

        for (var key in values) {

            // Remove null values or values bound to a function (not a setter)
            if (values[key] == null || typeof(model[key]) === "function") {
                delete values[key];
                continue;
            }

            var getter = model[this._getPrefix + key];
            var setter = model[this._setPrefix + key];

            // Deal with individual setters
            if (setter) {
                setterUsed = true;
                var result = setter(values[key]);
                if (typeof(result) == "undefined") {
                    delete values[key];
                    continue;
                } else {
                    values[key] = result;
                }
            }

            var oldValue = getter ? getter() : model[key];

            // Remove unchanged values
            if (oldValue == values[key]) {
                delete values[key];
                continue;
            }
        }

		if (Object.keys(values).length > 0) {
            if (fn) {
			    model.save(values, fn);
            } else {
                model.save(values);
            }
		} else if (setterUsed) {
            model.publish(XenConstants.TopicTypes.MODEL_SAVED);
            model.publish(XenConstants.TopicTypes.MODEL_CHANGED);
            if (fn) fn();
        }

        if(this.saveButton) {
            this.saveButton.set("disabled", true);
        }
    },

    _setupSave: function(/*Array | undefined*/ widgets) {
        if(this.saveButton) {
            var self = this;
            var onChange = function(newValue) {
                // 'this' is the widget context
                // self._binding == false because we don't want undefined to equate to false
                if(this._created && self._created && self._binding == false && newValue !== undefined
                    && ((this.wrapperWidget && this.wrapperWidget.isLoaded) ? this.wrapperWidget.isLoaded() : true) // for editablewidgets with selects as editors
                    && this.lastBoundValue !== undefined && this.get("lastBoundValue").toString() != newValue.toString()) {
                    self.saveButton.set("disabled", false);
                }
            };
            var onKeyUp = function(e) {
                var value;
                var context = this;
                switch(this.declaredClass) {
                    case "citrix.common.Repeater":
                        context = registry.byNode(e.currentTarget);
                        value = context.get("value");
                        event.stop(e);
                        break;
                    case "citrix.common.EditableWidget":
                        value = this.wrapperWidget ? this.get("editingValue") : this.get("value");
                        break;
                    default:
                        value = this.get("value");
                        break;
                };
                onChange.call(context, value);
            };
            array.forEach(widgets || this.getDecendantWidgets(), function(widget) {
                if(widget.name) {
                    if(widget._handleOnChange) {
                        // context needs to be null/not specified so it carries through whatever context the function already has
                        // this is important for getting this to work correctly for bound widgets within a Repeater
                        this._handles.push(aspect.after(widget, "_handleOnChange", onChange, true));
                    }
                    if(widget.onKeyUp) {
                        this._handles.push(widget.on("KeyUp", onKeyUp));
                    }
                }
            }, this);
            this.saveButton.set("disabled", true);
        }
    },

    _attachTemplateNodes: function(rootNode, getAttrFunc) {
        this.inherited(arguments);
        if (getAttrFunc) {
            var nodes = rootNode instanceof Array? rootNode : (rootNode.all || rootNode.getElementsByTagName("*"));
            var x = rootNode instanceof Array ? 0 : -1;
            for(; x<nodes.length; x++){
                var baseNode = (x == -1) ? rootNode : nodes[x];
                // Process dojoEventHandler
                var dojoEventHandler = getAttrFunc(baseNode, "dojoEventHandler") || getAttrFunc(baseNode, "data-dojo-event-handler");
                if(dojoEventHandler){
                    if (dojoEventHandler == "this"){
                        baseNode.dojoEventHandler = this;
                        continue;
                    }
                    baseNode.dojoEventHandler = json.parse.call(this, dojoEventHandler);
                }
            }
        }
    },

    show: function() {
        if(this.saveButton) {
            this.saveButton.set("disabled", true);
        }
        this.inherited(arguments);
    },
    
    // adds a child widget to the BoundContainer, 
    // if not already present
    addChildWidget:function(widget){
        for(var i in this._childWidgets){
            if(this._childWidgets[i].id == widget.id) return;
        }
        this._childWidgets.push(widget);
    },
    
    addChildWidgetArray: function(widgetArray){
        array.forEach(widgetArray, lang.hitch(this, this.addChildWidget));
    },
    
    // recursively get decenant widget
    // returns an array of widgets
    getDecendantWidgets: function(){
      var ret = [];
      array.forEach(this._childWidgets, function(widget){
        ret.push(widget);
        if(widget.hasOwnProperty("_childWidgets") && widget._childWidgets.length){
            ret = ret.concat(widget.getDecendantWidgets());
        }
      });
      return ret;
    },
    
    startChildWidgets: function(){
        array.forEach(this._childWidgets, function(widget){
                widget.startup();
        });
    },
    
    getChildWidget: function(widgetName){
        for( var i = 0; i < this._childWidgets.length; i++){
           if (this._childWidgets[i].name == widgetName){
                return this._childWidgets[i];
           } 
 
        };
        
        return ret;
    },

    uninitialize: function() {
        array.forEach(this._handles, function(handle){handle.remove()});
    }
});
});
