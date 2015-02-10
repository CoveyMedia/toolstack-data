define([
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/event",
    "dojo/_base/lang",
    "dojo/keys",
    // Mixins
    "dijit/form/NumberSpinner",
    "citrix/common/_KeyboardAttachMixin"
],
function(dojo, declare, event, lang, keys, numberSpinner, _keyboardAttachMixin) {
return declare("citrix.common.NumberSpinner", [numberSpinner, _keyboardAttachMixin], {

    defaultTimeout: 250,
    required: true,
    
    randomFunction: function(name, oldval, newval) {
        if (isNaN(parseInt(newval))) {
            this.set("value", this.constraints.min.toString());
        }
    },

    postCreate: function() {
        this.inherited(arguments);
        // This ensures that composition managers (IME toolbar) don't put crap into the input box (XC-7429)
        this.own(this.watch("value", lang.hitch(this, this.randomFunction)));
    },

    filter: function(/*Number | String*/ val){
        val = this.inherited(arguments);

        if(this._keyboardOpen == true) {
            return this.format(val, {});
        }

        // because this takes in formatted strings and numbers, need to do the following with numbers,
        // then convert it back to a formatted string that is locale appropriate
        val = this.parse(val, this.constraints);

        if (val < this.constraints.min) {
            val = this.constraints.min;
        }
        if (val > this.constraints.max) {
            val = this.constraints.max;
        }

        val = this.format(val, this.constraints);

        return val;
    },

    _onKeyPress: function(e){
		this.inherited(arguments);
        // suppress char keys
        if (e.charOrCode != keys.ENTER &&
            e.charOrCode != keys.TAB &&
            e.charOrCode != keys.CTRL &&
            e.charOrCode != keys.SHIFT &&
            e.charOrCode != keys.ESCAPE &&
            e.charOrCode != keys.DELETE &&
            e.charOrCode != keys.BACKSPACE &&
            e.charOrCode != keys.LEFT_ARROW &&
            e.charOrCode != keys.RIGHT_ARROW &&
            e.charOrCode != keys.NUMPAD_PERIOD &&
            e.charOrCode != "." && e.charOrCode != "," &&
            (e.keyCode < 48 || e.keyCode > 57)) {
            event.stop(e);
        }
	}
});
});
