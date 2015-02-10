define([
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    // Resources
    "dojo/text!citrix/common/templates/TabContainer.html",
    // Mixins
    "dijit/layout/TabContainer",
    // Required in code
    "citrix/common/TabController"
],
function(dojo, declare, lang, domClass, template, tabContainer) {
return declare("citrix.common.TabContainer", [tabContainer], {

    templateString: template,
    controllerWidget: "citrix.common.TabController",
    baseClass: "citrixTabContainer",
    tabPosition: "left-h",

    startup: function(){
        if(this._started){ return; }

        this.inherited(arguments);

        this.own(this.tablist.watch("focused", lang.hitch(this, function(prop, oldVal, newVal) {
            domClass.toggle(this.wrapperNode, "dijitFocused", newVal);
        })));
    }
});
});
