define([
    "dojo",
    "dojo/_base/declare",
    "dojo/dom-class",
    // Resources
    "dojo/text!citrix/common/templates/WizardStepItem.html",
    // Mixins
    "dijit/_Widget",
    "dijit/_Templated"
],
function(dojo, declare, domClass, template, _widget, _templated) {
return declare("citrix.common.WizardStepItem", [_widget, _templated], {

    templateString: template,
    selected: false,
    baseClass: "citrixWizardStepItem",

    _setSelectedAttr: function(/*boolean*/ value){
        value ? domClass.add(this.domNode, "citrixWizardStepSelected") : domClass.remove(this.domNode, "citrixWizardStepSelected");
    }
});
});
