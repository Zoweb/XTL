/**
 * Define a variable, named from key, as value. Variable is a single-child tag where the first child's value attribute
 * is the value. Use define again to overwrite.
 *
 * @param tag - The current tag
 * @param args - A dictionary of the arguments
 * @param children - A list of the children
 */
function defineAction(tag, args, children) {
    if (typeof args.key === "undefined" || typeof args.value === "undefined") throw new TagError("Invalid `define` tag");

    let tag = new Tag(args.key, {
        value: args.value
    });

    tag.meta.defineTempConstantAction(tag);

    return [];
}