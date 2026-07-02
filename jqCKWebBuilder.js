/**
 @preserve Creation Kit WebBuilder, built on jQuery 1.6 or so
Copyright 2012 ZeniMax Media Incorporated.
All Rights Reserved.
ZeniMax Media Incorporated, Rockville, Maryland  20850
*/

(function( $ ) {
$.widget("ui.combobox", {
    _create: function() {
        var self = this,
            select = this.element,//.hide(),
            selected = select.children(":selected"),
            value = selected.val() ? selected.text() : "";
        var input = this.input = $("<input>").insertAfter(select).val(value).autocomplete({
            delay: 0,
            minLength: 0,
            source: function(request, response) {
                var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
                response(select.children("option").map(function() {
                    var text = $(this).text();
                    if (this.value && (!request.term || matcher.test(text))) return {
                        label: text.replace(
                        new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + $.ui.autocomplete.escapeRegex(request.term) + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>"),
                        value: text,
                        option: this
                    };
                }));
            },
            select: function(event, ui) {
                ui.item.option.selected = true;
                self._trigger("selected", event, {
                    item: ui.item.option
                });
            },
            change: function(event, ui) {
                if (!ui.item) {
                    var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex($(this).val()) + "$", "i"),
                        valid = false;
                    select.children("option").each(function() {
                        if ($(this).text().match(matcher)) {
                            this.selected = valid = true;
                            return false;
                        }
                    });
                    if (!valid) {
                        // remove invalid value, as it didn't match anything
                        $(this).val("");
                        select.val("");
                        input.data("autocomplete").term = "";
                        return false;
                    }
                }
            }
        }).addClass("ui-widget ui-widget-content ui-corner-left");

        input.data("autocomplete")._renderItem = function(ul, item) {
            return $("<li></li>").data("item.autocomplete", item).append("<a>" + item.label + "</a>").appendTo(ul);
        };

        this.button = $("<button type='button'>&nbsp;</button>").attr("tabIndex", -1).attr("title", "Show All Items").insertAfter(input).button({
            icons: {
                primary: "ui-icon-triangle-1-s"
            },
            text: false
        }).removeClass("ui-corner-all").addClass("ui-corner-right ui-button-icon").click(function() {
            // close if already visible
            if (input.autocomplete("widget").is(":visible")) {
                input.autocomplete("close");
                return;
            }

            // work around a bug (likely same cause as #5265)
            $(this).blur();

            // pass empty string as value to search for, displaying all results
            input.autocomplete("search", "");
            input.focus();
        });
    },

    destroy: function() {
        this.input.remove();
        this.button.remove();
        this.element.show();
        $.Widget.prototype.destroy.call(this);
    },
    autocomplete : function(value) {
        this.element.val(value);
        this.input.val(value);
    }
});
})( jQuery );

function ckStyles(data)
{
    //return "position: relative;";
    return "";
}


var ckpageMetaData;
function InstallMetaData(meta)
{
    gPushMaterial = false;

    ckpageMetaData = meta;

    // clean up meta
    $.each(ckpageMetaData, function(metaKey, metaValue){
        if (metaValue.spinner != undefined && metaValue.spinner.places != undefined) {
            var step = metaValue.spinner.step;
            var min = metaValue.spinner.min;
            var max = metaValue.spinner.max;
            var places = metaValue.spinner.places;
            ckpageMetaData[metaKey].spinner.min = (min != undefined ? Math.round(min*Math.pow(10,places))/Math.pow(10,places) : undefined);
            ckpageMetaData[metaKey].spinner.max = (max != undefined ? Math.round(max*Math.pow(10,places))/Math.pow(10,places) : undefined);
            ckpageMetaData[metaKey].spinner.step = (step != undefined ? Math.round(step*Math.pow(10,places))/Math.pow(10,places) : undefined);
        }
    });

    gPushMaterial = true;
}

function ckAdditionalClasses(data)
{
    var retval = '';
    if (data && data["deprecated"]) {
        retval += ' ckDeprecated';
    }
    if (data && data["displayOnly"]) {
        retval += ' ckDisplayOnly';
    }
    return retval;
}

function AddToFormTypesToGet(formtype)
{
    if (!ckpageMetaData["__formsNeeded"]) {
        ckpageMetaData["__formsNeeded"] = [];
    }
    if (ckpageMetaData["__formsNeeded"].indexOf(formtype) == -1) {
        ckpageMetaData["__formsNeeded"].push(formtype);
    }
}

function GetFormTypeForKey(key)
{
        return ckpageMetaData["__keyFormTypes"][key];
}

function AddKeyFormTypeMapping(key, formtype)
{
        if (!ckpageMetaData["__keyFormTypes"]) {
                ckpageMetaData["__keyFormTypes"] = {};
        }
        ckpageMetaData["__keyFormTypes"][key] = formtype;
}

function HookupFormSelectComponents(header)
{
    if (ckpageMetaData && ckpageMetaData["__formsNeeded"]) {
        if (!ckpageMetaData["__existingForms"]) {
            ckpageMetaData["__existingForms"] = {};
        }
        ckpageMetaData["__formsNeeded"].map(function (formtype) {
            if (!ckpageMetaData["__existingForms"][formtype]) {
                ckpageMetaData["__existingForms"][formtype] = [];
            }
            $.getJSON(header+'getformsoftype?type='+formtype, function(data) {
                $.each(data, function(key,value) {
                    for (i=0;i < value.length;++i) {
                        ckpageMetaData["__existingForms"][formtype].push(value[i]);
                    }
                });

                // Iterate metadata for things looking for this type
                $.each(ckpageMetaData, function(key, value) {
                    if (key[0] != '_') {
                        if (value.type == "tesform" && value.formTypeName == formtype) {
                            // Look up the editbox for that thing
                            var $intendedparent = $('#editbox-'+key);
 
                            var options = '<option value=""></option>';
                            $.each(ckpageMetaData["__existingForms"][formtype], function(i, item ) {
                                options += "<option id='option-"+key+"-"+item.id+"' value='" + item.name + "'>" + item.name + "</option>";
                            });
                            $intendedparent.append(options).combobox();
                        }
                    }
                });
            });
        });
    }
}

function ckValueInRange(val, metaDataForVal)
{
    var retval = true;
    if (metaDataForVal[range]) {
        if (metaDataForVal[range].min) {
            if (metaDataForVal[range].inclusiveMin) {
                retval = (val >= metaDataForVal[range].min);
            } else {
                retval = (val > metaDataForVal[range].min);
            }
        }
        if (retval && metaDataForVal[range].max) {
            if (metaDataForVal[range].inclusiveMax) {
                retval = (val <= metaDataForVal[range].max);
            } else {
                retval = (val < metaDataForVal[range].max);                
            }
        }
    }
    return retval;
}

function ckNegativeAllowed(metaDataForVal)
{
    var retval = true;
    if (metaDataForVal["range"] && "min" in metaDataForVal["range"]) {
        retval = metaDataForVal["range"]["min"] < 0.0;
    } 
    return retval;
}

var someEvent;
function CKEditValidate(evt)
{
    var theEvent = evt || window.event;
    someEvent = theEvent;
    if (theEvent.target && theEvent.target.id) {
        var i = theEvent.target.id.indexOf('editbox-');
        if (i >= 0) {
            var metaDataName = theEvent.target.id.substring(i+8);
            if (ckpageMetaData[metaDataName]) {
                var bisOK = true;
                if (ckpageMetaData[metaDataName].type == "float") {
                    // Allow a '-' only if it's in the 0th position and
                    // negative values are allowed
                    var key = theEvent.keyCode || theEvent.which;
                    if (45 == key) {
                        bisOK = (someEvent.target.selectionEnd == 0 && ckNegativeAllowed(ckpageMetaData[metaDataName]));                        
                    } else if (46 == key) {
                        bisOK = (someEvent.target.value.indexOf('.') < 0);
                    } else {
                        bisOK = (47 < key && 58 > key && event.shiftKey == false);
                    }
                }
                if (!bisOK) {
                    theEvent.returnValue = false;
                    if(theEvent.preventDefault) theEvent.preventDefault();
                }
            }
        }
    }
}

function CKUIntEditValidate(evt)
{
    var theEvent = evt || window.event;
    someEvent = theEvent;
    if (theEvent.target && theEvent.target.id) {
        var i = theEvent.target.id.indexOf('editbox-');
        if (i >= 0) {
            var key = theEvent.keyCode || theEvent.which;
            if (!(47 < key && 58 > key && event.shiftKey == false)) {
                    theEvent.returnValue = false;
                    if(theEvent.preventDefault) theEvent.preventDefault();
            }
        }
    }
}

function CKByteEditValidate(evt)
{
    var theEvent = evt || window.event;
    someEvent = theEvent;
    if (theEvent.target && theEvent.target.id) {
        var i = theEvent.target.id.indexOf('editbox-');
        if (i >= 0) {
            var metaDataName = theEvent.target.id.substring(i+8);
            var key = theEvent.keyCode || theEvent.which;
            // Allow a '-' only if it's in the 0th position and
            // negative values are allowed
            var key = theEvent.keyCode || theEvent.which;
            var bisOK = false;
            if (45 == key) {
                bisOK = (someEvent.target.selectionEnd == 0 && ckNegativeAllowed(ckpageMetaData[metaDataName]));
            } else {
                bisOK = (47 < key && 58 > key && event.shiftKey == false);
            }
            if (!bisOK) {
                theEvent.returnValue = false;
                if(theEvent.preventDefault) theEvent.preventDefault();
            }
        }
    }
}

function BuildBoolComponent(addTo, key, data)
{
    // Build up a string that looks like a div
    var buttonName = 'button-'+key;
    var divName = 'div-'+key;
    var divClasses = ckAdditionalClasses(data);
    var divStyles = ckStyles(data);
    var titleText = data.description;
    $('<div id="'+divName+'" class="ckComponentHolder ckComponentBool'+divClasses+'" style="'+divStyles+'">'+
      '<label for="'+buttonName+'" title="'+titleText+'" class="ckQtippable"><input type="checkbox" id="'+buttonName+'" class="ckbuttonToggle" />'+data.friendlyName+'</label></div>')
        .appendTo(addTo);
}

function BuildFloatComponent(addTo, key, data)
{
    var divName = 'div-'+key;
    var divClasses = ckAdditionalClasses(data);

    if (data.spinner == undefined) {
        var editboxName = 'editbox-'+key;
        
        $('<div id="'+divName+'" class="ckComponentHolder ckComponentFloat'+divClasses+'"><label for="'+editboxName+'" class="ui-widget">'+data.friendlyName+'</label>'+
          '<input type="text" id="'+editboxName+'" class="ckfloatEdit ui-corner-all ui-widget"'+
             'onkeypress="CKEditValidate(event)"/></div>')
            .appendTo(addTo);
    } else {
        var titleText = data.friendlyName;
        if (data.description) {
            titleText = data.description;
        }
        var spinnerBoxName = 'editbox-'+key;
        $('<div id="'+divName+'" class="ckComponentHolder ckComponentSpinner'+divClasses+'">'+
          '<label for="'+spinnerBoxName+'" title="'+titleText+'" class="ui-widget ckQtippable">'+data.friendlyName+'</label>'+
          '<input type="text" id="'+spinnerBoxName+'" class="ckspinnerEdit ui-corner-all ui-widget"></input>'+'</div>')
        .appendTo(addTo);
        
    }
}

function BuildEnumerationComponent(addTo, key, data)
{
    var divName = 'div-'+key;
    var editBoxName = 'editbox-'+key;
    var divClasses = ckAdditionalClasses(data);
    
    var divstring =
        '<div id="'+divName+'" class="ckComponentHolder ckComponentEnum'+divClasses+'"><label for="'+editBoxName+'" class="ui-widget">'+data.friendlyName+'</label>'+
        '<select id="'+editBoxName+'" class="ckenumSelect ui-corner-all ui-widget ui-combobox">';
    for (i=0;i<data.values.length;++i) {
        divstring += '<option value="'+data.values[i]+'">'+data.values[i]+'</option>';
    }
    divstring += '</select></div>';
    $(divstring).appendTo(addTo);
}

function BuildFormSelectComponent(addTo, key, data)
{
    var divName = 'div-'+key;
    var editBoxName = 'editbox-'+key;
    var divClasses = ckAdditionalClasses(data);
    AddKeyFormTypeMapping(key, data.formTypeName);

    var divstring =
        '<div id="'+divName+'" class="ckComponentHolder ckComponentSelect'+divClasses+'"><label for="'+editBoxName+'" class="ui-widget">'+data.friendlyName+'</label>'+
        '<select id="'+editBoxName+'" class="ckformSelect ui-corner-all ui-widget ui-combobox">';
    divstring += '</select></div>';
    $(divstring).appendTo(addTo);
    AddToFormTypesToGet(data.formTypeName);
}

function BuildStringComponent(addTo, key, data)
{
    var divName = 'div-'+key;
    var editBoxName = 'editbox-'+key;
    var divClasses = ckAdditionalClasses(data);

    var divstring =
        '<div id="'+divName+'" class="ckComponentHolder ckComponentString'+divClasses+'"><label for="'+editBoxName+'" class="ui-widget">'+data.friendlyName+'</label>'+
        '<input type="text" id="'+editBoxName+'" class="ckstringEdit ui-corner-all ui-widget"/></div>';
    $(divstring).appendTo(addTo);
}

function BuildUnsignedIntComponent(addTo, key, data)
{
    var divName = 'div-'+key;
    var editBoxName = 'editbox-'+key;   
    var divClasses = ckAdditionalClasses(data);

    var divstring = '<div id="'+divName+'" class="ckComponentHolder ckComponentUInt'+divClasses+'"><label for="'+editBoxName+'" class="ui-widget">'+data.friendlyName+'</label>'+
        '<input type="text" id="'+editBoxName+'" class="ckuintEdit ui-corner-all ui-widget"'+
        'onkeypress="CKUIntEditValidate(event)"/></div>';
    $(divstring).appendTo(addTo);
}

function BuildByteComponent(addTo, key, data)
{
    var divName = 'div-'+key;
    var editBoxName = 'editbox-'+key;
    var divClasses = ckAdditionalClasses(data);
    
    var divstring = '<div id="'+divName+'" class="ckComponentHolder ckComponentByte'+divClasses+'"><label for="'+editBoxName+'" class="ui-widget">'+data.friendlyName+'</label>'+
        '<input type="text" id="'+editBoxName+'" class="ckbyteEdit ui-corner-all ui-widget"'+
        'onkeypress="CKByteEditValidate(event)"/></div>';
    $(divstring).appendTo(addTo);
}

function BuildColorComponent(addTo, key, data)
{
    var divName = 'div-'+key;
    var colorBoxName = 'color-'+key;
    var divClasses = ckAdditionalClasses(data);
    
    var divstring = '<div id="'+divName+'" class="ckComponentHolder ckComponentColor'+divClasses+'">'+
        '<label for="'+colorBoxName+'">Color</lable> <input type="color" id="'+colorBoxName+'" class="ckcolorEdit ui-corner-all ui-widget"/></div>';
    $(divstring).appendTo(addTo);
}

function BuildFilenameComponent(addTo, key, data)
{
    var divName = 'div-'+key;
    var editBoxName = 'editbox-'+key;
    var browseButtonName = 'browse-'+key;
    var clearButtonName = 'clear-'+key;
    var divClasses = ckAdditionalClasses(data);

    var divstring =
        '<div id="'+divName+'" class="ckComponentHolder ckComponentFilename'+divClasses+'"><label for="'+editBoxName+'" class="ui-widget">'+data.friendlyName+'</label>'+
        '<input type="text" id="'+editBoxName+'" class="ckfilenameEdit ui-corner-all ui-widget"/>'+
        '<button id="'+browseButtonName+'" class="ckbuttonFileBrowse ckQtippable" title="Browse for '+data.friendlyName+'">Browse</button>'+
        '<button id="'+clearButtonName+'" class="ckbuttonFileClear ckQtippable" title="Clear selection for '+data.friendlyName+'">Clear</button>'+
        '</div>';

    $(divstring).appendTo(addTo);
}

function BuildTips()
{
    $('.ckQTippable').qtip();
}

function BuildSpinnerBoxes()
{
    $('.ckspinnerEdit').each(function(i, data) {
        var key = data.id.substring(8);
        if (ckpageMetaData != undefined && ckpageMetaData[key] != undefined && ckpageMetaData[key].spinner != undefined) {
            var spinplaces = 1;
            var step = ckpageMetaData[key].spinner.step;
            if (ckpageMetaData[key].spinner.places != undefined) {
                spinplaces = ckpageMetaData[key].spinner.places;
            }

            var onSpinChange = function() {
                $(this).trigger("change");
            };

            $('#'+data.id).spinner({min:ckpageMetaData[key].spinner.min,
                                    max:ckpageMetaData[key].spinner.max,
                                    step: step,
                                    places:spinplaces,
                                    change: onSpinChange
                                   });
        } else {
                console.log("Difficulty setting spinner for "+key);
        }
    });
}

function BuildFileComponents(fileComponentsCallbacks)
{
    $('.ckbuttonFileBrowse').button();
    $('.ckbuttonFileClear').button();
    if (fileComponentsCallbacks != undefined) {
        if (fileComponentsCallbacks["browse"] != undefined) {
                $('.ckbuttonFileBrowse').each(fileComponentsCallbacks["browse"]);
        }
        if (fileComponentsCallbacks["clear"] != undefined) {
                $('.ckbuttonFileClear').each(fileComponentsCallbacks["clear"]);
        }
    }
}

function VisitFileComponentBrowseButtons(Callback)
{
        $('.ckbuttonFileBrowse').each(Callback);
}

function VisitComponents(Callbacks)
{
    if (Callbacks == undefined) return;
    if (Callbacks["bool"] != undefined) {
        $('.ckbuttonToggle').each(Callbacks["bool"]);
    }
    if (Callbacks["float"] != undefined) {
        $('.ckfloatEdit').each(Callbacks["float"]);
    }
    if (Callbacks["string"] != undefined) {
        $('.ckstringEdit').each(Callbacks["string"]);
    }
    if (Callbacks["filename"] != undefined) {
        $('.ckfilenameEdit').each(Callbacks["filename"]);
    }
    if (Callbacks["enumeration"] != undefined) {
        $('.ckenumSelect').each(Callbacks["enumeration"]);
    }
    if (Callbacks["color"] != undefined) {
        $('.ckcolorEdit').each(Callbacks["color"]);
    }
    if (Callbacks["uint"] != undefined) {
        $('.ckuintEdit').each(Callbacks["uint"]);
    }
    if (Callbacks["byte"] != undefined) {
        $('.ckbyteEdit').each(Callbacks["byte"]);
    }
    if (Callbacks["tesform"] != undefined) {
        $('.ckformSelect').each(Callbacks["tesform"]);
    }
    if (Callbacks["spinner"] != undefined) {
        $('.ckspinnerEdit').each(Callbacks["spinner"]);
    }
}

// OnChangeComponents --
/// Visit components of each of the following types and call a function on them if in the OnChangeComponents object
/// "bool", "float", "string", "uint", "enumeration", "byte", "filename", "tesform", "color"
function PostLoadSetup(header, topDiv, fileComponentsCallbacks, onchangeComponentsCallbacks)
{
        if (topDiv == undefined) {
                topDiv = 'input';
        }

        HookupFormSelectComponents(header);
        $('.ckDisplayOnly').children().prop("readonly", true);
        BuildSpinnerBoxes();
        BuildTips();
        BuildFileComponents(fileComponentsCallbacks);
        VisitComponents(onchangeComponentsCallbacks);
}

function BuildComponentForMetaData(key, value, addTo)
{
        if (value.type == "bool") {
            BuildBoolComponent(addTo, key, value);
        } else if (value.type == "float") {
            BuildFloatComponent(addTo, key, value);
        } else if (value.type == "enumeration") {
            BuildEnumerationComponent(addTo, key, value);
        } else if (value.type == "tesform") {
            BuildFormSelectComponent(addTo, key, value);
        } else if (value.type == "string") {
            BuildStringComponent(addTo, key, value);	
        } else if (value.type =="uint") {
            BuildUnsignedIntComponent(addTo, key, value);
        } else if (value.type =="byte") {
            BuildByteComponent(addTo, key, value);
        } else if (value.type =="filename") {
            BuildFilenameComponent(addTo,key,value);
        } else if (value.type == "color") {
            BuildColorComponent(addTo,key,value);
        } else {
        }
}

function BuildComponentsForMetaData(data, addTo)
{
    $.each(data, function(key, value) {
        BuildComponentForMetaData(key, value, addTo);
    });
}


function RetrieveBoolComponent(returnObject, key)
{
    var buttonName = '#button-'+key;
    if ($(buttonName).attr('checked') != undefined) {
        returnObject[key] = true;
    } else {
        returnObject[key] = false;
    }
}

function RetrieveEditBoxComponent(type, returnObject, key)
{
    var editboxName = '#editbox-'+key;
    var contents = $(editboxName).val();
    if (type == "float") {
        returnObject[key] = parseFloat(contents);
    } else if (type == "byte" || type == "uint") {
        returnObject[key] = parseInt(contents);
    } else {
        returnObject[key]= contents;
    }
}

function RetrieveEditBoxFormComponent(type, returnObject, key)
{
    var editboxName = '#editbox-'+key;
    var contents = $(editboxName).val();
    if (contents != "") {
        // Look at the metadata and determine type, then look in the downloaded things for that type;
        var formtype = GetFormTypeForKey(key);
        $.each(ckpageMetaData["__existingForms"][formtype], function(i, item ) {
                if (contents == item.name) {
                        returnObject[key] = parseInt(item.id);
//                        console.log("Found "+item.name+" as id "+item.id);
                        return;
                }
        });
    }
}

function RetrieveColorComponent(returnObject, key)
{
    var colorName = '#color-'+key;
    var contents = $(colorName).val();
    if (contents != "") {
        returnObject[key] = contents;
    }
}


function RetrieveObjectFromPageMetaData()
{
    var returnObj = {};
    $.each(ckpageMetaData, function(key, value) {
        if (value.type == "bool") {
            RetrieveBoolComponent(returnObj, key);
        } else if (value.type == "float" ||
                   value.type == "string" ||
                   value.type == "uint" ||
                   value.type == "enumeration" ||
                   value.type == "byte" ||
                   value.type == "filename") {
            RetrieveEditBoxComponent(value.type, returnObj, key);
        } else if (value.type == "tesform") {
            RetrieveEditBoxFormComponent(value.type, returnObj, key);
        } else if (value.type == "color") {
            RetrieveColorComponent(returnObj, key);
        } else {
                console.log("UNSUPPORTED PERSIST TYPE "+value.type);
        }
    });
    return returnObj;
}

function SetBoolComponent(key, value)
{
    var buttonName = '#button-'+key;
    $(buttonName).attr('checked', value);
    $(buttonName).trigger("change");
}

function SetEditBoxComponent(key, value)
{
    if (ckpageMetaData[key].spinner != undefined && ckpageMetaData[key].spinner.places != undefined) {
        value = Math.round(value*Math.pow(10, ckpageMetaData[key].spinner.places))/Math.pow(10, ckpageMetaData[key].spinner.places);
    }
    var editboxName = '#editbox-'+key;
    var showInHex = ckpageMetaData[key]["displayInHex"];
    if (showInHex != undefined && showInHex) {
        value = value.toString(16);
    }
    $(editboxName).val(value);
    $(editboxName).trigger("change");
}

function SetEnumerationComponent(key, value)
{
    var editBoxName = '#editbox-'+key;
    //console.log("setting "+editBoxName+" to "+value);
    //$(editBoxName).combobox('autocomplete', value);
    $(editBoxName).val(value);
    $(editBoxName).trigger("change");
}

function SetColorComponent(key, value)
{
    var colorName = '#color-'+key;
    $(colorName).attr('value', value);
    $(colorName).trigger("change");
}

function InstallDataIntoFields(data)
{
    gPushMaterial = false;
    $.each(data, function(key, value) {
        //console.log("Installing data, key is "+key+" and value is "+value);
        // For each one, look it up in the metadata, and find the appropriate thing and fill it
        if (ckpageMetaData[key]) {
            if (ckpageMetaData[key].type == "bool") {
                SetBoolComponent(key, value);
            } else if (ckpageMetaData[key].type == "float" ||
                   ckpageMetaData[key].type == "string" ||
                   ckpageMetaData[key].type == "uint" ||
                   ckpageMetaData[key].type == "byte" ||
                   ckpageMetaData[key].type == "tesform" ||
                   ckpageMetaData[key].type == "filename") {
                SetEditBoxComponent(key, value);
            } else if (ckpageMetaData[key].type == "enumeration" ) {
                SetEnumerationComponent(key, value);
            } else if (ckpageMetaData[key].type == "color") {
                SetColorComponent(key, value);
            }
        }
    });
    gPushMaterial = true;
}

function BuildFormTypesDom(parentDiv, key, helpText, funcOnSelect)
{
        divName = 'div-'+key;
        editboxName = 'editbox-'+key;
        var divstring =
            '<div id="'+divName+'" class="ckComponentHolder"><label for="'+editboxName+'" class="ui-widget">'+helpText+'</label>'+
            '<select id="'+editboxName+'" class="ui-corner-all ui-widget ui-combobox" onchange="'+funcOnSelect+'">';
        divstring += '</select></div>';
        $(divstring).appendTo(parentDiv);
}

function BuildFormTypesSelector(header, key)
{
        $.getJSON(header+"getformtypeswithmetadata", function(data) {
                $.each(data, function(k, value) {
                        var options = '<option value=""></option>';
                        value.map(function(formtype) {
                                options+="<option value='"+formtype+"'>" + formtype + "</option>";
                        });
                        $('#editbox-'+key).append(options).combobox();
                });
        });
}

function BuildFormTypesSelectorAndRequest(header, key, requestString)
{
        $.getJSON(header+requestString, function(data) {
                $.each(data, function(k, value) {
                        var options = '<option value=""></option>';
                        value.map(function(formtype) {
                                options+="<option value='"+formtype+"'>" + formtype + "</option>";
                        });
                        $('#editbox-'+key).append(options).combobox();
                });
        });
}

function BuildFormTypesWithMetaDataSelector(header, intoDiv, key, helpText, funcOnSelect)
{
        BuildFormTypesDom(intoDiv, key, helpText, funcOnSelect);
        BuildFormTypesSelector(header, key);
}

function BuildFormTypesWithMetaDataSelectorAndRequest(header, intoDiv, key, helpText, funcOnSelect, requestString)
{
        console.log("Getting with header "+header+" and request "+requestString);
        BuildFormTypesDom(intoDiv, key, helpText, funcOnSelect);
        BuildFormTypesSelectorAndRequest(header, key, requestString);
}


function GetMetaDataSelectorText(key)
{
        return $('#editbox-'+key+' option:selected').val();
}

function BuildFormNamesDom(parentDiv, key, helpText, funcOnSelect)
{
        divName = 'div-'+key;
        editboxName = 'editbox-'+key;
        var divstring =
            '<div id="'+divName+'" class="ckComponentHolder"><label for="'+editboxName+'" class="ui-widget">'+helpText+'</label>'+
            '<select id="'+editboxName+'" class="ui-corner-all ui-widget ui-combobox" onchange="'+funcOnSelect+'">';
        divstring += '</select></div>';
        $(divstring).appendTo(parentDiv);
}

function BuildFormNamesSelector(header, key, formtype)
{
        $.getJSON(header+"getformsoftype?type="+formtype, function(data) {
                $.each(data, function(k, value) {
                        var options = '<option value=""></option>';
                        value.map(function(formdata) {
                                options+="<option value='"+formdata.id+"'>" + formdata.name + "</option>";
                        });
                        $('#editbox-'+key).append(options).combobox();
                });
        });
}

function BuildFormNamesSelectorGeneric(header, key, formtype, requestString)
{
        $.getJSON(header+requestString+"?type="+formtype, function(data) {
                $.each(data, function(k, value) {
                        var options = '<option value=""></option>';
                        value.map(function(formdata) {
                                options+="<option value='"+formdata.id+"'>" + formdata.name + "</option>";
                        });
                        $('#editbox-'+key).append(options).combobox();
                });
        });
}


function BuildFormNamesWithSelector(header, intoDiv, key, formtype, helpText, funcOnSelect)
{
        BuildFormNamesDom(intoDiv, key, helpText, funcOnSelect);
        BuildFormNamesSelector(header, key, formtype);
}

function BuildFormNamesWithSelectorAndRequest(header, intoDiv, key, formtype, helpText, funcOnSelect, requestString)
{
        BuildFormNamesDom(intoDiv, key, helpText, funcOnSelect);
        BuildFormNamesSelectorGeneric(header, key, formtype, requestString);
}

function GetGroup(data)
{
        var returnval = undefined;
        if (data != undefined && data['grouping'] != undefined) {
                returnval = data['grouping'];
        }
        return returnval;
}

///////////////////////////////// COMMAND-LINE COMMANDS /////////////////////////////////
function EndLayoutComponents()
{
    $('.ckComponentHolder').draggable("destroy");
    $('.ckComponentHolder').resizable("destroy");
    return "Ending component layout";
}
function EndLayoutSections()
{
    $('.ck-groupify').draggable("destroy");
    $('.ck-groupify').resizable("destroy");
    return "Ending section layout";
}

function LayoutComponents()
{
    //EndLayoutSections();
    $('.ckComponentHolder').draggable();
    $('.ckComponentHolder').resizable();
    return "Component layout mode";
}

function LayoutSections()
{
    //EndLayoutComponents();
    $('.ck-groupify').draggable();
    $('.ck-groupify').resizable();
    return "Section layout mode";
}

function EndAllLayout()
{
    EndLayoutComponents();
    EndLayoutSections();
    return "Ended layout";
}

function StoreLayout(asname)
{
    // Ultimately, we'll store off the thing here
    var layout = {groups:new Object(),components:new Object()};
    
    // Iterate each thing and put it in a datastructure
    var stuff = $('.ck-groupify');
    for (i = 0; i < stuff.length; ++i) {
        if (stuff[i] && stuff[i].style != undefined && stuff[i].style.cssText != undefined) {
            layout.groups[stuff[i].id] = stuff[i].style.cssText;
        }
    }
    
    stuff = $('.ckComponentHolder');
    for (i = 0; i < stuff.length; ++i) {
        if (stuff[i] && stuff[i].style != undefined && stuff[i].style.cssText != undefined) {
            layout.components[stuff[i].id] = stuff[i].style.cssText;
        }
    }
    
    //layout.groups = groups;
	console.log("JSON STRINGIFIED");
	console.log(JSON.stringify(layout));
	console.log("DEFAULT");
	console.log(layout);
    return layout;
}


///////////////////////////////// TEST FUNCTIONALITY /////////////////////////////////
function DoComponentSetting(layout, k, v)
{
    var stuff = [];
	if (layout.components != undefined && layout.components[v.id] != undefined) {
		stuff = layout.components[v.id].split(';');
	}
    
    var divWeSet = $('#'+v.id);
    for (i = 0; i < stuff.length; ++i) {
        var indivPiece = stuff[i].split(':');
        if (indivPiece.length == 2) {
            var key = $.trim(indivPiece[0]);
            var value = $.trim(indivPiece[1]);
            if (key == "width") {                        
                divWeSet.width(value);
            } else if (key == "height") {
                divWeSet.height(value);
            } else {
                divWeSet.css(key, value);
            }
        }
    }
}
function DoLayoutSetting(layout, k, v)
{
    var stuff = [];
	if (layout.groups != undefined && layout.groups[v.id] != undefined) {
		stuff = layout.groups[v.id].split(';');
	}
    
    var divWeSet = $('#'+v.id);
    for (i = 0; i < stuff.length; ++i) {
        var indivPiece = stuff[i].split(':');
        if (indivPiece.length == 2) {
            var key = $.trim(indivPiece[0]);
            var value = $.trim(indivPiece[1]);
            if (key == "width") {                        
                divWeSet.width(value);
            } else if (key == "height") {
                divWeSet.height(value);
            } else {
                divWeSet.css(key, value);
            }
        }
    }
}
function ReadLayout(layout)
{
    if (layout != undefined) {
        if (layout["groups"] != undefined) {
            $('.ck-groupify').each( function(k, v) {
                DoLayoutSetting(layout, k, v);
            });
        }
        if (layout["components"] != undefined) {
            $('.ckComponentHolder').each( function(k,v) {
                DoComponentSetting(layout, k, v);
            });
        }
    }
    console.log("Done reading layout");
}
