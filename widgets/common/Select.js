define([
    "dojo",
    "dojo/_base/declare",
    "dojo/dom-class",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/dom-attr",
    "dojo/keys",
    // Mixins
    "dijit/form/Select",
    // Required in code
    "dijit/MenuSeparator",
    "dijit/MenuItem"
],
function(dojo, declare, domClass, lang, array, attr, keys, select, menuSeparator, menuItem) {

var _SelectMenu = declare("citrix.common._SelectMenu", [select._Menu], {

    focus: function() {
        if(this.parentSelect && this.parentSelect._selectedOption) {
            this.focusChild(this.parentSelect._selectedOption);
        } else {
            this.focusFirstChild();
        }
    }

});

var Select = declare("citrix.common.Select", [select], {

    _selectedOption: null,

    _loadChildren: function(/*Boolean*/ loadMenuItems){
        if(loadMenuItems === true){
            // want this to actually destroy the menu entirely, so that _connects gets cleared out
            if(this.dropDown) {
                this.dropDown.destroyRecursive(false);
                delete this.dropDown;
            }
            // Create the dropDown widget
            this.dropDown = new _SelectMenu({id: this.id + "_menu", parentSelect: this});
            domClass.add(this.dropDown.domNode, /*this.baseClass + */ "dijitSelectMenu");
        }
        this.inherited(arguments);
    },

    // Functions rewritten below to allow falsey values in select options

	_getMenuItemForOption: function(/*dijit.form.__SelectOption*/ option){
		// summary:
		//		For the given option, return the menu item that should be
		//		used to display it.  This can be overridden as needed
		if(!option.label){
			// We are a separator (no label set for it)
			return new menuSeparator();
		}else{
			// Just a regular menu option
			var click = lang.hitch(this, "_setValueAttr", option);
			var item = new menuItem({
				option: option,
				label: option.label || this.emptyLabel,
				onClick: click,
				disabled: option.disabled || false
			});
            item.focusNode.setAttribute("role", "listitem");
			return item;
		}
	},

    _setValueAttr: function(/*anything*/ newValue, /*Boolean, optional*/ priorityChange) {
		// summary:
		//		set the value of the widget.
		//		If a string is passed, then we set our value from looking it up.
		if(this._loadingStore){
			// Our store is loading - so save our value, and we'll set it when
			// we're done
			this._pendingValue = newValue;
			return;
		}
		var opts = this.getOptions() || [];
        if(!(newValue instanceof Array)){
			newValue = [newValue];
		}
		array.forEach(newValue, function(i, idx){
			if(!lang.isObject(i)){
				newValue[idx] = array.filter(opts, function(node){
					return node.value === i;
				})[0] || {value: "", label: ""};
			}
		}, this);

		// Make sure some sane default is set
        // newValue = dojo.filter(newValue, function(i){ return i && i.value; });
		if(!this.multiple && !newValue[0] && opts.length){
			newValue[0] = opts[0];
		}
		array.forEach(opts, function(i){
			i.selected = array.some(newValue, function(v){ return v.value === i.value; });
		});
		var val = array.map(newValue, function(i){ return i.value; }),
			disp = array.map(newValue, function(i){ return i.label; });

		this._set("value", this.multiple ? val : val[0]);
		this._setDisplay(this.multiple ? disp : disp[0]);

		this._updateSelection();
		this._handleOnChange(this.value, priorityChange);
        attr.set(this.valueNode, "value", this.get("value"));
	},

    _updateSelection: function() {
		// summary:
		//		Sets the "selected" class on the item for styling purposes
		this._set("value", this._getValueFromOpts());
		var val = this.value;
		if(!(val instanceof Array)){
			val = [val];
		}
//		if(val && val[0]){
        var selectedChild = null;
        array.forEach(this._getChildren(), function(child){
            var isSelected = array.some(val, function(v){
                return child.option && (v === child.option.value);
            });
            domClass.toggle(child.domNode, /*this.baseClass + */"dijitSelectSelectedOption", isSelected);
            child.domNode.setAttribute("aria-selected", isSelected);
            if(isSelected) { // XC-9487 saves the selected widget so that the dropdown menu can highlight it when it opens
                selectedChild = child;
            }
        }, this);
        this._selectedOption = selectedChild;
//		}
	},

	_getValueFromOpts: function() {
		// summary:
		//		Returns the value of the widget by reading the options for
		//		the selected flag
		var opts = this.getOptions() || [];
		if(!this.multiple && opts.length){
			// Mirror what a select does - choose the first one
			var opt = array.filter(opts, function(i){
				return i.selected;
			})[0];
			if(opt){
				return opt.value
			}else{
                return "";
//				opts[0].selected = true;
//				return opts[0].value;
			}
		}else if(this.multiple){
			// Set value to be the sum of all selected
			return array.map(array.filter(opts, function(i){
				return i.selected;
			}), function(i){
				return i.value;
			}) || [];
		}
		return "";
	},

    _onKey: function(/*Event*/ e){
        if(e.charOrCode == keys.ENTER) {
            return;
        }
        else {
            this.inherited(arguments);
        }
    }
});

Select._Menu = _SelectMenu;

return Select;
});
