define([
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/lang",
    // Mixins
    "dijit/form/ValidationTextBox",
    "citrix/common/_KeyboardAttachMixin"
],
function(dojo, declare, lang, validationTextBox, _keyboardAttachMixin) {
return declare("citrix.common.ValidationTextBox", [validationTextBox, _keyboardAttachMixin], {

    missingMessage: "",
    regExpObject: "",
    
    regExpGen: function(/*dijit.form.ValidationTextBox.__Constraints*/ constraints) {
        if(this.regExpObject) {
            var exp = lang.getObject(this.regExpObject);
            if(exp) {return exp;}
        }
        return this.regExp;
    }
});
});
