// @description Additional JavaScript functions for SVG animation
// @author Ton van Lankveld
// @license MIT
// @version 2018-05-18
// @requires jQuery 3.3.x

    // @function init
    // @description Initiation for myApplication
    // @requires jQuery
    function init() {
        $("#time-bar").hide();
		$("#xray-beam").hide();
		$("#switch-xrayrun-closed").hide();
		$("#switch-pos-down").hide();
		$("#svg").data("clockId", 0);  // clockId = Process id of the setInterval() event
		$("#svg").data("sequencerStep", 0);  // sequencerStep = Keeps track of the timingsequencer() steps
		return;
	}

    // --- Functions for the timing sequencer ---

    // @function storeOrigionalTimeBarPosition
    // @description Store the origional position of the time bar
    // @requires jQuery
    function storeOrigionalTimeBarPosition() {
        "use strict";
        var xStr = document.getElementById("time-bar").getAttribute("x");
        var yStr = document.getElementById("time-bar").getAttribute("y");
        var xFloat = parseFloat(xStr);
        var yFloat = parseFloat(yStr);
        $("#time-bar").data("origionalX", xFloat);
        $("#time-bar").data("origionalY", yFloat);
        return;
    }

    function endOfTimingDiagram() {
        "use strict";
        timingClock(0);  // Stop clock
        $("#svg").data("sequencerStep", 0);  // Reset step counter
        $("#time-bar").hide();
        var xFloat = $("#time-bar").data("origionalX");
        var yFloat = $("#time-bar").data("origionalY");
        moveElementTo("time-bar", xFloat, yFloat);
        $("#switch-xrayrun-closed").hide();
        $("#switch-pos-up").show();
        $("#switch-pos-down").hide();
        $("#button-play").on("click", playAnimation);
        return;
    }

    // --- ---------------------------------- ---

    // --- Animation timing ---

    // @function timingClock
    // @description Clock for the timing of animations
    // @parameter {number} framesPerSecondInt - Frames/second. 0 = stop clock
    // @global {number} clockIdInt - Process id of the setInterval() event
    // @fires timingSequencer()
    function timingClock(framesPerSecondInt) {
	     "use strict";
	     var clockIdInt = $("#svg").data("clockId");
		  if (framesPerSecondInt === 0) {
		      if (clockIdInt < 1) {  // If clock is not running, abort function
			       return clockIdInt;
			   }
		      clearInterval(clockIdInt);
			   clockIdInt = 0;
		  } else {
		      var delayInt = 1000/framesPerSecondInt;  // 1000 milliseconds
		      clockIdInt = setInterval(timingSequencer, delayInt);
		  }
		  $("#svg").data("clockId", clockIdInt);
		  return;
    }

    // @async
    // @function timingSequencer
    // @description Defines a sequence of steps for an animation
    // @requires jQuery
    function timingSequencer() {
        "use strict";
        var sequencerStepInt = $("#svg").data("sequencerStep");
        moveElement("time-bar", 4, 0);
        if ((sequencerStepInt > 5) && (sequencerStepInt < 39)) {
            // moveGroup("patient-tabletop", -2.5, 0);
        }
        if (sequencerStepInt === 9) {
            $("#xray-beam").show();
        }
        if (sequencerStepInt === 35) {
            $("#xray-beam").hide();
        }
        if (sequencerStepInt === 40) {
            $("#switch-xrayrun-closed").hide();
            $("#switch-xrayrun-open").show();
        }
        if ((sequencerStepInt > 43) && (sequencerStepInt < 76)) {
            // moveGroup("patient-tabletop", 2.5, 0);
        }
        if (sequencerStepInt === 78) {
            $("#switch-xrayrun-open").hide();
            $("#switch-xrayrun-closed").show();
            $("#switch-pos-up").hide();
            $("#switch-pos-down").show();
        }
        if (sequencerStepInt === 80) {
            $("#xray-beam").show();
        }
        if ((sequencerStepInt > 81) && (sequencerStepInt < 114)) {
            // moveGroup("patient-tabletop", -2.5, 0);
        }
        if (sequencerStepInt === 107) {
            $("#xray-beam").hide();
        }
        if (sequencerStepInt === 110) {
            $("#switch-xrayrun-closed").hide();
            $("#switch-xrayrun-open").show();
        }
        if ((sequencerStepInt > 119) && (sequencerStepInt < 152)) {
            // moveGroup("patient-tabletop", 2.5, 0);
        }
        // Maximal horizontal (x) movement of "time-bar" is 622.5 pixels
        if (sequencerStepInt > 156) {
            endOfTimingDiagram();
        }
        sequencerStepInt += 1;
        $("#svg").data("sequencerStep", sequencerStepInt);
        return;
    }

    // --- ---------------- ---

    // @function detectXYset
	// @description search in a SVG element(<rect> <text> <circle> <ellipse> <line>), for the different variations of the x and y attribute
	// @parameter {string} elementIdStr - Id of SVG element
	// @return {array} xyArr - Array with name(s) of x and y attribute(s)
	function detectXYset(elementIdStr) {
	    "use strict";
	    var elementXstr;
	    var xyArr = [];
	    if (document.getElementById(elementIdStr) === null) {
	        return xyArr;
	    }
	    elementXstr = document.getElementById(elementIdStr).getAttribute("x");
	    if (elementXstr !== null) {
	        xyArr = ["x", "y"];  // Rectangle, text
	        return xyArr;
	    }
	    elementXstr = document.getElementById(elementIdStr).getAttribute("cx");
	    if (elementXstr !== null) {
	        xyArr = ["cx", "cy"];  // Circle, ellipse
	        return xyArr;
	    }
	    elementXstr = document.getElementById(elementIdStr).getAttribute("x1");
	    if (elementXstr !== null) {
	        xyArr = ["x1", "y1", "x2", "y2"];  // Line
	        return xyArr ;
	    }
        return xyArr;
	}

	// @function moveElement
	// @description Moves a SVG element(<rect> <text>), relative to it's current position
	// @parameter {string} elementIdStr - Id of SVG element
	// @parameter {number} deltaXFloat - Movement in X direction (pixels)
	// @parameter {number} deltaYFloat - Movement in Y direction (pixels)
    function moveElement(elementIdStr, deltaXFloat, deltaYFloat) {
	     "use strict";
		  var prevXStr = document.getElementById(elementIdStr).getAttribute("x");
		  var prevYStr = document.getElementById(elementIdStr).getAttribute("y");
		  var prevXfloat = parseFloat(prevXStr);
		  var prevYfloat = parseFloat(prevYStr);
		  var newXfloat = prevXfloat + deltaXFloat;
          var newYfloat = prevYfloat + deltaYFloat;
		  var newXstr = newXfloat.toString();
		  var newYstr = newYfloat.toString();
		  document.getElementById(elementIdStr).setAttribute("x", newXstr);
		  document.getElementById(elementIdStr).setAttribute("y", newYstr);
		  return;
    }

	// @function moveElementTo
	// @description Moves a SVG element ((<rect> <text>) to a new position
	// @parameter {string} elementIdStr - Id of SVG element
	// @parameter {number} xFloat - Movement to an absolute X position (pixels)
	// @parameter {number} yFloat - Movement to an absolute Y position (pixels)
	function moveElementTo(elementIdStr, xFloat, yFloat) {
	    "use strict";
		var newXstr = xFloat.toString();
		var newYstr = yFloat.toString();
		document.getElementById(elementIdStr).setAttribute("x", newXstr);
		document.getElementById(elementIdStr).setAttribute("y", newYstr);
		return;
	}

	// @function moveGroup
	// @description Moves a SVG group (<g>), relative to it's current position
	// @parameter {string} groupIdStr - Id of SVG group
	// @parameter {number} deltaXFloat - Movement in X direction (pixels)
	// @parameter {number} deltaYFloat - Movement in Y direction (pixels)
	function moveGroup(groupIdStr, xFloat, yFloat) {
	    "use strict";
	    var charStr = "";
	    var tempStr = "";
	    var transformStr = document.getElementById(groupIdStr).getAttribute("transform");
	    var transformStr2 = "";
	    // Find 'translate' command
	    var posInt1 = transformStr.search("translate(");
	    if (posInt1 === -1) {
	        return;
	    }
	    var posInt2 = transformStr.search(")");
	    if (posInt2 === -1) {
	        return;
	    }
	    var prevNumbersStr = transformStr.slice((posInt1 + 10), posInt2);
	    // Filter out spaces
	    for (charStr in prevNumbersStr) {
	        if (charStr !== " ") {
	            tempStr = tempStr + charStr;
	        }
	    }
	    prevNumbersStr = tempStr;
	    // Get X and Y values
	    var numbersArr = prevNumbersStr.split(",");
	    var prevXstr = numbersArr[0];
	    var prevYstr = numbersArr[1];
	    // Calculate new values
	    var prevXfloat = parseFloat(prevXstr);
	    var newXfloat = prevXfloat + xFloat;
	    var prevYfloat = parseFloat(prevYstr);
	    var newYfloat = prevYfloat + yFloat;
	    // Insert new values in 'transform' string
	    var newXStr = newXfloat.toString();
	    var newYStr = newYfloat.toString();
	    var newNumbersStr = newXStr + "," + newYStr;
	    transformStr2 = transformStr.replace(prevNumbersStr, newNumbersStr);
	    // Change 'transform' attribute
	    document.getElementById(groupIdStr).setAttribute("transform", transformStr);
	    return;
	}

	// @function playAnimation
	// @description Play the animation
	// @requires jQuery
    function playAnimation() {
	    "use strict";
		var FRAMESPERSECOND = 15;
		storeOrigionalTimeBarPosition();
	    $("#time-bar").show();
		$("#switch-xrayrun-closed").show();
		$("#switch-xrayrun-open").hide();
		$("#button-play").off;
		timingClock(FRAMESPERSECOND);
		return;
	}

	// Main loop
    function myApplication() {
	    "use strict";
		init();
		$("#button-play").on("click", playAnimation);
	}
	
	myApplication();
  
