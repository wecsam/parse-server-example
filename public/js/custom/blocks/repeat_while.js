/**
 * Created by Joan on 12/7/2014.
 * Modified by David on 1/8/2016.
 */
Blockly.Blocks['repeat_while'] = {
    /**
     * Block for 'do while/until' loop.
     * @this Blockly.Block
     */
    init: function() {
        this.setHelpUrl(Blockly.Msg.CONTROLS_WHILEUNTIL_HELPURL);
        this.setColour(120);
        this.appendValueInput('BOOL')
            .setCheck('Boolean')
            .appendField("repeat while");
        this.appendStatementInput('DO')
            .appendField(Blockly.Msg.CONTROLS_WHILEUNTIL_INPUT_DO);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(function() {
            return Blockly.Msg.CONTROLS_WHILEUNTIL_TOOLTIP_WHILE;
        });
    }
};

Blockly.JavaScript['repeat_while'] = function(block) {
    // Do while loop.
    var argument0 = Blockly.JavaScript.valueToCode(block, 'BOOL', Blockly.JavaScript.ORDER_NONE) || 'false';
    var branch = Blockly.JavaScript.statementToCode(block, 'DO');
    branch = Blockly.JavaScript.addLoopTrap(branch, block.id);
	return 'while (' + argument0 + ') {\n  CheckWhetherMoving();\n' + branch + '}\n';
};