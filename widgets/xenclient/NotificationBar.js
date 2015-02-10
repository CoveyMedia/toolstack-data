define([
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    // Resources
    "dojo/i18n!citrix/xenclient/nls/Alerts",
    "dojo/text!citrix/xenclient/templates/NotificationBar.html",
    // Mixins
    "dijit/_Widget",
    "dijit/_Contained",
    "dijit/_Templated",
    "citrix/common/_CitrixWidgetMixin"
],
function(dojo, declare, lang, topic, alertsNls, template, _widget, _contained, _templated, _citrixWidgetMixin) {
return declare("citrix.xenclient.NotificationBar", [_widget, _contained, _templated, _citrixWidgetMixin], {

	templateString: template,

    postMixInProperties: function() {
        lang.mixin(this, alertsNls);
        this.inherited(arguments);
    },

    postCreate: function() {
        this.inherited(arguments);
        this.own(
            topic.subscribe(XUICache.Host.publish_topic, lang.hitch(this, this._messageHandler))
        );
        this._bindDijit();
    },

    _bindDijit: function() {
        var authReq = false;
        for (var path in XUICache.VMs) {
            var vm = XUICache.VMs[path];
            if (vm && vm.autostart_pending && vm.getState() == XenConstants.VMStates.VM_LOCKED) {
                authReq = true;
                break;
            }
        }
        this._setDisplay(this.autoStartAuthNode, authReq);
        this._setDisplay(this.safeGraphicsNode, XUICache.Host.safe_graphics);
        this._setDisplay(this.unlicensedNode, !XUICache.Host.licensed);
    },

    _messageHandler: function(message) {
        switch(message.type) {
            case XenConstants.TopicTypes.MODEL_CHANGED:
            case XenConstants.TopicTypes.UI_VM_CREATED:
            case XenConstants.TopicTypes.UI_VMSTATE_CHANGED: {
                // a VM state changed
                this._bindDijit();
                break;
            }
        }
    }
});
});
