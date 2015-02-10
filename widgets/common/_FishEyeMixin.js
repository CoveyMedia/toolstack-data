define([
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-geometry",
    "dojo/on"
],
function(dojo, declare, lang, domClass, geometry, on) {
return declare("citrix.common._FishEyeMixin", null, {

    mouseContainer: window,
    nodeName: "imageNode",
    fishClass: "fish",
    innerField: 50,
    outerField: 200,
    minScale: 1.0,
    maxScale: 1.25,
    _lastScale: 0,
    _fishEyeOn: true,

    postCreate: function() {
        this._scaler = (this.maxScale - this.minScale) / (this.outerField - this.innerField);
        domClass.add(this.containerNode, this.fishClass);
        this.own(on(this.mouseContainer, "mousemove", lang.hitch(this, this._mouseMove)));
        this.inherited(arguments);
    },

    _mouseMove: function(event) {
        if(!this._fishEyeOn) {
            this._scaleImage(this.minScale);
            return;
        }
        var coords = geometry.position(this[this.nodeName]);
        this._imageCentreX = coords.x + (this[this.nodeName].width / 2);
        this._imageCentreY = coords.y + (this[this.nodeName].height / 2);
        var dist_x = (this._imageCentreX - event.x);
        var dist_y = (this._imageCentreY - event.y);
        var dist = Math.sqrt((dist_x * dist_x) + (dist_y * dist_y));
        var scale = ((this.outerField - dist) * this._scaler) + this.minScale;
        scale = Math.min(this.maxScale, scale);
        scale = Math.max(this.minScale, scale);
        this._lastScale = scale;
        this._scaleImage(scale);
    },

    _onFocus: function() {
        this._scaleImage(this.maxScale);
    },

    _onBlur: function() {
        // Fix resize jumping
        var scale = Math.max(this._lastScale, this.minScale);
        this._scaleImage(scale);
    },

    _scaleImage: function(scale) {
        this[this.nodeName].style.webkitTransform = "scale(" + scale + ")";
    }
});
});
