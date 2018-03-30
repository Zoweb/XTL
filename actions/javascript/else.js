/**
 * children are removed if value is not 'truthy'.
 *
 * @param tag - The current tag
 * @param args - A dictionary of the arguments
 * @param children - A list of the children
 */
module.exports = function elseAction(tag, args, children) {
    if (this.tag.previousTag.name !== "if") throw new TagError("`else` must come directly after `if`");

    if (this.meta.previousTag.customProperties.success) return [];
    else return children;
};