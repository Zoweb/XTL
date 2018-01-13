const tag = require("./javascript/tag");

const actionsList = {};

module.exports = function registerAction(actionName, options) {
    // Check that `actionName` is a valid tag name
    if (!tag.isValidTagName(actionName)) throw new TypeError("Invalid action name");
    actionName = tag.convertTagNameCase(actionName);

    if (actionsList[actionName]) throw new ReferenceError("Action already exists");

    actionsList[actionName] = options.targets;
};

module.exports.getActionContents = function(name, language) {
    if (!actionsList[name]) throw new ReferenceError("Action does not exist");

    
};