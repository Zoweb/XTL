const path = require("path");

function processTag(jsActions, previousTag, tag) {
    if (tag.data.flags.compiled && jsActions[tag.name]) {
        // Run the tag's action from the list of actions

        let dir = jsActions.actions[tag.name].root;
        let actionRelative = jsActions.actions[tag.name].js,
            actionPath = dir ? path.join(dir, actionRelative) : actionRelative;

        let actionMethod = require(actionPath);
        actionMethod()
    } else if (tag.data.flags.macro) {
        let actionPath = jsActions.macros[tag.name].js;
    }

    // If the tag has an automatic name, set it to the previous tag's name.
    if (tag.data.flags.auto) {
        if (!previousTag) throw new ReferenceError("Cannot have auto-tag as first tag in section");
        tag.data.name = previousTag.data.name;
    }
}

module.exports = function(jsActions, ast) {
    // Enter into the AST, loop through the children and if necessary, edit them
    if (ast.type !== "Program") throw new TypeError("Invalid AST");

    for (let i = 0; i < ast.children.length; i++) {
        processTag(jsActions, ast.children[i - 1], ast.children[i])
    }
};