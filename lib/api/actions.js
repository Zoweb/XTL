const tag = require("./javascript/tag");

const actionsList = {
    actions: {},
    macros: {}
};

exports.registerAction = function registerAction(actionName, options) {
    // Check that `actionName` is a valid tag name
    if (!tag.isValidTagName(actionName)) throw new TypeError("Invalid action name");
    actionName = tag.convertTagNameCase(actionName);

    if (actionsList.actions[actionName]) throw new ReferenceError("Action already exists");

    actionsList.actions[actionName] = options.targets;
};

exports.registerMacro = function registerMacro(macroName, options) {
    // Check that `macroName` is a valid tag name
    if (!tag.isValidTagName(macroName)) throw new TypeError("Invalid macro name");
    macroName = tag.convertTagNameCase(macroName);

    if (actionsList.macros[macroName]) throw new ReferenceError("Action already exists");

    actionsList.macros[macroName] = options.targets;
};

exports.getActionContents = function(name, language) {
    if (!actionsList[name]) throw new ReferenceError("Action does not exist");

    
};