/**
 @preserve BGS Dialog editor, built on jQuery 1.6 or so
Copyright 2012 ZeniMax Media Incorporated.
All Rights Reserved.
ZeniMax Media Incorporated, Rockville, Maryland  20850
*/

(function ($) {

  //==============
  // jQuery Plugin
  //==============

  $.bgsdlgeditor = {
    
    // Defaults
    defaultOptions: {
        width:  500, 
        height: 250,
        controls:   // add these to the toolbar
            "gestureBeat | ^Happiness mildHappy mediumHappy extremeHappy | " +
            "^Anger mildAngry mediumAngry extremeAngry | " +
            "^Fear mildFear mediumFear extremeFear | " +
            "^Disgust mildDisgust mediumDisgust extremeDisgust | " + 
            "^Sadness mildSad mediumSad extremeSad | " +
            "^Surprise mildSurprise mediumSurprise extremeSurprise",
        useCSS: true,
        docType: // stuff inside the frame
             '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">',
        docCSS: // styling for stuff inside the frame
            "",
        bodyStyle: // stuff inside the document body within the editor
            "margin: 3px; font: 12pt Tahoma; cursor:text"
    },
    
    buttonBar: {
        // buttonHTML, command, tooltip; ^ denotes start of section, buttons separated by |
        // ^ denotes a toolbar divider -- if it has text following it that section has a title
        // buttonHTML starting with # indicates a colored button
        init:
            ",<b>B</b>,bold,gestureBeat,Gestural beat,^" +
            "Happiness,#99d791,#99d791,mildHappy,Mild Happiness,|" +
            "#3faa26,#3faa26,mediumHappy,Medium Happiness,|" +
            "#237c04,#237c04,extremeHappy,Extreme Happiness,|^" +
            "Anger,#e644af,#e644af,mildAngry,Mild Anger,|" +
            "#e70c07,#e70c07,mediumAngry,Medium Anger,|" +
            "#d20606,#d20606,extremeAngry,Extreme Anger,|^" +
            "Fear,#fbb66d,#fbb66d,mildFear,Mild Fear,|" +
            "#f7a921,#f7a921,mediumFear,Medium Fear,|" +
            "#946304,#946304,extremeFear,Extreme Fear,|^" +
            "Disgust,#be96de,#be96de,mildDisgust,Mild Disgust,|" +
            "#7622b0,#7622b0,mediumDisgust,Medium Disgust,|" +
            "#310484,#310484,extremeDisgust,Extreme Disgust,|^" +
            "Sadness,#88c8e0,#88c8e0,mildSad,Mild Sadness,|" +
            "#2789ad,#2789ad,mediumSad,Medium Sadness,|" +
            "#077589,#077589,extremeSad,Extreme Sadness,|^" +
            "Surprise,#fcdf90,#fcdf90,mildSurprise,Mild Surprise,|" +
            "#f9ca49,#f9ca49,mediumSurprise,Medium Surprise,|" +
            "#efb007,#efb007,extremeSurprise,Extreme Surprise"
    }
  }; // End bgsdlgeditor
  
  // Creation func
  $.fn.bgsdlgeditor = function(options) {
    var $result = $([]);
    
    // Loop through text areas and create editors for them
    this.each(function(idx,elem){
        if (elem.tagName =="TEXTAREA") {
            var data = $.data(elem,BGSDLGEDITOR);
            if (!data) data = new bgsdlgeditor(elem,options);
            $result=$result.add(data);
        }
    });
    
    return $result;
  };
  
  // VARIABLES, generally speaking, constants
  var
    BGSDLGEDITOR            = "bgsdlgeditor",
    BACKGROUND_COLOR        = "backgroundColor",
    BUTTON                  = "button",
    BUTTON_NAME             = "buttonName",
    CHANGE                  = "change",
    CLICK                   = "click",
    DISABLED                = "disabled",
    DIV_TAG                 = "<div>",
    FOREGROUND_COLOR        = "foregroundColor",
    TRANSPARENT             = "transparent",
    UNSELECTABLE            = "unselectable",
    
    // Class name constants
    MAIN_CLASS              = "bgsdlgeditorMain",    // main containing div
    TOOLBAR_CLASS           = "bgsdlgeditorToolbar", // toolbar div inside main div
    GROUP_CLASS             = "bgsdlgeditorGroup",   // group divs inside the toolbar div
    BUTTON_CLASS            = "bgsdlgeditorButton",  // button divs inside group div
    DISABLED_CLASS          = "bgsdlgeditorDisabled",// disabled button divs
    DIVIDER_CLASS           = "bgsdlgeditorDivider", // divider divs inside group div
    LIST_CLASS              = "bgsdlgeditorList",    // list popup divs inside body
    PROMPT_CLASS            = "bgsdlgeditorPrompt",  // prompt popup divs inside body
    MSG_CLASS               = "bgsdlgeditorMsg",     // message popup div inside body

    // Test for i.e.
    ie = $.browser.msie,
    
    documentClickAssigned,
    
    buttonBar = $.bgsdlgeditor.buttonBar;
    
    // INIT
    // ---------------------------------------------------------------
    
    // Expand buttons.init string into actual buttons object, creating an object
    // for each button; split by section.
    // TODO: Section name handling to be done later.
    $.each(buttonBar.init.split("^"), function(idx, buttonList) {
        var tooltipIndex = 4;
        $.each(buttonList.split("|"), function (iidx, button) {
            var items = button.split(","), name = items[tooltipIndex-1];
            buttonBar[name] = {
                name: name, 
                command: items[tooltipIndex-2],
                tooltip: items[tooltipIndex],
                buttonText: items[tooltipIndex-3]
            };
            tooltipIndex = 3;
        });
    });
    console.log(buttonBar);
    delete buttonBar.init;

    // CONSTRUCTOR
    // ---------------------------------------------------------------
    bgsdlgeditor = function(area, options) {
        var editor = this;
        
        // Get the defaults and override with passed in options
        editor.options = options = $.extend({}, $.bgsdlgeditor.defaultOptions, options);
        
        // Hide the textarea and associate it with this editor
        var $area = editor.$area = $(area).hide()
            .data(BGSDLGEDITOR, editor)
            .blur(function() {updateFrame(editor, true);
        });
        
        // Create the main container and append the textarea
        var $main = editor.$main = $(DIV_TAG)
            .addClass(MAIN_CLASS)
            .width(options.width)
            .height(options.height);
            
        // Create the toolbar
        var $toolbar = editor.$toolbar = $(DIV_TAG)
            .addClass(TOOLBAR_CLASS)
            .appendTo($main);
            
        // Add a group to the toolbar
        var $group = $(DIV_TAG)
            .addClass(GROUP_CLASS)
            .appendTo($toolbar);

        // Split up the controls string to bind to the particular buttons
        $.each(options.controls.split(" "), function(idx, buttonName) {
            if (buttonName ==="") return true;
            
            // Dividers
            if (buttonName == "|") {
                var $div = $(DIV_TAG)
                    .addClass(DIVIDER_CLASS)
                    .appendTo($group);
                    
                $group = $(DIV_TAG)
                    .addClass(GROUP_CLASS)
                    .appendTo($toolbar);
            } else if (buttonName[0] == "^") { // Header for a group of buttons; TODO
                //console.log(buttonName);
            } else { // Button
                var button = buttonBar[buttonName];
                
                // Add a new button to the group
                var $buttonDiv;
                if (button.buttonText[0] == "#") {
                    $buttonDiv = $(DIV_TAG)
                        .data(BUTTON_NAME, button.name)
                        .css(BACKGROUND_COLOR, button.buttonText)
                        .addClass(BUTTON_CLASS)
                        .attr("title", button.tooltip)
                        .bind(CLICK, $.proxy(buttonClick, editor))
                        .appendTo($group);
                        //.hover(colorHoverEnter, colorHoverLeave);
                    //$buttonDiv.append(" ");
                } else {
                    $buttonDiv = $(DIV_TAG)
                        .data(BUTTON_NAME, button.name)
                        .addClass(BUTTON_CLASS)
                        .attr("title", button.tooltip)
                        .bind(CLICK, $.proxy(buttonClick, editor))
                        .appendTo($group)
                        .hover(hoverEnter, hoverLeave);
                    $buttonDiv.append(button.buttonText);
                }
                    
            }
        });
        
        
        // Add the main div to the DOM and append the textarea
        $main.insertBefore($area)
            .append($area);
            
        // Bind document click handler
        
        // Bind the window resize event when the width or height is auto or %
        if (/auto|%/.test("" + options.width + options.height))
          $(window).resize(function() {refresh(editor);});
          
        // Create iframe and resize controls
        refresh(editor);
    };
    
    // EVENT HANDLERS
    // ---------------------------------------------------------------
    function buttonClick(e) {
        var editor = this,
            buttonDiv = e.target,
            buttonName = $.data(buttonDiv, BUTTON_NAME),
            button = buttonBar[buttonName];
            
        if (editor.disabled || $(buttonDiv).attr(DISABLED) == DISABLED)
            return;

        var tempcommand = button.command;
        var tempvalue = null;
        if (button.command[0] === "#") {
            tempcommand = "backColor";
            tempvalue = button.command;
        }
        var data = {
            editor: editor,
            button: buttonDiv,
            buttonName: buttonName,
            command: tempcommand,
            value: tempvalue
        };
        
        if (!execCommand(editor, data.command, data.value))
            return false;
        
        return true;
    }
    // hoverEnter - mouseenter event handler for buttons and popup items
    function hoverEnter(e) {
        var $div = $(e.target).closest("div");
        $div.css(BACKGROUND_COLOR, $div.data(BUTTON_NAME) ? "#FFF" : "#FFC");
    }
    
    // hoverLeave - mouseleave event handler for buttons and popup items
    function hoverLeave(e) {
        $(e.target).closest("div").css(BACKGROUND_COLOR, "transparent");
    }

    
    // PUBLIC METHODS
    // ---------------------------------------------------------------

    var fn = bgsdlgeditor.prototype,
        methods=[
            ["disable", disable],
            ["execCommand", execCommand],
            ["focus", focus],
            ["refresh", refresh],
            ["updateFrame", updateFrame],
            ["updateTextArea", updateTextArea]
        ];
    $.each(methods, function(idx, method) {
        fn[method[0]] = function() {
            var editor = this, args = [editor];
            // using each here would cast booleans into objects!
            for(var x = 0; x < arguments.length; x++) {args.push(arguments[x]);}
            var result = method[1].apply(editor, args);
            if (method[2]) return result;
            return editor;
        };
    });
    
    // bind change handler
    fn.change = function(handler) {
        var $this = $(this);
        return handler ? $this.bind(CHANGE, handler) : $this.trigger(CHANGE);
    };

    // PRIVATE METHODS
    // ---------------------------------------------------------------
    // disable - enables or disables the editor
    function disable(editor, disabled) {
    
        // Update the textarea and save the state
        if (disabled) {
            editor.$area.attr(DISABLED, DISABLED);
            editor.disabled = true;
        }
        else {
            editor.$area.removeAttr(DISABLED);
            delete editor.disabled;
        }
        
        // Switch the iframe into design mode.
        // ie6 does not support designMode.
        // ie7 & ie8 do not properly support designMode="off".
        try {
            if (ie) editor.doc.body.contentEditable = !disabled;
            else editor.doc.designMode = !disabled ? "on" : "off";
        }
        // Firefox 1.5 throws an exception that can be ignored
        // when toggling designMode from off to on.
        catch (err) {}
        
        // Enable or disable the toolbar buttons
        //refreshButtons(editor);
    
    }

    // refresh - creates the iframe and resizes controls
    function refresh(editor) {
        var $main = editor.$main,
            options = editor.options;
            
            // Remove the old iframe
            if (editor.$frame)
                editor.$frame.remove();
                
            var $frame = editor.$frame = $('<iframe frameborder="0" src="javascript:true;">')
                .hide()
                .appendTo($main);
                
            // Load the iframe document content
            var contentWindow = $frame[0].contentWindow,
                doc = editor.doc = contentWindow.document,
                $doc = $(doc);
                
            doc.open();
            doc.write(
                options.docType + '<html>' +
                //((options.docCSSFile === '') ? '' : '<head><link rel="stylesheet" type="text/css" href="' + options.docCSSFile + '" /></head>') +
                '<body style="' +options.bodyStyle +'"></body></html>'
            );
            doc.close();
            
        // IE editor bug focus problem
        if (ie)
            $doc.click(function()  {focus(editor);});
            
        // Load the content into the doc
        updateFrame(editor);
        
        // Bind IE specific event handlers
        if (ie) {
            // Save current selection -- otherewise IE will reset it just after beforedeactivate and just before
            // beforeactivate
            $doc.bind("beforedeactivate beforeactivate selectionchange keypress", function(e) {
                // Flag editor as inactive if before deactivate
                if (e.type =="beforedeactivate")
                    editor.inactive = true;
                // Get rid of bogus seleciton and flag editor as active
                else if (e.type == "beforeactivate") {
                    if (!editor.inactive && editor.range && editor.range.length > 1)
                        editor.range.shift();
                    delete editor.inactive;
                }
                // Save the selection when the editor is active
                else if (!editor.inactive) {
                    if (!editor.range)
                        editor.range = [];
                    editor.range.unshift(getRange(editor));
                
                    // We only need the last 2 selections
                    while (editor.range.length > 2)
                        editor.range.pop();
                }
            });
            
            // Restore the text range when the iframe gains focus
            $frame.focus(function() {
                restorRange(editor);
            });
        } // end if(ie)
    
        // Update the textarea when the iframe loses focus
        ($.browser.mozilla ? $doc : $(contentWindow)).blur(function() {
            updateTextArea(editor, true);
        });
    
        // Enable toolbar buttons
        
        $frame.show();
        
        // Wait for layout to finish -- sort of like $(document).ready() for $doc
        $(function() {
            // Lots of resizing here
            
            // Switch the iframe into design mode if enabled
             disable(editor, editor.disabled);
        });
    }

    // focus - sets focus to either the textarea or iframe
    function focus(editor) {
      setTimeout(function() {
        editor.$frame[0].contentWindow.focus();
        //refreshButtons(editor);
      }, 0);
    }
    
    // updateFrame - updates the iframe with the textarea contents
    function updateFrame(editor, checkForChange) {
        var code = editor.$area.val(),
            options = editor.options,
            $body = $(editor.doc.body);
        
        // Convert the textarea source code into iframe html
        var html = code;
        
        // Prevent script injection
        html = html.replace(/<(?=\/?script)/ig, "&lt;");
         
        // Update the frame and trigger "change"
        if (html != $body.html()) {
            $body.html(html);
            $(editor).triggerHandler(CHANGE);
        }
    }
    
    // updateTextArea - updates the textarea with the iframe contents
    function updateTextArea(editor, checkForChange) {
        var html = $(editor.doc.body).html(),
            options = editor.options,
            $area = editor.$area;
            
        if (html != $area.val()) {
            $area.val(html);
            $(editor).triggerHandler(CHANGE);
        }
    }
    
    // execCommand -- designMode command over selection
    function execCommand(editor, command, value, useCSS, button)
    {
        restoreRange(editor);
        
        if (!ie) {
            if (useCSS === undefined || useCSS === null)
                useCSS = editor.options.useCSS;
            editor.doc.execCommand("styleWithCSS", true, useCSS.toString());
        }
        
        // Execute and check for editor
        var success = true, description;
        try { success = editor.doc.execCommand(command, 0, value || null); }
        catch (err) { description = err.description; success = false; }
        
        if (!success) {
            alert(description ? description : "Error executing the " + command + " command.");
        }
        
        focus(editor);
        
        return success;
    }
    
    
    // getRange - gets the current text range object
    function getRange(editor) {
        if (ie) return getSelection(editor).createRange();
        return getSelection(editor).getRangeAt(0);
    }
    // restoreRange - restores the current ie selection
    function restoreRange(editor) {
        if (ie && editor.range)
            editor.range[0].select();
    }

    // getSelection - gets the current text range object
    function getSelection(editor) {
        if (ie) return editor.doc.selection;
        return editor.$frame[0].contentWindow.getSelection();
    }
    
    

})(jQuery);
