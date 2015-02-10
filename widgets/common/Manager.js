define([
    "dojo",
    "dojo/_base/declare",
    "dojo/dnd/autoscroll",
    "dojo/dom-geometry", 
    // Mixins
    "dojo/dnd/Manager"
],
function(dojo, declare, autoscroll, geometry, manager) {
return declare("citrix.common.Manager", [manager], {

//	OFFSET_X: 0,
//	OFFSET_Y: 0,
    horizontalOnly: false,
    verticalOnly: false,
    autoScroll: false,

	onMouseMove: function(event) {
		if(this.avatar) {
            if (this.autoScroll) {
			    autoscroll.autoScrollNodes(event);
            }

            var x = this._getAvatarX(event);
            var y = this._getAvatarY(event);
			var style = this.avatar.node.style;
			style.left = x + "px";
			style.top  = y + "px";

            // BROKEN, no replacement for dojo.isCopyKey as of 1/16/15
			var copy = Boolean(this.source.copyState(dojo.isCopyKey(event)));
			if(this.copy != copy){
				this._setCopyStatus(copy);
			}
		}
	},

    onMouseUp: function() {
        delete this._avatarX;
        delete this._avatarY;
        this.inherited(arguments);
    },

    _getAvatarX: function(event) {
        if (this._avatarX) {
            return this._avatarX;
        }
        if (this.verticalOnly) {
            this._avatarX = geometry.position(event.target.parentNode).x + this.OFFSET_X;
            return this._avatarX;
        }
        return event.pageX + this.OFFSET_X;
    },

    _getAvatarY: function(event) {
        if (this._avatarY) {
            return this._avatarY;
        }
        if (this.horizontalOnly) {
            this._avatarY = geometry.position(event.target.parentNode).y + this.OFFSET_Y;
            return this._avatarY;
        }
        return event.pageY + this.OFFSET_Y;
    }
});
});
