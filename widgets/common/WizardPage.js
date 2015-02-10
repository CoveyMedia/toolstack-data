define([
    "dojo",
    "dojo/_base/declare",
    "dojo/topic",
    "dijit",
    // Mixins
    "dijit/form/_FormMixin",
    "citrix/common/ContentPane"
],
function(dojo, declare, topic, dijit, _formMixin, contentPane) {
return declare("citrix.common.WizardPage", [contentPane, _formMixin], {

    isReturnable: true,

    onStartFunction: function() {},
    onNextFunction: function(success) { success(); },

    postCreate: function() {
        this.inherited(arguments);

        this.own(this.watch("selected", function(prop, oldVal, newVal) {
            if(newVal && !this._wasShown && this.onStartFunction) {
                this.onStartFunction();
            }
        }));
    },

    _setStateAttr: function(value) {
        this.state = value;
        
        topic.publish(this.getParent().id + "-stateChange", (value == ""));
    },

    onShow: function() {
        if(!this._haveFocused) {
            this._haveFocused = true;
            var node = dijit.getFirstInTabbingOrder(this.domNode);
            if(node) {
                node.focus();
            }
        }
    }
});
});
