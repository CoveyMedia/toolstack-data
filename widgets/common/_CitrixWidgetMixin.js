define([
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/query",
    "dojo/dom-class",
    "dijit/registry",
    "dojo/NodeList-dom",
],
function(dojo, declare, array, query, domClass, registry) {
return declare("citrix.common._CitrixWidgetMixin", null, {

    _setDisplay: function(item, display) {
        if (!item) {
            return;
        }

        function setDisplay(node, display) {
            if (node.domNode) {
                node = node.domNode;
            }
            node.style.display = display ? "" : "none";
        }

        if (typeof(item) == "string" && this.domNode) {
            query(item, this.domNode).forEach(function(node) {
                setDisplay(node, display);
            });
        } else {
            setDisplay(item, display);
        }
    },

    _setVisible: function(item, visible) {
        if (!item) {
            return;
        }

        function setVisible(node, visible) {
            if (node.domNode) {
                node = node.domNode;
            }
            node.style.visibility = visible ? "visible" : "hidden";
        }

        if (typeof(item) == "string" && this.domNode) {
            query(item, this.domNode).forEach(function(node) {
                setVisible(node, visible);
            });
        } else {
            setVisible(item, visible);
        }
    },

    _setEnabled: function(item, enabled) {
        if (!item) {
            return;
        }

        function setEnabled(node, enabled) {
            node.set("disabled", !enabled);
        }

        if (typeof(item) == "string" && this.domNode) {
            query(item, this.domNode).forEach(function(node) {
                node = registry.byNode(node);
                if (node) {
                    setEnabled(node, enabled);
                }
            });
        } else {
            setEnabled(item, enabled);
        }
    },

    _setClass: function(item, cssClass, toggle) {
        if (!item || cssClass == "") {
            return;
        }

        if (typeof(item) == "string" && this.domNode) {
            query(item, this.domNode).toggleClass(cssClass, toggle);
        } else {
            domClass.toggle(item, cssClass, toggle);
        }
    }
});
});
