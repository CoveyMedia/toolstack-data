define([
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/event",
    "dojo/topic",
    "dojo/keys",
    "dijit/registry",
    // Mixins
    "citrix/common/Dialog",
    "citrix/common/_BoundContainerMixin",
    "citrix/common/_CitrixTooltipMixin"
],
function(dojo, declare, lang, event, topic, keys, registry, dialog, _boundContainerMixin, _citrixTooltipMixin) {
return declare("citrix.common._WizardDialog", [dialog, _boundContainerMixin, _citrixTooltipMixin], {

    //templateString: should be set in any children
    widgetsInTemplate: true,
    destroyOnHide: true,
    canExecute: true,

    wizardId: "wizard", // needs to be set in any children to be unique amongst wizards

    postCreate: function() {
        this.inherited(arguments);
        this.own(topic.subscribe(this.wizardId + "-cancel", lang.hitch(this, "onCancel")));
        this.own(topic.subscribe(this.wizardId + "-finish", lang.hitch(this, "onExecute")));
    },

    afterHide: function() {
        XUtils.publish(XenConstants.TopicTypes.UI_HIDE_WAIT);
        this.inherited(arguments);
    },

    onProgress: function() {
        var widget = registry.byId(this.wizardId);
        if(widget && widget.progress) {
            widget.progress();
        }
    },

    _onKey: function(evt) {
        if(evt.charOrCode == keys.ENTER && this.canExecute
            && evt.srcElement && evt.srcElement.type != "textarea") {
            this.onProgress();
            event.stop(evt);
            return;
        } else if(evt.charOrCode == keys.ESCAPE && !this.canCancel) {
            event.stop(evt);
            return;
        }
        this.inherited(arguments);
    }
});
});
