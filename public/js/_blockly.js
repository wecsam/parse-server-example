var testObject;

function blocklyLoaded(blockly) {
  // Called once Blockly is fully loaded.
  window.Blockly = blockly;
}
var output;
function executeBlockly(){
  var myCode = Blockly.JavaScript.workspaceToCode();
  if (myCode !== '') {
    output = myCode.split('\n');

    //Check if there is more than one stack of blocks and give a warning
    var multipleStacks = false;
    for(var i = 0; i < output.length-1; i++){
      if(output[i] == ""){
        multipleStacks = true;
        $("#multipleStacksModal").modal("show");
        return;
      }
    }

	player.reset();
    parseCode();
    nextStep();
  }else{
    alert("Code is empty");
    CheckSuccess();
  }
}

var myInterpreter = null;

//API for external calls for Custom Blocks through the interpreter
function initApi(interpreter, scope) {
  // Add an API function for the alert() block.
  var wrapper = function(text) {
    text = text ? text.toString() : '';
    return interpreter.createPrimitive(alert(text));
  };
  interpreter.setProperty(scope, 'alert',
      interpreter.createNativeFunction(wrapper));

  // Add an API function for the prompt() block.
  var wrapper = function(text) {
    text = text ? text.toString() : '';
    return interpreter.createPrimitive(prompt(text));
  };
  interpreter.setProperty(scope, 'prompt',
      interpreter.createNativeFunction(wrapper));

  // Add an API function for highlighting blocks.
  var wrapper = function(id) {
    id = id ? id.toString() : '';
    return interpreter.createPrimitive(highlightBlock(id));
  };
  interpreter.setProperty(scope, 'highlightBlock',
      interpreter.createNativeFunction(wrapper));

  // Add an API function for displaying output from block.
  var wrapper = function(id) {
    id = id ? id.toString() : '';
    return interpreter.createPrimitive(displayBlockOutput(text));
  };
  interpreter.setProperty(scope, 'displayBlockOutput',
      interpreter.createNativeFunction(wrapper));

  // Add an API function for checking whether the player has moved at all.
  wrapper = function() {
    return interpreter.createPrimitive(CheckWhetherMoving());
  };
  interpreter.setProperty(scope, 'CheckWhetherMoving',
      interpreter.createNativeFunction(wrapper));

  // Add an API function for the Walk() block.
  wrapper = function() {
    return interpreter.createPrimitive(Walk());
  };
  interpreter.setProperty(scope, 'Walk',
      interpreter.createNativeFunction(wrapper));

  // Add an API function for the forward() block.
  wrapper = function() {
    return interpreter.createPrimitive(Forward());
  };
  interpreter.setProperty(scope, 'Forward',
    interpreter.createNativeFunction(wrapper));

  // Add an API function for the turn_right() block.
  wrapper = function() {
    return interpreter.createPrimitive(TurnRight());
  };
  interpreter.setProperty(scope, 'TurnRight',
    interpreter.createNativeFunction(wrapper));

  // Add an API function for the turn_left() block.
  wrapper = function() {
    return interpreter.createPrimitive(TurnLeft());
  };
  interpreter.setProperty(scope, 'TurnLeft',
    interpreter.createNativeFunction(wrapper));

  // Add an API function for the Jump() block.
  wrapper = function() {
    return interpreter.createPrimitive(Jump());
  };
  interpreter.setProperty(scope, 'Jump',
      interpreter.createNativeFunction(wrapper));

  // Add an API function for the SuperJump() block.
  wrapper = function() {
    return interpreter.createPrimitive(SuperJump());
  };
  interpreter.setProperty(scope, 'SuperJump',
    interpreter.createNativeFunction(wrapper));

  // Add an API function for the LongJump() block.
  wrapper = function() {
    return interpreter.createPrimitive(LongJump());
  };
  interpreter.setProperty(scope, 'LongJump',
    interpreter.createNativeFunction(wrapper));

  // Add an API function for the Target block.
  wrapper = function() {
    return interpreter.createPrimitive(TargetBlock());
  };
  interpreter.setProperty(scope, 'TargetBlock',
      interpreter.createNativeFunction(wrapper));

  // Add an API function for the Obstacle block.
  wrapper = function() {
    return interpreter.createPrimitive(ObstacleBlock());
  };
  interpreter.setProperty(scope, 'ObstacleBlock',
      interpreter.createNativeFunction(wrapper));

  // Add an API function for the StackedObstacle block.
  wrapper = function() {
    return interpreter.createPrimitive(StackedObstacleBlock());
  };
  interpreter.setProperty(scope, 'StackedObstacleBlock',
    interpreter.createNativeFunction(wrapper));

  // Add an API function for the DoubleObstacle block.
  wrapper = function() {
    return interpreter.createPrimitive(DoubleObstacleBlock());
  };
  interpreter.setProperty(scope, 'DoubleObstacleBlock',
    interpreter.createNativeFunction(wrapper));

  // Add an API function for the Empty block.
  wrapper = function() {
    return interpreter.createPrimitive(EmptyBlock());
  };
  interpreter.setProperty(scope, 'EmptyBlock',
      interpreter.createNativeFunction(wrapper));

  // Add an API function for the EmptyCell block.
  wrapper = function() {
    return interpreter.createPrimitive(EmptyCellBlock());
  };
  interpreter.setProperty(scope, 'EmptyCellBlock',
    interpreter.createNativeFunction(wrapper));

  // Add an API function for the EmptyCellBlockLeft block.
  wrapper = function() {
    return interpreter.createPrimitive(EmptyCellBlockLeft());
  };
  interpreter.setProperty(scope, 'EmptyCellBlockLeft',
    interpreter.createNativeFunction(wrapper));

  // Add an API function for the EmptyCellBlockRight block.
  wrapper = function() {
    return interpreter.createPrimitive(EmptyCellBlockRight());
  };
  interpreter.setProperty(scope, 'EmptyCellBlockRight',
    interpreter.createNativeFunction(wrapper));

  // Add an API function for the CheckSuccess() function. This funciton is added manually inside parseCode()
  wrapper = function() {
    return interpreter.createPrimitive(CheckSuccess());
  };
  interpreter.setProperty(scope, 'CheckSuccess',
      interpreter.createNativeFunction(wrapper));
}

var highlightPause = false, blockTextCounts = [];
function highlightBlock(id) {
	var doHighlight = true;
	highlightPause = true;

	// Count the number of times that this block has been highlighted.
	if(blockTextCounts.hasOwnProperty(id)){
		blockTextCounts[id]++;
	}else{
		blockTextCounts[id] = 0;
	}

	var currentBlock = Blockly.mainWorkspace.getBlockById(id);
	switch(currentBlock.type){
		case 'controls_repeat':
			var count = blockTextCounts[id], countStop = currentBlock.getFieldValue('TIMES');
			if(count == countStop){
				doHighlight = false;
			}else{
				displayBlockOutput(currentBlock, (count + 1) + "/" + countStop);
			}
			highlightPause = false;
			break;
		case 'controls_whileUntil':
			// Get the input block for the loop
			var inputBlock = currentBlock.getChildren()[0];
			// Generate code for the input block and evaluate it
			var inputBlockCode = Blockly.JavaScript.blockToCode(inputBlock)[0];
			var controls_whileUntil_value = eval(inputBlockCode);
			displayBlockOutput(currentBlock, controls_whileUntil_value);
			highlightPause = controls_whileUntil_value;
			break;
		case 'repeat_until':
			// Get the input block for the loop
			var inputBlock = currentBlock.getChildren()[0];
			// Generate code for the input block and evaluate it
			var inputBlockCode = Blockly.JavaScript.blockToCode(inputBlock)[0];
			var controls_whileUntil_value = eval(inputBlockCode);
			displayBlockOutput(currentBlock, controls_whileUntil_value);
			highlightPause = controls_whileUntil_value;
			break;
		case 'repeat_while':
			// Get the input block for the loop
			var inputBlock = currentBlock.getChildren()[0];
			// Generate code for the input block and evaluate it
			var inputBlockCode = Blockly.JavaScript.blockToCode(inputBlock)[0];
			var controls_whileUntil_value = eval(inputBlockCode);
			displayBlockOutput(currentBlock, controls_whileUntil_value);
			highlightPause = !controls_whileUntil_value;
			break;
		case 'controls_if':
			// Get the input block for the if block
			var inputBlock = currentBlock.getChildren()[0];
			// Generate code for the input block and evaluate it
			var inputBlockCode = Blockly.JavaScript.blockToCode(inputBlock)[0];
			var controls_if_value = eval(inputBlockCode);
			displayBlockOutput(currentBlock, controls_if_value);
			highlightPause = false;
			break;
		case 'variables_set':
			var n = myInterpreter.getScope().properties.n.data;
			if (n != undefined) {
			  console.log('n: ' + n);
			  displayBlockOutput(currentBlock, n);
			}
			break;
		case 'start':
			highlightPause = false;
			break;
		default:
			break;
	}
	
	if(doHighlight){
		Blockly.mainWorkspace.highlightBlock(id);
	}
}

function parseCode() {
  // Generate JavaScript code and parse it.
  Blockly.JavaScript.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
  Blockly.JavaScript.addReservedWords('highlightBlock');

  var code = Blockly.JavaScript.workspaceToCode();
  code += "CheckSuccess();";
  myInterpreter = new Interpreter(code, initApi);

  highlightPause = false;
  blockTextCounts = [];
  Blockly.mainWorkspace.traceOn(true);
  Blockly.mainWorkspace.highlightBlock(null);
}

function nextStep(){
	if(!invalidState && myInterpreter.step()){
		animationsArray.push(setTimeout(nextStep, highlightPause ? (frames / 2 + 55) : 10));
	}
}

//USE TO PAUSE EXECUTION ON HIGHLIGHTED BLOCK
//function stepCode() {
//  try {
//    var ok = myInterpreter.step();
//  } finally {
//    if (!ok) {
//      // Program complete, no more code to execute.
//      //document.getElementById('stepButton').disabled = 'disabled';
//      return;
//    }
//  }
//  if (highlightPause) {
//    // A block has been highlighted.  Pause execution here.
//    highlightPause = false;
//  } else {
//    // Keep executing until a highlight statement is reached.
//    stepCode();
//  }
//}