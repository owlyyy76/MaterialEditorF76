/**
 @preserve Creation Kit WebBuilder, built on jQuery 1.6 or so
Copyright 2012 ZeniMax Media Incorporated.
All Rights Reserved.
ZeniMax Media Incorporated, Rockville, Maryland  20850
*/

var ckmaterialMetaData = [];
var currentMaterialType = "bgsm";

function GetCurrentMaterialType( )
{
	return currentMaterialType;
}

function SetCurrentMaterialType(type)
{
	currentMaterialType=type;
}

ReadLayoutCallback = function(data) {
	ReadLayout(data);
};

function ValidateTextureSelected()
{
	var numTextures = $('.ckTextureFileSelected').length;
	if (numTextures == 0) {
		JGrowlError("No texture selected");
	} else if (numTextures > 1) {
		JGrowlError("Too many textures selected (this should be impossible; see Brett)");
	}
	return (numTextures == 1);
}

function SilentSuccess(data,textStatus,jqXHR)
{
	//$.jGrowl("Successful push!");
}

function ErrorOnPush(jqXHR,textStatus,errorThrown)
{
	JGrowlError("Unable to push: "+textStatus);	
}

function BrowseFunction(idx, item) {
	var buttonName = '#'+item.id;
    $(buttonName).on("click", function() {
		if ( buttonName == "#browse-sRootMaterialPath" )
		{
			$("#RootMaterialTreeModal").data("openedBy", buttonName);
			$("#RootMaterialTreeModal").dialog("open");
		}
		else
		{
			$("#TextureTreeModal").data("openedBy", buttonName);
			$("#TextureTreeModal").dialog("open");
		}
    });
}

function ClearFunction(idx, item) {
	var buttonName = '#'+item.id;
	$(buttonName).click(function(e) {
		var editBoxName = '#editbox'+ this.id.substring(5);
		$(editBoxName).val('');
		var pushAs = '';

		if (ValidateMaterialSelectedSilent()) {
			$('.ckMaterialFileSelected').each(function() {
                var materialPath = $(this).data("path").replace("data/materials/", "");
				pushAs = '?file=' + materialPath;
			});
		}
		SaveMaterialUtility('pushmaterial'+pushAs, SilentSuccess, ErrorOnPush);
		// Set global variable for clicking away without saving
		ChangingMaterialsIsOkay = false;
	});
}

function PushOnButtonChange(idx, item) {
	var elementName = '#'+item.id;
    $(elementName).change(function(e) {
		var pushAs = '';
		if (ValidateMaterialSelectedSilent()) {
			$('.ckMaterialFileSelected').each(function() {
                var materialPath = $(this).data("path").replace("data/materials/", "");
				pushAs = '?file=' + materialPath;
			});
		}
        if(typeof(gPushMaterial) == "undefined" || gPushMaterial) {
            SaveMaterialUtility('pushmaterial'+pushAs, SilentSuccess, ErrorOnPush);
            // Set global variable for clicking away without saving
            ChangingMaterialsIsOkay = false;
        }
	});
}

function PushOnEditboxChange(idx, item) {
	var elementName = '#'+item.id;
	$(elementName).on("change keyup", function(e) {
		var pushAs = '';
		if (ValidateMaterialSelectedSilent()) {
			$('.ckMaterialFileSelected').each(function() {
                var materialPath = $(this).data("path").replace("data/materials/", "");
				pushAs = '?file=' + materialPath;
			});
		}
        if(typeof(gPushMaterial) == "undefined" || gPushMaterial) {
            SaveMaterialUtility('pushmaterial'+pushAs, SilentSuccess, ErrorOnPush);
            // Set global variable for clicking away without saving
            ChangingMaterialsIsOkay = false;
        }
	});
}

function PushOnElementChange(idx, item) {
}

function BuildMaterialFromMetaData(header, addTo, callback, callbackArg1, callbackArg2)
{
	console.log("removing");
    ckmaterialMetaData["_groups"] = [];
	$('#group-Alpha').remove();
	$('#group-Specular').remove();
	$('#group-BackLighting').remove();
	$('#group-Misc').remove();
	$('#group-Emittance').remove();
	$('#group-EnvironmentMapping').remove();
	$('#group-Glowmap').remove();
	$('#group-Refraction').remove();
	$('#group-RimLighting').remove();
	$('#group-SubsurfaceLighting').remove();
	$('#group-Textures').remove();
	$('#group-Parallax').remove();
	
	$('#group-Base').remove();
	$('#group-Blood').remove();
	$('#group-Falloff').remove();
	$('#group-GrayscaleToPalette').remove();
	$('#group-Lighting').remove();
	$('#group-Soft').remove();
	
    // Let's go ahead and get the metadata from the server and build from there
    $.when($.getJSON(header + "getmaterialmetadata?materialType=" + GetCurrentMaterialType(), function (data) {
        console.log(data);
            InstallMetaData(data);
            $.each(data, function(key, value) {
            var group = GetGroup(value);
            if (group != undefined) {
                // Check to see if it's a member of _groups, and if it is, create a new div under "addTo" that is that thing
                if (ckmaterialMetaData["_groups"].indexOf(group) == -1) {
                    addTo.append('<fieldset class="ck-groupify ui-widget ui-widget-content ui-corner-all" id="group-'+group+'" style="overflow:hidden;"><legend>'+group+'</legend><div class="ck-resizable" id="group-'+group+'-1"></div></fieldset>');
                    ckmaterialMetaData["_groups"].push(group);
                }
            }
            
            // Terrific, now just go ahead and build the thing that goes there
            var $group = addTo;
            if (group != undefined) {
                $group = $('#group-'+group+'-1');
            }
            BuildComponentForMetaData(key, value, $group);
        })
    })).done(function() {

			// Customize file buttons
			var fileBrowse = { "browse" : BrowseFunction, "clear" : ClearFunction };
			var componentCallbacks = { "bool" : PushOnButtonChange, "float" : PushOnEditboxChange, "string" : PushOnEditboxChange,
				"uint" : PushOnEditboxChange, "enumeration" : PushOnButtonChange, "byte" : PushOnEditboxChange, "filename" : PushOnEditboxChange,
				"color" : PushOnButtonChange, "spinner" : PushOnButtonChange
			};
            PostLoadSetup(header, '', fileBrowse, componentCallbacks);
			
			if ( currentMaterialType == "BGSM" || currentMaterialType == "bgsm" )
			{
			    ReadLayout({
			        "groups": {
			            "ActiveMaterialContainer": "position: relative;",
			            "ControlButtons": "position: relative;",
			            "group-Alpha": "overflow: hidden; position: absolute; top: 589px; left: 3px; width: 250px; height: 152px;",
			            "group-Specular": "overflow: hidden; position: absolute; left: 4px; top: 791px; width: 380px; height: 385px;",
			            "group-BackLighting": "overflow: hidden; position: absolute; left: 284px; top: 590.6875px; width: 109px; height: 71px;",
			            "group-Hair": "overflow: hidden; position: absolute; left: 290px; top: 1206px; width: 74px; height: 84px;",
			            "group-Misc": "overflow: hidden; position: absolute; left: 421px; top: 854px; height: 503px; width: 230px;",
			            "group-Emittance": "overflow: hidden; position: absolute; left: 290px; top: 1471px; width: 99px; height: 104px;",
			            "group-EnvironmentMapping": "overflow: hidden; position: absolute; left: 421px; top: 689px; width: 159px; height: 139px;",
			            "group-Glowmap": "overflow: hidden; position: absolute; left: 4px; top: 1219px; width: 249px; height: 45px;",
			            "group-GrayscaleToPalette": "overflow: hidden; position: absolute; left: 290px; top: 1389px; width: 313px; height: 37px;",
			            "group-Refraction": "overflow: hidden; position: absolute; left: 430px; top: 1471px; width: 126px; height: 88px;",
			            "group-RimLighting": "overflow: hidden; position: absolute; left: 283px; top: 693.0625px; width: 94px; height: 75px;",
			            "group-SubsurfaceLighting": "overflow: hidden; position: absolute; left: 426px; top: 590.25px; width: 152px; height: 70px;",
			            "group-Textures": "overflow: hidden; position: absolute; left: 4px; top: 111px; width: 574px; height: 449px;",
			            "group-Parallax": "overflow: hidden; position: absolute; left: 3px; top: 1311px; width: 249px; height: 203px;"
			        }, "components": {
			            "restoreDefaultsDiv": "position: relative;",
			            "checkoutAddDiv": "position: relative;",
			            "revertDiv": "position: relative;",
			            "saveMaterialDiv": "position: relative;",
			            "saveMaterialAsDiv": "position: relative;",
			            "syncMaterialsDiv": "position: relative;",
			            "refreshFileList": "",
			            "div-bAlphaTest": "position: relative;",
			            "div-bEnableEditorAlphaRef": "position: relative;",
			            "div-eAlphaBlendMode": "position: relative;",
			            "div-fAlpha": "position: relative;",
			            "div-fAlphaTestRef": "position: relative;",
			            "div-bAnisoLighting": "position: relative;",
			            "div-bSpecularEnabled": "position: relative;",
			            "div-cSpecularColor": "position: relative;",
			            "div-fSmoothness": "position: relative;",
			            "div-fSpecularMult": "position: relative;",
			            "div-bBackLighting": "position: relative;",
			            "div-fBackLightPower": "position: relative;",
			            "div-bCastShadows": "position: relative;",
			            "div-bDecal": "position: relative;",
			            "div-bDecalNoFade": "position: relative;",
			            "div-bDissolveFade": "position: relative;",
			            "div-bExternalEmittance": "position: relative;",
			            "div-bFacegen": "position: relative;",
			            "div-bHideSecret": "position: relative;",
			            "div-bModelSpaceNormals": "position: relative;",
			            "div-bScreenSpaceReflections": "",
			            "div-bTree": "position: relative;",
			            "div-bTwoSided": "position: relative;",
			            "div-bZBufferTest": "position: relative;",
			            "div-bZBufferWrite": "position: relative;",
			            "div-bEmitEnabled": "position: relative;",
			            "div-cEmittanceColor": "position: relative;",
			            "div-fEmittanceMult": "position: relative;",
			            "div-bEnvironmentMapping": "position: relative;",
			            "div-bEnvironmentMappingEye": "position: relative;",
			            "div-bEnvironmentMappingLightFade": "position: relative;",
			            "div-bEnvironmentMappingWindow": "position: relative;",
			            "div-fEnvironmentMappingMaskScale": "position: relative;",
			            "div-bGlowmap": "position: relative;",
			            "div-bGrayscaleToPaletteColor": "position:relative",
			            "div-fGrayscaleToPaletteScale": "position:absolute; left: 100px; top:30px;",
			            "div-bRefraction": "position: relative;",
			            "div-bRefractionFalloff": "position: relative;",
			            "div-fRefractionPower": "position: relative;",
			            "div-bRimLighting": "position: relative;",
			            "div-fRimPower": "position: relative;",
			            "div-bSubsurfaceLighting": "position: relative;",
			            "div-fSubsurfaceLightingRolloff": "position: relative;",
			            "div-bTileU": "position: relative; left: 135px; top: 352px;",
			            "div-bTileV": "position: relative; left: 368px; top: 328px;",
			            "div-fUOffset": "position: relative; left: 85px; top: 329px;",
			            "div-fUScale": "position: relative; left: 89px; top: 325px;",
			            "div-fVOffset": "position: relative; left: 319px; top: 271px;",
			            "div-fVScale": "position: relative; left: 323px; top: 267px;",
			            "div-sDiffuseTexture": "position: relative; top: -166px;",
			            "div-sEnvmapTexture": "position: relative; top: -45px;",
			            "div-sGlowTexture": "position: relative; top: -50px;",
			            "div-sGreyscaleTexture": "position: relative; top: -183px;",
			            "div-sInnerLayerTexture": "position: relative; top: -60px;",
			            "div-sNormalTexture": "position: relative; top: -355px;",
			            "div-sSmoothSpecTexture": "position: relative; top: -360px;",
			            "div-sWrinklesTexture": "position: relative; top: -240px;",
			            "div-eParallaxType": "position: relative;",
			            "div-fParallaxInnerLayerUScale": "position: relative;",
			            "div-fParallaxInnerLayerVScale": "position: relative;",
			            "div-fParallaxLayerThickness": "position: relative;",
			            "div-fParallaxOcclusionHeightScale": "position: relative;",
			            "div-fParallaxOcclusionMaxPasses": "position: relative;",
			            "div-fParallaxRefractionScale": "position: relative;"
			        }
			    });
			}
			else if ( currentMaterialType == "BGEM" || currentMaterialType == "bgem" )
			{
			    ReadLayout({
			        "groups": {
			            "ActiveMaterialContainer": "position: relative;",
			            "ControlButtons": "position: relative;",
			            "group-Alpha": "overflow: hidden; position: absolute; top: 469px; left: 391px; width: 188px; height: 135px;",
			            "group-Blood": "overflow: hidden; position: absolute; left: 2px; top: 825.6875px; width: 73px; height: 56px;",
			            "group-Misc": "overflow: hidden; position: absolute; left: 186px; top: 467px; height: 182px; width: 172px;",
			            "group-Lighting": "overflow: hidden; position: absolute; left: 402px; top: 673.8125px; width: 176px; height: 118px;",
			            "group-EnvironmentMapping": "overflow: hidden; position: absolute; left: 2px; top: 946px; width: 523px; height: 52px;",
			            "group-Falloff": "overflow: hidden; position: absolute; left: 1px; top: 674px; width: 358px; height: 117px;",
			            "group-GrayscaleToPalette": "overflow: hidden; position: absolute; left: 247px; top: 825.6875px; width: 140px; height: 87px;",
			            "group-Hair": "overflow: hidden; position: absolute; left: 4px; top: 582px; width: 144px; height: 60px;",
			            "group-Refraction": "overflow: hidden; position: absolute; left: 432px; top: 825.6875px; width: 146px; height: 88px;",
			            "group-Soft": "overflow: hidden; position: absolute; left: 119px; top: 825.6875px; width: 92px; height: 71px;",
			            "group-Textures": "overflow: hidden; position: absolute; left: 4px; top: 111px; width: 574px; height: 325px;",
			            "group-Base": "overflow: hidden; position: absolute; left: 3px; top: 468.75px; height: 86px; width: 144px;"
			        }, "components": {
			            "restoreDefaultsDiv": "position: relative;", "checkoutAddDiv": "position: relative;",
			            "revertDiv": "position: relative;", "saveMaterialDiv": "position: relative;",
			            "saveMaterialAsDiv": "position: relative;", "syncMaterialsDiv": "position: relative;",
			            "refreshFileList": "position: relative;", "div-bAlphaTest": "position: relative;",
			            "div-eAlphaBlendMode": "position: relative;", "div-fAlpha": "position: relative;",
			            "div-fAlphaTestRef": "position: relative;", "div-bBloodEnabled": "position: relative;",
			            "div-bDecal": "position: relative;",
			            "div-bDecalNoFade": "position: relative;",
			            "div-bTwoSided": "position: relative;",
			            "div-bZBufferTest": "position: relative;",
			            "div-bZBufferWrite": "position: relative;",
			            "div-bEffectLightingEnabled": "position: relative;",
			            "div-fLightingInfluence": "position: absolute; top: 54.8125px; left: 10px; height: 20.15999984741211px; width: 175px;",
			            "div-bEnvironmentMapping": "position: relative;",
			            "div-fEnvironmentMappingMaskScale": "position: relative; left: 175px; top: -21px;",
			            "div-iEnvmapMinLOD": "position: relative; left: 325px; top: -45px;",
			            "div-bFalloffColorEnabled": "position: absolute; top: 31px; left: 100px; width: 252px; height: 37.15999984741211px;",
			            "div-bFalloffColor": "position: absolute; top: 31px; left: 200px; width: 252px; height: 37.15999984741211px;",
			            "div-fFalloffStartAngle": "position: relative; left: 5px; top: 28px;",
			            "div-fFalloffStartOpacity": "position: relative; left: 179px; top: 0px;",
			            "div-fFalloffStopAngle": "position: relative; left: 5px; top: 1px;",
			            "div-fFalloffStopOpacity": "position: relative; left: 180px; top: -30px;",
			            "div-bGrayscaleToPaletteAlpha": "position: relative; left: -1px; top: 40px;",
			            "div-fGrayscaleToPaletteColor": "position: absolute; left: 10px; top: 39.8125px; height: 18.15999984741211px;",
			            "div-bRefraction": "position: relative;",
			            "div-bRefractionFalloff": "position: relative;",
			            "div-fRefractionPower": "position: relative;",
			            "div-bSoftEnabled": "position: relative;",
			            "div-fSoftDepth": "position: relative;",
			            "div-bTileU": "position: relative; left: 135px; top: 222px;",
			            "div-bTileV": "position: relative; left: 368px; top: 198px;",
			            "div-fUOffset": "position: relative; left: 85px; top: 200px;",
			            "div-fUScale": "position: relative; left: 89px; top: 199px;",
			            "div-fVOffset": "position: relative; left: 319px; top: 144px;",
			            "div-fVScale": "position: relative; left: 319px; top: 143px;",
			            "div-sBaseTexture": "position: relative; top: -166px;",
			            "div-sEnvmapMaskTexture": "position: relative; top: -86px; left: 1px;",
			            "div-sEnvmapTexture": "position: relative; top: -176px; left: 1px;",
			            "div-sGrayscaleTexture": "position: relative; top: -268px; left: 0px;",
			            "div-sGreyscaleTexture": "position: relative; top: -268px; left: 0px;",
			            "div-sNormalTexture": "position: relative; left: 2px; top: -186px;",
			            "div-fBaseColorScale": "position: relative; left: 2px; top: 4px;",
			            "div-uBaseColor": "position: absolute; left: 16px; top: 29.8125px; width: 95px; height: 23.15999984741211px;"
			        }
			    });
			}
            if (callback != undefined) { callback(callbackArg1, callbackArg2); }

            $(".ckbuttonFileClear").each(function(){
                var that = $(this);
                var key = $(this).attr("id").substring(6);
                var editbox = "#editbox-"+key;
                $(editbox).on("change input", function(){
                    var hasValue = $(this).val().length;
                    hasValue ? that.button("enable") : that.button("disable");
                });
            });

            var inputRelatives = [
                [$("#button-bAlphaTest"), [$("#editbox-fAlphaTestRef")]],
                [$("#button-bEnvironmentMapping"), [$("#group-EnvironmentMapping-1 input").not("#button-bEnvironmentMapping")]],
                [$("#button-bSpecularEnabled"), [$("#group-Specular-1 input").not("#button-bSpecularEnabled")]],
                [$("#button-bRimLighting"), [$("#group-RimLighting-1 input").not("#button-bRimLighting")]],
                [$("#button-bHair"), [$("#group-Hair-1 input").not("#button-bHair")]],
                [$("#button-bRefraction"), [$("#group-Refraction-1 input").not("#button-bRefraction")]],
                [$("#button-bEmitEnabled"), [$("#group-Emittance-1 input").not("#button-bEmitEnabled")]],
                [$("#button-bSubsurfaceLighting"), [$("#group-SubsurfaceLighting-1 input").not("#button-bSubsurfaceLighting")]],
                [$("#button-bBackLighting"), [$("#group-BackLighting-1 input").not("#button-bBackLighting")]],
                [$("#editbox-eAlphaBlendMode"), [$("#editbox-fAlpha")]],
                [$("#editbox-eParallaxType"), [$("#group-Parallax-1 input").not("#editbox-eParallaxType")]],
                [$("#button-bTileU"), [$("#editbox-fUOffset"), $("#editbox-fUScale")]],
                [$("#button-bTileV"), [$("#editbox-fVOffset"), $("#editbox-fVScale")]],
				[$("#button-bSoftEnabled"), [$("#editbox-fSoftDepth")]],
				[$("#button-bEffectLightingEnabled"), [$("#editbox-fLightingInfluence")]],
            ];

            gPushMaterial = false;

            $.each(inputRelatives, function(idx, val){

                val[0].on("input change", function(){

                    var enabled = true;

                    if(val[0].hasClass("ckbuttonToggle")) {
                        enabled = val[0].is(":checked");
                    } else if(val[0].hasClass("ckenumSelect")) {
                        enabled = val[0].val() != "None" && val[0].val().length > 0;
                    } else {
                        enabled = val[0].val();
                    }

                    $.each(val[1], function(selectorIdx, selectorVal){
                        selectorVal.each(function(elemIdx, elemVal){
                            var elem = $(elemVal);
                            if(elem.hasClass("ckspinnerEdit")) {
                                enabled ? elem.spinner("enable") : elem.spinner("disable");
                            } else {
                                enabled ? elem.removeAttr("disabled") : elem.attr("disabled", true);
                            }

                            // change the label if we can find one
                            var labelSelector = "label[for='"+elem.attr("id")+"']";
                            $(labelSelector).fadeTo(1, enabled ? 1 : 0.4);
                        });
                    });
                });

                val[0].trigger("change");
            });

            gPushMaterial = true;
        });
}

