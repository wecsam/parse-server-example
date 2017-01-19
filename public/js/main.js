var CURRENT_USER = {};
var menuButtonsOpen = false;

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

		if(!$.isEmptyObject(CURRENT_USER)){
			var Play = Parse.Object.extend("Play");
			var playParse = new Play();

			totalBlocksUsed = getTotalBlocksUsed();

			console.log("Blocks used on Start: " + totalBlocksUsed);
			playParse.set("level", currentLevel);
			playParse.set("blocksUsed", totalBlocksUsed);
			playParse.set("codeUsed", Blockly.JavaScript.workspaceToCode());
			playParse.set("time", new Date());
			playParse.set("UserId", CURRENT_USER.id);
			playParse.save();
		}
		
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
		var stopParse = new Parse.Object("Stop");
		stopParse.set("level", currentLevel);
		stopParse.set("codeUsed", Blockly.JavaScript.workspaceToCode());
		stopParse.set("time", new Date());
		stopParse.set("UserId", CURRENT_USER.id);
		stopParse.save();
	});
	/*$(window).blur(function(){
		$stop.click();
	});*/

	$(".modal .retry").click(function(){
		ReloadLevel();
		if(!$.isEmptyObject(CURRENT_USER)){
			var Retry = Parse.Object.extend("Retry");
			var retry = new Retry();
			retry.set("time", new Date());
			retry.set("UserId", CURRENT_USER.id);
			retry.save();
		}
	});

	$('.tipModal').on('hidden.bs.modal', function () {
		if($(this).data("resetWhenClosed")){
			player.reset();
		}
		$(this).data("resetWhenClosed", false);
		if(!$.isEmptyObject(CURRENT_USER)){
			var HintModalClosed = Parse.Object.extend("HintClosed");
			var closeHint = new HintModalClosed();
			closeHint.set("HintId", tipToShow - 1);
			closeHint.set("Level", currentLevel);
			closeHint.set("time", new Date());
			closeHint.set("UserId", CURRENT_USER.id);
			closeHint.save();
		}
	});

	$('#newBlockModal').on('hidden.bs.modal', function () {
		// There should be no need to move the player back to its original position here.
		// Just log the event.
		if(!$.isEmptyObject(CURRENT_USER)){
			var HintModalClosed = Parse.Object.extend("HintClosed");
			var closeHint = new HintModalClosed();
			closeHint.set("HintId", -1);
			closeHint.set("Level", currentLevel);
			closeHint.set("time", new Date());
			closeHint.set("UserId", CURRENT_USER.id);
			closeHint.save();
		}
	});

	$('#successModal').on('hidden.bs.modal', function () {
		player.reset();
	});
	
	$('#instructionsModal').on('hidden.bs.modal', function(){
		if($("#newBlockTip").is(":visible")){
			$("#newBlockModal").modal("show");
		}
	});

	$("#menuButtons .retry").click(function(){
		//Kill all animations in queue
		while(animationsArray.length > 0){
			clearTimeout(animationsArray.pop());
		}

		var level = currentLevel; //Store current level
		currentLevel = 0; //Change currentLevel value so that Loading the level will make it seem like its the first time. This forces instructions to be displayed
		LoadLevel(level); //Load the level
		if(!$.isEmptyObject(CURRENT_USER)){
			var Retry = Parse.Object.extend("Retry");
			var retry = new Retry();

			var totalBlocksUsed = getTotalBlocksUsed();

			console.log("Blocks used on Retry: " + totalBlocksUsed);
			retry.set("level", currentLevel);
			retry.set("blocksUsed", totalBlocksUsed);
			retry.set("codeUsed", Blockly.JavaScript.workspaceToCode());
			retry.set("time", new Date());
			retry.set("UserId", CURRENT_USER.id);
			retry.save();
		}
	});

	$(".tip").click(function(){
		//Data is saved first, before tipToShow is modified
		console.log("Hint modal requested from menu", tipToShow);
		if(!$.isEmptyObject(CURRENT_USER)){
			var HintRequested = Parse.Object.extend("HintRequested");
			var hintModalRequested = new HintRequested();
			hintModalRequested.set("HintId", (tipToShow > totalNumTips) ? 1 : tipToShow);
			hintModalRequested.set("Level", currentLevel);
			hintModalRequested.set("time", new Date());
			hintModalRequested.set("UserId", CURRENT_USER.id);
			hintModalRequested.save();
		};

		//Hide menu buttons and instructions text
		hideControlsMenu();
		displayTip(false);
	});

	$("#newBlockTip").click(function(){
		console.log("New Hint modal requested from menu", tipToShow);

		if(!$.isEmptyObject(CURRENT_USER)){
			var HintRequested = Parse.Object.extend("HintRequested");
			var hintModalRequested = new HintRequested();
			hintModalRequested.set("HintId", -1);
			hintModalRequested.set("Level", currentLevel);
			hintModalRequested.set("time", new Date());
			hintModalRequested.set("UserId", CURRENT_USER.id);
			hintModalRequested.save();
		};

		$("#newBlockModal").modal('show');
	});

	$(".nextLevel").click(function(){
		LoadNextLevel();
	});

	var challengesEnabled = false;
	$("#levelSelect").click(function(){
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
		}else if(challengesEnabled){
			$("#levelSelectMenu1").hide();
			$("#levelSelectMenu2").hide();
			$("#levelSelectMenuChallenge").show();
		}

		$("#levelSelectModal").modal({
			backdrop: 'static',
			show: true
		});
		
		if(runConditionIsPlus()){
			// Put the number of stars that the user has earned under each level button.
			if(CURRENT_USER.attributes.starsID){
				var query = new Parse.Query(Parse.Object.extend("UserStars"));
				query.get(CURRENT_USER.attributes.starsID, {
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
					$(".level-select-footer-close").prop("disabled", true);
					// When entering the challenge world, log an event.
					if(!$.isEmptyObject(CURRENT_USER)){
						var logEventClass = Parse.Object.extend("ChallengeWorldEnter"),
							logEvent = new logEventClass();
						logEvent.set("time", new Date());
						logEvent.set("UserId", CURRENT_USER.id);
						logEvent.save();
					}
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
					$(".level-select-footer-close").prop("disabled", true);
					// When leaving the challenge world, log an event.
					if(!$.isEmptyObject(CURRENT_USER)){
						var logEventClass = Parse.Object.extend("ChallengeWorldExit"),
							logEvent = new logEventClass();
						logEvent.set("time", new Date());
						logEvent.set("UserId", CURRENT_USER.id);
						logEvent.save();
					}
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
		var level = parseInt( this.id.match(/\d+/)[0] );
		LoadLevel(level);
		if(!$.isEmptyObject(CURRENT_USER)) {
			var LevelSelectedFromMenu = Parse.Object.extend("LevelSelectedFromMenu");
			var levelSelectedFromMenu = new LevelSelectedFromMenu();
			levelSelectedFromMenu.set("level", level);
			levelSelectedFromMenu.set("time", new Date());
			levelSelectedFromMenu.set("UserId", CURRENT_USER.id);
			levelSelectedFromMenu.save();
		}
		$(".level-select-footer-close").prop("disabled", false);
	});

	$(".login-form button.login-form-submit").click(function(){
		// Clear the log in form.
		var $inputs = $(this).siblings("input").add(this);
		$inputs.prop("disabled", true);
		// Pass the username and password to Parse for logging in.
		Parse.User.logIn($("#login-username").val().toLowerCase(), $("#login-password").val()).then(
			function(user) {
				//Hide navbar to use all available space
				$("nav").hide();
				CURRENT_USER = user;
				$("#login").hide();
				$("#logout h2").text(Parse.User.current().get("username"));
				$("span#currentUser").html( Parse.User.current().get("studentName") );
				$("#logout").show();

				UnlockLevels(CURRENT_USER.attributes.maxLevel);
				console.log("User's max level: " + CURRENT_USER.attributes.maxLevel);
				$('#loginModal').modal('hide');
				LoadLevel(Math.min(CURRENT_USER.attributes.maxLevel, parseInt($("#levelSelectMenu2 button:last").attr("id").match(/\d+/))));
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
		$("#login").show();
		$("#logout").hide();
	});

	//Logout when the app is first loaded
	Parse.User.logOut();
	CURRENT_USER = {};
	$("#logout").hide();

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
					console.log("Blockly text input deactivated");
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
			show: true
		});
		var dynamicStyle = $('<style type="text/css"></style>');
		$("head").append(dynamicStyle);
		$(window).data("dynamicStyle", dynamicStyle).resize();
	}else{
		setTimeout(init, 1000);
	}
}