define([
    "dojo",
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dojo/dom",
    "dijit/registry",
    // Mixins
    "dojo/dnd/Source"
],
function(dojo, declare, construct, dom, registry, source) {
return declare("citrix.common.Source", [source], {

    moveOnly: false,

    copyState: function() {
        if (this.moveOnly) {
            return false;
        }

        this.inherited(arguments);
	},

    deleteSelectedNodes: function() {
   		// summary:
   		//		deletes all selected items
        //      overridden to also destroy the dijit if the node is actually a dijit
   		//var e = dojo.dnd._empty;
        var e = new Object();
   		for(var i in this.selection) {
            if(i in e){ continue; }
            var n = registry.byId(i);
            if(n) {
                n.destroyRecursive(false);
            } else {
                n = dom.byId(i);
                construct.destroy(n);
            }
            this.delItem(i);
   		}
   		this.anchor = null;
   		this.selection = {};
   		return this;	// self
   	}
});
});
