var menuButtonsOpen = false;
function saveParseObjectExtension(className, extraProperties){
	// This function saves an object to the Parse server.
	// Check that the Parse API is loaded.
	if(window.Parse){
		// Create a "static" map of class names to their classes.
		if(!saveParseObjectExtension.classes){
			saveParseObjectExtension.classes = {};
		}
		// Extend Parse.Object if it has not been done already.
		if(!saveParseObjectExtension.classes.hasOwnProperty(className)){
			// Check that the class name is not a reserved keyword.
			if(saveParseObjectExtension.classes[className]){
				console.error("Cannot save object of class", className, "because it is a reserved keyword.");
				return false;
			}
			// Extend the class.
			saveParseObjectExtension.classes[className] = Parse.Object.extend(className);
		}
		// Check that there is a current user or that anonymous saves are allowed.
		var currentUser = Parse.User.current();
		if(currentUser){
			// Create an instance of the desired class.
			var prop, event = new saveParseObjectExtension.classes[className]();
			// These properties should always be saved with every object.
			event.set("Time", new Date());
			event.set("UserID", currentUser.id);
			event.set("Level", window.currentLevel);
			// Add the additional properties.
			for(prop in extraProperties){
				event.set(prop, extraProperties[prop]);
			}
			// Initiate the upload of this data.
			event.save();
			return true;
		}
	}
	return false;
}
$( document ).ready(function() {
	$menuButtons = $("ul#menuButtons");
	$menuButtons.slideUp();
	$topMenuText = $("#topMenuText");

	function hideControlsMenu(){
		$menuButtons.slideUp();
		menuButtonsOpen = false;
		$topMenuText.text("");
	}

	function openControlsMenu(){
		$("ul#menuButtons").slideDown();
		menuButtonsOpen = true;
		$topMenuText.text( $("#instructionsModal .modal-body h3").text() );
	}

	$("button#toggleMenuButton").click(function(){
		if(menuButtonsOpen){
			hideControlsMenu();
		}else{
			openControlsMenu();
		}
	});

	var $iframeResize = $("#iframeResize");
	var iframeSizeFull = true;
	$iframeResize.click(function(){
		iframeResizeUser();
	});

	var arrowDirection = function(iframeSizeFull){
		/* K-map              | Window width > 1067px | Window width < 1067px
		----------------------------------------------------------------------
		iframe is 640px width | Arrow points right    | Arrow points left
		iframe is 60% width   | Arrow points left     | Arrow points right
		*/
		return ((0.6 * $(window).width() - 640) * (iframeSizeFull ? 1 : -1) > 0) ? "rotate(180deg)" : "none";
	}
	window.iframeResizeUser = function(invert){
		var iframeSizeFullLocal = invert ? !iframeSizeFull : iframeSizeFull;
		if(iframeSizeFullLocal){
			$("html, body, .blocklySvg", window.codingArea.document).css("background", "transparent");
			$("iframe").animate({
				"width": "640px",
				"opacity" : "1"
			});
			$("#iframeResize").css({"transform": arrowDirection(iframeSizeFullLocal)}).animate({"left": "590px"});
			if(currentLevel <= 20){
				$("body").css({"background": "rgb(153, 204, 255)"});
			}else if(currentLevel < 99){
				$("body").css({"background": "rgb(150, 50, 100)"});
			}else{
				$("body").css({"background": "rgb(100, 100, 100)"});
			}
			iframeSizeFull = false;
		}else{
			$("html, body, .blocklySvg", window.codingArea.document).css("background", "#fff");
			$("iframe").animate({
				"width": "60%",
				"opacity" : "0.7"
			});
			$("#iframeResize").css({"transform": arrowDirection(iframeSizeFullLocal)}).animate({"left": "55%"});
			$("body").css({"background": ""});
			iframeSizeFull = true;
		}
	}

	var $play = $("#play"), $stop = $("#stop");
	var $iframeBlocker = $("#iframeBlocker");

	var oldiframeSize;
	$stop.hide();
	$play.click(function(){
		$play.hide();
		$stop.show();
		$iframeBlocker.show();
		//Resize blockly workspace to small width
		oldiframeSize = iframeSizeFull;
		iframeSizeFull = true;
		iframeResizeUser();

		saveParseObjectExtension("Play", {
			"blocksUsed": getTotalBlocksUsed(),
			"codeUsed": Blockly.JavaScript.workspaceToCode(Blockly.mainWorkspace)
		});
		
		function animationComplete(){
			if(window.animationsArray.length != 0){
				setTimeout(function(){
					animationComplete();
				}, 200);
			}else{
				$play.prop("disabled", false);
				$play.show();
				$stop.hide();
				$iframeBlocker.hide();
				setTimeout(function(){
					// We want to check the iframe size inside the timeout because the user could change it
					// before the timeout executes.
					if(oldiframeSize && !iframeSizeFull){
						iframeResizeUser();
					}
				}, runConditionIsPlus() ? 4000 : 10);
			}
		}
		setTimeout(animationComplete, 200);

		executeBlockly();
	});
	$stop.click(function(){
		while(animationsArray.length){
			clearTimeout(animationsArray.pop());
		}
		$play.show();
		$stop.hide();
		$iframeBlocker.hide();
		if(oldiframeSize && !iframeSizeFull){
			iframeResizeUser();
		}
		player.x = player.init_x;
		player.y = player.init_y;
		player.angle = 0;
		redraw();
		Blockly.mainWorkspace.highlightBlock(null);
		saveParseObjectExtension("Stop", {
			"codeUsed": Blockly.JavaScript.workspaceToCode(Blockly.mainWorkspace)
		});
	});
	/*$(window).blur(function(){
		$stop.click();
	});*/

	$(".modal .retry").click(function(){
		ReloadLevel(true);
	});

	$('.tipModal').on('hidden.bs.modal', function () {
		if($(this).data("resetWhenClosed")){
			player.reset();
		}
		$(this).data("resetWhenClosed", false);
		saveParseObjectExtension("HintClosed", {
			"HintId": tipToShow - 1
		});
	});

	$('#newBlockModal').on('hidden.bs.modal', function () {
		// There should be no need to move the player back to its original position here.
		// Just log the event.
		saveParseObjectExtension("HintClosed", {
			"HintId": -1
		});
	});

	$('#successModal').on('hidden.bs.modal', function () {
		player.reset();
	});
	
	// If there is a new block, automatically show the new block modal.
	$('#instructionsModal').on('hidden.bs.modal', function(){
		if($("#newBlockTip").is(":visible")){
			$("#newBlockModal").modal("show");
		}
	});

	$("#menuButtons .retry").click(function(){
		saveParseObjectExtension("Retry", {
			"blocksUsed": getTotalBlocksUsed(),
			"codeUsed": Blockly.JavaScript.workspaceToCode(Blockly.mainWorkspace)
		});
		ReloadLevel(true);
	});

	$(".tip").click(function(){
		//Data is saved first, before tipToShow is modified
		saveParseObjectExtension("HintRequested", {
			"HintId": (tipToShow > totalNumTips) ? 1 : tipToShow
		});

		//Hide menu buttons and instructions text
		hideControlsMenu();
		displayTip(false);
	});

	$("#newBlockTip").click(function(){
		console.log("New block modal requested from menu", tipToShow);

		saveParseObjectExtension("HintRequested", {
			"HintId": -1
		});

		$("#newBlockModal").modal('show');
	});

	$(".nextLevel").click(function(){
		LoadNextLevel();
	});

	var challengesEnabled = false;
	$("#levelSelect").click(function(){
		saveParseObjectExtension("OpenLevelSelectMenu", {});
		
		hideControlsMenu();

		$("#worldSelectMenu").hide();
		if(currentLevel <= 20){
			$("#levelSelectMenu1").show();
			$("#levelSelectMenu2").hide();
			$("#levelSelectMenuChallenge").hide();
		}else if(currentLevel <= 42){
			$("#levelSelectMenu1").hide();
			$("#levelSelectMenu2").show();
			$("#levelSelectMenuChallenge").hide();
		}else{
			$("#levelSelectMenu1").hide();
			$("#levelSelectMenu2").hide();
			$("#levelSelectMenuChallenge").show();
		}

		$("#levelSelectModal").modal({
			backdrop: 'static',
			keyboard: false,
			show: true
		});
		
		if(runConditionIsPlus()){
			// Put the number of stars that the user has earned under each level button.
			if(Parse.User.current().attributes.starsID){
				var query = new Parse.Query(Parse.Object.extend("UserStars"));
				query.get(Parse.User.current().attributes.starsID, {
					success: function(userStars) {
						$("#levelSelectModal .modal-dialog button").each(function(){
							if(this.id.indexOf("level") == 0){
								var $this = $(this), columnName = "stars" + this.id.substring(5);
								$this.find("img.star").remove();
								if(userStars.get(columnName)){
									var i, stars = userStars.get(columnName), result = '<div>';
									for(i = 0; i < stars; i++){
										result += '<img src="images/star_spot.png" width="200" height="215" class="star">';
									}/*
									while(i < 3){
										result += '<img src="images/spot.png" width="200" height="215" class="star">';
										i++;
									}*/
									result += '</div>';
									$this.append(result);
								}
							}
						});
					},
					error: function(userStars, error) {
						console.error('Failed to query stars table row: ' + error.message);
					}
				});
			}else{
				console.log("This user has no stars.");
			}
		}
		
		// Indicate the run condition of the game.
		$("#conditionIndicator").text(runConditionIsPlus() ? "+" : "S");
		
		// Stop execution of code.
		if($("#stop").is(":visible")){
			$("#stop").click();
		}
	});

	$("#levelSelectBack").click(function(){
		$("#worldSelectMenu").show();
		$(".levelSelectMenu").hide();
		$("#levelSelectBack").hide();
	});

	$(".worldButton").click(function(){
		// Require passwords to enter and exit the challenge world.
		if(this.value == "Challenge"){
			// Require password to enter the challenge world.
			if(!challengesEnabled){
				var password = prompt("Enter password to visit challenges:");
				if(password === "ptp"){
					challengesEnabled = true;
					// When entering the challenge world, log an event.
					saveParseObjectExtension("ChallengeWorldEnter", {});
				}else if(password === null){
					return;
				}else{
					alert("That password was incorrect.");
					return;
				}
			}
		}else{
			// Require password to exit the challenge world.
			if(challengesEnabled){
				var password = prompt("Enter password to leave challenges:");
				if(password === "ptpexit"){
					challengesEnabled = false;
					// When leaving the challenge world, log an event.
					saveParseObjectExtension("ChallengeWorldExit", {});
				}else if(password === null){
					return;
				}else{
					alert("That password was incorrect.");
					return;
				}
			}
		}
		console.log("Opening a world...")
		// Show the levels in this world.
		$("#worldSelectMenu").hide();
		$(".levelSelectMenu").hide();
		$("#levelSelectMenu" + this.value).show();
		$("#levelSelectBack").show();
	});

	$(".levelSelectMenu button").click(function(){
		// Get the level number of this button.
		var level = parseInt( this.id.match(/\d+/)[0] );
		// Record that a level was chosen from the level selection menu.
		saveParseObjectExtension("LevelSelectedFromMenu", {
			"Level": level
		});
		// Force workspace to clear and instructions to show.
		currentLevel = 0;
		// Load the level.
		LoadLevel(level);
	});

	$(".login-form").submit(function(event){
		event.preventDefault();
		// Clear the log in form.
		var $inputs = $(this).find("input");
		$inputs.prop("disabled", true);
		// Pass the username and password to Parse for logging in.
		Parse.User.logIn($("#login-username").val().toLowerCase(), $("#login-password").val()).then(
			function(user) {
				// The user was successfully authenticated.
				// Record an event separate from the _Session collection.
				saveParseObjectExtension("UserSessionBegin", {});
				// Display the current username.
				$("#currentUser").text(user.get("username"));
				console.log("User's max level: " + user.attributes.maxLevel);
				// Dismiss the modal.
				$('#loginModal').modal('hide');
				// Load the user's highest level within the non-challenge problem sets.
				UnlockLevels(user.attributes.maxLevel);
				LoadLevel(Math.min(user.attributes.maxLevel, parseInt($("#levelSelectMenu2 button:last").attr("id").match(/\d+/))));
			},
			function(error) {
				alert("Invalid username or password");
				$inputs.prop("disabled", false);
				$("#login-password").val("");
			}
		);
	});

	$("#logout button").click(function(){
		Parse.User.logOut();
	});

	//Logout when the app is first loaded
	Parse.User.logOut();

	//Load Fast Click for mobile browsers
	$(function() {
		FastClick.attach(document.body);
	});

	// Calculator modal popup button events
	$("#blocklyNumbers").on("click", "button", function(){
		var $this = $(this), target = $("#blocklyNumbers").data("target"), currVal;
		if(target){
			currVal = parseInt(target.textContent) || 0;
			if($this.is(".accept")){
				console.log("Blockly text input accepted", currVal);
				$("#blocklyNumbers").data("target", false).css({
					"display": "none"
				});
			}else if($this.is(".clear")){
				currVal = 0;
			}else if($this.is(".backspace")){
				currVal = Math.floor(currVal / 10);
			}else{
				currVal = currVal * 10 + parseInt(this.textContent);
			}
			target.textContent = currVal;
			// Let the block resize itself depending on the number of digits in currVal.
			Blockly.FieldTextInput.htmlInput_.value = currVal;
			Blockly.FieldTextInput.htmlInput_.onKeyUpWrapper_[0][2]({keyCode:1});
		}else{
			console.trace();
		}
	});
	
	// Hide oops messages
	$(".oopsMsg").hide();
});

// Calculator modal popup text input activation
(function(){
	var attachCalculator = function(){
		if(window.codingArea && window.codingArea.document){
			$(window.codingArea.document).on("click", function(event){
				var $target = $(event.target), target = event.target;
				// Sometimes, the user may click on the rect element before the text element.
				// The calculator modal should still open if that happens.
				if($target.next().is("text")){
					console.log("You clicked on the rectangle.");
					$target = $target.next();
					target = $target[0];
				}
				// Check whether this element is an input field with a numeric value.
				if(isNaN(parseInt(target.textContent))){
					// Close the calculator modal.
					$("#blocklyNumbers").data("target", false).css({
						"display": "none"
					});
				}else if($target.is("svg g.blocklyEditableText text.blocklyText")){
					// Show the calculator modal.
					console.log("Blockly text input activated");
					// Get the coordinates of the text element.
					var position = $target.offset();
					// Tell the calculator modal which field it is modifying, and position the calculator modal.
					$("#blocklyNumbers").data("target", target).css({
						"left": (position.left - 15) + "px",
						"top": (position.top + 25) + "px",
						"display": "block"
					});
					// Hide Blockly's input field.
					setTimeout(function(){
						$(".blocklyWidgetDiv", window.codingArea.document).hide();
					}, 10);
				}
			});
		}else{
			console.log("Waiting for coding area");
			setTimeout(attachCalculator, 200);
		}
	}
	attachCalculator();
})();

function getTotalBlocksUsed(){
	var blocksUsed = Blockly.mainWorkspace.getAllBlocks(), totalBlocksUsed = blocksUsed.length;
	blocksUsed.forEach(function(element, index, array){
		switch(element.type){
			case "target":
			case "target2":
			case "logic_negate":
			case "empty":
			case "empty_cell":
			case "empty_cell_left":
			case "empty_cell_right":
			case "obstacle":
			case "obstacle2":
			case "obstacle3":
			case "obstacle4":
				console.log("Minus " + element.type);
				totalBlocksUsed--;
				break;
			default:
				break;
		}
	});
	return totalBlocksUsed;
}

// Make sure that the level selection buttons are not too big.
$(window).resize(function(){
	var levelSelectionButtonHeight = Math.abs(Math.min(100, Math.floor(($(window).height() - 200) / 4 - 27)));
	$(window).data("dynamicStyle").html(
		"#levelSelectModal .btn-primary{" +
			"height:" + levelSelectionButtonHeight + "px;" +
			"width:" + Math.abs(Math.min(200, Math.floor(($(window).width() - 62) / 5 - 21))) + "px;" +
			"font-size:" + ((levelSelectionButtonHeight < 80) ? 16 : 24) + "px" +
		"}" +
		"#levelSelectModal .modal-dialog{" +
			"width:" + ($(window).width() - 60) + "px" +
		"}" +
		"#levelSelectModal .levelSelectMenu{" +
			"height:" + ($(window).height() - 200) + "px;" +
			"overflow:auto" +
		"}"
	);
	iframeResizeUser(true);
});

//START APP AFTER EVERYTHING HAS LOADED
window.onload = init;
function init(){
	if(window.Blockly && Blockly.mainWorkspace){
		Blockly.mainWorkspace.clear();
		$("#loginModal").modal({
			backdrop: 'static',
			focus: false,
			keyboard: false,
			show: true
		});
		setTimeout(function(){
			$("#loginModal input:first").focus();
		}, 600);
		var dynamicStyle = $('<style type="text/css"></style>');
		$("head").append(dynamicStyle);
		$(window).data("dynamicStyle", dynamicStyle).resize();
	}else{
		setTimeout(init, 1000);
	}
}