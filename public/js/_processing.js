var player; // Declare object
var playerImg, playerImg3, playerCool, turnSad = [];
var target;
var numSteps = 1; // Number of steps ahead of the player character
var isPlayerMoving = false;
var currentLevel = 0;
var obstacles = [];
var start = false; // Used to determine if code from block stacks is attached to Start block and should be executed
var tipToShow = 1; // Loop through available hints
var numTipsUsed; // Count the number of hints used in each level
var oopsMsgID = 0; // Loop through available oops messages
var totalNumTips; // Number of hints to loop through for each level
var levelStartTime; // Keeping track of how much time was spent on each level

//Challenge task specific
var emptyCells;

//Movement animation var
var animationSpeed = 10;
var frames = 90;
var animationsArray = [];

//Read by blockly iframe using parent.var
var controls_whileUntil_options;

function preload() {
	playerImg = loadImage("../images/smiley.png");
	playerImg3 = loadImage("../images/triangleIsoceles.png");
	playerCool = loadImage("../images/smiley_shades.png");
	var i;
	for(i = 1; i <= 17; i++){
		turnSad.push(loadImage("../images/smiley_sad/Picture" + i + ".png"));
	}
}

function setup() {
	var myCanvas = createCanvas(windowWidth / 2, windowHeight);
	myCanvas.parent('p5Container');
	noLoop();
	angleMode(DEGREES);
}

function windowResized() {
	resizeCanvas(windowWidth / 2, windowHeight);
}

setInterval(function(){
	resizeCanvas(windowWidth / 2, windowHeight);
}, 2000);

function draw() {
    if (currentLevel <= 20) {
		background(153, 204, 255);

		if(target){
			target.display();
		}

		if(player){
			player.display();
		}

        if (obstacles.length > 0) {
            for (var i = 0; i < obstacles.length; i++) {
                obstacles[i].display();
            }
        }

		if(player){
			DrawSteps();
		}
    } else if (currentLevel < 99) {
        background(150, 50, 100);

        target.display();

        player.display();

        if (obstacles.length > 0) {
            for (var i = 0; i < obstacles.length; i++) {
                obstacles[i].display();
            }
        }

        DrawSteps();
    } else { // Challenge Levels
        background(100, 100, 100);
        target.display();
        player.display();
        if (obstacles.length > 0) {
            for (var i = 0; i < obstacles.length; i++) {
                if (obstacles[i].fill) {
                    fill(obstacles[i].color);
                } else {
                    noFill();
                }
                ellipse(obstacles[i].x, obstacles[i].y, obstacles[i].diameter, obstacles[i].diameter);
            }
        }
		switch(currentLevel){
			case 99:
			case 102:
			case 103:
			case 106:
			case 107:
			case 109:
			case 111:
			case 120:
				window["DrawStepsLevel" + currentLevel]();
				break;
			default:
				console.error("An unknown level number " + currentLevel + " is set in the draw function.");
		}
	}
}

function runConditionIsPlus(){
	if(CURRENT_USER.attributes.runCondition){
		// List of run conditions:
		// 0 - undefined, should not be used
		// 1 - normal
		// 2 - plus, which adds the "Oops"/"Missed It" messages and the feedback modal
		return CURRENT_USER.attributes.runCondition == 2;
	}
	console.error("User's run condition is not set!");
	//$("#instructionsModal .modal-body").html('<h3>Your run condition has not been set by the laboratory.</h3>');
	//$("#instructionsModal").modal("show");
	alert("Your run condition has not been set by the laboratory.");
	location.reload();
	return 0;
}

function Player() {
    this.init_x = 50;
    this.init_y = windowHeight * 2 / 3;

    this.angle = 0;

    this.x = this.init_x;
    this.y = this.init_y;
	this.next_x = this.x;
	this.next_y = this.y;

    this.diameter = 45;
    this.steps = this.diameter;
    this.color = color(0, 255, 0);
    this.total_hor_dist_walk = this.diameter * 1;
    this.total_hor_dist_jump = this.diameter * 2;

	this.isStuckInInfiniteLoop = false;

    this.move = function() {
		var initial_x = this.next_x,
			total_hor_dist = this.total_hor_dist_walk,
			that = this;
		this.next_x += total_hor_dist; // Set the initial_x for the next animation.

        var drawStep = function(x) {
            that.x = initial_x + x * total_hor_dist / frames;
            redraw();
            CheckInvalidStates();
        };

		for(var i = 1; i <= frames; i++){
			animationsArray.push(setTimeout(drawStep, animationSpeed * i, i));
		}
    };

    this.jump = function() {
		var amplitude = this.y * 2,
			initial_x = this.next_x,
			initial_y = this.next_y,
			total_hor_dist = this.total_hor_dist_jump,
			max_height = this.diameter,
			that = this;
		this.next_x += total_hor_dist;

        var drawStep = function(j) {
            that.x = initial_x + j * total_hor_dist / frames;
            that.y = initial_y - max_height * sin(j * 180 / frames); //Use negative to account for inverted coordinate system in Y
            redraw();
            CheckInvalidStates();
        };

		for(var i = 1; i <= frames; i++){
			animationsArray.push(setTimeout(drawStep, animationSpeed * i, i));
		}
    }

    this.long_jump = function() {
		var amplitude = this.y * 2,
			initial_x = this.next_x,
			initial_y = this.next_y,
			total_hor_dist = this.total_hor_dist_jump * 1.5,
			max_height = this.diameter,
			that = this;
		this.next_x += total_hor_dist;

        var drawStep = function(j) {
            that.x = initial_x + j * total_hor_dist / frames;
            that.y = initial_y - max_height * sin(j * 180 / frames); //Use negative to account for inverted coordinate system in Y
            redraw();
            CheckInvalidStates();
        };

		for(var i = 1; i <= frames; i++){
			animationsArray.push(setTimeout(drawStep, animationSpeed * i, i));
		}
    }

    this.super_jump = function() {
        var amplitude = this.y * 2.5,
			initial_x = this.next_x,
			initial_y = this.next_y,
			total_hor_dist = this.total_hor_dist_jump,
			max_height = this.diameter;
		this.next_x += total_hor_dist;

        var drawStep = function(j) {
            that.x = initial_x + j * total_hor_dist / frames;
            that.y = initial_y - max_height * sin(j * 180 / frames) * 2.5; //Use negative to account for inverted coordinate system in Y
            redraw();
            CheckInvalidStates();
        };

		for(var i = 1; i <= frames; i++){
			var that = this;
			animationsArray.push(setTimeout(drawStep, animationSpeed * i, i));
		}
    }

    this.display = function() {
        var that = this;
        push();
        translate(that.x, that.y);
        rotate(that.angle);
		image(playerImg, -that.diameter / 2, -that.diameter / 2, that.diameter, that.diameter);
		playerImg.resize(that.diameter, 0);
        pop();
    }
	
	this.turn_sad = function(callback) {
		var startTime = Date.now(), duration = frames * animationSpeed / 2;
		var i, that = this, drawStep = function() {
			if(invalidState){
				if(callback){
					callback.call(that);
				}
				return;
			}
			var elapsed = Date.now() - startTime;
			if(elapsed < duration){
				that.angle = 180 * elapsed / duration;
				if(window.requestAnimationFrame){
					requestAnimationFrame(drawStep);
				}else{
					setTimeout(drawStep, animationSpeed);
				}
			}else{
				that.angle = 0;
				var i = 0, interval = setInterval(function(){
					if(i < turnSad.length){
						image(turnSad[i++], that.x - that.diameter / 2, that.y - that.diameter / 2, that.diameter, that.diameter);
					}else{
						clearInterval(interval);
						if(callback){
							setTimeout(function(){
								callback.call(that);
							}, 500);
						}
					}
				}, animationSpeed);
			}
			redraw();
			CheckInvalidStates();
		};
		drawStep();
	}
	
	this.jump_for_joy = function(callback) {
		var startTime = Date.now(), duration = frames * animationSpeed * 2;
		var initial_y = this.y, that = this, drawStep = function() {
			var elapsed = Date.now() - startTime;
			if(elapsed < duration){
				that.y = initial_y - 100 * abs(sin((1 - (elapsed / duration)) * -3 * 180));
				if(window.requestAnimationFrame){
					requestAnimationFrame(drawStep);
				}else{
					setTimeout(drawStep, animationSpeed);
				}
			}else{
				that.y = initial_y;
				setTimeout(function(){
					var width = that.diameter * 821 / 781;
					image(playerCool, that.x - width / 2, that.y - that.diameter / 2, width, that.diameter);
					setTimeout(function(){
						if(callback){
							callback.call(that);
						}
					}, 1000);
				}, frames * animationSpeed / 4);
			}
			redraw();
		};
		drawStep();
	}
	
	var lastx = 0, lasty = 0, stuckCount = 0;
	this.checkWhetherMoving = function(){
		if((this.x == lastx) && (this.y == lasty)){
			stuckCount++;
			if(stuckCount >= 3){
				console.log("The player appears to be stuck inside an infinite loop.");
				this.isStuckInInfiniteLoop = true;
				CheckInvalidStates();
			}
		}else{
			stuckCount = 0;
		}
		lastx = this.x;
		lasty = this.y;
	}
	this.checkWhetherMovingReset = function(){
		lastx = 0;
		lasty = 0;
		stuckCount = 0;
		this.isStuckInInfiniteLoop = false;
	}

	this.reset = function(){
		invalidState = false;
		this.x = this.init_x;
		this.y = this.init_y;
		this.next_x = this.x;
		this.next_y = this.y;
		this.angle = 0;
		this.checkWhetherMovingReset();
		redraw();
	}
};

function PlayerChallenge() {
    this.init_x = 100;
    this.init_y = windowHeight / 2;

    this.angle = 0;

    this.x = this.init_x;
    this.y = this.init_y;
	this.next_x = this.x;
	this.next_y = this.y;

    this.diameter = 60;
    this.steps = this.diameter;
    this.color = color(0, 255, 0);
    this.total_hor_dist_walk = this.diameter * 1;
    this.total_hor_dist_jump = this.diameter * 2;

    this.forward = function() {
        var initial_x = this.x,
			initial_y = this.y,
			total_hor_dist = this.total_hor_dist_walk,
			that = this;

		// Set the final values for other animations to use
		if(that.angle == 0 || that.angle == 360){
			this.next_x = initial_x + total_hor_dist;
		}else if (that.angle == 90){
			this.next_y = initial_y + total_hor_dist;
		}else if (that.angle == 180){
			this.next_x = initial_x - total_hor_dist;
		}else if (that.angle == 270){
			this.next_y = initial_y - total_hor_dist;
		}

        var drawStep = function(x) {
            if (that.angle == 0 || that.angle == 360) {
                if (initial_x + total_hor_dist)
                    that.x = initial_x + x * total_hor_dist / frames;
                redraw();
            } else if (that.angle == 90) {
                that.y = initial_y + x * total_hor_dist / frames;
                redraw();
            } else if (that.angle == 180) {
                that.x = initial_x - x * total_hor_dist / frames;
                redraw();
            } else if (that.angle == 270) {
                that.y = initial_y - x * total_hor_dist / frames;
                redraw();
            }

            CheckInvalidStates();
        };

		for(var i = 1; i <= frames; i++){
			animationsArray.push(setTimeout(drawStep, animationSpeed * i, i));
		}
    };

    this.turnRight = function() {
        this.angle += 90;

        if (this.angle == 360) {
            this.angle = 0;
        }

        redraw();
    };

    this.turnLeft = function() {
        this.angle -= 90;

        if (this.angle == -90) {
            this.angle = 270;
        }

        redraw();
    };

    this.display = function() {
        var that = this;
        push();
        translate(that.x, that.y);
        rotate(this.angle);
		image(playerImg3, -that.diameter / 2, -that.diameter / 2, that.diameter, that.diameter);
        pop();
    }
	
	this.turn_sad = function(){};
	this.jump_for_joy = function(){};
	this.checkWhetherMoving = function(){};

	this.reset = function(){
		invalidState = false;
		this.x = this.init_x;
		this.y = this.init_y;
		this.next_x = this.x;
		this.next_y = this.y;
		this.angle = 0;
		redraw();
	}
};

function EmptyCell(x, y, width, height) {
    //Used for challenge task
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
};

function Target() {
    this.init_x = 50;
    this.init_y = 200;

    this.x = this.init_x;
    this.y = this.init_y;

    this.diameter = 30;
    this.steps = this.diameter;
    this.color = color(255, 0, 0);

    this.display = function() {
        fill(this.color);
        ellipse(this.x, this.y, this.diameter, this.diameter);
    }
};

function Obstacle(x, y) {
    this.init_x = x;
    this.init_y = y;

    this.x = this.init_x;
    this.y = this.init_y;

    this.diameter = 15;
    if (currentLevel <= 20) {
        //this.color = color(125, 38, 205);
        this.color = color(100, 100, 100);
    } else {
        this.color = color(205, 125, 38);
    }

    this.display = function() {
        fill(this.color);
        if (currentLevel <= 20) {
            ellipse(this.x, this.y, this.diameter, this.diameter);
        } else {
            rect(this.x - this.diameter / 2, this.y - this.diameter / 2, this.diameter, this.diameter);
        }
    }
};

function ObstacleChallenge(x, y, fill) {
    this.init_x = x;
    this.init_y = y;
    this.fill = fill;

    this.x = this.init_x;
    this.y = this.init_y;

    this.diameter = 15;
    if (currentLevel <= 20) {
        this.color = color(125, 38, 205);
    } else {
        this.color = color(205, 125, 38);
    }

    this.display = function() {
        fill(this.color);
        if (currentLevel <= 20) {
            ellipse(this.x, this.y, this.diameter, this.diameter);
        } else {
            rect(this.x - this.diameter / 2, this.y - this.diameter / 2, this.diameter, this.diameter);
        }
    }
};

function DrawSteps() {
    var steps = numSteps;
    var Y1 = player.init_y + player.diameter / 2 + 5;
    var Y2 = Y1;
    var X1 = player.init_x - player.diameter / 4;
    var X2 = X1 + player.diameter / 2;

    stroke(255, 255, 255);
    for (var i = 0; i < steps + 1; i++) {
        var x_translate = i * player.diameter;
        line(X1 + x_translate, Y1, X2 + x_translate, Y1);
    }
    noStroke();
}

function LoadNextLevel() {
	var button = $(".levelSelectMenu #level" + (currentLevel + 1))[0];
	if(button){
		button.disabled = false;
		LoadLevel(currentLevel + 1);
	}
}

function UnlockLevels(maxLevel) {
    var buttons = $(".levelSelectMenu button");
    for (var i = 0; i < maxLevel; i++) {
		if(buttons[i]){
			buttons[i].disabled = false;
		}
    }
}

function ReloadLevel(showInstructionsAndClearWorkspace) {
    while (animationsArray.length > 0) {
        clearTimeout(animationsArray.pop());
    }
	if(showInstructionsAndClearWorkspace){
		var level = currentLevel;
		currentLevel = 0;
		LoadLevel(level);
	}else{
		LoadLevel(currentLevel);
	}
}

function isDummyLevel(levelNumber){
	// If the level loader function contains "LoadLevel" inside the function body, then it is a dummy level.
	// Level 43 is also a dummy level.
	return !!(window["LoadLevel" + levelNumber] && ((levelNumber == 43) || window["LoadLevel" + levelNumber].toString().match(/\{[^]*\bLoadLevel(\(\d+|\d+\()\)[^]*\}/)));
}

function LoadLevel(level) {
	if((currentLevel != level) || (level == 0)){
		// Reset animations, states, and the workspace.
		animationsArray = [];
		invalidState = false;
		Blockly.mainWorkspace.clear();
		// Check whether the requested level is defined.
		if(!window["LoadLevel" + level]){
			level = 1;
		}
		// Save the level start event.
		if(!$.isEmptyObject(CURRENT_USER)){
			// Use a different class name for dummy levels.
			var StartLevel = Parse.Object.extend(isDummyLevel(level) ? "StartLevelDummy" : "StartLevel");
			var event = new StartLevel();
			event.set("level", level);
			event.set("time", new Date());
			event.set("UserId", CURRENT_USER.id);
			event.save();
		}
		// Load the level.
		window["LoadLevel" + level]();
		// Update the level number display.
		if (currentLevel <= 20) {
			$("div#currentLevel").html(currentLevel);
		} else if (currentLevel <= 43) {
			$("div#currentLevel").html(currentLevel - 20);
		} else if (currentLevel >= 100) {
			$("div#currentLevel").html(currentLevel - 100);
		} else {
			$("div#currentLevel").html("*");
		}
    }

    //Close menu on level load
    $("ul#menuButtons").slideUp();
    menuButtonsOpen = false;
    $topMenuText.text("");
}

function LoadLevel1() {
    if (currentLevel != 1) {
        $("#instructionsModal .modal-body").html('<h3>Connect the "Walk" block to the "On Start" block. Then press the Start button to execute.</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 1;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 2;
        numSteps = 1;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 1; //Position target one steps away from player
    target.color = color(153, 51, 0);

    obstacles = [];

    Blockly.mainWorkspace.updateToolbox(
        '<xml id="toolbox" style="display: none">' +
        '<block ' +
        // 'movable="false" ' +
        // 'deletable="false" ' +
        'type="walk">' +
        '</block>' +
        //'<block type="start"></block>'+
        //'<block type="jump"></block>'+
        //'<block type="controls_whileUntil">'+
        //  '<field name="MODE">UNTIL</field>'+
        //'</block>'+
        //'<block type="empty"></block>'+
        //'<block type="text_print"></block>'+
        //'<block type="text"></block>'+
        //'<block type="controls_if"></block>'+
        //'<block type="logic_compare"></block>'+
        //'<block type="logic_operation"></block>'+
        //'<block type="logic_negate"></block>'+
        //'<block type="logic_boolean"></block>'+
        //'<block type="math_number"></block>'+
        '</xml>'
    );

    $("#tipModal1 .modal-body").html('<h3>You need to connect the "Walk" block to the "On Start" block to make the smiley face walk.</h3>');

    $("#tipModal2 .modal-body").html(
        '<h3>You need to program the smiley face to walk towards the red circle. Connect the visual blocks in the right way to make the smiley face walk. Try using the "Walk" block.</h3>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/start.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>This is the first block of your program. Add blocks under this one.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley face one space to the right.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();

    //Insert Start block in workspace
    InsertBlock("start", 150, 50, false, true);

    redraw();
}

function LoadLevel2() {
    if (currentLevel != 2) {
        $("#instructionsModal .modal-body").html("<h3>Program the smiley face to walk to the red circle</h3>");
        $("#instructionsModal").modal("show");
        currentLevel = 2;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 2;
    }

    player = new Player();
    //player.init_x = 50;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 2; //Position target three steps away from player
    target.color = color(153, 51, 0);

    obstacles = [];

    Blockly.mainWorkspace.updateToolbox(
        '<xml id="toolbox" style="display: none">' +
        '<block type="walk"></block>' +
        '</xml>'
    );

    $("#tipModal1 .modal-body").html('<h3>You need to connect the "Walk" blocks. Try using more than one "Walk" block.</h3>');

    $("#tipModal2 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 3 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal3 .modal-body").html(
        '<h3>You need to program the smiley face to reach the red circle. Connect the visual blocks in the right way to get the smiley face moving. Try using more than one "Walk" block.</h3>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/start.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>This is the first block of your program. Add blocks under this one.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley face one space to the right.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();

    //Insert Start block in workspace
    InsertBlock("start", 150, 50, false, true);

    redraw();
}

function LoadLevel3() {
    if (currentLevel != 3) {
        $("#instructionsModal .modal-body").html("<h3>Program the smiley face to walk to the red circle.</h3>");
        $("#instructionsModal").modal("show");
        currentLevel = 3;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 4;
    }

    player = new Player();
    //player.init_x = 50;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 4; //Position target three steps away from player
    target.color = color(153, 51, 0);

    obstacles = [];
    Blockly.mainWorkspace.updateToolbox(
        '<xml id="toolbox" style="display: none">' +
        '<block type="walk"></block>' +
        '</xml>'
    );

    $("#tipModal1 .modal-body").html('<h3>Try connecting more than one "Walk" block to reach the red circle.</h3>');

    $("#tipModal2 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 5 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal3 .modal-body").html(
        '<h3>You need to program the smiley face to reach the red circle. Connect the visual blocks in the right way to get the smiley face moving. Try using many "Walk" blocks. </h3>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/start.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>This is the first block of your program. Add blocks under this one.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley face one space to the right.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();

    //Insert Start block in workspace
    InsertBlock("start", 150, 50, false, true);

    redraw();
}

function LoadLevel4() {
    if (currentLevel != 4) {
        $("#instructionsModal .modal-body").html('<h3>Use "Jump" to avoid the gray circles and reach the red circle.</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 4;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 5;
    }


    player = new Player();
    //player.init_x = 50;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 5; //Position target three steps away from player
    target.color = color(153, 51, 0);

    obstacles = [new Obstacle(player.x + player.diameter * 3, player.y)];
    Blockly.mainWorkspace.updateToolbox(
        '<xml id="toolbox" style="display: none">' +
        '<block type="walk"></block>' +
        //'<block type="repeat_until"></block>'+
        //'<block type="controls_if"></block>'+
        //'<block type="obstacle"></block>'+
        //'<block type="target"></block>'+
        '<block type="jump"></block>' +
        '</xml>'
    );

    $("#tipModal1 .modal-body").html('<h3>Try using the "Walk" and "Jump" block to walk and jump over the gray circles.</h3>');

    $("#tipModal2 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 5 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal3 .modal-body").html(
        '<h3>Connect the visual blocks in the right way to get the smiley face moving. Try using many "Walk" and "Jump" blocks.</h3>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/start.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>This is the first block of your program. Add blocks under this one.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley face one space to the right.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Jump block makes the smiley face move over gray circles and moves him a total of two spaces.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").show();
	$("#newBlockModal .modal-body").html('<img class="tip-pic" src="images/sharmeen/jump-1.png">');

    //Insert Start block in workspace
    InsertBlock("start", 150, 50, false, true);

    redraw();
}

function LoadLevel5() {
    if (currentLevel != 5) {
        $("#instructionsModal .modal-body").html("<h3>Use the repeat block to reach the red circle</h3>");
        $("#instructionsModal").modal("show");
        currentLevel = 5;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 2;
        numSteps = 9;
    }


    player = new Player();
    //player.init_x = 50;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 9; //Position target three steps away from player
    target.color = color(153, 51, 0);

    obstacles = [];

    Blockly.mainWorkspace.updateToolbox(
        '<xml id="toolbox" style="display: none">' +
        '<block type="controls_repeat">' +
        '<field name="TIMES">9</field>' +
        '</block>' +
        '<block type="walk"></block>' +
        //'<block type="repeat_until"></block>'+
        //'<block type="target"></block>'+
        '</xml>'
    );

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 3 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );
    $("#tipModal2 .modal-body").html(
        '<h4>Try using the "Repeat" block with a "Walk" block inside. Change the number to change the number of times to repeat.</h4>' +
        '<h4>Connect the visual blocks in the right way to get the smiley face moving. Try using the "Repeat" and "Walk" blocks.</h4>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/repeat9.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Repeats the blocks in this "Repeat" block 9 times. The "Repeat" block is useful when you want to run the same code again and again. You can connect the "Walk" and "Jump" blocks inside it. You can also change the number of times you want to repeat the code.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Walk block moves the smiley face one space to the right.</h4>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").show();
	$("#newBlockModal .modal-body").html('<img class="tip-pic" src="images/sharmeen/repeat_count-1.png">');

    //Insert Start block in workspace
    InsertBlock("start", 150, 50, false, true);

    redraw();
}

function LoadLevel6() {
    if (currentLevel != 6) {
        $("#instructionsModal .modal-body").html("<h3>Avoid the gray circles to reach the red circle.</h3>");
        $("#instructionsModal").modal("show");
        currentLevel = 6;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 9;

        Blockly.mainWorkspace.updateToolbox(
            '<xml id="toolbox" style="display: none">' +
            //'<block type="repeat_until"></block>'+
            '<block type="controls_repeat">' +
            '<field name="TIMES">3</field>' +
            '</block>' +
            '<block type="walk"></block>' +
            '<block type="jump"></block>' +
            '</xml>'
        );
    }


    player = new Player();
    //player.init_x = 50;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 9; //Position target three steps away from player
    target.color = color(153, 51, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 2, player.y),
        new Obstacle(player.x + player.diameter * 5, player.y),
        new Obstacle(player.x + player.diameter * 8, player.y)
    ];

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 4 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html('<h3>Try using the "Repeat" block with "Walk" and "Jump" blocks inside.</h3>');

    $("#tipModal3 .modal-body").html(
        '<h4>Connect the visual blocks in the right way to get the smiley face moving. Try using the "Walk" and "Jump" blocks inside the "Repeat" blocks.</h4>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/repeat3.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Repeats the blocks in this "Repeat" block 3 times. The "Repeat" block is useful when you want to run the same code again and again. You can connect the "Walk" and "Jump" blocks inside it. You can also change the number of times you want to repeat the code.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Walk block moves the smiley face one space to the right.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Jump block makes the smiley face move over gray circles and moves him a total of two spaces.</h4>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();

    //Insert Start block in workspace
    InsertBlock("start", 150, 50, false, true);

    redraw();
}

function LoadLevel7() {
    if (currentLevel != 7) {
        $("#instructionsModal .modal-body").html("<h3>Avoid the obstacles to get to the red circle.</h3>");
        $("#instructionsModal").modal("show");
        currentLevel = 7;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 9;

        Blockly.mainWorkspace.updateToolbox(
            '<xml id="toolbox" style="display: none">' +
            '<block type="controls_repeat">' +
            '<field name="TIMES">3</field>' +
            '</block>' +
            '<block type="walk"></block>' +
            '<block type="jump"></block>' +
            '</xml>'
        );
    }


    player = new Player();
    //player.init_x = 50;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 9; //Position target three steps away from player
    target.color = color(153, 51, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 1, player.y),
        new Obstacle(player.x + player.diameter * 4, player.y),
        new Obstacle(player.x + player.diameter * 7, player.y)
    ];

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 4 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html('<h3>Try using the "Repeat" block with "Walk" and "Jump" blocks inside.</h3>');

    $("#tipModal3 .modal-body").html(
        '<h4>Connect the visual blocks in the right way to get the smiley face moving. Try using the "Walk" and "Jump" blocks.</h4>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/repeat3.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Repeats the blocks in this "Repeat" block 3 times. The "Repeat" block is useful when you want to run the same code again and again. You can connect the "Walk" and "Jump" blocks inside it. You can also change the number of times you want to repeat the code.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Walk block moves the smiley face one space to the right.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Jump block makes the smiley face move over gray circles and moves him a total of two spaces.</h4>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();

    //Insert Start block in workspace
    InsertBlock("start", 150, 50, false, true);

    redraw();
}

function LoadLevel8() {
    if (currentLevel != 8) {
        $("#instructionsModal .modal-body").html("<h3>Avoid the obstacles to get to the red circle.</h3>");
        $("#instructionsModal").modal("show");
        currentLevel = 8;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 7;

        Blockly.mainWorkspace.updateToolbox(
            '<xml id="toolbox" style="display: none">' +
            //'<block type="repeat_until"></block>'+
            '<block type="controls_repeat">' +
            '<field name="TIMES">2</field>' +
            '</block>' +
            '<block type="walk"></block>' +
            '<block type="jump"></block>' +
            '</xml>'
        );
    }


    player = new Player();
    //player.init_x = 50;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 7; //Position target three steps away from player
    target.color = color(153, 51, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 1, player.y),
        new Obstacle(player.x + player.diameter * 4, player.y),
    ];

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 5 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html('<h3>You  might need an extra "Walk" block after the "Repeat" block.</h3>');

    $("#tipModal3 .modal-body").html(
        '<h4>Connect the visual blocks in the right way to get the smiley face moving. Try using many "Walk" and "Jump" blocks.</h4>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/repeat2.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Repeats the blocks in this "Repeat" block 2 times. The "Repeat" block is useful when you want to run the same code again and again. You can connect the "Walk" and "Jump" blocks inside it. You can also change the number of times you want to repeat the code.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Walk block moves the smiley face one space to the right.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Jump block makes the smiley face move over gray circles and moves him a total of two spaces.</h4>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();

    //Insert Start block in workspace
    InsertBlock("start", 150, 50, false, true);

    redraw();
}

function LoadLevel9() {
    if (currentLevel != 9) {
        $("#instructionsModal .modal-body").html("<h3>Avoid the obstacles to get to the red circle.</h3>");
        $("#instructionsModal").modal("show");
        currentLevel = 9;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 7;

        Blockly.mainWorkspace.updateToolbox(
            '<xml id="toolbox" style="display: none">' +
            //'<block type="repeat_until"></block>'+
            '<block type="controls_repeat">' +
            '<field name="TIMES">2</field>' +
            '</block>' +
            '<block type="walk"></block>' +
            '<block type="jump"></block>' +
            '</xml>'
        );
    }


    player = new Player();
    //player.init_x = 50;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 7; //Position target three steps away from player
    target.color = color(153, 51, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 3, player.y),
        new Obstacle(player.x + player.diameter * 6, player.y)
    ];

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 5 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html('<h3>You  might need an extra "Walk" block before the "Repeat" block.</h3>');

    $("#tipModal3 .modal-body").html(
        '<h4>Connect the visual blocks in the right way to get the smiley face moving. Try using many "Walk" and "Jump" blocks.</h4>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/repeat2.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Repeats the blocks in this "Repeat" block 2 times. The "Repeat" block is useful when you want to run the same code again and again. You can connect the "Walk" and "Jump" blocks inside it. You can also change the number of times you want to repeat the code.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Walk block moves the smiley face one space to the right.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Jump block makes the smiley face move over gray circles and moves him a total of two spaces.</h4>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();

    //Insert Start block in workspace
    InsertBlock("start", 150, 50, false, true);

    redraw();
}

function LoadLevel10() {
    if (currentLevel != 10) {
        $("#instructionsModal .modal-body").html("<h3>Avoid the obstacles to get to the red circle.</h3>");
        $("#instructionsModal").modal("show");
        currentLevel = 10;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 4;
        numSteps = 9;

        Blockly.mainWorkspace.updateToolbox(
            '<xml id="toolbox" style="display: none">' +
            //'<block type="repeat_until"></block>'+
            '<block type="controls_repeat">' +
            '<field name="TIMES">3</field>' +
            '</block>' +
            '<block type="walk"></block>' +
            '<block type="jump"></block>' +
            '</xml>'
        );
    }


    player = new Player();
    //player.init_x = 50;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 8; //Position target three steps away from player
    target.color = color(153, 51, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 4, player.y)
    ];

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 6 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html('<h3>Try using 2 "Repeat" blocks.</h3>');

    $("#tipModal3 .modal-body").html('<h3>Try using 2 "Repeat" blocks with a "Jump" block in between.</h3>');

    $("#tipModal4 .modal-body").html(
        '<h4>Connect the visual blocks in the right way to get the smiley face moving. Try using many "Walk" and "Jump" blocks.</h4>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/repeat3.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Repeats the blocks in this "Repeat" block 3 times. The "Repeat" block is useful when you want to run the same code again and again. You can connect the "Walk" and "Jump" blocks inside it. You can also change the number of times you want to repeat the code.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Walk block moves the smiley face one space to the right.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Jump block makes the smiley face move over gray circles and moves him a total of two spaces.</h4>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();

    //Insert Start block in workspace
    InsertBlock("start", 150, 50, false, true);

    redraw();
}

function LoadLevel11() {
    if (currentLevel != 11) {
        $("#instructionsModal .modal-body").html('<h3>Walk to the red circle.<h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 11;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 2;
        numSteps = 7;

        controls_whileUntil_options = [
            ['repeat until', 'UNTIL']
        ];
		Blockly.mainWorkspace.updateToolbox(
			'<xml id="toolbox" style="display: none">' +
				'<block type="repeat_until">' +
					'<value name="BOOL">' +
						'<block movable="false" type="target"></block>' +
					'</value>' +
				'</block>' +
				/*'<block type="controls_whileUntil">' +
					'<field name="MODE">UNTIL</field>' +
					'<value name="BOOL">' +
						'<block movable="false" type="target"></block>' +
					'</value>' +
				'</block>' +*/
				'<block type="walk"></block>' +
				'<block type="jump"></block>' +
			'</xml>'
		);
    }


    player = new Player();
    //player.init_x = 50;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 7; //Position target three steps away from player
    target.color = color(153, 51, 0);

    obstacles = [];

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 3 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h4>Connect the visual blocks in the right way to get the smiley face moving inside the "repeat until" block.</h4>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/repeat_until_target.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Repeat the blocks in this "repeat until" until the smiley face reaches the red circle. The "repeat until" block is useful when you want to run the same code again and again until the goal is reached. In this case the goal is the red circle. You can connect the "Walk" and "Jump" blocks inside it.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Walk block moves the smiley face one space to the right.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Jump block makes the smiley face move over gray circles and moves him a total of two spaces.</h4>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").show();
	$("#newBlockModal .modal-body").html('<img class="tip-pic" src="images/sharmeen/repeat_until-1.png">');

    //Insert Start block in workspace
    InsertBlock("start", 200, 50, false, true);

    redraw();
}

function LoadLevel12() {
    if (currentLevel != 12) {
        $("#instructionsModal .modal-body").html('<h3>Walk to the red circle.<h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 12;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 2;
        numSteps = 6;

        controls_whileUntil_options = [
            ['repeat until', 'UNTIL']
        ];
        Blockly.mainWorkspace.updateToolbox(
            '<xml id="toolbox" style="display: none">' +
				'<block type="repeat_until">' +
					'<value name="BOOL">' +
						'<block movable="false" type="target"></block>' +
					'</value>' +
				'</block>' +
				'<block type="walk"></block>' +
				'<block type="jump"></block>' +
			'</xml>'
        );
    }


    player = new Player();
    //player.init_x = 50;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 6; //Position target three steps away from player
    target.color = color(153, 51, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 2, player.y),
        new Obstacle(player.x + player.diameter * 5, player.y)
    ];

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 4 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h4>Connect the visual blocks in the right way to get the smiley face moving inside the "repeat until" block.</h4>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/repeat_until_target.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Repeat the blocks in this "repeat until" until the smiley face reaches the red circle. The "repeat until" block is useful when you want to run the same code again and again until the goal is reached. In this case the goal is the red circle. You can connect the "Walk" and "Jump" blocks inside it.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Walk block moves the smiley face one space to the right.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Jump block makes the smiley face move over gray circles and moves him a total of two spaces.</h4>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();

    //Insert Start block in workspace
    InsertBlock("start", 200, 50, false, true);

    redraw();
}

function LoadLevel13() {
    if (currentLevel != 13) {
        $("#instructionsModal .modal-body").html('<h3>Walk to the red circle.<h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 13;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 2;
        numSteps = 6;

        controls_whileUntil_options = [
            ['repeat until', 'UNTIL']
        ];
		Blockly.mainWorkspace.updateToolbox(
			'<xml id="toolbox" style="display: none">' +
				'<block type="repeat_until">' +
					'<value name="BOOL">' +
						'<block movable="false" type="target"></block>' +
					'</value>' +
				'</block>' +
				'<block type="walk"></block>' +
				'<block type="jump"></block>' +
			'</xml>'
		);
    }


    player = new Player();
    //player.init_x = 50;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 6; //Position target three steps away from player
    target.color = color(153, 51, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 1, player.y),
        new Obstacle(player.x + player.diameter * 4, player.y)
    ];

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 4 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h4>Connect the visual blocks in the right way to get the smiley face moving inside the "repeat until" block.</h4>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/repeat_until_target.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Repeat the blocks in this "repeat until" until the smiley face reaches the red circle. The "repeat until" block is useful when you want to run the same code again and again until the goal is reached. In this case the goal is the red circle. You can connect the "Walk" and "Jump" blocks inside it.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Walk block moves the smiley face one space to the right.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Jump block makes the smiley face move over gray circles and moves him a total of two spaces.</h4>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();

    //Insert Start block in workspace
    InsertBlock("start", 200, 50, false, true);

    redraw();
}

function LoadLevel14() {
    if (currentLevel != 14) {
        $("#instructionsModal .modal-body").html('<h3>Use the "not" condition to get to the red circle.<h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 14;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 2;
        numSteps = 7;

        controls_whileUntil_options = [
            ['repeat while', 'WHILE']
        ];
		Blockly.mainWorkspace.updateToolbox(
			'<xml id="toolbox" style="display: none">' +
				'<block type="repeat_while">' +
					'<value name="BOOL">' +
						'<block movable="false" type="logic_negate">' +
							'<value name="BOOL">' +
								'<block movable="false" type="target"></block>' +
							'</value>' +
						'</block>' +
					'</value>' +
				'</block>' +
				'<block type="walk"></block>' +
				'<block type="jump"></block>' +
			'</xml>'
		);
    }


    player = new Player();
    //player.init_x = 50;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 7; //Position target three steps away from player
    target.color = color(153, 51, 0);

    obstacles = [
        //new Obstacle(player.x + player.diameter*1, player.y),
        //new Obstacle(player.x + player.diameter*4, player.y)
    ];

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 3 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h4>Connect the visual blocks in the right way inside the "repeat while" block to get the smiley face moving.</h4>' +
        '<div class="row">' +
        '<div class="col-xs-6">' +
        '<img src="../images/repeat_while_not_target.png">' +
        '</div>' +
        '<div class="col-xs-6">' +
        '<h4>Repeat the blocks in this "repeat while" while the smiley face has not reached the red circle. The "repeat while" block is useful when you want to run the same code again and again while a condition is true. You can connect the "Walk" and "Jump" blocks inside it.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/not_target.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>The "not" block is an expression that returns true or false. In this case it returns false if there is a red circle in front.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Walk block moves the smiley face one space to the right.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Jump block makes the smiley face move over gray circles and moves him a total of two spaces.</h4>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").show();
	$("#newBlockModal .modal-body").html('<img class="tip-pic" src="images/sharmeen/not-1.png">');

    //Insert Start block in workspace
    InsertBlock("start", 220, 25, false, true);

    redraw();
}

function LoadLevel15() {
	if (currentLevel != 15) {
		$("#instructionsModal .modal-body").html('<h3>Get to the red circle.<h3>');
		$("#instructionsModal").modal("show");
		currentLevel = 15;
		tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
		totalNumTips = 2;
		numSteps = 9;

		controls_whileUntil_options = [
			['repeat while', 'WHILE']
		];
		Blockly.mainWorkspace.updateToolbox(
			'<xml id="toolbox" style="display: none">' +
				'<block type="repeat_while">' +
					'<value name="BOOL">' +
						'<block movable="false" type="logic_negate">' +
							'<value name="BOOL">' +
								'<block movable="false" type="target"></block>' +
							'</value>' +
						'</block>' +
					'</value>' +
				'</block>' +
				'<block type="walk"></block>' +
				'<block type="jump"></block>' +
			'</xml>'
		);
	}

	player = new Player();
	target = new Target();
	target.y = player.y;
	target.x = player.x + player.diameter * numSteps; // Position target nine steps away from player
	target.color = color(153, 51, 0);

	obstacles = [
		new Obstacle(player.x + player.diameter * 2, player.y),
		new Obstacle(player.x + player.diameter * 5, player.y),
		new Obstacle(player.x + player.diameter * 8, player.y)
	];

	$("#tipModal1 .modal-body").html(
		'<h3>To write the best code, you should solve the problem using 4 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
	);

	$("#tipModal2 .modal-body").html(
		'<h4>Connect the visual blocks in the right way inside the "repeat while" block to get the smiley face moving.</h4>' +
		'<div class="row">' +
		'<div class="col-xs-6">' +
		'<img src="../images/repeat_while_not_target.png">' +
		'</div>' +
		'<div class="col-xs-6">' +
		'<h4>Repeat the blocks in this "repeat while" while the smiley face has not reached the red circle. The "repeat while" block is useful when you want to run the same code again and again while a condition is true. You can connect the "Walk" and "Jump" blocks inside it.</h4>' +
		'</div>' +
		'</div>' +
		'<div class="row">' +
		'<div class="col-xs-5">' +
		'<img src="../images/not_target.png">' +
		'</div>' +
		'<div class="col-xs-7">' +
		'<h4>The "not" block is an expression that returns true or false. In this case it returns false if there is a red circle in front.</h4>' +
		'</div>' +
		'</div>' +
		'<div class="row">' +
		'<div class="col-xs-5">' +
		'<img src="../images/walk.png">' +
		'</div>' +
		'<div class="col-xs-7">' +
		'<h4>Each Walk block moves the smiley face one space to the right.</h4>' +
		'</div>' +
		'</div>' +
		'<div class="row">' +
		'<div class="col-xs-5">' +
		'<img src="../images/jump.png">' +
		'</div>' +
		'<div class="col-xs-7">' +
		'<h4>Each Jump block makes the smiley face move over gray circles and moves him a total of two spaces.</h4>' +
		'</div>' +
		'</div>'
	);

	$("button#newBlockTip").hide();

	//Insert Start block in workspace
	InsertBlock("start", 220, 25, false, true);

	redraw();
}

function LoadLevel16() {
	if (currentLevel != 16) {
		$("#instructionsModal .modal-body").html('<h3>Use the repeat block to get to the red circle.<h3>');
		$("#instructionsModal").modal("show");
		currentLevel = 16;
		tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
		totalNumTips = 2;
		numSteps = 9;

		controls_whileUntil_options = [
			['repeat until', 'UNTIL']
		];
		Blockly.mainWorkspace.updateToolbox(
			'<xml id="toolbox" style="display: none">' +
				'<block type="repeat_until">' +
					'<value name="BOOL">' +
						'<block movable="false" type="target"></block>' +
					'</value>' +
				'</block>' +
				'<block type="controls_if">' +
					'<value name="IF0">' +
						'<block movable="false" type="obstacle"></block>' +
					'</value>' +
				'</block>' +
				'<block type="walk"></block>' +
				'<block type="jump"></block>' +
			'</xml>'
		);
	}

	player = new Player();
	target = new Target();
	target.y = player.y;
	target.x = player.x + player.diameter * numSteps; // Position target nine steps away from player
	target.color = color(153, 51, 0);

	obstacles = [
		new Obstacle(player.x + player.diameter * 2, player.y),
		new Obstacle(player.x + player.diameter * 5, player.y)
	];

	$("#tipModal1 .modal-body").html(
		'<h3>To write the best code, you should solve the problem using 5 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
	);

	$("#tipModal2 .modal-body").html(
		'<h4>Connect the visual blocks in the right way inside the "repeat until" block to get the smiley face moving.</h4>' +
		'<div class="row">' +
		'<div class="col-xs-6">' +
		'<img src="../images/repeat_until_target.png">' +
		'</div>' +
		'<div class="col-xs-6">' +
		'<h4>Repeat the blocks in this "repeat until" until the smiley face has reached the red circle. The "repeat until" block is useful when you want to run the same code again and again until the goal is reached. You can connect the "Walk" and "Jump" blocks inside it.</h4>' +
		'</div>' +
		'</div>' +
		'<div class="row">' +
		'<div class="col-xs-5">' +
		'<img src="../images/if_obstacle.png">' +
		'</div>' +
		'<div class="col-xs-7">' +
		'<h4>Walk the blocks in this "if" only if the smiley face sees a gray circle ahead.</h4>' +
		'</div>' +
		'</div>' +
		'<div class="row">' +
		'<div class="col-xs-5">' +
		'<img src="../images/walk.png">' +
		'</div>' +
		'<div class="col-xs-7">' +
		'<h4>Each Walk block moves the smiley face one space to the right.</h4>' +
		'</div>' +
		'</div>' +
		'<div class="row">' +
		'<div class="col-xs-5">' +
		'<img src="../images/jump.png">' +
		'</div>' +
		'<div class="col-xs-7">' +
		'<h4>Each Jump block makes the smiley face move over gray circles and moves him a total of two spaces.</h4>' +
		'</div>' +
		'</div>'
	);

	$("button#newBlockTip").show();
	$("#newBlockModal .modal-body").html('<img class="tip-pic" src="images/sharmeen/if_then-1.png">');

	//Insert Start block in workspace
	InsertBlock("start", 220, 25, false, true);

	redraw();
}

function LoadLevel17() {
    if (currentLevel != 17) {
        $("#instructionsModal .modal-body").html('<h3>Use the repeat block to get to the red circle.<h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 17;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 2;
        numSteps = 8;

        controls_whileUntil_options = [
            ['repeat until', 'UNTIL']
        ];
		Blockly.mainWorkspace.updateToolbox(
			'<xml id="toolbox" style="display: none">' +
				'<block type="repeat_until">' +
					'<value name="BOOL">' +
						'<block movable="false" type="target"></block>' +
					'</value>' +
				'</block>' +
				'<block type="controls_if">' +
					'<value name="IF0">' +
						'<block movable="false" type="empty"></block>' +
					'</value>' +
				'</block>' +
				'<block type="walk"></block>' +
				'<block type="jump"></block>' +
			'</xml>'
		);
    }


    player = new Player();
    //player.init_x = 50;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 8; //Position target nine steps away from player
    target.color = color(153, 51, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 1, player.y),
        new Obstacle(player.x + player.diameter * 4, player.y),
        new Obstacle(player.x + player.diameter * 7, player.y)
    ];

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 5 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h4>Connect the visual blocks in the right way inside the "repeat until" block to get the smiley face moving.</h4>' +
        '<div class="row">' +
        '<div class="col-xs-6">' +
        '<img src="../images/repeat_until_target.png">' +
        '</div>' +
        '<div class="col-xs-6">' +
        '<h4>Repeat the blocks in this "repeat until" until the smiley face has reached the red circle. The "repeat until" block is useful when you want to run the same code again and again until the goal is reached. You can connect the "Walk" and "Jump" blocks inside it.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_empty.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Walk the blocks in this "if" only if the smiley face sees a path ahead.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Walk block moves the smiley face one space to the right.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Jump block makes the smiley face move over gray circles and moves him a total of two spaces.</h4>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();

    //Insert Start block in workspace
    InsertBlock("start", 220, 25, false, true);

    redraw();
}

function LoadLevel18() {
    if (currentLevel != 18) {
        $("#instructionsModal .modal-body").html('<h3>Use conditionals to get to the red circle.<h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 18;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 9;

        controls_whileUntil_options = [
            ['repeat until', 'UNTIL']
        ];

		Blockly.mainWorkspace.updateToolbox(
			'<xml id="toolbox" style="display: none">' +
				'<block type="repeat_until">' +
					'<value name="BOOL">' +
						'<block movable="false" type="target"></block>' +
					'</value>' +
				'</block>' +
				'<block type="controls_if">' +
					'<value name="IF0">' +
						'<block movable="false" type="empty"></block>' +
					'</value>' +
				'</block>' +
				'<block type="controls_if">' +
					'<value name="IF0">' +
						'<block movable="false" type="obstacle"></block>' +
					'</value>' +
				'</block>' +
				'<block type="walk"></block>' +
				'<block type="jump"></block>' +
			'</xml>'
		);
    }


    player = new Player();
    //player.init_x = 50;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 9; //Position target nine steps away from player
    target.color = color(153, 51, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 2, player.y),
        new Obstacle(player.x + player.diameter * 4, player.y)
    ];

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 6 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h3>If the smiley face sees a gray circle "Jump". If the smiley face sees a path "Walk".</h3>'
    );

    $("#tipModal3 .modal-body").html(
        '<h4>Connect the visual blocks in the right way inside the "repeat until" block to get the smiley face moving.</h4>' +
        '<div class="row">' +
        '<div class="col-xs-6">' +
        '<img src="../images/repeat_until_target.png">' +
        '</div>' +
        '<div class="col-xs-6">' +
        '<h4>Repeat the blocks in this "repeat until" until the smiley face has reached the red circle. The "repeat until" block is useful when you want to run the same code again and again until the goal is reached. You can connect the "Walk" and "Jump" blocks inside it.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_obstacle.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Walk the blocks in this "if" only if the smiley face sees a gray circle ahead.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_empty.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Walk the blocks in this "if" only if the smiley face sees a path ahead.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Walk block moves the smiley face one space to the right.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Jump block makes the smiley face move over gray circles and moves him a total of two spaces.</h4>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();

    //Insert Start block in workspace
    InsertBlock("start", 220, 25, false, true);

    redraw();
}

function LoadLevel19() {
    if (currentLevel != 19) {
        $("#instructionsModal .modal-body").html('<h3>Use conditionals to get to the red circle.<h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 19;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 9;

        controls_whileUntil_options = [
            ['repeat until', 'UNTIL']
        ];

		Blockly.mainWorkspace.updateToolbox(
			'<xml id="toolbox" style="display: none">' +
				'<block type="repeat_until">' +
					'<value name="BOOL">' +
						'<block movable="false" type="target"></block>' +
					'</value>' +
				'</block>' +
				'<block type="controls_if">' +
					'<mutation else="1"></mutation>' +
					'<value name="IF0">' +
						'<block movable="false" type="obstacle"></block>' +
					'</value>' +
				'</block>' +
				'<block type="walk"></block>' +
				'<block type="jump"></block>' +
			'</xml>'
		);
    }


    player = new Player();
    //player.init_x = 50;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 9; //Position target nine steps away from player
    target.color = color(153, 51, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 2, player.y),
        new Obstacle(player.x + player.diameter * 4, player.y),
        new Obstacle(player.x + player.diameter * 8, player.y)
    ];

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 5 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h3>If the smiley face sees a gray circle "Jump". Otherwise, if the smiley face sees a path "Walk".</h3>'
    );

    $("#tipModal3 .modal-body").html(
        '<h4>Connect the visual blocks in the right way inside the "repeat until" block to get the smiley face moving.</h4>' +
        '<div class="row">' +
        '<div class="col-xs-6">' +
        '<img src="../images/repeat_until_target.png">' +
        '</div>' +
        '<div class="col-xs-6">' +
        '<h4>Repeat the blocks in this "repeat until" until the smiley face has reached the red circle. The "repeat until" block is useful when you want to run the same code again and again until the goal is reached. You can connect the "Walk" and "Jump" blocks inside it.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_obstacle_else.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>If there is a gray circle ahead, run the blocks in the first "If" section. Otherwise, run the blocks in the second "Else" section.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Walk block moves the smiley face one space to the right.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Jump block makes the smiley face move over gray circles and moves him a total of two spaces.</h4>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").show();
	$("#newBlockModal .modal-body").html('<img class="tip-pic" src="images/sharmeen/if_then_else-1.png">');

    //Insert Start block in workspace
    InsertBlock("start", 220, 25, false, true);

    redraw();
}

function LoadLevel20() {
    if (currentLevel != 20) {
        $("#instructionsModal .modal-body").html('<h3>Use the if-else conditional to get to the red circle.<h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 20;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 9;

        controls_whileUntil_options = [
            ['repeat until', 'UNTIL']
        ];

		Blockly.mainWorkspace.updateToolbox(
			'<xml id="toolbox" style="display: none">' +
				'<block type="repeat_until">' +
					'<value name="BOOL">' +
						'<block movable="false" type="target"></block>' +
					'</value>' +
				'</block>' +
				'<block type="controls_if">' +
					'<mutation else="1"></mutation>' +
					'<value name="IF0">' +
						'<block movable="false" type="empty"></block>' +
					'</value>' +
				'</block>' +
				'<block type="walk"></block>' +
				'<block type="jump"></block>' +
			'</xml>'
		);
    }


    player = new Player();
    //player.init_x = 50;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 9; //Position target nine steps away from player
    target.color = color(153, 51, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 2, player.y),
        new Obstacle(player.x + player.diameter * 8, player.y)
    ];

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 5 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h3>If the smiley face sees a gray circle "Jump". Otherwise, if the smiley face sees a path "Walk".</h3>'
    );

    $("#tipModal3 .modal-body").html(
        '<h4>Connect the visual blocks in the right way inside the "repeat until" block to get the smiley face moving.</h4>' +
        '<div class="row">' +
        '<div class="col-xs-6">' +
        '<img src="../images/repeat_until_target.png">' +
        '</div>' +
        '<div class="col-xs-6">' +
        '<h4>Repeat the blocks in this "repeat until" until the smiley face has reached the red circle. The "repeat until" block is useful when you want to run the same code again and again until the goal is reached. You can connect the "Walk" and "Jump" blocks inside it.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_empty_else.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>If the smiley face sees a path ahead, run the blocks in the first "If" section. Otherwise, run the blocks in the second "Else" section.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Walk block moves the smiley face one space to the right.</h4>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each Jump block makes the smiley face move over gray circles and moves him a total of two spaces.</h4>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();

    //Insert Start block in workspace
    InsertBlock("start", 220, 25, false, true);

    redraw();
}

//WORLD 2
function LoadLevel21() {
    if (currentLevel != 21) {
        $("#instructionsModal .modal-body").html('<h3>Can you move the smiley  face to the green circle?</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 21;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 2;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 2; //Position target one steps away from player
    target.color = color(51, 153, 0);

    obstacles = [];

    Blockly.mainWorkspace.updateToolbox(
        '<xml id="toolbox" style="display: none">' +
        '<block ' +
        'type="walk">' +
        '</block>' +
        '</xml>'
    );

    $("#tipModal1 .modal-body").html('<h3>You need to connect the "Walk" block. Try using more than one "Walk" block.</h3>');

    $("#tipModal2 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 3 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal3 .modal-body").html(
        '<h3>You need to program the smiley  face to walk towards the green circle. Connect the visual blocks in the right way to make the smiley  face walk. Try using more than one "Walk" block.</h3>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/start.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>This is the first block of your program. Add blocks under this one.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley  face one step forward to the next space on the path.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").show();
	$("#newBlockModal .modal-body").html('<img class="tip-pic" src="images/sharmeen/walk.png">');

    //Insert Start block in workspace
    InsertBlock("start", 150, 50, false, true);

    redraw();
}

function LoadLevel22() {
    if (currentLevel != 22) {
        $("#instructionsModal .modal-body").html('<h3>Can you move the smiley  face to the green circle?</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 22;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 4;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 4; //Position target one steps away from player
    target.color = color(51, 153, 0);

    obstacles = [];

    Blockly.mainWorkspace.updateToolbox(
        '<xml id="toolbox" style="display: none">' +
        '<block ' +
        'type="walk">' +
        '</block>' +
        '</xml>'
    );

    $("#tipModal1 .modal-body").html('<h3>Try connecting more than one "Walk" block to reach the green circle.</h3>');

    $("#tipModal2 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 5 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal3 .modal-body").html(
        '<h3>You need to program the smiley  face to walk towards the green circle. Connect the visual blocks in the right way to make the smiley  face walk. Try using many "Walk" blocks.</h3>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/start.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>This is the first block of your program. Add blocks under this one.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley  face one step forward to the next space on the path.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();

    //Insert Start block in workspace
    InsertBlock("start", 150, 50, false, true);

    redraw();
}

function LoadLevel23() {
    if (currentLevel != 23) {
        $("#instructionsModal .modal-body").html('<h3>Use Walk and Jump to avoid the obstacles.</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 23;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 5;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 5; //Position target one steps away from player
    target.color = color(51, 153, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 3, player.y)
    ];

    Blockly.mainWorkspace.updateToolbox(
        '<xml id="toolbox" style="display: none">' +
        '<block ' +
        'type="walk">' +
        '</block>' +
        '<block type="jump"></block>' +
        '</xml>'
    );

    $("#tipModal1 .modal-body").html('<h3>Try using the "Walk" and "Jump" block to walk and jump over the orange rectangle.</h3>');

    $("#tipModal2 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 5 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal3 .modal-body").html(
        '<h3>You need to program the smiley  face to walk towards the green circle. Connect the visual blocks in the right way to make the smiley  face walk. Try using many "Walk" and "Jump" blocks.</h3>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/start.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>This is the first block of your program. Add blocks under this one.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley  face one step forward to the next space on the path.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Jump block makes the smiley  face jump over the orange rectangle and moves him two steps forward.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").show();
	$("#newBlockModal .modal-body").html('<img class="tip-pic" src="images/sharmeen/jump-2.png">');

    //Insert Start block in workspace
    InsertBlock("start", 150, 50, false, true);

    redraw();
}

function LoadLevel24() {
    if (currentLevel != 24) {
        $("#instructionsModal .modal-body").html('<h3>Get the smiley  face to the green circle.</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 24;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 2;
        numSteps = 9;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 9; //Position target one steps away from player
    target.color = color(51, 153, 0);

    obstacles = [
        //new Obstacle(player.x + player.diameter*3, player.y)
    ];

    Blockly.mainWorkspace.updateToolbox(
        '<xml id="toolbox" style="display: none">' +
        '<block type="controls_repeat">' +
        '<field name="TIMES">9</field>' +
        '</block>' +
        '<block ' +
        'type="walk">' +
        '</block>' +
        '</xml>'
    );

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 3 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h3>Try using the "Repeat" block with a "Walk" block inside. Change the number to change the number of times to repeat.</h3>' +
        '<h3>Connect the visual blocks in the right way to get the smiley  face moving. Try using the "Repeat" and "Walk" blocks.</h3>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/repeat9.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Repeats the blocks in this "Repeat" block 9 times. The "Repeat" block is useful when you want to run the same code again and again. You can connect the "Walk" and "Jump" blocks inside it. You can also change the number of times you want to repeat the code.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley  face one step forward to the next space on the path.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").show();
	$("#newBlockModal .modal-body").html('<img class="tip-pic" src="images/sharmeen/repeat_count-2.png">');

    //Insert Start block in workspace
    InsertBlock("start", 150, 50, false, true);

    redraw();
}

function LoadLevel25() {
    if (currentLevel != 25) {
        $("#instructionsModal .modal-body").html('<h3>Avoid the obstacles</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 25;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 2;
        numSteps = 9;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 9; //Position target one steps away from player
    target.color = color(51, 153, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 2, player.y),
        new Obstacle(player.x + player.diameter * 5, player.y),
        new Obstacle(player.x + player.diameter * 8, player.y)
    ];

    Blockly.mainWorkspace.updateToolbox(
        '<xml id="toolbox" style="display: none">' +
        '<block type="controls_repeat">' +
        '<field name="TIMES">3</field>' +
        '</block>' +
        '<block ' +
        'type="walk">' +
        '</block>' +
        '<block ' +
        'type="jump">' +
        '</block>' +
        '</xml>'
    );

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 4 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h3>Try using the "Repeat" block with a "Walk" and "Jump" blocks inside.</h3>' +
        '<h3>Connect the visual blocks in the right way to get the smiley  face moving. Try using the "Walk" and "Jump" blocks inside the "Repeat" block.</h3>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/repeat3.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Repeats the blocks in this "Repeat" block 3 times. The "Repeat" block is useful when you want to run the same code again and again. You can connect the "Walk" and "Jump" blocks inside it. You can also change the number of times you want to repeat the code.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley  face one step forward to the next space on the path.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Jump block makes the smiley  face jump over the orange rectangle and moves him two steps forward.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();
    //$("#newBlockModal .modal-body").html(
    //  '<div class="row">'+
    //  '<div class="col-xs-5">'+
    //  '<img src="../images/repeat9.png">'+
    //  '</div>'+
    //  '<div class="col-xs-7">'+
    //  '<h3>Repeats the blocks in this "Repeat" block 9 times. The "Repeat" block is useful when you want to run the same code again and again. You can connect the "Walk" and "Jump" blocks inside it. You can also change the number of times you want to repeat the code.</h3>'+
    //  '</div>'+
    //  '</div>'
    //);

    //Insert Start block in workspace
    InsertBlock("start", 150, 50, false, true);

    redraw();
}

function LoadLevel26() {
    if (currentLevel != 26) {
        $("#instructionsModal .modal-body").html('<h3>Reach the green circle, but avoid the orange squares.</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 26;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 2;
        numSteps = 9;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 9; //Position target one steps away from player
    target.color = color(51, 153, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 1, player.y),
        new Obstacle(player.x + player.diameter * 4, player.y),
        new Obstacle(player.x + player.diameter * 7, player.y)
    ];

    Blockly.mainWorkspace.updateToolbox(
        '<xml id="toolbox" style="display: none">' +
        '<block type="controls_repeat">' +
        '<field name="TIMES">3</field>' +
        '</block>' +
        '<block ' +
        'type="walk">' +
        '</block>' +
        '<block ' +
        'type="jump">' +
        '</block>' +
        '</xml>'
    );

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 4 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h3>Try using the "Repeat" block with a "Walk" and "Jump" blocks inside.</h3>' +
        '<h3>Connect the visual blocks in the right way to get the smiley  face moving. Try using the "Walk" and "Jump" blocks inside the "Repeat" block.</h3>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/repeat3.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Repeats the blocks in this "Repeat" block 3 times. The "Repeat" block is useful when you want to run the same code again and again. You can connect the "Walk" and "Jump" blocks inside it. You can also change the number of times you want to repeat the code.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley  face one step forward to the next space on the path.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Jump block makes the smiley  face jump over the orange rectangle and moves him two steps forward.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();
    //$("#newBlockModal .modal-body").html(
    //  '<div class="row">'+
    //  '<div class="col-xs-5">'+
    //  '<img src="../images/repeat9.png">'+
    //  '</div>'+
    //  '<div class="col-xs-7">'+
    //  '<h3>Repeats the blocks in this "Repeat" block 9 times. The "Repeat" block is useful when you want to run the same code again and again. You can connect the "Walk" and "Jump" blocks inside it. You can also change the number of times you want to repeat the code.</h3>'+
    //  '</div>'+
    //  '</div>'
    //);

    //Insert Start block in workspace
    InsertBlock("start", 150, 50, false, true);

    redraw();
}

function LoadLevel27() {
    if (currentLevel != 27) {
        $("#instructionsModal .modal-body").html('<h3>Reach the green circle, but avoid the orange squares.</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 27;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 2;
        numSteps = 9;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 8; //Position target one steps away from player
    target.color = color(51, 153, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 4, player.y)
    ];

    Blockly.mainWorkspace.updateToolbox(
        '<xml id="toolbox" style="display: none">' +
        '<block type="controls_repeat">' +
        '<field name="TIMES">3</field>' +
        '</block>' +
        '<block ' +
        'type="walk">' +
        '</block>' +
        '<block ' +
        'type="jump">' +
        '</block>' +
        '</xml>'
    );

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 6 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h3>Try using the "Repeat" block with a "Walk" and "Jump" blocks inside.</h3>' +
        '<h3>Connect the visual blocks in the right way to get the smiley  face moving. Try using the "Walk" and "Jump" blocks inside the "Repeat" block.</h3>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/repeat3.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Repeats the blocks in this "Repeat" block 3 times. The "Repeat" block is useful when you want to run the same code again and again. You can connect the "Walk" and "Jump" blocks inside it. You can also change the number of times you want to repeat the code.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley  face one step forward to the next space on the path.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Jump block makes the smiley  face jump over the orange rectangle and moves him two steps forward.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();
    //$("#newBlockModal .modal-body").html(
    //  '<div class="row">'+
    //  '<div class="col-xs-5">'+
    //  '<img src="../images/repeat9.png">'+
    //  '</div>'+
    //  '<div class="col-xs-7">'+
    //  '<h3>Repeats the blocks in this "Repeat" block 9 times. The "Repeat" block is useful when you want to run the same code again and again. You can connect the "Walk" and "Jump" blocks inside it. You can also change the number of times you want to repeat the code.</h3>'+
    //  '</div>'+
    //  '</div>'
    //);

    //Insert Start block in workspace
    InsertBlock("start", 150, 50, false, true);

    redraw();
}

function LoadLevel28() {
    if (currentLevel != 28) {
        $("#instructionsModal .modal-body").html('<h3>Reach the green circle, but jump if there is an orange square.</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 28;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 2;
        numSteps = 3;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 3; //Position target one steps away from player
    target.color = color(51, 153, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 1, player.y)
    ];

	Blockly.mainWorkspace.updateToolbox(
		'<xml id="toolbox" style="display: none">' +
			'<block type="controls_if">' +
				'<value name="IF0">' +
					'<block movable="false" type="obstacle2"></block>' +
				'</value>' +
				'<value name="DO0">' +
					'<block movable="false" type="jump"></block>' +
				'</value>' +
			'</block>' +
			'<block type="walk"></block>' +
		'</xml>'
	);

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 4 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h3>Try using the "If" block with "Jump" block inside to avoid the orange rectangle.</h3>' +
        '<h3>Connect the visual blocks in the right way to get the smiley  face moving. Try using the "If" block with the "Jump" block.</h3>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_obstacle_then.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Walk the blocks in this "If" only if the smiley  face sees an orange rectangle ahead.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley  face one step forward to the next space on the path.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Jump block makes the smiley  face jump over the orange rectangle and moves him two steps forward.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").show();
	$("#newBlockModal .modal-body").html('<img class="tip-pic" src="images/sharmeen/if_then-2.png">');

    //Insert Start block in workspace
    InsertBlock("start", 150, 50, false, true);

    redraw();
}

function LoadLevel29() {
    if (currentLevel != 29) {
        $("#instructionsModal .modal-body").html('<h3>Reach the green circle, but jump if there is an orange square.</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 29;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 2;
        numSteps = 2;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 2; //Position target one steps away from player
    target.color = color(51, 153, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 1, player.y)
    ];

    Blockly.mainWorkspace.updateToolbox(
        '<xml id="toolbox" style="display: none">' +

        '<block type="controls_if">' +
        '<mutation else="1"></mutation>' +

        '<value name="IF0">' +
        '<block ' +
        'movable="false" ' +
        'type="obstacle2">' +
        '</block>' +
        '</value>' +

        '<value name="DO0">' +
        '<block ' +
        'movable="false" ' +
        'type="jump">' +
        '</block>' +
        '</value>' +

        '<value name="ELSE">' +
        '<block ' +
        'movable="false" ' +
        'type="walk">' +
        '</block>' +
        '</value>' +
        '</block>' +

        '<block ' +
        'type="walk">' +
        '</block>' +
        '</xml>'
    );

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 4 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h3>Try using the "If-Else" block with "Jump" block inside to avoid the orange rectangle.</h3>' +
        '<h3>Connect the visual blocks in the right way to get the smiley  face moving. Try using the "If-Else" block with the "Jump" block.</h3>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_obstacle_then_else.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>If the smiley  face sees an orange rectangle ahead, run the blocks in the first "If" section. Otherwise, run the blocks in the second "Else" section.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley  face one step forward to the next space on the path.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Jump block makes the smiley  face jump over the orange rectangle and moves him two steps forward.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").show();
	$("#newBlockModal .modal-body").html('<img class="tip-pic" src="images/sharmeen/if_then_else-2.png">');

    //Insert Start block in workspace
    InsertBlock("start", 150, 50, false, true);

    redraw();
}

function LoadLevel30() {
    if (currentLevel != 30) {
        $("#instructionsModal .modal-body").html('<h3>Reach the green circle, but avoid the orange squares.</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 30;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 9;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 9; //Position target one steps away from player
    target.color = color(51, 153, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 1, player.y),
        new Obstacle(player.x + player.diameter * 5, player.y),
        new Obstacle(player.x + player.diameter * 7, player.y)
    ];

	Blockly.mainWorkspace.updateToolbox(
		'<xml id="toolbox" style="display: none">' +
			'<block type="repeat_until">' +
				'<value name="BOOL">' +
					'<block movable="false" type="target2"></block>' +
				'</value>' +
			'</block>' +
			'<block type="controls_if">' +
				'<mutation else="1"></mutation>' +
				'<value name="IF0">' +
					'<block movable="false" type="obstacle2"></block>' +
				'</value>' +
			'</block>' +
			'<block type="jump"></block>' +
			'<block type="walk"></block>' +
		'</xml>'
	);

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 5 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h3>If the smiley  face sees an orange rectangle "Jump". If the smiley  face sees a path "Walk".</h3>'
    );

    $("#tipModal3 .modal-body").html(
        //'<h3>Try using the "If-Else" block with "Jump" block inside to avoid the orange rectangle.</h3>'+
        '<h3>Connect the visual blocks in the right way to get the smiley  face moving inside the "Repeat Until" loop.</h3>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/repeat_until_target2.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Repeat the blocks in this "Repeat Until" until the smiley  face reaches the green circle. ' +
        'The "repeat until" block is useful when you want to run the same code again and again until the goal is reached. ' +
        'In this case the goal is the green circle. You can connect the "Walk" and "Jump" blocks inside it.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_obstacle_then_else.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>If the smiley  face sees an orange rectangle ahead, run the blocks in the first "If" section. Otherwise, run the blocks in the second "Else" section.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley  face one step forward to the next space on the path.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Jump block makes the smiley  face jump over the orange rectangle and moves him two steps forward.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").show();
	$("#newBlockModal .modal-body").html('<img class="tip-pic" src="images/sharmeen/repeat_until-2.png">');

    //Insert Start block in workspace
    InsertBlock("start", 200, 50, false, true);

    redraw();
}

function LoadLevel31() {
    if (currentLevel != 31) {
        $("#instructionsModal .modal-body").html('<h3>Reach the green circle.</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 31;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 9;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 9; //Position target one steps away from player
    target.color = color(51, 153, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 2, player.y),
        new Obstacle(player.x + player.diameter * 4, player.y),
        new Obstacle(player.x + player.diameter * 7, player.y)
    ];

	Blockly.mainWorkspace.updateToolbox(
		'<xml id="toolbox" style="display: none">' +
			'<block type="repeat_until">' +
				'<value name="BOOL">' +
					'<block movable="false" type="target2"></block>' +
				'</value>' +
			'</block>' +
			'<block type="controls_if">' +
				'<mutation else="1"></mutation>' +
				'<value name="IF0">' +
					'<block movable="false" type="obstacle2"></block>' +
				'</value>' +
			'</block>' +
			'<block type="jump"></block>' +
			'<block type="walk"></block>' +
		'</xml>'
	);

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 5 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h3>If the smiley  face sees an orange rectangle "Jump". If the smiley  face sees a path "Walk".</h3>'
    );

    $("#tipModal3 .modal-body").html(
        //'<h3>Try using the "If-Else" block with "Jump" block inside to avoid the orange rectangle.</h3>'+
        '<h3>Connect the visual blocks in the right way to get the smiley  face moving inside the "Repeat Until" loop.</h3>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/repeat_until_target2.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Repeat the blocks in this "Repeat Until" until the smiley  face reaches the green circle. ' +
        'The "repeat until" block is useful when you want to run the same code again and again until the goal is reached. ' +
        'In this case the goal is the green circle. You can connect the "Walk" and "Jump" blocks inside it.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_obstacle_then_else.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>If the smiley  face sees an orange rectangle ahead, run the blocks in the first "If" section. Otherwise, run the blocks in the second "Else" section.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley  face one step forward to the next space on the path.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Jump block makes the smiley  face jump over the orange rectangle and moves him two steps forward.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();
    //$("#newBlockModal .modal-body").html(
    //  '<div class="row">'+
    //  '<div class="col-xs-5">'+
    //  '<img src="../images/repeat_until_target2.png">'+
    //  '</div>'+
    //  '<div class="col-xs-7">'+
    //  '<h3>Repeat the blocks in this "Repeat Until" until the smiley  face reaches the green circle. ' +
    //  'The "repeat until" block is useful when you want to run the same code again and again until the goal is reached. ' +
    //  'In this case the goal is the green circle. You can connect the "Walk" and "Jump" blocks inside it.</h3>'+
    //  '</div>'+
    //  '</div>'
    //);

    //Insert Start block in workspace
    InsertBlock("start", 200, 50, false, true);

    redraw();
}

function LoadLevel32() {
    if (currentLevel != 32) {
        $("#instructionsModal .modal-body").html('<h3>Reach the green circle.</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 32;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 2;
        numSteps = 9;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 9; //Position target one steps away from player
    target.color = color(51, 153, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 2, player.y),
        new Obstacle(player.x + player.diameter * 4, player.y),
        new Obstacle(player.x + player.diameter * 7, player.y)
    ];

	Blockly.mainWorkspace.updateToolbox(
		'<xml id="toolbox" style="display: none">' +
			'<block type="repeat_until">' +
				'<value name="BOOL">' +
					'<block movable="false" type="target2"></block>' +
				'</value>' +
			'</block>' +
			'<block type="controls_if">' +
				'<mutation else="1"></mutation>' +
				'<value name="IF0">' +
					'<block movable="false" type="logic_negate">' +
						'<value name="BOOL">' +
							'<block movable="false" type="obstacle2"></block>' +
						'</value>' +
					'</block>' +
				'</value>' +
			'</block>' +
			'<block type="jump"></block>' +
			'<block type="walk"></block>' +
		'</xml>'
	);

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 5 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    //$("#tipModal2 .modal-body").html(
    //  '<h3>If the smiley  face sees an orange rectangle "Jump". If the smiley  face sees a path "Walk".</h3>'
    //);

    $("#tipModal2 .modal-body").html(
        //'<h3>Try using the "If-Else" block with "Jump" block inside to avoid the orange rectangle.</h3>'+
        '<h3>Connect the visual blocks in the right way to get the smiley  face moving inside the "Repeat Until" loop.</h3>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/repeat_until_target2.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Repeat the blocks in this "Repeat Until" until the smiley  face reaches the green circle. ' +
        'The "repeat until" block is useful when you want to run the same code again and again until the goal is reached. ' +
        'In this case the goal is the green circle. You can connect the "Walk" and "Jump" blocks inside it.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/not_obstacle2.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>The "not" block is an expression that returns true or false. ' +
        'In this case it returns false if there is an orange rectangle in front.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_obstacle_then_else.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>If the smiley  face sees an orange rectangle ahead, run the blocks in the first "If" section. Otherwise, run the blocks in the second "Else" section.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley  face one step forward to the next space on the path.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Jump block makes the smiley  face jump over the orange rectangle and moves him two steps forward.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").show();
	$("#newBlockModal .modal-body").html('<img class="tip-pic" src="images/sharmeen/not-2.png">');

    //Insert Start block in workspace
    InsertBlock("start", 200, 50, false, true);

    redraw();
}

function LoadLevel33() {
    if (currentLevel != 33) {
        $("#instructionsModal .modal-body").html('<h3>Reach the green circle, but do a long jump if there are double orange rectangles.</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 33;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 5;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 5; //Position target one steps away from player
    target.color = color(51, 153, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 2, player.y),
        new Obstacle(player.x + player.diameter * 3, player.y)
    ];

	Blockly.mainWorkspace.updateToolbox(
		'<xml id="toolbox" style="display: none">' +
			'<block type="controls_if">' +
				'<value name="IF0">' +
					'<block movable="false" type="obstacle3"></block>' +
				'</value>' +
				'<value name="DO0">' +
					'<block movable="false" type="long_jump"></block>' +
				'</value>' +
			'</block>' +
			'<block type="walk"></block>' +
		'</xml>'
	);

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 5 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h3>Try using the "If" block with "Long Jump" block inside to avoid the double orange rectangles.</h3>'
    );

    $("#tipModal3 .modal-body").html(
        '<h3>You need to program the smiley  face to reach the green circle. ' +
        'Connect the visual blocks in the right way to get the smiley  face moving. ' +
        'Try using the "If" block with "Long Jump" block.' +
        '</h3>' +
        //'<h3>Connect the visual blocks in the right way to get the smiley  face moving inside the "Repeat Until" loop.</h3>'+
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/start.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>This is the first block of your program. Add blocks under this one.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_double_obstacle_then.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Walk the blocks in this "If" only if the smiley  face sees double orange rectangles ahead.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley  face one step forward to the next space on the path.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/long_jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Long Jump block makes the smiley  face jump over the double orange rectangles and moves him three steps forward.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").show();
	$("#newBlockModal .modal-body").html('<img class="tip-pic" src="images/sharmeen/long_jump.png">');

    //Insert Start block in workspace
    InsertBlock("start", 200, 50, false, true);

    redraw();
}

function LoadLevel34() {
    if (currentLevel != 34) {
        $("#instructionsModal .modal-body").html('<h3>Reach the green circle, but do a super jump if there are stacked orange rectangles.</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 34;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 2;
        numSteps = 5;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 5; //Position target one steps away from player
    target.color = color(51, 153, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 2, player.y),
        new Obstacle(player.x + player.diameter * 2, player.y - player.diameter)
    ];

	Blockly.mainWorkspace.updateToolbox(
		'<xml id="toolbox" style="display: none">' +
			'<block type="controls_if">' +
				'<value name="IF0">' +
					'<block movable="false" type="obstacle4"></block>' +
				'</value>' +
				'<value name="DO0">' +
					'<block movable="false" type="super_jump"></block>' +
				'</value>' +
			'</block>' +
			'<block type="walk"></block>' +
		'</xml>'
	);

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 6 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    //$("#tipModal2 .modal-body").html(
    //  '<h3>Try using the "If" block with "Long Jump" block inside to avoid the double orange rectangles.</h3>'
    //);

	$("#tipModal2 .modal-body").html(
		'<h3>' +
			'You need to program the smiley  face to reach the green circle. ' +
			'Connect the visual blocks in the right way to get the smiley  face moving. ' +
			'Try using the "If" block with "Super Jump" block.' +
		'</h3>' +
		'<div class="row">' +
			'<div class="col-xs-3">' +
				'<img src="../images/start.png">' +
			'</div>' +
			'<div class="col-xs-9">' +
				'<h3>This is the first block of your program. Add blocks under this one.</h3>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-xs-5">' +
				'<img src="../images/if_stacked_obstacles_then.png">' +
			'</div>' +
			'<div class="col-xs-7">' +
				'<h3>Walk the blocks in this "If" only if the smiley  face sees double orange rectangles ahead.</h3>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-xs-3">' +
				'<img src="../images/walk.png">' +
			'</div>' +
			'<div class="col-xs-9">' +
				'<h3>Each Walk block moves the smiley  face one step forward to the next space on the path.</h3>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-xs-3">' +
				'<img src="../images/super_jump.png">' +
			'</div>' +
			'<div class="col-xs-9">' +
				'<h3>Each Super Jump block makes the smiley  face jump over stacked orange rectangles and moves him two steps forward.</h3>' +
			'</div>' +
		'</div>'
	);

    $("button#newBlockTip").show();
	$("#newBlockModal .modal-body").html('<img class="tip-pic" src="images/sharmeen/super_jump.png">');

    //Insert Start block in workspace
    InsertBlock("start", 200, 50, false, true);

    redraw();
}

function LoadLevel35() {
    if (currentLevel != 35) {
        $("#instructionsModal .modal-body").html('<h3>Reach the green circle, but do a long jump if there are double orange rectangles.</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 35;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 9;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 9; //Position target one steps away from player
    target.color = color(51, 153, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 2, player.y),
        new Obstacle(player.x + player.diameter * 3, player.y),
        new Obstacle(player.x + player.diameter * 6, player.y),
        new Obstacle(player.x + player.diameter * 7, player.y)
    ];

	Blockly.mainWorkspace.updateToolbox(
        '<xml id="toolbox" style="display: none">' +
			'<block type="repeat_until">' +
				'<value name="BOOL">' +
					'<block movable="false" type="target2"></block>' +
				'</value>' +
			'</block>' +
			'<block type="controls_if">' +
				'<mutation else="1"></mutation>' +
				'<value name="IF0">' +
					'<block movable="false" type="obstacle3"></block>' +
				'</value>' +
				'<value name="DO0">' +
					'<block movable="false" type="long_jump"></block>' +
				'</value>' +
			'</block>' +
			'<block type="walk"></block>' +
		'</xml>'
	);

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 5 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h3>Try using the "If" block with "Long Jump" block inside to avoid the double orange rectangles.</h3>'
    );

    $("#tipModal3 .modal-body").html(
        '<h3>You need to program the smiley  face to reach the green circle. ' +
        'Connect the visual blocks in the right way to get the smiley  face moving. ' +
        'Try using the "If" block with "Long Jump" block.' +
        '</h3>' +
        //'<h3>Connect the visual blocks in the right way to get the smiley  face moving inside the "Repeat Until" loop.</h3>'+
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/start.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>This is the first block of your program. Add blocks under this one.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/repeat_until_target2.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Repeat the blocks in this "Repeat Until" until the smiley  face reaches the green circle. ' +
        'The "repeat until" block is useful when you want to run the same code again and again until the goal is reached. ' +
        'In this case the goal is the green circle. You can connect the "Walk" and "Long Jump" blocks inside it.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_double_obstacle_then_else.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Walk the blocks in this "If" only if the smiley  face sees double orange rectangles ahead. ' +
        'Otherwise, run the blocks in the second "Else" section.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley  face one step forward to the next space on the path.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/long_jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Long Jump block makes the smiley  face jump over the double orange rectangles and moves him three steps forward.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();
    //$("#newBlockModal .modal-body").html(
    //  '<div class="row">'+
    //  '<div class="col-xs-5">'+
    //  '<img src="../images/if_double_obstacle_then_long_jump.png">'+
    //  '</div>'+
    //  '<div class="col-xs-7">'+
    //  '<h3>The "Long Jump" block will make the smiley  face jump 3 spaces.</h3>'+
    //  '</div>'+
    //  '</div>'
    //);

    //Insert Start block in workspace
    InsertBlock("start", 200, 50, false, true);

    redraw();
}

function LoadLevel36() {
    if (currentLevel != 36) {
        $("#instructionsModal .modal-body").html('<h3>Reach the green circle, but do a super jump if there are stacked orange rectangles.</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 36;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 2;
        numSteps = 9;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 9; //Position target one steps away from player
    target.color = color(51, 153, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 2, player.y),
        new Obstacle(player.x + player.diameter * 2, player.y - player.diameter),
        new Obstacle(player.x + player.diameter * 4, player.y),
        new Obstacle(player.x + player.diameter * 4, player.y - player.diameter),
        new Obstacle(player.x + player.diameter * 7, player.y),
        new Obstacle(player.x + player.diameter * 7, player.y - player.diameter)
    ];

	Blockly.mainWorkspace.updateToolbox(
		'<xml id="toolbox" style="display: none">' +
			'<block type="repeat_until">' +
				'<value name="BOOL">' +
					'<block movable="false" type="target2"></block>' +
				'</value>' +
			'</block>' +
			'<block type="controls_if">' +
				'<mutation else="1"></mutation>' +
				'<value name="IF0">' +
					'<block movable="false" type="obstacle4"></block>' +
				'</value>' +
				'<value name="DO0">' +
					'<block movable="false" type="super_jump"></block>' +
				'</value>' +
			'</block>' +
			'<block type="walk"></block>' +
		'</xml>'
	);

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 5 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

	$("#tipModal2 .modal-body").html(
		'<h3>' +
			'You need to program the smiley  face to reach the green circle. ' +
			'Connect the visual blocks in the right way to get the smiley  face moving. ' +
			'Try using the "If" block with "Super Jump" block.' +
		'</h3>' +
		'<div class="row">' +
			'<div class="col-xs-3">' +
				'<img src="../images/start.png">' +
			'</div>' +
			'<div class="col-xs-9">' +
				'<h3>This is the first block of your program. Add blocks under this one.</h3>' +
			'</div>' +
			'</div>' +
		'<div class="row">' +
			'<div class="col-xs-5">' +
				'<img src="../images/if_stacked_obstacles_then.png">' +
			'</div>' +
			'<div class="col-xs-7">' +
				'<h3>Walk the blocks in this "If" only if the smiley  face sees double orange rectangles ahead.</h3>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-xs-3">' +
				'<img src="../images/walk.png">' +
			'</div>' +
			'<div class="col-xs-9">' +
				'<h3>Each Walk block moves the smiley  face one step forward to the next space on the path.</h3>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-xs-3">' +
				'<img src="../images/jump.png">' +
			'</div>' +
			'<div class="col-xs-9">' +
				'<h3>Each Jump block makes the smiley  face jump over the orange rectangle and moves him two steps forward.</h3>' +
			'</div>' +
		'</div>'
	);

    $("button#newBlockTip").hide();

    //Insert Start block in workspace
    InsertBlock("start", 200, 50, false, true);

    redraw();
}

function LoadLevel37() {
    if (currentLevel != 37) {
        $("#instructionsModal .modal-body").html('<h3>Reach the green circle, but do a long jump if there are double orange rectangles.</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 37;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 7;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 7; //Position target one steps away from player
    target.color = color(51, 153, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 2, player.y),
        new Obstacle(player.x + player.diameter * 4, player.y),
        new Obstacle(player.x + player.diameter * 5, player.y)
    ];

	Blockly.mainWorkspace.updateToolbox(
        '<xml id="toolbox" style="display: none">' +
			'<block type="controls_if">' +
				'<value name="IF0">' +
					'<block movable="false" type="obstacle2"></block>' +
				'</value>' +
				'<value name="DO0">' +
					'<block movable="false" type="jump"></block>' +
				'</value>' +
			'</block>' +
			'<block type="controls_if">' +
				'<value name="IF0">' +
					'<block movable="false" type="obstacle3"></block>' +
				'</value>' +
				'<value name="DO0">' +
					'<block movable="false" type="long_jump"></block>' +
				'</value>' +
			'</block>' +
			'<block type="walk"></block>' +
		'</xml>'
	);

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 7 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h3>Try using the "If" block with "Long Jump" or "Jump" block to avoid the orange rectangles.</h3>'
    );

    $("#tipModal3 .modal-body").html(
        '<h3>You need to program the smiley  face to reach the green circle. ' +
        'Connect the visual blocks in the right way to get the smiley  face moving. ' +
        'Try using the "If" block with "Long Jump" or "Jump" block.' +
        '</h3>' +
        //'<h3>Connect the visual blocks in the right way to get the smiley  face moving inside the "Repeat Until" loop.</h3>'+
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/start.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>This is the first block of your program. Add blocks under this one.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_obstacle_then.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Walk the blocks in this "If" only if the smiley  face sees an orange rectangle ahead.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_double_obstacle_then.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Walk the blocks in this "If" only if the smiley  face sees double orange rectangles ahead.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley  face one step forward to the next space on the path.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Jump block moves the smiley  face jump over the orange rectangle and moves it two steps forward.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/long_jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Long Jump block makes the smiley  face jump over the double orange rectangles and moves him three steps forward.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();
    //$("#newBlockModal .modal-body").html(
    //  '<div class="row">'+
    //  '<div class="col-xs-5">'+
    //  '<img src="../images/if_double_obstacle_then_long_jump.png">'+
    //  '</div>'+
    //  '<div class="col-xs-7">'+
    //  '<h3>The "Long Jump" block will make the smiley  face jump 3 spaces.</h3>'+
    //  '</div>'+
    //  '</div>'
    //);

    //Insert Start block in workspace
    InsertBlock("start", 200, 50, false, true);

    redraw();
}

function LoadLevel38() {
    if (currentLevel != 38) {
        $("#instructionsModal .modal-body").html('<h3>Reach the green circle, but do a super jump if there are stacked orange rectangles.</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 38;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 6;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 6; //Position target one steps away from player
    target.color = color(51, 153, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 2, player.y),
        new Obstacle(player.x + player.diameter * 4, player.y),
        new Obstacle(player.x + player.diameter * 4, player.y - player.diameter)
    ];

	Blockly.mainWorkspace.updateToolbox(
		'<xml id="toolbox" style="display: none">' +
			'<block type="controls_if">' +
				'<value name="IF0">' +
					'<block movable="false" type="obstacle2"></block>' +
				'</value>' +
				'<value name="DO0">' +
					'<block movable="false" type="jump"></block>' +
				'</value>' +
			'</block>' +
			'<block type="controls_if">' +
				'<value name="IF0">' +
					'<block movable="false" type="obstacle4"></block>' +
				'</value>' +
				'<value name="DO0">' +
					'<block movable="false" type="super_jump"></block>' +
				'</value>' +
			'</block>' +
			'<block type="walk"></block>' +
		'</xml>'
	);

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 7 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h3>Try using the "If" block with "Super Jump" or "Jump" block to avoid the orange rectangles.</h3>'
    );

    $("#tipModal3 .modal-body").html(
        '<h3>You need to program the smiley  face to reach the green circle. ' +
        'Connect the visual blocks in the right way to get the smiley  face moving. ' +
        'Try using the "If" block with "Super Jump" or "Jump" block.' +
        '</h3>' +
        //'<h3>Connect the visual blocks in the right way to get the smiley  face moving inside the "Repeat Until" loop.</h3>'+
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/start.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>This is the first block of your program. Add blocks under this one.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_obstacle_then.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Walk the blocks in this "If" only if the smiley  face sees an orange rectangle ahead.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_stacked_obstacles_then.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Walk the blocks in this "If" only if the smiley  face sees stacked orange rectangles ahead.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley  face one step forward to the next space on the path.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Jump block moves the smiley  face jump over the orange rectangle and moves it two steps forward.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/super_jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Super Jump block makes the smiley  face jump over stacked orange rectangles and moves him two steps forward.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();
    //$("#newBlockModal .modal-body").html(
    //  '<div class="row">'+
    //  '<div class="col-xs-5">'+
    //  '<img src="../images/if_double_obstacle_then_long_jump.png">'+
    //  '</div>'+
    //  '<div class="col-xs-7">'+
    //  '<h3>The "Long Jump" block will make the smiley  face jump 3 spaces.</h3>'+
    //  '</div>'+
    //  '</div>'
    //);

    //Insert Start block in workspace
    InsertBlock("start", 200, 50, false, true);

    redraw();
}

function LoadLevel39() {
    if (currentLevel != 39) {
        $("#instructionsModal .modal-body").html('<h3>Reach the green circle, but do a long jump if there are double orange rectangles.</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 39;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 9;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 9; //Position target one steps away from player
    target.color = color(51, 153, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter, player.y),
        new Obstacle(player.x + player.diameter * 3, player.y),
        new Obstacle(player.x + player.diameter * 4, player.y),
        new Obstacle(player.x + player.diameter * 6, player.y),
        new Obstacle(player.x + player.diameter * 7, player.y)
    ];

	Blockly.mainWorkspace.updateToolbox(
		'<xml id="toolbox" style="display: none">' +
			'<block type="repeat_until">' +
				'<value name="BOOL">' +
					'<block movable="false" type="target2"></block>' +
				'</value>' +
			'</block>' +
			'<block type="controls_if">' +
				'<value name="IF0">' +
					'<block movable="false" type="obstacle2"></block>' +
				'</value>' +
				'<value name="DO0">' +
					'<block movable="false" type="jump"></block>' +
				'</value>' +
			'</block>' +
			'<block type="controls_if">' +
				'<mutation else="1"></mutation>' +
				'<value name="IF0">' +
					'<block movable="false" type="obstacle3"></block>' +
				'</value>' +
				'<value name="DO0">' +
					'<block movable="false" type="long_jump"></block>' +
				'</value>' +
			'</block>' +
			'<block type="walk"></block>' +
		'</xml>'
	);

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 7 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h3>Try using the "If" block with "Long Jump" or "Jump" block inside to avoid the orange rectangles.</h3>'
    );

    $("#tipModal3 .modal-body").html(
        '<h3>You need to program the smiley  face to reach the green circle. ' +
        'Connect the visual blocks in the right way to get the smiley  face moving. ' +
        'Try using the "If" block with "Long Jump" or "Jump" block.' +
        '</h3>' +
        //'<h3>Connect the visual blocks in the right way to get the smiley  face moving inside the "Repeat Until" loop.</h3>'+
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/start.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>This is the first block of your program. Add blocks under this one.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/repeat_until_target2.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Repeat the blocks in this "Repeat Until" until the smiley  face reaches the green circle. ' +
        'The "repeat until" block is useful when you want to run the same code again and again until the goal is reached. ' +
        'In this case the goal is the green circle. You can connect the "Walk" and "Long Jump" blocks inside it.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_obstacle_then.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Walk the blocks in this "If" only if the smiley  face sees an orange rectangle ahead.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_double_obstacle_then_else.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Walk the blocks in this "If" only if the smiley  face sees double orange rectangles ahead. ' +
        'Otherwise, run the blocks in the second "Else" section.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley  face one step forward to the next space on the path.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Jump block makes the smiley  face jump over an orange rectangle and moves it two steps forward.</h3>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/long_jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Long Jump block makes the smiley  face jump over the double orange rectangles and moves him three steps forward.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();
    //$("#newBlockModal .modal-body").html(
    //  '<div class="row">'+
    //  '<div class="col-xs-5">'+
    //  '<img src="../images/if_double_obstacle_then_long_jump.png">'+
    //  '</div>'+
    //  '<div class="col-xs-7">'+
    //  '<h3>The "Long Jump" block will make the smiley  face jump 3 spaces.</h3>'+
    //  '</div>'+
    //  '</div>'
    //);

    //Insert Start block in workspace
    InsertBlock("start", 200, 50, false, true);

    redraw();
}

function LoadLevel40() {
    if (currentLevel != 40) {
        $("#instructionsModal .modal-body").html('<h3>Reach the green circle, but do a super jump if there are stacked orange rectangles.</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 40;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 9;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 9; //Position target one steps away from player
    target.color = color(51, 153, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 1, player.y),
        new Obstacle(player.x + player.diameter * 3, player.y),
        new Obstacle(player.x + player.diameter * 3, player.y - player.diameter),
        new Obstacle(player.x + player.diameter * 5, player.y),
        new Obstacle(player.x + player.diameter * 5, player.y - player.diameter),
        new Obstacle(player.x + player.diameter * 7, player.y),
        new Obstacle(player.x + player.diameter * 7, player.y - player.diameter)
    ];

	Blockly.mainWorkspace.updateToolbox(
		'<xml id="toolbox" style="display: none">' +
			'<block type="repeat_until">' +
				'<value name="BOOL">' +
					'<block movable="false" type="target2"></block>' +
				'</value>' +
			'</block>' +
			'<block type="controls_if">' +
				'<value name="IF0">' +
					'<block movable="false" type="obstacle2"></block>' +
				'</value>' +
				'<value name="DO0">' +
					'<block movable="false" type="jump"></block>' +
				'</value>' +
			'</block>' +
			'<block type="controls_if">' +
				'<mutation else="1"></mutation>' +
				'<value name="IF0">' +
					'<block movable="false" type="obstacle4"></block>' +
				'</value>' +
				'<value name="DO0">' +
					'<block movable="false" type="super_jump"></block>' +
				'</value>' +
			'</block>' +
			'<block type="walk"></block>' +
		'</xml>'
	);

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 7 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h3>Try using the "If" block with "Super Jump" or "Jump" block to avoid the orange rectangles.</h3>'
    );

    $("#tipModal3 .modal-body").html(
        '<h3>You need to program the smiley  face to reach the green circle. ' +
        'Connect the visual blocks in the right way to get the smiley  face moving. ' +
        'Try using the "If" block with "Super Jump" or "Jump" block.' +
        '</h3>' +
        //'<h3>Connect the visual blocks in the right way to get the smiley  face moving inside the "Repeat Until" loop.</h3>'+
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/start.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>This is the first block of your program. Add blocks under this one.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/repeat_until_target2.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Repeat the blocks in this "Repeat Until" until the smiley  face reaches the green circle. ' +
        'The "repeat until" block is useful when you want to run the same code again and again until the goal is reached. ' +
        'In this case the goal is the green circle. You can connect the "Walk" and "Super Jump" blocks inside it.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_obstacle_then.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Walk the blocks in this "If" only if the smiley  face sees an orange rectangle ahead.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_stacked_obstacles_then_else.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Walk the blocks in this "If" only if the smiley  face sees stacked orange rectangles ahead. ' +
        'Otherwise, run the blocks in the second "Else" section.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley  face one step forward to the next space on the path.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Jump block moves the smiley  face jump over the orange rectangle and moves it two steps forward.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/super_jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Super Jump block makes the smiley  face jump over stacked orange rectangles and moves him two steps forward.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();
    //$("#newBlockModal .modal-body").html(
    //  '<div class="row">'+
    //  '<div class="col-xs-5">'+
    //  '<img src="../images/if_double_obstacle_then_long_jump.png">'+
    //  '</div>'+
    //  '<div class="col-xs-7">'+
    //  '<h3>The "Long Jump" block will make the smiley  face jump 3 spaces.</h3>'+
    //  '</div>'+
    //  '</div>'
    //);

    //Insert Start block in workspace
    InsertBlock("start", 200, 50, false, true);

    redraw();
}

function LoadLevel41() {
    if (currentLevel != 41) {
        $("#instructionsModal .modal-body").html('<h3>Reach the green circle with combination jumps.</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 41;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 9;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 9; //Position target one steps away from player
    target.color = color(51, 153, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 2, player.y),
        new Obstacle(player.x + player.diameter * 2, player.y - player.diameter),
        new Obstacle(player.x + player.diameter * 4, player.y),
        new Obstacle(player.x + player.diameter * 5, player.y),
        new Obstacle(player.x + player.diameter * 7, player.y),
        new Obstacle(player.x + player.diameter * 7, player.y - player.diameter)
    ];

	Blockly.mainWorkspace.updateToolbox(
		'<xml id="toolbox" style="display: none">' +
			'<block type="repeat_until">' +
				'<value name="BOOL">' +
					'<block movable="false" type="target2"></block>' +
				'</value>' +
			'</block>' +
			'<block type="controls_if">' +
				'<mutation else="1"></mutation>' +
				'<value name="IF0">' +
					'<block movable="false" type="obstacle3"></block>' +
				'</value>' +
				'<value name="DO0">' +
					'<block movable="false" type="long_jump"></block>' +
				'</value>' +
			'</block>' +
			'<block type="controls_if">' +
				'<mutation else="1"></mutation>' +
				'<value name="IF0">' +
					'<block movable="false" type="obstacle4"></block>' +
				'</value>' +
				'<value name="DO0">' +
					'<block movable="false" type="super_jump"></block>' +
				'</value>' +
			'</block>' +
			//'<block type="jump"></block>' +
			'<block type="walk"></block>' +
		'</xml>'
	);

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 7 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h3>Try using the "If" block with "Long Jump" or "Super Jump" blocks to avoid the orange rectangles.</h3>'
    );

    $("#tipModal3 .modal-body").html(
        '<h3>You need to program the smiley  face to reach the green circle. ' +
        'Connect the visual blocks in the right way to get the smiley  face moving. ' +
        'Try using the "If" block with "Long Jump" or "Super Jump" block.' +
        '</h3>' +
        //'<h3>Connect the visual blocks in the right way to get the smiley  face moving inside the "Repeat Until" loop.</h3>'+
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/start.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>This is the first block of your program. Add blocks under this one.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/repeat_until_target2.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Repeat the blocks in this "Repeat Until" until the smiley  face reaches the green circle. ' +
        'The "repeat until" block is useful when you want to run the same code again and again until the goal is reached. ' +
        'In this case the goal is the green circle. You can connect the "Walk" and "Long Jump" blocks inside it.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_double_obstacle_then_else.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Walk the blocks in this "If" only if the smiley  face sees double orange rectangles ahead. ' +
        'Otherwise, run the blocks in the second "Else" section.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_stacked_obstacles_then_else.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Walk the blocks in this "If" only if the smiley  face sees stacked orange rectangles ahead. ' +
        'Otherwise, run the blocks in the second "Else" section.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley  face one step forward to the next space on the path.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/super_jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Super Jump block makes the smiley  face jump over stacked orange rectangles and moves him two steps forward.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/long_jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Long Jump block makes the smiley  face jump over double orange rectangles and moves him three steps forward.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();
    //$("#newBlockModal .modal-body").html(
    //  '<div class="row">'+
    //  '<div class="col-xs-5">'+
    //  '<img src="../images/if_double_obstacle_then_long_jump.png">'+
    //  '</div>'+
    //  '<div class="col-xs-7">'+
    //  '<h3>The "Long Jump" block will make the smiley  face jump 3 spaces.</h3>'+
    //  '</div>'+
    //  '</div>'
    //);

    //Insert Start block in workspace
    InsertBlock("start", 200, 50, false, true);

    redraw();
}

function LoadLevel42() {
    if (currentLevel != 42) {
        $("#instructionsModal .modal-body").html('<h3>Reach the green circle with combination jumps.</h3>');
        $("#instructionsModal").modal("show");
        currentLevel = 42;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 3;
        numSteps = 9;
    }

    player = new Player();
    //player.init_x = 100;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y + player.diameter * 0;
    target.x = player.x + player.diameter * 9; //Position target one steps away from player
    target.color = color(51, 153, 0);

    obstacles = [
        new Obstacle(player.x + player.diameter * 2, player.y),
        new Obstacle(player.x + player.diameter * 2, player.y - player.diameter),
        new Obstacle(player.x + player.diameter * 4, player.y),
        new Obstacle(player.x + player.diameter * 5, player.y),
        new Obstacle(player.x + player.diameter * 7, player.y)
    ];

	Blockly.mainWorkspace.updateToolbox(
		'<xml id="toolbox" style="display: none">' +
			'<block type="repeat_until">' +
				'<value name="BOOL">' +
					'<block movable="false" type="target2"></block>' +
				'</value>' +
			'</block>' +
			'<block type="controls_if">' +
				'<mutation else="1"></mutation>' +
				'<value name="IF0">' +
					'<block movable="false" type="obstacle2"></block>' +
				'</value>' +
				'<value name="DO0">' +
					'<block movable="false" type="jump"></block>' +
				'</value>' +
			'</block>' +
			'<block type="controls_if">' +
				'<mutation else="1"></mutation>' +
				'<value name="IF0">' +
					'<block movable="false" type="obstacle3"></block>' +
				'</value>' +
				'<value name="DO0">' +
					'<block movable="false" type="long_jump"></block>' +
				'</value>' +
			'</block>' +
			'<block type="controls_if">' +
				'<mutation else="1"></mutation>' +
				'<value name="IF0">' +
					'<block movable="false" type="obstacle4"></block>' +
				'</value>' +
				'<value name="DO0">' +
					'<block movable="false" type="super_jump"></block>' +
				'</value>' +
			'</block>' +
			//'<block type="jump"></block>' +
			'<block type="walk"></block>' +
		'</xml>'
	);

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 9 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );

    $("#tipModal2 .modal-body").html(
        '<h3>Try using the "If" block with "Long Jump" or "Super Jump", or "Jump" blocks to avoid the orange rectangles.</h3>'
    );

    $("#tipModal3 .modal-body").html(
        '<h3>You need to program the smiley  face to reach the green circle. ' +
        'Connect the visual blocks in the right way to get the smiley  face moving. ' +
        'Try using the "If" block with "Long Jump" or "Super Jump", or "Jump" block.' +
        '</h3>' +
        //'<h3>Connect the visual blocks in the right way to get the smiley  face moving inside the "Repeat Until" loop.</h3>'+
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/start.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>This is the first block of your program. Add blocks under this one.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/repeat_until_target2.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Repeat the blocks in this "Repeat Until" until the smiley  face reaches the green circle. ' +
        'The "repeat until" block is useful when you want to run the same code again and again until the goal is reached. ' +
        'In this case the goal is the green circle. You can connect the "Walk" and "Long Jump" blocks inside it.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_obstacle_then_else.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Walk the blocks in this "If" only if the smiley  face sees an orange rectangles ahead.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_double_obstacle_then_else.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Walk the blocks in this "If" only if the smiley  face sees double orange rectangles ahead. ' +
        'Otherwise, run the blocks in the second "Else" section.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_stacked_obstacles_then_else.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h3>Walk the blocks in this "If" only if the smiley  face sees stacked orange rectangles ahead. ' +
        'Otherwise, run the blocks in the second "Else" section.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/walk.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Walk block moves the smiley  face one step forward to the next space on the path.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Jump block makes the smiley  face jump over an orange rectangle and moves it two steps forward.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/super_jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Super Jump block makes the smiley  face jump over stacked orange rectangles and moves him two steps forward.</h3>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<img src="../images/long_jump.png">' +
        '</div>' +
        '<div class="col-xs-9">' +
        '<h3>Each Long Jump block makes the smiley  face jump over double orange rectangles and moves him three steps forward.</h3>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();
    //$("#newBlockModal .modal-body").html(
    //  '<div class="row">'+
    //  '<div class="col-xs-5">'+
    //  '<img src="../images/if_double_obstacle_then_long_jump.png">'+
    //  '</div>'+
    //  '<div class="col-xs-7">'+
    //  '<h3>The "Long Jump" block will make the smiley  face jump 3 spaces.</h3>'+
    //  '</div>'+
    //  '</div>'
    //);

    //Insert Start block in workspace
    InsertBlock("start", 200, 50, false, true);

    redraw();
}

function LoadLevel43() {
    // This is a dummy level. This function is called when the user finishes the last level, not counting the challenge level.
	$("button#levelSelect").click();
}

//CHALLENGE TASK
function LoadLevel99() {
    if (currentLevel != 99) {
        $("#instructionsModal .modal-body").html("<h3>Choose the right path to reach the red circle. You must do this using exactly 8 blocks.</h3>");
        $("#instructionsModal").modal("show");

        currentLevel = 99;
        tipToShow = 1;
		numTipsUsed = 0;
		levelStartTime = Date.now();
        totalNumTips = 5;
        numSteps = 0;
    }

    controls_whileUntil_options = [
        ['repeat until', 'UNTIL'],
        ['repeat while', 'WHILE']
    ];

    player = new PlayerChallenge();
    //player.init_x = 50;
    //player.init_y = 200;

    player.x = player.init_x;
    player.y = player.init_y;

    target = new Target();
    target.y = player.y - player.diameter * 2;
    target.x = player.x + player.diameter * 6; //Position target three steps away from player
    target.color = color(153, 51, 0);


    obstacles = [
        new ObstacleChallenge(player.x - player.diameter, player.y - player.diameter * 3, false),
        new ObstacleChallenge(player.x, player.y - player.diameter * 3, false),
        new ObstacleChallenge(player.x + player.diameter, player.y - player.diameter * 3, false),
        new ObstacleChallenge(player.x + player.diameter * 2, player.y - player.diameter * 3, false),
        new ObstacleChallenge(player.x + player.diameter * 3, player.y - player.diameter * 3, false),
        new ObstacleChallenge(player.x + player.diameter * 4, player.y - player.diameter * 3, false),
        new ObstacleChallenge(player.x + player.diameter * 5, player.y - player.diameter * 3, false),
        new ObstacleChallenge(player.x + player.diameter * 6, player.y - player.diameter * 3, false),
        new ObstacleChallenge(player.x + player.diameter * 7, player.y - player.diameter * 3, false),

        new ObstacleChallenge(player.x - player.diameter, player.y - player.diameter * 2, false),
        new ObstacleChallenge(player.x, player.y - player.diameter * 2, false),
        new ObstacleChallenge(player.x + player.diameter, player.y - player.diameter * 2, false),
        new ObstacleChallenge(player.x + player.diameter * 2, player.y - player.diameter * 2, true),
        new ObstacleChallenge(player.x + player.diameter * 3, player.y - player.diameter * 2, false),
        new ObstacleChallenge(player.x + player.diameter * 4, player.y - player.diameter * 2, false),
        new ObstacleChallenge(player.x + player.diameter * 5, player.y - player.diameter * 2, false),
        //new Obstacle(player.x + player.diameter*6, player.y - player.diameter*2),
        new ObstacleChallenge(player.x + player.diameter * 7, player.y - player.diameter * 2, false),

        new ObstacleChallenge(player.x - player.diameter, player.y - player.diameter, false),
        new ObstacleChallenge(player.x, player.y - player.diameter, false),
        new ObstacleChallenge(player.x + player.diameter, player.y - player.diameter, false),
        //new Obstacle(player.x + player.diameter*2, player.y - player.diameter),
        new ObstacleChallenge(player.x + player.diameter * 3, player.y - player.diameter, false),
        new ObstacleChallenge(player.x + player.diameter * 4, player.y - player.diameter, false),
        new ObstacleChallenge(player.x + player.diameter * 5, player.y - player.diameter, false),
        //new Obstacle(player.x + player.diameter*6, player.y - player.diameter),
        new ObstacleChallenge(player.x + player.diameter * 7, player.y - player.diameter, false),

        new ObstacleChallenge(player.x - player.diameter, player.y, false),
        //new ObstacleChallenge(player.x,                     player.y,                   true),
        //new ObstacleChallenge(player.x + player.diameter,   player.y,                   true),
        //new ObstacleChallenge(player.x + player.diameter*2, player.y,                   true),
        //new ObstacleChallenge(player.x + player.diameter*3, player.y,                   true),
        //new ObstacleChallenge(player.x + player.diameter*4, player.y,                   true),
        new ObstacleChallenge(player.x + player.diameter * 5, player.y, true),
        //new ObstacleChallenge(player.x + player.diameter*6, player.y,                   true),
        new ObstacleChallenge(player.x + player.diameter * 7, player.y, false),

        new ObstacleChallenge(player.x - player.diameter, player.y + player.diameter, false),
        new ObstacleChallenge(player.x, player.y + player.diameter, false),
        new ObstacleChallenge(player.x + player.diameter, player.y + player.diameter, false),
        //new ObstacleChallenge(player.x + player.diameter*2, player.y + player.diameter, true),
        new ObstacleChallenge(player.x + player.diameter * 3, player.y + player.diameter, false),
        new ObstacleChallenge(player.x + player.diameter * 4, player.y + player.diameter, false),
        new ObstacleChallenge(player.x + player.diameter * 5, player.y + player.diameter, false),
        //new ObstacleChallenge(player.x + player.diameter*6, player.y + player.diameter, true),
        new ObstacleChallenge(player.x + player.diameter * 7, player.y + player.diameter, false),

        new ObstacleChallenge(player.x - player.diameter, player.y + player.diameter * 2, false),
        new ObstacleChallenge(player.x, player.y + player.diameter * 2, true),
        //new ObstacleChallenge(player.x + player.diameter,   player.y + player.diameter*2, true),
        //new ObstacleChallenge(player.x + player.diameter*2, player.y + player.diameter*2, true),
        new ObstacleChallenge(player.x + player.diameter * 3, player.y + player.diameter * 2, false),
        new ObstacleChallenge(player.x + player.diameter * 4, player.y + player.diameter * 2, false),
        //new ObstacleChallenge(player.x + player.diameter*5, player.y + player.diameter*2, true),
        //new ObstacleChallenge(player.x + player.diameter*6, player.y + player.diameter*2, true),
        new ObstacleChallenge(player.x + player.diameter * 7, player.y + player.diameter * 2, false),

        new ObstacleChallenge(player.x - player.diameter, player.y + player.diameter * 3, false),
        new ObstacleChallenge(player.x, player.y + player.diameter * 3, false),
        new ObstacleChallenge(player.x + player.diameter, player.y + player.diameter * 3, false),
        //new ObstacleChallenge(player.x + player.diameter*2, player.y + player.diameter*3, true),
        //new ObstacleChallenge(player.x + player.diameter*3, player.y + player.diameter*3, true),
        //new ObstacleChallenge(player.x + player.diameter*4, player.y + player.diameter*3, true),
        //new ObstacleChallenge(player.x + player.diameter*5, player.y + player.diameter*3, true),
        new ObstacleChallenge(player.x + player.diameter * 6, player.y + player.diameter * 3, false),
        new ObstacleChallenge(player.x + player.diameter * 7, player.y + player.diameter * 3, false),

        new ObstacleChallenge(player.x - player.diameter, player.y + player.diameter * 4, false),
        new ObstacleChallenge(player.x, player.y + player.diameter * 4, false),
        new ObstacleChallenge(player.x + player.diameter, player.y + player.diameter * 4, false),
        new ObstacleChallenge(player.x + player.diameter * 2, player.y + player.diameter * 4, false),
        new ObstacleChallenge(player.x + player.diameter * 3, player.y + player.diameter * 4, false),
        new ObstacleChallenge(player.x + player.diameter * 4, player.y + player.diameter * 4, false),
        new ObstacleChallenge(player.x + player.diameter * 5, player.y + player.diameter * 4, false),
        new ObstacleChallenge(player.x + player.diameter * 6, player.y + player.diameter * 4, false),
        new ObstacleChallenge(player.x + player.diameter * 7, player.y + player.diameter * 4, false)
    ];

    Blockly.mainWorkspace.updateToolbox(
        '<xml id="toolbox" style="display: none">' +
        '<block type="controls_repeat">' +
        '<field name="TIMES">3</field>' +
        '</block>' +

        '<block type="controls_whileUntil">' +
        '<field name="MODE">UNTIL</field>' +
        '<value name="BOOL">' +
        '<block ' +
        'movable="false" ' +
        'type="target">' +
        '</block>' +
        '</value>' +
        '</block>' +

        '<block type="controls_if">' +
        '<mutation else="1"></mutation>' +
        '<value name="IF0">' +
        '<block ' +
        'movable="false" ' +
        'type="empty_cell">' +
        '</block>' +
        '</value>' +
        '</block>' +

        '<block type="controls_if">' +
        '<mutation else="1"></mutation>' +
        '<value name="IF0">' +
        '<block ' +
        'movable="false" ' +
        'type="empty_cell_left">' +
        '</block>' +
        '</value>' +
        '</block>' +

        '<block type="controls_if">' +
        '<mutation else="1"></mutation>' +
        '<value name="IF0">' +
        '<block ' +
        'movable="false" ' +
        'type="empty_cell_right">' +
        '</block>' +
        '</value>' +
        '</block>' +

        '<block type="turn_left"></block>' +
        '<block type="turn_right"></block>' +
        '<block type="forward"></block>' +

        '</xml>'
    );

    $("#tipModal1 .modal-body").html(
        '<h3>To write the best code, you should solve the problem using 9 or less blocks. If you can\'t do it the first time, just come back later and try again.</h3>'
    );
    $("#tipModal2 .modal-body").html(
        '<h4>Try using the "repeat until" and "repeat" block until you reach the red circle.</h4>'
    );
    $("#tipModal3 .modal-body").html(
        '<h4>Try using the "turn right" if there is a path to the right.</h4>'
    );
    $("#tipModal4 .modal-body").html(
        '<h4>Try using the "turn left" if there is a path to the left.</h4>'
    );
    $("#tipModal5 .modal-body").html(
        '<h4>You need to program the triangle to reach the red circle.</h4>' +
        '<h4>Connect the visual blocks in the right way to get the triangle moving. Try using the "repeat until" or "repeat while" with the "turn right"' +
        ' "turn left", and "forward" blocks.</h4>' +
        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/repeat3.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Repeats the blocks in this "Repeat" block 3 times. The "Repeat" block is useful when you want to run the same code again and again. You can connect the "forward" block inside. You can also change the number of times you want to repeat the code.</h4>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/repeat_until_target.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Repeat the blocks in this "Repeat Until" until the triangle reaches the red circle. ' +
        'The "repeat until" block is useful when you want to run the same code again and again until the goal is reached. ' +
        'In this case the goal is the green circle. You can connect any blocks inside it.</h4>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_path_in_front_then_else.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Run the blocks in this "If" only if there is a path to the front. ' +
        'Otherwise, run the blocks in the "Else" section.</h4>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_path_left_then_else.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Run the blocks in this "If" only if there is a path to the left ahead. ' +
        'Otherwise, run the blocks in the "Else" section.</h4>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/if_path_right_then_else.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Run the blocks in this "If" only if there is a path to the right ahead. ' +
        'Otherwise, run the blocks in the "Else" section.</h4>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/forward.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each "forward" block moves the triangle one step forward to the next space on the path.</h4>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/turn_left.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each "turn left" block makes the triangle turn to the left.</h4>' +
        '</div>' +
        '</div>' +

        '<div class="row">' +
        '<div class="col-xs-5">' +
        '<img src="../images/turn_right.png">' +
        '</div>' +
        '<div class="col-xs-7">' +
        '<h4>Each "turn right" block makes the triangle turn to the right.</h4>' +
        '</div>' +
        '</div>'
    );

    $("button#newBlockTip").hide();

    //Insert Start block in workspace
    InsertBlock("start", 200, 20, false, true);

    redraw();
}
function DrawStepsLevel99(){
	var X1 = player.init_x - player.diameter / 2;
    var Y1 = player.init_y - player.diameter / 2;
    var width = player.diameter;
    var height = player.diameter;
    emptyCells = [
        new EmptyCell(X1 + width * 2, Y1 - height * 2, width, height),
        new EmptyCell(X1 + width * 6, Y1 - height * 2, width, height),
        new EmptyCell(X1 + width * 2, Y1 - height * 1, width, height),
        new EmptyCell(X1 + width * 6, Y1 - height * 1, width, height),
        new EmptyCell(X1, Y1, width, height),
        new EmptyCell(X1 + width * 1, Y1, width, height),
        new EmptyCell(X1 + width * 2, Y1, width, height),
        new EmptyCell(X1 + width * 3, Y1, width, height),
        new EmptyCell(X1 + width * 4, Y1, width, height),
        new EmptyCell(X1 + width * 5, Y1, width, height),
        new EmptyCell(X1 + width * 6, Y1, width, height),
        new EmptyCell(X1 + width * 2, Y1 + height * 1, width, height),
        new EmptyCell(X1 + width * 6, Y1 + height * 1, width, height),
        new EmptyCell(X1, Y1 + height * 2, width, height),
        new EmptyCell(X1 + width * 1, Y1 + height * 2, width, height),
        new EmptyCell(X1 + width * 2, Y1 + height * 2, width, height),
        new EmptyCell(X1 + width * 5, Y1 + height * 2, width, height),
        new EmptyCell(X1 + width * 6, Y1 + height * 2, width, height),
        new EmptyCell(X1 + width * 2, Y1 + height * 3, width, height),
        new EmptyCell(X1 + width * 3, Y1 + height * 3, width, height),
        new EmptyCell(X1 + width * 4, Y1 + height * 3, width, height),
        new EmptyCell(X1 + width * 5, Y1 + height * 3, width, height)
    ];
    stroke(255, 255, 255);
    noFill();
    for (var i = 0; i < emptyCells.length; i++) {
        rect(emptyCells[i].x, emptyCells[i].y, emptyCells[i].width, emptyCells[i].height);
    }
    noStroke();
}

function LoadLevel100(){
	// Bump the game to Level 102 because there is no 100 or 101.
	LoadLevel(102);
}

// The following functions make it easy to create challenge levels.
// This is a map of paths. The path is the set of white squares that mark the locations
// that the player is allowed to be. If the player moves off of the path, the level is
// immediately considered not solved and the user's Blockly program stops executing.
window.ChallengePaths = {};
// This function takes a list of coordinates and turns it into the emptyCells list.
// Each coordinate is the number of squares offset from the player's initial position.
// Each EmptyCell becomes a white square that indicates where the player is allowed to go.
function ChallengePathToEmptyCells(cells){
	var i, result = [];
	for(i = 0; i < cells.length; i++){
		result.push(new EmptyCell(player.init_x + player.diameter * (cells[i].x - 0.5), player.init_y + player.diameter * (cells[i].y - 0.5), player.diameter, player.diameter));
	}
	return result;
}
// This function takes an array of coordinates and returns an array of obstacles.
// The obstacles surround the white squares and are responsible for detecting when
// the player strays from the white squares.
// You can add additional visible obstacles through additionalVisibleObstacles as
// an array of coordinates.
// All of the input coordinates are the number of squares relative to the player.
function ChallengePathToObstacles(cells, additionalVisibleObstacles){
	var i, j, newObstacle, cellKey, obstacleKey, result = [],
		obstaclesCoords = [], obstaclesCoordsInverse = {},
		cellCoordsInverse = {},
		cellToObstacleOffsets = [
			{x: -1, y: 0}, // Left
			{x: 0, y: -1}, // Top
			{x: 1, y: 0}, // Right
			{x: 0, y: 1}, // Bottom
		],
		xyToMapKey = function(coord){
			return coord.x + "," + coord.y;
		};
	// Loop through each cell.
	for(i = 0; i < cells.length; i++){
		// Add this cell to the map of discovered cells.
		cellKey = xyToMapKey(cells[i]);
		cellCoordsInverse[cellKey] = true;
		// Add an obstacle on the top, bottom, left, and right.
		for(j = 0; j < cellToObstacleOffsets.length; j++){
			newObstacle = {
				x: cells[i].x + cellToObstacleOffsets[j].x,
				y: cells[i].y + cellToObstacleOffsets[j].y
			};
			// Do not add an obstacle in a location where a cell already exists,
			// and do not add duplicate obstacles.
			obstacleKey = xyToMapKey(newObstacle);
			if(!cellCoordsInverse[obstacleKey] && typeof obstaclesCoordsInverse[obstacleKey] != "number"){
				obstaclesCoordsInverse[obstacleKey] = obstaclesCoords.length;
				obstaclesCoords.push(newObstacle);
			}
		}
		// If an obstacle is in the location of this cell, nullify that obstacle.
		if(typeof obstaclesCoordsInverse[cellKey] == "number"){
			obstaclesCoords[obstaclesCoordsInverse[cellKey]] = null;
		}
	}
	// Now, convert the list of obstacle coordinates into actual obstacles.
	var coordsToObstacleChallenge = function(coords, visible){
		// The square-based coordinates are converted to pixel coordinates here.
		return new ObstacleChallenge(
			player.x + player.diameter * coords.x,
			player.y + player.diameter * coords.y,
			visible
		)
	}
	for(i = 0; i < obstaclesCoords.length; i++){
		if(obstaclesCoords[i]){
			result.push(coordsToObstacleChallenge(obstaclesCoords[i], false));
		}
	}
	// Add in the additional visible obstacles.
	if(typeof additionalVisibleObstacles == "object"){
		for(i = 0; i < additionalVisibleObstacles.length; i++){
			result.push(coordsToObstacleChallenge(additionalVisibleObstacles[i], true));
		}
	}
	return result;
}
// This function should be called from a DrawStepsLevel function.
function ChallengeDraw(emptyCells){
    stroke(255, 255, 255);
    noFill();
    for(var i = 0; i < emptyCells.length; i++){
        rect(emptyCells[i].x, emptyCells[i].y, emptyCells[i].width, emptyCells[i].height);
    }
    noStroke();
}
// This function returns a LoadLevel function.
function ChallengeLoadLevelCallback(
	thisLevel, // a number - the level number
	instructions, // a string - what to show when the level is loaded
	newBlockInfo, // a string or null - information on any new code blocks
	hints, // an array of strings - these become the hint texts
	playerInitXAdjust, // a number - added to player's initial x position
	playerInitYAdjust, // a number - added to player's initial y position
	targetX, // a number - target is positioned this number of squares to the right of the player
	targetY, // a number - target is positioned this number of squares beneath the player,
	toolboxXML, // a string - passed directly to Blockly to form the toolbox
	additionalVisibleObstacles // an array - passed directly to ChallengePathToObstacles
){
	var MAX_NUM_HINTS = 6;
	if(typeof ChallengePaths[thisLevel] != "object"){
		console.error("ChallengeLoadLevelCallback error: the path for level " + thisLevel + "is not defined.");
	}
	if(!hints){
		hints = ["Try again."];
	}
	return function(){
		if(currentLevel != thisLevel){
			$("#instructionsModal .modal-body").html("<h3>" +
				(instructions || "Choose the right path to reach the red circle.") +
			"</h3>");
			$("#instructionsModal").modal("show");
			currentLevel = thisLevel;
			tipToShow = 1;
			numTipsUsed = 0;
			levelStartTime = Date.now();
			totalNumTips = Math.min(hints.length, MAX_NUM_HINTS);
			numSteps = 0;
		}
		// Create the player character.
		player = new PlayerChallenge();
		player.init_x += playerInitXAdjust;
		player.init_y += playerInitYAdjust;
		player.x = player.init_x;
		player.y = player.init_y;
		// Create the target.
		target = new Target();
		target.x = player.x + player.diameter * targetX;
		target.y = player.y + player.diameter * targetY;
		target.color = color(153, 51, 0);
		// Surround the path with obstacles.
		obstacles = ChallengePathToObstacles(ChallengePaths[thisLevel], additionalVisibleObstacles);
		// This level only has the forward block in the toolbox.
		Blockly.mainWorkspace.updateToolbox(toolboxXML);
		// Add up to five hints.
		for(var i = 0; (i < hints.length) && (i < MAX_NUM_HINTS); i++){
			$("#tipModal" + (i + 1) + " .modal-body").html(hints[i]);
		}
		// Insert the new block information.
		if(newBlockInfo){
			$("button#newBlockTip").show();
			$("#newBlockModal .modal-body").html(newBlockInfo);
		}else{
			$("button#newBlockTip").hide();
		}
		// Insert the On Start block and redraw.
		InsertBlock("start", 200, 20, false, true);
		redraw();
	};
}
// This function returns a DrawStepsLevel function.
function ChallengeDrawStepsCallback(thisLevel){
	return function(){
		ChallengeDraw(ChallengePathToEmptyCells(ChallengePaths[thisLevel]));
	}
}

ChallengePaths[102] = (function(){
	var cells = [];
	for(var i = 0; i <= 5; i++){
		cells.push({x: i, y: 0});
	}
	return cells;
})();
window.LoadLevel102 = ChallengeLoadLevelCallback(
	102,
	"Collect a power cell on the way to the moon base.",
	'<div class="row">' +
		'<div class="col-xs-3 help-block-image">' +
			'<img src="../images/forward.png">' +
		'</div>' +
		'<div class="col-xs-9 help-block-text">' +
			'<h3>Each &ldquo;forward&rdquo; block makes the rocket ship go one step forward to the next space on the path.</h3>' +
		'</div>' +
	'</div>',
	[
		'<h3>' +
			"Solve the puzzle using six blocks or fewer on your first try to earn three stars. " +
			"If you don&rsquo;t get all three stars the first time, try again later." +
		'</h3>',
		'<h3>' +
			"Try connecting more than one &ldquo;forward&rdquo; block to reach the power cell." +
		'</h3>',
		'<h3>' +
			"You need to program the rocket ship to reach the power cell." +
			"Connect the blocks to move the ship." +
			"Try using many &ldquo;forward&rdquo; blocks." +
		'</h3>' +
		'<div class="row">' +
			'<div class="col-xs-3 help-block-image">' +
				'<img src="../images/start.png">' +
			'</div>' +
			'<div class="col-xs-9 help-block-text">' +
				'<h3>' +
					"This is the first block of your program. Add blocks under this one." +
				'</h3>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-xs-3 help-block-image">' +
				'<img src="../images/forward.png">' +
			'</div>' +
			'<div class="col-xs-9 help-block-text">' +
				'<h3>' +
					"Each &ldquo;forward&rdquo; block makes the rocket ship go one step forward." +
				'</h3>' +
			'</div>' +
		'</div>'
	],
	0, 0,
	5, 0,
	'<xml id="toolbox" style="display: none">' +
		'<block type="forward"></block>' +
	'</xml>'
);
window.DrawStepsLevel102 = ChallengeDrawStepsCallback(102);

ChallengePaths[103] = [
	{x: 0, y: 0},
	{x: 1, y: 0},
	{x: 1, y: -1},
	{x: 2, y: -1}
];
window.LoadLevel103 = ChallengeLoadLevelCallback(
	103,
	"Get more power cells to get to the moon base quickly.",
	'<div class="row">' +
		'<div class="col-xs-3 help-block-image">' +
			'<img src="../images/turn_left.png">' +
		'</div>' +
		'<div class="col-xs-9 help-block-text">' +
			'<h3>Each &ldquo;turn left&rdquo; block makes the rocket ship turn to the left.</h3>' +
		'</div>' +
	'</div>' +
	'<div class="row">' +
		'<div class="col-xs-3 help-block-image">' +
			'<img src="../images/turn_right.png">' +
		'</div>' +
		'<div class="col-xs-9 help-block-text">' +
			'<h3>Each &ldquo;turn right&rdquo; block makes the rocket ship turn to the right.</h3>' +
		'</div>' +
	'</div>',
	[
		'<h3>' +
			"Solve the puzzle using six blocks or fewer on your first try to earn three stars. " +
			"If you don&rsquo;t get all three stars the first time, try again later." +
		'</h3>',
		'<h3>' +
			"Try using the &ldquo;turn left&rdquo; and &ldquo;turn right&rdquo; blocks with " +
			"the &ldquo;forward&rdquo; block to reach the power cell." +
		'</h3>',
		'<h3>' +
			"Program the rocket ship to reach the power cell. " +
			"Connect the blocks to move the ship. " +
			"Try using the &ldquo;forward,&rdquo; &ldquo;turn right,&rdquo; and &ldquo;turn left&rdquo; blocks." +
		'</h3>' +
		'<div class="row">' +
			'<div class="col-xs-3 help-block-image">' +
				'<img src="../images/start.png">' +
			'</div>' +
			'<div class="col-xs-9 help-block-text">' +
				'<h3>' +
					"This is the first block of your program. Add blocks under this one." +
				'</h3>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-xs-3 help-block-image">' +
				'<img src="../images/forward.png">' +
			'</div>' +
			'<div class="col-xs-9 help-block-text">' +
				'<h3>' +
					"Each &ldquo;forward&rdquo; block makes the rocket ship go one step forward." +
				'</h3>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-xs-3 help-block-image">' +
				'<img src="../images/turn_left.png">' +
			'</div>' +
			'<div class="col-xs-9 help-block-text">' +
				'<h3>' +
					"Each &ldquo;turn left&rdquo; block makes the rocket ship turn to the left." +
				'</h3>' +
			'</div>' +
		'</div>'
	],
	0, 0,
	2, -1,
	'<xml id="toolbox" style="display: none">' +
		'<block type="forward"></block>' +
		'<block type="turn_left"></block>' +
		'<block type="turn_right"></block>' +
	'</xml>'
);
window.DrawStepsLevel103 = ChallengeDrawStepsCallback(103);

function LoadLevel104(){
	LoadLevel(106);
}

ChallengePaths[106] = (function(){
	var i, cells = [];
	for(i = 1; i >= -5; i--){
		cells.push({x: -i, y: i});
		cells.push({x: 1 - i, y: i});
	}
	cells.push({x: 6, y: 6});
	return cells;
})();
function LoadLevel106(){
	ChallengeLoadLevelCallback(
		106,
		"Find the power cell by making lots of turns in a repeat loop.",
		null,
		[
			'<h3>' +
				"Solve the puzzle using six blocks or fewer on your first try to earn three stars. " +
				"If you don&rsquo;t get all three stars the first time, try again later." +
			'</h3>',
			'<h3>' +
				"Try connecting the &ldquo;forward,&rdquo; &ldquo;turn right,&rdquo; and " +
				"&ldquo;turn left&rdquo; blocks to the &ldquo;repeat&rdquo; block to make the rocket ship go forward." +
			'</h3>',
			'<h3>' +
				"Try changing the value of the &ldquo;repeat&rdquo; block to make the rocket ship reach the power cell." +
			'</h3>',
			'<h3>' +
				"Program the rocket ship to reach the power cell. " +
				"Connect the blocks to move the ship. " +
				"Try using many &ldquo;forward,&rdquo; &ldquo;turn right,&rdquo; and &ldquo;turn left&rdquo; blocks " +
				"inside the &ldquo;repeat&rdquo; block." +
			'</h3>' +
			'<div class="row">' +
				'<div class="col-xs-3 help-block-image">' +
					'<img src="../images/repeat3.png">' +
				'</div>' +
				'<div class="col-xs-9 help-block-text">' +
					'<h3>' +
						"Repeat the blocks in this &ldquo;repeat&rdquo; block three times. " +
						"The &ldquo;repeat&rdquo; block is useful when you want to run the same code again and again. " +
						"You can connect the &ldquo;forward&rdquo; and &ldquo;turn&rdquo; blocks inside it. " +
						"You can also change the number of times you want to repeat the code." +
					'</h3>' +
				'</div>' +
			'</div>' +
			'<div class="row">' +
				'<div class="col-xs-3 help-block-image">' +
					'<img src="../images/forward.png">' +
				'</div>' +
				'<div class="col-xs-9 help-block-text">' +
					'<h3>' +
						"Each &ldquo;forward&rdquo; block makes the rocket ship go one step forward." +
					'</h3>' +
				'</div>' +
			'</div>' +
			'<div class="row">' +
				'<div class="col-xs-3 help-block-image">' +
					'<img src="../images/turn_left.png">' +
				'</div>' +
				'<div class="col-xs-9 help-block-text">' +
					'<h3>Each &ldquo;turn left&rdquo; block makes the rocket ship turn to the left.</h3>' +
				'</div>' +
			'</div>' +
			'<div class="row">' +
				'<div class="col-xs-3 help-block-image">' +
					'<img src="../images/turn_right.png">' +
				'</div>' +
				'<div class="col-xs-9 help-block-text">' +
					'<h3>' +
						"Each &ldquo;turn right&rdquo; block makes the rocket ship turn to the right." +
					'</h3>' +
				'</div>' +
			'</div>'
		],
		60, Math.max(windowHeight * 2 / 3, 420) - windowHeight / 2,
		5, -5,
		'<xml id="toolbox" style="display: none">' +
			'<block type="controls_repeat">' +
				'<field name="TIMES">3</field>' +
			'</block>' +
			'<block type="forward"></block>' +
			'<block type="turn_left"></block>' +
			'<block type="turn_right"></block>' +
		'</xml>'
	).apply(this, arguments);
}
window.DrawStepsLevel106 = ChallengeDrawStepsCallback(106);

ChallengePaths[107] = (function(){
	var cells = [];
	for(var i = 0; i <= 5; i++){
		cells.push({x: i, y: 0});
	}
	return cells;
})();
window.LoadLevel107 = ChallengeLoadLevelCallback(
	107,
	"Collect the power cell using the &ldquo;repeat until&rdquo; conditional loop.",
	'<div class="row">' +
		'<div class="col-xs-4 help-block-image">' +
			'<img src="../images/repeat_until_target.png">' +
		'</div>' +
		'<div class="col-xs-8 help-block-text">' +
			'<h3>' +
				"Repeat the blocks in this &ldquo;repeat until&rdquo; until the rocket ship reaches the power cell. " +
				"The &ldquo;repeat until&rdquo; block is useful when you want to run the same code again and again " +
				"until the goal is reached. In this case the goal is the power cell. " +
				"You can connect the &ldquo;forward&rdquo; block inside it." +
			'</h3>' +
		'</div>' +
	'</div>',
	[
		'<h3>' +
			"Solve the puzzle using three blocks or fewer on your first try to earn three stars. " +
			"If you don&rsquo;t get all three stars the first time, try again later." +
		'</h3>',
		'<h3>' +
			"Try connecting the &ldquo;forward&rdquo; blocks to the &ldquo;repeat until&rdquo; block." +
		'</h3>',
		'<h3>' +
			"Program the rocket ship to reach the power cell. " +
			"Try connecting &ldquo;forward&rdquo; blocks to the &ldquo;repeat until&rdquo; block." +
		'</h3>' +
		'<div class="row">' +
			'<div class="col-xs-5 help-block-image">' +
				'<img src="../images/repeat_until_target.png">' +
			'</div>' +
			'<div class="col-xs-7 help-block-text">' +
				'<h3>' +
					"Repeat the blocks in this &ldquo;repeat until&rdquo; unil the rocket ship reaches the power cell. " +
					"The &ldquo;repeat until&rdquo; block is useful when you want to run the same code again and again " +
					"until the goal is reached. In this case the goal is the power cell. " +
					"You can connect the &ldquo;forward&rdquo; block inside it." +
				'</h3>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-xs-5 help-block-image">' +
				'<img src="../images/forward.png">' +
			'</div>' +
			'<div class="col-xs-7 help-block-text">' +
				'<h3>' +
					"Each &ldquo;forward&rdquo; block makes the rocket ship go one step forward." +
				'</h3>' +
			'</div>' +
		'</div>'
	],
	0, 0,
	5, 0,
	'<xml id="toolbox" style="display: none">' +
		'<block type="controls_whileUntil">' +
			'<field name="MODE">UNTIL</field>' +
			'<value name="BOOL">' +
				'<block movable="false" type="target"></block>' +
			'</value>' +
        '</block>' +
		'<block type="forward"></block>' +
		'<block type="turn_left"></block>' +
		'<block type="turn_right"></block>' +
	'</xml>'
);
window.DrawStepsLevel107 = ChallengeDrawStepsCallback(107);

function LoadLevel108(){
	LoadLevel(109);
}

ChallengePaths[109] = (function(){
	var i, cells = [];
	for(i = 0; i <= 2; i++){
		cells.push({x: i, y: 0});
	}
	for(i = 0; i >= -5; i--){
		cells.push({x: 2, y: i});
	}
	return cells;
})();
window.LoadLevel109 = ChallengeLoadLevelCallback(
	109,
	"Go to the power cell with conditions and turns.",
	'<div class="row">' +
		'<div class="col-xs-3 help-block-image">' +
			'<img src="../images/if_path_left.png">' +
		'</div>' +
		'<div class="col-xs-9 help-block-text">' +
			'<h3>' +
				"Run the blocks in this &ldquo;if&rdquo; only if there is a path to the left ahead." +
			'</h3>' +
		'</div>' +
	'</div>',
	[
		'<h3>' +
			"Solve the puzzle using five blocks or fewer on your first try to earn three stars. " +
			"If you don&rsquo;t get all three stars the first time, try again later." +
		'</h3>',
		'<h3>' +
			"Try using the &ldquo;repeat until&rdquo; block until the rocket ship reaches the power cell." +
		'</h3>',
		'<h3>' +
			"Try using the &ldquo;turn left&rdquo; block if there is a path to the left." +
		'</h3>',
		'<h3>' +
			"Program the rocket ship to reach the power cell. Connect the blocks to move the ship. " +
			"Try using the &ldquo;repeat until&rdquo; &ldquo;left turn&rdquo; and &ldquo;forward&rdquo; blocks." +
		'</h3>' +
		'<div class="row">' +
			'<div class="col-xs-5 help-block-image">' +
				'<img src="../images/repeat_until_target.png">' +
			'</div>' +
			'<div class="col-xs-7 help-block-text">' +
				'<h3>' +
					"Repeat the blocks in this &ldquo;repeat until&rdquo; unil the rocket ship reaches the power cell. " +
					"The &ldquo;repeat until&rdquo; block is useful when you want to run the same code again and again " +
					"until the goal is reached. In this case the goal is the power cell. " +
					"You can connect the &ldquo;forward,&rdquo; &ldquo;if,&rdquo; and &ldquo;turn left&rdquo; blocks inside it." +
				'</h3>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-xs-4 help-block-image">' +
				'<img src="../images/if_path_left.png">' +
			'</div>' +
			'<div class="col-xs-8 help-block-text">' +
				'<h3>' +
					"Run the blocks in this &ldquo;if&rdquo; only if there is a path to the left ahead." +
				'</h3>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-xs-3 help-block-image">' +
				'<img src="../images/forward.png">' +
			'</div>' +
			'<div class="col-xs-9 help-block-text">' +
				'<h3>' +
					"Each &ldquo;forward&rdquo; block makes the rocket ship go one step forward." +
				'</h3>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-xs-3 help-block-image">' +
				'<img src="../images/turn_left.png">' +
			'</div>' +
			'<div class="col-xs-9 help-block-text">' +
				'<h3>Each &ldquo;turn left&rdquo; block makes the rocket ship turn to the left.</h3>' +
			'</div>' +
		'</div>'
	],
	0, 100,
	2, -5,
	'<xml id="toolbox" style="display: none">' +
		'<block type="controls_whileUntil">' +
			'<field name="MODE">UNTIL</field>' +
			'<value name="BOOL">' +
				'<block movable="false" type="target"></block>' +
			'</value>' +
        '</block>' +
		'<block type="controls_if">' +
			'<value name="IF0">' +
				'<block movable="false" type="empty_cell_left"></block>' +
			'</value>' +
        '</block>' +
		'<block type="forward"></block>' +
		'<block type="turn_left"></block>' +
	'</xml>'
);
window.DrawStepsLevel109 = ChallengeDrawStepsCallback(109);

function LoadLevel110(){
	LoadLevel(111);
}

ChallengePaths[111] = (function(){
	var i, cells = [
		{x: 0, y: -3},
		{x: 0, y: -2},
		{x: 4, y: -3},
		{x: 4, y: -2},
		{x: 4, y: -1},
		{x: 1, y: -2},
		{x: 2, y: -2}
	];
	for(i = 0; i <= 4; i++){
		cells.push({x: i, y: 0});
		cells.push({x: i, y: -4});
	}
	return cells;
})();
window.LoadLevel111 = ChallengeLoadLevelCallback(
	111,
	"Collect the power cell with more conditions and left turns.",
	null,
	[
		'<h3>' +
			"Solve the puzzle using five blocks or fewer on your first try to earn three stars. " +
			"If you don&rsquo;t get all three stars the first time, try again later." +
		'</h3>',
		'<h3>' +
			"Try using the &ldquo;repeat until&rdquo; or &ldquo;repeat while&rdquo; block " +
			"until the rocket ship reaches the power cell." +
		'</h3>',
		'<h3>' +
			"Try using the &ldquo;turn left&rdquo; block if there is a path to the left." +
		'</h3>',
		'<h3>' +
			"Program the rocket ship to reach the power cell. Connect the blocks to move the ship. " +
			"Try using the &ldquo;repeat until&rdquo; or &ldquo;repeat while&rdquo; with " +
			"the &ldquo;left turn&rdquo; and &ldquo;forward&rdquo; blocks." +
		'</h3>' +
		'<div class="row">' +
			'<div class="col-xs-5 help-block-image">' +
				'<img src="../images/repeat_until_target.png">' +
			'</div>' +
			'<div class="col-xs-7 help-block-text">' +
				'<h3>' +
					"Repeat the blocks in this &ldquo;repeat until&rdquo; unil the rocket ship reaches the power cell. " +
					"The &ldquo;repeat until&rdquo; block is useful when you want to run the same code again and again " +
					"until the goal is reached. In this case the goal is the power cell. " +
					"You can connect the &ldquo;forward,&rdquo; &ldquo;if,&rdquo; and &ldquo;turn left&rdquo; blocks inside it." +
				'</h3>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-xs-5 help-block-image">' +
				'<img src="../images/repeat_while_path_front.png">' +
			'</div>' +
			'<div class="col-xs-7 help-block-text">' +
				'<h3>' +
					"Repeat the blocks in this &ldquo;repeat with&rdquo; while there is a path in front of the rocket ship. " +
					"The &ldquo;repeat while&rdquo; block is useful when you want to run the same code again and again " +
					"while a condition is true.  You can connect the &ldquo;forward,&rdquo; &ldquo;if,&rdquo; " +
					"and &ldquo;turn left&rdquo; blocks inside it." +
				'</h3>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-xs-4 help-block-image">' +
				'<img src="../images/if_path_left.png">' +
			'</div>' +
			'<div class="col-xs-8 help-block-text">' +
				'<h3>' +
					"Run the blocks in this &ldquo;if&rdquo; only if there is a path to the left ahead." +
				'</h3>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-xs-3 help-block-image">' +
				'<img src="../images/forward.png">' +
			'</div>' +
			'<div class="col-xs-9 help-block-text">' +
				'<h3>' +
					"Each &ldquo;forward&rdquo; block makes the rocket ship go one step forward." +
				'</h3>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-xs-3 help-block-image">' +
				'<img src="../images/turn_left.png">' +
			'</div>' +
			'<div class="col-xs-9 help-block-text">' +
				'<h3>Each &ldquo;turn left&rdquo; block makes the rocket ship turn to the left.</h3>' +
			'</div>' +
		'</div>'
	],
	0, 120,
	2, -2,
	'<xml id="toolbox" style="display: none">' +
		'<block type="controls_whileUntil">' +
			'<field name="MODE">UNTIL</field>' +
			'<value name="BOOL">' +
				'<block movable="false" type="target"></block>' +
			'</value>' +
        '</block>' +
		'<block type="controls_whileUntil">' +
			'<field name="MODE">WHILE</field>' +
			'<value name="BOOL">' +
				'<block movable="false" type="empty_cell"></block>' +
			'</value>' +
        '</block>' +
		'<block type="controls_if">' +
			'<value name="IF0">' +
				'<block movable="false" type="empty_cell_left"></block>' +
			'</value>' +
        '</block>' +
		'<block type="forward"></block>' +
		'<block type="turn_left"></block>' +
	'</xml>'
);
window.DrawStepsLevel111 = ChallengeDrawStepsCallback(111);

function LoadLevel112(){
	LoadLevel(120);
}

ChallengePaths[120] = (function(){
	var i, cells = [
		{x: 1, y: -3},
		{x: 1, y: -2},
		{x: 1, y: -1},
		{x: 2, y: 1},
		{x: 2, y: 2},
		{x: 4, y: -2},
		{x: 4, y: -1},
		{x: 6, y: -2},
		{x: 6, y: -1}
	];
	for(i = 0; i <= 4; i++){
		cells.push({x: i, y: 0});
	}
	for(i = 4; i <= 7; i++){
		cells.push({x: i, y: -3});
	}
	return cells;
})();
window.LoadLevel120 = ChallengeLoadLevelCallback(
	120, 
	"Collect the power cell with more conditions and left turns.",
	null,
	[
		'<h3>' +
			"Solve the puzzle using eight blocks or fewer on your first try to earn three stars. " +
			"If you don&rsquo;t get all three stars the first time, try again later." +
		'</h3>',
		'<h3>' +
			"Try using the &ldquo;repeat until&rdquo; block until the rocket ship reaches the power cell." +
		'</h3>',
		'<h3>' +
			"Try using the &ldquo;forward&rdquo; block if there is a path in front." +
		'</h3>',
		'<h3>' +
			"Try using the &ldquo;turn left&rdquo; block if there is a path to the left." +
		'</h3>',
		'<h3>' +
			"Try using the &ldquo;turn right&rdquo; block if there is a path to the right." +
		'</h3>',
		'<h3>' +
			"Program the rocket ship to reach the power cell. Connect the blocks to move the ship. " +
			"Try using the &ldquo;repeat until&rdquo;, &ldquo;turn left,&rdquo; &ldquo;turn right,&rdquo; " +
			"and &ldquo;forward&rdquo; blocks." +
		'</h3>' +
		'<div class="row">' +
			'<div class="col-xs-5 help-block-image">' +
				'<img src="../images/repeat_until_target.png">' +
			'</div>' +
			'<div class="col-xs-7 help-block-text">' +
				'<h3>' +
					"Repeat the blocks in this &ldquo;repeat until&rdquo; unil the rocket ship reaches the power cell. " +
					"The &ldquo;repeat until&rdquo; block is useful when you want to run the same code again and again " +
					"until the goal is reached. In this case the goal is the power cell. " +
					"You can connect the &ldquo;forward,&rdquo; &ldquo;if,&rdquo; &ldquo;turn left,&rdquo; and " +
					"&ldquo;turn right&rdquo; blocks inside it." +
				'</h3>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-xs-4 help-block-image">' +
				'<img src="../images/if_path_in_front_then_else.png">' +
			'</div>' +
			'<div class="col-xs-8 help-block-text">' +
				'<h3>' +
					"Run the blocks in this &ldquo;if&rdquo; only if there is a path to the front. " +
					"Otherwise, run the blocks in the &ldquo;else&rdquo; section." +
				'</h3>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-xs-4 help-block-image">' +
				'<img src="../images/if_path_left_then_else.png">' +
			'</div>' +
			'<div class="col-xs-8 help-block-text">' +
				'<h3>' +
					"Run the blocks in this &ldquo;if&rdquo; only if there is a path to the left ahead. " +
					"Otherwise, run the blocks in the &ldquo;else&rdquo; section." +
				'</h3>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-xs-4 help-block-image">' +
				'<img src="../images/if_path_right_then_else.png">' +
			'</div>' +
			'<div class="col-xs-8 help-block-text">' +
				'<h3>' +
					"Run the blocks in this &ldquo;if&rdquo; only if there is a path to the right ahead. " +
					"Otherwise, run the blocks in the &ldquo;else&rdquo; section." +
				'</h3>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-xs-3 help-block-image">' +
				'<img src="../images/forward.png">' +
			'</div>' +
			'<div class="col-xs-9 help-block-text">' +
				'<h3>' +
					"Each &ldquo;forward&rdquo; block makes the rocket ship go one step forward." +
				'</h3>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-xs-3 help-block-image">' +
				'<img src="../images/turn_left.png">' +
			'</div>' +
			'<div class="col-xs-9 help-block-text">' +
				'<h3>Each &ldquo;turn left&rdquo; block makes the rocket ship turn to the left.</h3>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-xs-3 help-block-image">' +
				'<img src="../images/turn_right.png">' +
			'</div>' +
			'<div class="col-xs-9 help-block-text">' +
				'<h3>' +
					"Each &ldquo;turn right&rdquo; block makes the rocket ship turn to the right." +
				'</h3>' +
			'</div>' +
		'</div>'
	],
	0, 0,
	7, -3,
	'<xml id="toolbox" style="display: none">' +
        '<block type="controls_whileUntil">' +
			'<field name="MODE">UNTIL</field>' +
			'<value name="BOOL">' +
				'<block movable="false" type="target"></block>' +
			'</value>' +
        '</block>' +
        '<block type="controls_if">' +
			'<mutation else="1"></mutation>' +
			'<value name="IF0">' +
				'<block movable="false" type="empty_cell"></block>' +
			'</value>' +
        '</block>' +
        '<block type="controls_if">' +
			'<mutation else="1"></mutation>' +
			'<value name="IF0">' +
				'<block movable="false" type="empty_cell_left"></block>' +
			'</value>' +
        '</block>' +
        '<block type="controls_if">' +
			'<mutation else="1"></mutation>' +
			'<value name="IF0">' +
				'<block movable="false" type="empty_cell_right"></block>' +
			'</value>' +
        '</block>' +
        '<block type="forward"></block>' +
        '<block type="turn_left"></block>' +
        '<block type="turn_right"></block>' +
	'</xml>',
	[
		{x: 1, y: -3},
		{x: 2, y: 2},
		{x: 6, y: -1}
	]
);
window.DrawStepsLevel120 = ChallengeDrawStepsCallback(120);

function LoadLevel121(){
	// Show the level selection menu.
	LoadLevel(43);
}

function insertCommasIntoNumber(theNumber, digitsPerGroup){
	digitsPerGroup = digitsPerGroup || 3;
	theNumber = theNumber.toString();
	var i, lastPosition = 0, result = "";
	for(i = (theNumber.length % digitsPerGroup); i < theNumber.length; i += digitsPerGroup){
		if(i != lastPosition){
			result += theNumber.substring(lastPosition, i) + ",";
			lastPosition = i;
		}
	}
	result += theNumber.substring(lastPosition);
	return result;
}

function strPadLeft(theString, padChar, desiredLength){
	theString = "" + theString;
	while(theString.length < desiredLength){
		theString = padChar + theString;
	}
	return theString;
}

function timespanString(timespan){
	timespan = new Date(timespan);
	return timespan.getUTCHours() + ":" + strPadLeft(timespan.getMinutes(), '0', 2) + ":" + strPadLeft(timespan.getSeconds(), '0', 2);
}

function updateUserStars(numStars){
	var columnName = "stars" + currentLevel;
	// Obtain the Parse subclass.
	var UserStars = Parse.Object.extend("UserStars");
	// Check whether the user already has a row in the UserStars table.
	if(CURRENT_USER.attributes.starsID){
		// First, see how many stars the user previously had for this level.
		var query = new Parse.Query(UserStars);
		query.get(CURRENT_USER.attributes.starsID, {
			success: function(userStars) {
				// Update the new number of stars if the user got more stars than before.
				if(!userStars.get(columnName) || (numStars > userStars.get(columnName))){
					userStars.set(columnName, numStars);
					userStars.save();
				}
			},
			error: function(userStars, error) {
				console.error('Failed to query stars table row: ' + error.message);
			}
		});
	}else{
		// The user does not have a row in the UserStars table. Create one now.
		var userStars = new UserStars();
		userStars.set(columnName, numStars);
		userStars.set("user", CURRENT_USER.id);
		userStars.save(null, {
			success: function(userStars) {
				CURRENT_USER.set("starsID", userStars.id);
				CURRENT_USER.save();
			},
			error: function(userStars, error) {
				console.error('Failed to create new stars table row: ' + error.message);
			}
		});
	}
}

function CheckSuccess() {

    animationsArray.push(setTimeout(runCheck, Math.ceil(200 / 30 * frames)));

    function runCheck() {
        if (player.x == target.x && Math.abs(player.y - target.y) < 5) {
            textSize(32);
            text("Correct", 10, 30);
            fill(0, 102, 153);

			var totalBlocksUsed = getTotalBlocksUsed();

			var numStars = -1;
			if(runConditionIsPlus()){
				// Show the number of points that the user got.
				if(levelStars[currentLevel - 1]){
					if(levelStars[currentLevel - 1].levelNumber == currentLevel){
						// Figure out how many stars we need and points the user earned.
						numStars = (function(hints){
							// Find out how many stars we should have based on the number of hints
							switch(hints){
								case 0:
									return 3;
								case 1:
									return 2;
								case 2:
								case 3:
								default:
									return 1;
							}
						})(numTipsUsed);
						var maxPoints = (function(levelStarsCurrentLevel, stars){
								// Find the maximum possible number of points based on the number of stars
								switch(stars){
									case 3:
										return levelStarsCurrentLevel.threeStars;
									case 2:
										return levelStarsCurrentLevel.twoStars;
									case 1:
									default:
										return levelStarsCurrentLevel.oneStar;
								}
							})(levelStars[currentLevel - 1], numStars),
							bestSolutionNumBlocks = (function(levelBestSolutionNumBlocksCurrentLevel){
								// Find the number of blocks in the best solution for the level.
								return levelBestSolutionNumBlocksCurrentLevel.bestSolutionNumBlocks;
							})(levelBestSolutionNumBlocks[currentLevel - 1]),
							numPoints = Math.round(maxPoints * totalBlocksUsed / bestSolutionNumBlocks);
						// Change the success modal to show the stars and feedback.
						$("#successModal .modal-body").html(''
							+ '<h1>' + (function(currentLevel){
								if(currentLevel == 99){
									return "Challenge";
								}else if(currentLevel <= 20){
									return "Problem " + currentLevel;
								}else if(currentLevel <= 43){
									return "Problem " + (currentLevel - 20);
								}
								return "Problem";
							})(currentLevel) + ' Completed!</h1>'
							+ '<div class="starsMultitude">' + (function(stars){
								var i, result = "";
								for(i = 0; i < stars; i++){
									result += '<img src="images/star_spot.png" width="200" height="215" class="star">';
								}
								while(i < 3){
									result += '<img src="images/spot.png" width="200" height="215" class="star">';
									i++;
								}
								return result;
							})(numStars) + '</div>'
							+ '<table>'
							+ '<tr><td class="pointsTableLabel">Blocks Used</td>' + ((totalBlocksUsed <= bestSolutionNumBlocks) ? ('<td class="nicelyDone">' + totalBlocksUsed + ' (Best)</td>') : ('<td>' + totalBlocksUsed + '</td>')) + '</tr>'
							+ '<tr><td class="pointsTableLabel">Hints Used</td><td class="' + ((numTipsUsed == 0) ? "optimal" : "nonOptimal") + '">' + numTipsUsed + '</td></tr>'
							+ '<tr><td class="pointsTableLabel">Time</td><td>' + timespanString(Date.now() - levelStartTime) + '</td></tr>'
							+ '<tr><td class="pointsTableLabel">Points</td><td>' + insertCommasIntoNumber(numPoints) + '</td></tr>'
							+ '</table>'
						);
						// Save the number of stars.
						updateUserStars(numStars);
					}else{
						console.warn("Level star mismatch", currentLevel, levelStars[currentLevel - 1]);
					}
				}else{
					$("#successModal .modal-body").html("<h3>Points are unavailable for this level. Proceed to the next problem.</h3>");
				}
				player.jump_for_joy(function(){
					$("#successModal").modal("show");
				});
			}else{
				$("#successModal").modal("show");
			}

            if (!$.isEmptyObject(CURRENT_USER)) {
                CURRENT_USER.set("maxLevel", Math.max(currentLevel + 1, CURRENT_USER.attributes.maxLevel));
                CURRENT_USER.save();
                UnlockLevels(CURRENT_USER.attributes.maxLevel);

                var LevelCompleted = Parse.Object.extend("LevelCompleted");
                var levelCompleted = new LevelCompleted();

                console.log("Blocks used to solve problem: " + totalBlocksUsed);

                levelCompleted.set("level", currentLevel);
                levelCompleted.set("blocksUsed", totalBlocksUsed);
                levelCompleted.set("codeUsed", Blockly.JavaScript.workspaceToCode());
                levelCompleted.set("time", new Date());
				if(numStars >= 0){
					levelCompleted.set("stars", numStars);
				}
                levelCompleted.set("UserId", CURRENT_USER.id);
                levelCompleted.save();
            }
        } else {
            console.log("The user is incorrect.");
			var continueAfterOopsMsg = function(){
				$modal = $('.tipModal');
				if (!$('.tipModal').hasClass('in')) {
					if (!$.isEmptyObject(CURRENT_USER)) {
						var HintProvided = Parse.Object.extend("HintProvided");
						var hintProvided = new HintProvided();
						hintProvided.set("HintId", (tipToShow > totalNumTips) ? 1 : tipToShow);
						hintProvided.set("Level", currentLevel);
						hintProvided.set("time", new Date());
						hintProvided.set("UserId", CURRENT_USER.id);
						hintProvided.save();
					};
					displayTip(true);
				}
			}
			if(runConditionIsPlus()){
				// Make the player turn sad.
				player.turn_sad(function(){
					// Prepare to display the oops message.
					var oopsMsgElements = $(".oopsMsg");
					oopsMsgID = (oopsMsgID < oopsMsgElements.length) ? oopsMsgID : 0;
					// Log OopsMsg event in Parse.
					if (!$.isEmptyObject(CURRENT_USER)) {
						var OopsMsg = Parse.Object.extend("OopsMsg");
						var oopsMsg = new OopsMsg();
						oopsMsg.set("OopsMsgId", oopsMsgID);
						oopsMsg.set("Level", currentLevel);
						oopsMsg.set("time", new Date());
						oopsMsg.set("UserId", CURRENT_USER.id);
						oopsMsg.save();
					}
					// Display the oops message.
					oopsMsgElements.slice(oopsMsgID, oopsMsgID + 1).show();
					// Remove the oops message and display the hint.
					setTimeout(function(){
						oopsMsgElements.hide();
						continueAfterOopsMsg();
					}, 3000);
					// Increment the oops message ID for next time.
					oopsMsgID++;
				});
			}else{
				continueAfterOopsMsg();
			}
        }

        //Clear animations array
        animationsArray = [];
    }
}

function GetBlock(name) {
    return Blockly.Block.obtain(Blockly.mainWorkspace, name);
}

function InsertBlock(name, x, y, deletable, movable) {
    var newBlockStart = Blockly.Block.obtain(Blockly.mainWorkspace, name);
    newBlockStart.initSvg();
    newBlockStart.moveBy(x, y); // Ideally, we'd have a moveTo function, even though the initial position is (0, 0), anyway.
    newBlockStart.setDeletable(deletable);
    newBlockStart.setMovable(movable);
    newBlockStart.render();

    //Insert 2 blocks and connect them in workspace
    //var newBlock1 = Blockly.Block.obtain(Blockly.mainWorkspace,"repeat_until");
    //newBlock1.initSvg();
    //newBlock1.render();
    //newBlock1.moveTo(80,100);
    //
    //var newBlock2 = Blockly.Block.obtain(Blockly.mainWorkspace,"obstacle");
    //newBlock2.initSvg();
    //newBlock2.render();
    //newBlock2.moveTo(100,100);
    //
    //newBlock1.getConnections_()[2].connect(newBlock2.getConnections_()[0]);
}

var invalidState = false;

function CheckInvalidStates() {
    if (obstacles.length > 0) {
        for (var i = 0; i < obstacles.length; i++) {
            if ((obstacles[i].x == player.x) && (Math.abs(obstacles[i].y - player.y)) < 2) {
                //Stop all animations
                invalidState = true;
            }
        }
    }

	// Check whether the player is beyond the target, except in challenge levels.
	// Check whether the character is stuck inside an infinite loop.
	invalidState = invalidState || ((currentLevel < 99) && (player.x >= (target.x + player.diameter))) || player.isStuckInInfiniteLoop;

    if (invalidState) {
		console.log("There are invalid states.");
        while (animationsArray.length > 0) {
            clearTimeout(animationsArray.pop());
        }
        CheckSuccess();
        return
    }
}

function Retry() {
    ReloadLevel(false);
    animationsArray = [];
    redraw();
}

function displayTip(resetWhenClosed) {
	resetWhenClosed = resetWhenClosed ? true : false;
    if (tipToShow <= totalNumTips) {
        $("#tipModal" + tipToShow).data("resetWhenClosed", resetWhenClosed).modal("show");
        tipToShow++;
		numTipsUsed++;
    } else {
        tipToShow = 1;
        displayTip(resetWhenClosed);
    }
}

// API FOR BLOCKLY
function Walk() {
    player.move();
}

function CheckWhetherMoving() {
	player.checkWhetherMoving();
}

function Forward() {
    player.forward();
}

function TurnRight() {
    player.turnRight();
}

function TurnLeft() {
    player.turnLeft();
}

function Jump() {
    player.jump();
}

function LongJump() {
    player.long_jump();
}

function SuperJump() {
    player.super_jump();
};
/**
 * @return {boolean}
 */
function TargetBlock() {
    if (player.x == target.x && Math.abs(player.y - target.y) < 5) {
        return true;
    }
    return false;
};

/**
 * @return {boolean}
 */
function ObstacleBlock() {
    var walkDist = player.x + player.total_hor_dist_walk;
    for (var i = 0; i < obstacles.length; i++) {
        if ((walkDist == obstacles[i].x) && !StackedObstacleBlock() && !DoubleObstacleBlock()) {
            return true;
        }
    }
    return false;
};

function DoubleObstacleBlock() {
    var walkDist = player.x + player.total_hor_dist_walk;
    var walkDistDouble = player.x + player.total_hor_dist_walk * 2;

    for (var i = 0; i < obstacles.length; i++) {
        if (walkDist == obstacles[i].x) {

            for (var j = 0; j < obstacles.length; j++) {
                if (walkDistDouble == obstacles[j].x) {
                    return true;
                }
            }

        }
    }
    return false;
};

function StackedObstacleBlock() {
    var walkDist = player.x + player.diameter;
    var heightDistDouble = player.y - player.diameter;

    for (var i = 0; i < obstacles.length; i++) {
        if (walkDist == obstacles[i].x) { //Is there an obstacle at ground level

            for (var j = 0; j < obstacles.length; j++) {

                if ((Math.abs(heightDistDouble - obstacles[j].y) < 5) && (walkDist == obstacles[j].x)) { //Is there a stacked obstacle. Use < to account for height variations on jump animations
                    return true;
                }
            }

        }
    }
    return false;
};

function EmptyBlock() {
    var walkDist = player.x + player.total_hor_dist_walk;
    var lastEmtpySpaceX = numSteps * player.diameter + player.init_x;
    for (var i = 0; i < obstacles.length; i++) {
        if (walkDist == obstacles[i].x || walkDist > lastEmtpySpaceX) {
            return false;
        }
    }
    return true;
};

function EmptyCellBlock() {
    if (player.angle == 0 || player.angle == 360) {
        var walkDist = player.x + player.total_hor_dist_walk;
        for (var i = 0; i < obstacles.length; i++) {
            if (walkDist == obstacles[i].x && player.y == obstacles[i].y) {
                return false;
            }
        }
    } else if (player.angle == 90) {
        var walkDist = player.y + player.total_hor_dist_walk;
        for (var i = 0; i < obstacles.length; i++) {
            if (walkDist == obstacles[i].y && player.x == obstacles[i].x) {
                return false;
            }
        }
    } else if (player.angle == 180) {
        var walkDist = player.x - player.total_hor_dist_walk;
        for (var i = 0; i < obstacles.length; i++) {
            if (walkDist == obstacles[i].x && player.y == obstacles[i].y) {
                return false;
            }
        }
    } else if (player.angle == 270) {
        var walkDist = player.y - player.total_hor_dist_walk;
        for (var i = 0; i < obstacles.length; i++) {
            if (walkDist == obstacles[i].y && player.x == obstacles[i].x) {
                return false;
            }
        }
    }

    return true;
};

function EmptyCellBlockLeft() {
    if (player.angle == 0 || player.angle == 360) {
        var walkDist = player.y - player.total_hor_dist_walk;
        for (var i = 0; i < obstacles.length; i++) {
            if (player.x == obstacles[i].x && walkDist == obstacles[i].y) {
                return false;
            }
        }
    } else if (player.angle == 90) {
        var walkDist = player.x + player.total_hor_dist_walk;
        for (var i = 0; i < obstacles.length; i++) {
            if (player.y == obstacles[i].y && walkDist == obstacles[i].x) {
                return false;
            }
        }
    } else if (player.angle == 180) {
        var walkDist = player.y + player.total_hor_dist_walk;
        for (var i = 0; i < obstacles.length; i++) {
            if (walkDist == obstacles[i].y && player.x == obstacles[i].x) {
                return false;
            }
        }
    } else if (player.angle == 270) {
        var walkDist = player.x - player.total_hor_dist_walk;
        for (var i = 0; i < obstacles.length; i++) {
            if (walkDist == obstacles[i].x && player.y == obstacles[i].y) {
                return false;
            }
        }
    }

    return true;
};

function EmptyCellBlockRight() {
    if (player.angle == 0 || player.angle == 360) {
        var walkDist = player.y + player.total_hor_dist_walk;
        for (var i = 0; i < obstacles.length; i++) {
            if (walkDist == obstacles[i].y && player.x == obstacles[i].x) {
                return false;
            }
        }
    } else if (player.angle == 90) {
        var walkDist = player.x - player.total_hor_dist_walk;
        for (var i = 0; i < obstacles.length; i++) {
            if (walkDist == obstacles[i].x && player.y == obstacles[i].y) {
                return false;
            }
        }
    } else if (player.angle == 180) {
        var walkDist = player.y - player.total_hor_dist_walk;
        for (var i = 0; i < obstacles.length; i++) {
            if (walkDist == obstacles[i].y && player.x == obstacles[i].x) {
                return false;
            }
        }
    } else if (player.angle == 270) {
        var walkDist = player.x + player.total_hor_dist_walk;
        for (var i = 0; i < obstacles.length; i++) {
            if (walkDist == obstacles[i].x && player.y == obstacles[i].y) {
                return false;
            }
        }
    }

    return true;
};

var $output = $("#codeEvalOutput");
var $iframe = $("iframe");

function displayBlockOutput(block, text) {
    var $iframeWidth = $iframe.width();
    var $iframeOffset = $iframe.offset();
    var position = block.getRelativeToSurfaceXY();
    var blockWidth = block.getHeightWidth().width;
    var toolboxWidth = 150;
    $output.text(text);
    $output.css({
        'top': $iframeOffset.top + position.y + 15,
        'left': $iframeOffset.left + toolboxWidth + position.x + blockWidth
    });
    $output.show();
    setTimeout(hideOutput, 500);

    function hideOutput() {
        $output.hide();
    };
}

/* I used this code to fix the toolboxes.
$0.value = $0.value.replace('<block type="controls_whileUntil"><field name="MODE">UNTIL</field><value name="BOOL"><block movable="false" type="target2"></block></value></block>', '<block type="repeat_until"><value name="BOOL"><block movable="false" type="target2"></block></value></block>');
$0.value = $0.value.replace('<block type="controls_whileUntil"><field name="MODE">UNTIL</field><value name="BOOL"><block movable="false" type="target"></block></value></block>', '<block type="repeat_until"><value name="BOOL"><block movable="false" type="target"></block></value></block>');
$0.value = "'" + $0.value.replace(/    /g, "\t").replace(/\t\</g, "\t'<").replace(/>\n/g, ">' +\n").replace("</xml>", "'</xml>'");
*/