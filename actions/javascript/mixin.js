/**
 * Defines a variable named from value, with children as specified.
 *
 * @param tag - The current tag
 * @param args - A dictionary of the arguments
 * @param children - A list of the children
 */
module.exports = function mixAction(tag, args, children) {
    if (typeof args.value === "undefined") throw new TagError("Invalid `mix` tag");

    let tag = new Tag(args.key, children);

    tag.meta.defineTempConstantAction(tag);

    return [];
};