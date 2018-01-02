/**
 * Children are removed if comparison returns false.
 *
 * @param tag - The current tag
 * @param args - A dictionary of the arguments
 * @param children - A list of the children
 */
function ifAction(tag, args, children) {
    tag.customProperties.success = false;

    if (typeof args.left !== "undefined" && typeof args.right !== "undefined") {
        args.compare = args.compare || "=";

        switch (args.compare) {
            case "=":
                tag.customProperties.success = args.left === args.right;
                break;
            case "!=":
                tag.customProperties.success = args.left !== args.right;
                break;
            case ">":
                tag.customProperties.success = args.left > args.right;
                break;
            case ">=":
                tag.customProperties.success = args.left >= args.right;
                break;
            case "<":
                tag.customProperties.success = args.left < args.right;
                break;
            case "<=":
                tag.customProperties.success = args.left <= args.right;
                break;
            default:
                throw new AttributeError("Invalid `if` comparison");
        }
    } else if (typeof args.value !== "undefined") {
        tag.customProperties.success = !!args.value;
    } else {
        throw new TagError("Invalid `if` tag");
    }

    return tag.customProperties.success ? children : [];
}