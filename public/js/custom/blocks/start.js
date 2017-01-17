/**
 * Created by Joan on 12/7/2014.
 * Modified by David on 1/11/2016.
 */
Blockly.Blocks['start'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.setColour(260);
        this.appendDummyInput()
            .appendField("On Start");
        this.setPreviousStatement(false);
        this.setNextStatement(true);
        this.setTooltip('');
    }
};

Blockly.JavaScript['start'] = function(block) {
    return "void(0);\n";
};

