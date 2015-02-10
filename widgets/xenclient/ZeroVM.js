define([
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/_WidgetBase",
    // Resources
    "dojo/text!citrix/xenclient/templates/ZeroVM.html",
    // Mixins
    "citrix/xenclient/_VMButton"
],
function(dojo, declare, lang, widgetBase, template, _vmButton) {
return declare("citrix.xenclient.ZeroVM", [_vmButton], {

	templateString: template,
    text: "",
    imagePath: "",

    attributeMap: lang.delegate(widgetBase.prototype.attributeMap, {
        text: [{ node: "textNode", type: "innerHTML" }],
        imagePath: [{ node: "imageNode", attribute : 'src'}]
    })
});
});
