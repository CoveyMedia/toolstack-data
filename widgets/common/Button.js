define([
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/event",
    "dojo/on", 
    "dojo/keys",
    // Resources
    "dojo/text!citrix/common/templates/Button.html",
    // Required by code
    // Mixins
    "dijit/form/Button"
],
function(dojo, declare, event, on, keys, template, button) {
return declare("citrix.common.Button", [button], {

    templateString: template,

    postCreate: function() {
        this.inherited(arguments);
        this.own(on(this.domNode, "keypress", this._onKey));
    },

    _onKey: function(evt) {
        // this is to make sure the button captures the key press before the container - using ondijitclick
        // doesn't seem to accomplish this since dojo 1.7.2, so cancel the keypress event and let the ondijitclick do its thing
        // also sometimes evt.charOrCode doesn't return keyCode for SPACE here (but does elsewhere) hence using evt.keyCode
        if(evt.keyCode == keys.ENTER || evt.keyCode == keys.SPACE) {
            event.stop(evt);
        }
    },

    _onClick: function(evt) {
        this.inherited(arguments);
    }
});
});
