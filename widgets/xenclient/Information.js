define([
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-attr",
    "dojo/query",
    "dojo/topic",
    // Resources
    "dojo/i18n!citrix/xenclient/nls/Information",
    "dojo/text!citrix/xenclient/templates/Information.html",
    // Mixins
    "citrix/common/Dialog",
    "citrix/common/_BoundContainerMixin",
    "citrix/common/_CitrixTooltipMixin",
    //Required in code
    "citrix/xenclient/ReportWizard",
    // Required in template
    "citrix/common/TabContainer",
    "citrix/common/ContentPane",
    "citrix/common/Button",
    "citrix/common/BoundWidget"
],
function(dojo, declare, lang, domAttr, query, topic, infoNls, template, dialog, _boundContainerMixin, _citrixTooltipMixin, reportWizard) {
return declare("citrix.xenclient.Information", [dialog, _boundContainerMixin, _citrixTooltipMixin], {

	templateString: template,
    widgetsInTemplate: true,

    constructor: function(args) {
        this.host = XUICache.Host;
    },

    postMixInProperties: function() {
        lang.mixin(this, infoNls);
        this.inherited(arguments);
    },

    postCreate: function() {
        this.inherited(arguments);
        this.startup();
        this._updateBranding();
        this.own(
            topic.subscribe(XUICache.Host.publish_topic, lang.hitch(this, this._messageHandler)),
            topic.subscribe("com.citrix.xenclient.xenmgr", lang.hitch(this, this._messageHandler))
        );
        this._bindDijit();
    },

    show: function() {
        this.inherited(arguments);
        // Refresh when opening dialog
        this.host.refresh();
    },

    refreshResources: function() {
        this.host.refreshResources(lang.hitch(this, function() {
            this.memoryNode.set("value", this.host.free_mem);
            this.storageNode.set("value", this.host.free_storage);
        }));
    },

    createReport: function() {
        new reportWizard().show();
    },

    _updateBranding: function() {
        XUtils.disableContextMenu(this.brandingNode.contentDocument);
        var blurbPath = XenConstants.Plugins.PLUGIN_PATH + XenConstants.Plugins.BRANDING_DIR + "/";

        function changeBasePath(document, attr) {
            var basePath = location.href;
            basePath = basePath.substr(0, basePath.lastIndexOf("/"));
            basePath += "/" + blurbPath;
            query("[" + attr + "]", document).forEach(function(path, i) {
                domAttr.set(path, attr, basePath + domAttr.get(path, attr));
            });
        }

        XUtils.pathExists(blurbPath + XenConstants.Plugins.BRANDING_BLURB, lang.hitch(this, function(exists, html) {
            this._setDisplay(".branding", exists);
            if (exists) {
                html = XUtils.stripScript(html);
                this.brandingNode.contentDocument.body.innerHTML = html;
                changeBasePath(this.brandingNode.contentDocument.body, "src");
                changeBasePath(this.brandingNode.contentDocument.body, "href");
            }
        }));
    },

    _bindDijit: function() {
        this.bind(this.host);
        this.inherited(arguments);
    },

    _messageHandler: function(message) {
        switch(message.type) {
            case XenConstants.TopicTypes.MODEL_CHANGED: {
                this._bindDijit();
                break;
            }
            case "vm_state_changed": {
                if (this.open) {
                    this.refreshResources();
                }
                break;
            }
        }
    }
});
});
