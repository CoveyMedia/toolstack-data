define([
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/lang",
    // Resources
    "dojo/i18n!citrix/xenclient/nls/Receiver",
    "dojo/text!citrix/xenclient/templates/Receiver.html",
    // Mixins
    "citrix/common/Dialog",
    "citrix/common/_CitrixWidgetMixin",
    // Required in template
    "citrix/common/ValidationTextBox",
    "citrix/common/Button"
],
function(dojo, declare, lang, receiverNls, template, dialog, _citrixWidgetMixin) {
return declare("citrix.xenclient.Receiver", [dialog, _citrixWidgetMixin], {

	templateString: template,
    widgetsInTemplate: true,
    canExecute: true,
    needsValidation: true,

    postMixInProperties: function() {
        lang.mixin(this, receiverNls);
        this.inherited(arguments);
    },

    postCreate: function() {
        this.inherited(arguments);
        this.startup();
        this.set("title", this.TITLE);
    },

    _setStateAttr: function(value) {
        this._setEnabled(this.finishButton, !value);
    },

    show: function() {
        this.urlNode.reset();
        this.nameNode.reset();
        this.inherited(arguments);
    },

    onExecute: function() {
        XUtils.publish(XenConstants.TopicTypes.UI_SHOW_WAIT);

        function failure(error) {
            XUtils.publish(XenConstants.TopicTypes.UI_HIDE_WAIT);
            XUICache.messageBox.showError(error, XenConstants.ToolstackCodes);
        }

        var url = this.urlNode.get("value");
/*
        if (!url.startsWith("http")) {
            url = "https://" + url;
        }
*/
        var args = arguments;

        XUICache.Host.createVMWithUI("new-vm-ica", this.nameNode.get("value"), "", "images/vms/Receiver_VM.png", lang.hitch(this, function(vm_path) {
            XUICache.loadVMModel(vm_path, lang.hitch(this, function(vm) {
                vm.url = url;
                vm.save(lang.hitch(this, function() {
                    this.inherited(args);
                    XUtils.publish(XenConstants.TopicTypes.UI_HIDE_WAIT);
//                    vm.start();
                }));
            }), failure);
        }), failure);
    }
});
});
