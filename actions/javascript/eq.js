const TagError = require("./tag-error");

if (!String.prototype.repeat) String.prototype.repeat = count => {
    if (count < 1) return "";

    let result = "", pattern = this.valueOf();
    while (count > 1) {
        if (count & 1) result += pattern;
        count >>= 1;
        pattern += pattern;
    }

    return result + pattern;
};

/**
 * Run an operation on key, using with otherkey's value. See operations section below.
 *
 * @param tag - The current tag
 * @param args - A dictionary of the arguments
 * @param children - A list of the children
 */
module.exports = function eqAction(tag, args, children) {
    if (typeof args.key === "undefined") throw new TagError("Invalid `eq` tag");

    let newValue;

    if (args.operation === "++") {
        newValue = args.key + 1;
    } else if (args.operation === "--") {
        if (typeof args.key !== "number") throw new AttributeError("key must be a number with `--` operation");
        newValue = args.key - 1;
    } else {
        if (typeof args.otherkey === "undefined")
            throw new AttributeError("otherkey must be defined with `" + args.operation + "` operation");

        switch (args.operation) {
            case "+":
                newValue = args.key + args.otherkey;
                break;
            case "-":
                if (typeof args.key !== "number" || typeof args.otherkey !== "number")
                    throw new AttributeError("key and otherkey must both be numbers with `-` operation");
                break;
            case "*":
                if (typeof args.otherkey !== "number")
                    throw new AttributeError("otherkey must be a number with `*` operation");
                if (typeof args.key === "number") {
                    newValue = args.key * args.otherkey;
                    break;
                }
                newValue = args.key.repeat(args.otherkey);
                break;
            case "/":
                if (typeof args.key !== "number" || typeof args.otherkey !== "number")
                    throw new AttributeError("key and otherkey must both be numbers with `/` operation");
                newValue = args.key / args.otherkey;
                break;
            case "%":
                if (typeof args.key !== "number" || typeof args.otherkey !== "number")
                    throw new AttributeError("key and otherkey must both be numbers with `-` operation");
                newValue = args.key % args.otherkey;
                break;
            default:
                throw new TagError("Invalid `eq` tag");
        }
    }

    tag.attributes.value = newValue;

    return [];
};