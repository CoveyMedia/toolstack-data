define([
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/dom",
    "dojo/dom-class",
    "dojo/dom-attr", 
    "dijit",
    // Mixins
    "dijit/Tooltip"
],
function(dojo, declare, array, dom, domClass, attr, dijit, tooltip) {
return declare("citrix.common.Tooltip", [tooltip], {

    baseClass: "",
    isOpen: false,

    startup: function() {
        this.inherited(arguments);

        array.forEach(this._connectIds, function(item) {
            this.setTooltip(item);
        }, this);
    },

    setTooltip: function(id) {
        var node = dom.byId(id);
        if(!node) {
            return;
        }
        if(attr.has(node, "title")) {
            this.label = attr.get(node, "title");
            attr.remove(node, "title");
        }
    },

    open: function(/*DomNode*/ target){
        if(this.label == "") { return; }

        this.inherited(arguments);
        if(this.baseClass != "") {
            domClass.add(dijit._masterTT.domNode, this.baseClass);
        }
    },

    close: function() {
        this.inherited(arguments);
        if(this.baseClass != "" && dijit._masterTT) {
            domClass.remove(dijit._masterTT.domNode, this.baseClass);
        }
    },

    addTarget: function(/*DOMNODE || String*/ node){
        var id = node.id || node;
        if(array.indexOf(this._connectIds, id) == -1 || this._connections.length == 0 || this._connections[0].length == 0) {
            this.set("connectId", this._connectIds.concat(id));
        }
    },

    onShow: function() {
        this.inherited(arguments);
        this.isOpen = true;
    },

    onHide: function() {
        this.inherited(arguments);
        this.isOpen = false;
    }
});
});
