// @file Mars Lander simulation game (proof of concept))
// @description A simulation game. To land save on Mars.
// @author Ton van Lankveld (lankveal@xs4all.nl)
// @version 0.0.2 (2018-05-01)
// @license MIT. See LICENSE
//
// Used library: jQuery 3.2.1 (http://jquery.com/)
//
// Documentation: JsDoc 3 Toolkit (http://usejsdoc.org/)


// function
// @name init
// @description Default settings.
// @requires jQuery
// @requires Id's of SVG elements: UIfuelSwitch, lander, LMflame1,LMflame2, LMflame3,UIstartButton,UIcontactLight
// @param {object} fixedParamObj - List of  fixed parameters.
// @global {boolean} unlimitedFuelBool - true = Unlimited Fuel | false = Fuel Tank.
// @global {number} heightFloat - Altitude of the lander in meters
// @global {number} speedFloat - Speed of the lander in meters/second
// @global {number} fuelInt - Fuel level (%). 0 =< fuelInt =< 100.
function init(fixedParamObj) {
    "use strict";
    // Store initial data at SVG elements
    $("#UIfuelSwitch").data("unlimitedFuelBool", true);
    $("#lander").data("heightFloat", 100.0); // (m)t
    $("#lander").data("speedFloat", 25.0); // (m/s)t
    $("#lander").data("fuelInt", 100); // (%)
    $("#instrumentPanel").data("selThrustInt", 0);

    // Setup the game screen. Set the required SVG elements in their default state.
    setFuelSwitch(unlimitedFuelBool);
    $("#LMflame1").hide(); // Small flame
    $("#LMflame2").hide(); // Medium flame
    $("#LMflame3").show(); // Large flame
    document.getElementById( "UIstartButton" ).style.fill = fixedParamObj.startbuttoncoloron;
    document.getElementById( "UIcontactLight" ).style.fill = fixedParamObj.contactlightcoloroff;
    return;
}

// @function
// @name setFuelSwitch
// @description Set the fuel switch, on the control panel, in the indicated position.
// @requires jQuery
// @requires Id's of SVG elements: UIfuelUnlimited, UIfuelTank
// @global {boolean} unlimitedFuelBool - Unlimited Fuel = true | Fuel Tank = false.
function setFuelSwitch(){
    "use strict";
    var switchModeBool = $("#UIfuelSwitch").data("unlimitedFuelBool");
    
    if (switchModeBool) {
        $("#UIfuelUnlimited").show(); // Fuel switch: UNLIMITED FUEL
        $("#UIfuelTank").hide();
    } else {
        $("#UIfuelUnlimited").hide();
        $("#UIfuelTank").show(); // Fuel switch: FUEL TANK
    }
    return;
}

// @function
// @name toggleFuelSwitch
// @description Toggel the fuel switch.
// @requires jQuery
// @requires Id's of SVG element: UIfuelSwitch
// @global {boolean} unlimitedFuelBool - Unlimited Fuel = true | Fuel Tank = false.
function toggleFuelSwitch() {
    "use strict";
    var switchModeBool = $("#UIfuelSwitch").data("unlimitedFuelBool");
    
    if (switchModeBool === true) {
        switchModeBool = false;
    } else {
        switchModeBool = true;
    }
    $("#UIfuelSwitch").data("unlimitedFuelBool", switchModeBool);
    setFuelSwitch();
    return;
}

// function
// @name gameLoop
// @description Main loop to control the simulation of the game.
// @requires jQuery
// @requires Id's of SVG elements: UIstartButton, UIthrustButton1, UIthrustButton2, UIthrustButton3
function gameLoop() {
    "use strict";
    var FPS = 10;  // Frames per second
    $("#UIstartButton").off();
    document.getElementById( "UIstartButton" ).style.fill = "#4d4d4d";  // Grey
    // Activate Thrust buttons
    $("#UIthrustButton1").on("mousedown", {value: 1}, setThrustLevel);
    $("#UIthrustButton2").on("mousedown", {value: 2}, setThrustLevel);
    $("#UIthrustButton3").on("mousedown", {value: 3}, setThrustLevel);
    timingClock(FPS);
    return;
}

// @function timingClock
// @description Clock for the timing of animations
// @parameter {number} framesPerSecondInt - Frames/second. 0 = stop clock
// @global {number} clockIdInt - Process id of the setInterval() event
// @fires speedHeightCalculation()
function timingClock(framesPerSecondInt) {
    "use strict";
    var clockIdInt = $("svg").data("clockId");
    if (framesPerSecondInt === 0) {
        if (clockIdInt < 1) {  // If clock is not running, abort function
	        return clockIdInt;
        }
        clearInterval(clockIdInt);
        clockIdInt = 0;
    } else {
        var delayInt = 1000/framesPerSecondInt;  // 1000 milliseconds
        clockIdInt = setInterval(speedHeightCalculation, delayInt);
    }
    $("#svg").data("clockId", clockIdInt);
    return;
}

// @async
// @function
// @name speedHeightCalculation
// @description Calculate the new speed and height of the Lander.
// @requires jQuery
// @requires Id's of SVG elements: lander, UIfuelSwitch
// @parameter {integer} selectedThrustInt - 0 = No thrust | 1 = small | 2 = medium | 3 = full
// @parameter {float} deltaTimeFloat - Delay between calculations (s).
// @global {float} speedFloat - Speed of lander (m/s).
// @global {float} heightFloat - Height of lander above ground (m).
// @global {boolean} unlimitedFuelBool - Unlimited Fuel = true | Fuel Tank = false.
function speedHeightCalculation(deltaTimeFloat) {
    "use strict";
    var GRAVITYFLOAT = -3.7;  // (m/s²)
    var accelerationThrust = 0.0;
    var selectedThrustInt = $("#instrumentPanel").data("selThrustInt");
    
    // Convert thrust to acceleration
    if (selectedThrustInt < 1) {
        accelerationThrust = 0.0;  // (m/s²)
    }
    if (selectedThrustInt === 1) {
        accelerationThrust = 2.0;  // (m/s²)
    }
    if (selectedThrustInt === 2) {
        accelerationThrust = 12.0;  // (m/s²)
    } else {
        accelerationThrust = 20.0;  // (m/s²)
    }
    // Calculate speed and height
    var fallSpeedFloat = fallSpeedFloat + (GRAVITYFLOAT*deltaTimeFloat*deltaTimeFloat);  // Distance free fall (g*t²)
    var landerSpeedFloat = $("#lander").data("speedFloat");
    landerSpeedFloat = landerSpeedFloat + (accelerationThrust*deltaTimeFloat*deltaTimeFloat);  // 
    var landerHeightFloat = $("#lander").data("heightFloat");
    landerHeightFloat = landerHeightFloat + (landerSpeedFloat*deltaTimeFloat) - (fallSpeedFloat*deltaTimeFloat);
    if (landerHeightFloat < 0.0) {
        landerHeightFloat = 0.0;
    }
    // Store new speed and height
    $("#lander").data("heightFloat", landerHeightFloat);
    $("#lander").data("speedFloat", landerSpeedFloat);
    return;
}

// @function
// @name updateFuelIndicator
// @description Set the fuel indicator to a given level.
// @requires jQuery.
// @requires Id's of SVG elements: UIfuelIndicator, UIfuelLevel.
// @global {number} fuelInt - Fuel level (%). 0 =< fuelInt =< 100.
// @global {number} origionalHeightNum - Height of bar at 100% fuel level.
// @global {number} originalYpositionNum - Y-position of bar at 100% fuel level.
function updateFuelIndicator() {
    "use strict";
    var origionalHeightStr = "";
    var origionalHeightNum = 0.0;
    var originalYpositionStr = "";
    var originalYpositionNum = 0.0;
    var barHeightNum = 0.0;
    var barYpositionNum = 0.0;
    var fuelLevelInt = 0;

    fuelLevelInt = $("#lander").data("fuelInt");
    if ((fuelLevelInt < 0) || (fuelLevelInt === undefined)) {
        fuelLevelInt = 0;
    }
    if (fuelLevelInt > 100) {
        fuelLevelInt = 100;
    }
    if (fuelLevelInt < 2) {
        $("#UIfuelLevel").hide();
    } else {
        $("#UIfuelLevel").show();
        origionalHeightStr = $("#UIfuelLevel").data("heightNum");
        if (origionalHeightStr === undefined) { // Is the data already stored?
            // Get the height and y-position of the fuel bar at 100%, and store them for future calculations.
            origionalHeightStr = $("#UIfuelLevel").attr("height");
            originalYpositionStr = $("#UIfuelLevel").attr("y");
            $("#UIfuelIndicator").data("heightNum", origionalHeightStr);
            $("#UIfuelIndicator").data("yNumb", originalYpositionStr);
        } else {
            // Get the stored height and y-position of the fuel bar at 100%
            origionalHeightStr = $("#UIfuelLevel").data("heightNum");
            originalYpositionStr = $("#UIfuelLevel").data("yNumb");
        }
        origionalHeightNum = parseFloat(origionalHeightStr);
        originalYpositionNum = parseFloat(originalYpositionStr);
        // Calculate height of fuel bar
        barHeightNum = (fuelLevelInt/100) * origionalHeightNum;
        barYpositionNum = originalYpositionNum + (origionalHeightNum - barHeightNum);
        // Set new height and y-position of the fuel bar
        var barHeightStr = barHeightNum.toString();
        var barYpositionStr = barYpositionNum.toString();
        $("#UIfuelLevel").attr("height", barHeightStr);
        $("#UIfuelLevel").attr("y", barYpositionStr);
    }
    return;
}

// @async
// @function
// @name setThrustLevel
// @description Store the selected thrust button.
// @requires jQuery.
// @requires Id's of SVG elements: instrumentPanel.
// @global {number} selThrustInt - Selected thrust button. 0 = No thrust | 1 = small | 2 = medium | 3 = full
    "use strict";
    var thrustLevelInt = event.data.value;
    $("#instrumentPanel").data("selThrustInt", thrustLevelInt);
}

// @async
// @function
// @name setThrustLevelZero
// @description Set the thrust level to 0. No thrust.
// @requires jQuery.
// @requires Id's of SVG elements: instrumentPanel.
// @global {number} selThrustInt - Selected thrust button. 0 = No thrust | 1 = small | 2 = medium | 3 = full
function setThrustLevelZero() {
    "use strict";
    $("#instrumentPanel").data("selThrustInt", 0);
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


// @name Main loop
// @requires jQuery
var fixedParamObj = {
    startbuttoncoloron: "#00ff00",
    startbuttoncoloroff: "#4d4d4d",
    contactlightcoloron: "#ffff00",
    contactlightcoloroff: "#999999"
};
init(fixedParamObj);
// Toggle fuel switch
$("#UIfuelSwitch").on("click", toggleFuelSwitch);
// Start game
$("#UIstartButton").on("click", gameLoop);
// Change Height and Speed indicators
var landerHeightFloat = $("#lander").data("heightFloat");
var landerSpeedFloat = $("#lander").data("speedFloat");
var landerHeightStr = landerHeightFloat.toString();
var landerSpeedStr = landerSpeedFloat.toString();
$("#UIheight").text(landerHeightStr);
$("#UIspeed").text(landerSpeedStr);
// Set fuel level indicator
updateFuelIndicator();
