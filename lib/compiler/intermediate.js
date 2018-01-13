function processTag(jsActions, previousTag, tag) {
    if (tag.data.flags.compiled && jsActions[tag.name]) {
        // Run the tag's action from the list of actions
        let action = jsActions[tag.name];
    } else if (tag.data.flags.macro) {

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