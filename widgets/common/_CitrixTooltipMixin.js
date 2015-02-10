define([
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/query",
    "dojo/dom-attr",
    // Required in code
    "citrix/common/Tooltip"
],
function(dojo, declare, array, query, attr, tooltip) {
/*
    When mixed in with a widget that contains nodes, setting "title" attribute on child nodes and
     calling "_bindDijit" will result in a tooltip.
 */
return declare("citrix.common._CitrixTooltipMixin", null, {

    _citrixTooltips: null,
    _idCounter: 0,

    constructor: function() {
        this._citrixTooltips = {};
    },

    _bindDijit: function() {
        this.bindTooltips();
    },

    bindTooltips: function() {
        array.forEach(query("[title]", this.containerNode), function(item) {
            var id = attr.get(item, "id");
            var title = attr.get(item, "title");
            var preserve = attr.get(item, "pre") || false;
            if(this._citrixTooltips[id]) {
                this._citrixTooltips[id].setTooltip(id);
            } else if (title != "") {
                if (preserve) {
                    attr.set(item, "title", "<span style='white-space:pre'>" + title + "</span>");
                }
                var position = [attr.get(item, "position") || "below"];
                if (!id && title != "") {
                    id = this.id + "_tooltipNode_" + (this._idCounter++).toString();
                    attr.set(item, "id", id);
                }
                this._citrixTooltips[id] = new tooltip({ connectId: id, position: position, showDelay: 200, baseClass: "citrixTooltip" });
                if(this._started) {
                    this._citrixTooltips[id].startup();
                }
            }
            // don't bother creating tooltip if title exists but is empty
        }, this);
    },

    startup: function() {
        if(!this._started) {
            for (var tooltip in this._citrixTooltips) {
                if(this._citrixTooltips.hasOwnProperty(tooltip)) {
                    this._citrixTooltips[tooltip].startup();
                }
            }
        }
        this.inherited(arguments);
    },

    destroy: function() {
        for(var tooltip in this._citrixTooltips) {
            if(this._citrixTooltips.hasOwnProperty(tooltip)) {
                this._citrixTooltips[tooltip].destroy();
                delete this._citrixTooltips[tooltip];
            }
        }
        this._citrixTooltips = {};
        this.inherited(arguments);
    }
});
});
