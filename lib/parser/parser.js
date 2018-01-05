const fs = require("fs");

const Part = require("./Part");
const Token = require("./Token");

// TODO: Write tests

module.exports = function parse(originalString, logErrors, debug) {
    let str = originalString;
    let strStart = 0, currentItem = new Part("Program", 0, str);

    let previousStrStart;

    let debugIndent = 0, indentLevelsOverTime = [];
    function indent(width = debugIndent) {
        let str = "";
        for (let i = 0; i < width; i++) str += i % 4 ? " " : "¦";
        return str;
    }

    function spaces(dist, char = " ") {
        return Array.from({length: dist}).map(a => char).join("");
    }

    function throwSyntaxError(message, tokenValue, recommendations, overrideIndex = strStart) {
        if (!logErrors) throw new SyntaxError(message);

        let errorPart = new Part("", overrideIndex, originalString);
        if (debug) console.log(indent() + "\\ [91mOops, [0man error occured here.");
        let text = `${message}[0m${
            tokenValue ? ": " + tokenValue : ""
        } at [4m${errorPart.line}:${errorPart.column}[0m.${
            recommendations ? "\n\t[36mRecommendations to fix it: [0m" + recommendations : ""
        }`;

        console.log("\n\n");
        let line = originalString.split("\n")[errorPart.line - 1];
        let indentAmount = line.match(/^\s+/) ? line.match(/^\s+/)[0].length : 0;
        line = spaces(indentAmount, "·") + line.trim();
        line = `${line.substr(0, errorPart.column - 1)}[91m${line.substr(errorPart.column - 1, 1)}[0m${line.substr(errorPart.column)}`;
        console.log(" [33mError-producing code: [0m…" + line + "…");
        console.log(spaces(23 + errorPart.column) + "↑");
        console.log(`${spaces(20)}┄${spaces(errorPart.column + 2, "─")}┘ (@${errorPart.line}:${errorPart.column})`);
        console.log("\n[91mSyntax Error:[0m", text);
        process.exit(-1);
    }

    function lexr(name, regex) {
        return rule(name, val => str.match(regex) !== null &&
            str.match(regex).index === 0 &&
            val(str.match(regex)[0]));
    }

    function lexs(name, string) {
        return rule(name, val => str.indexOf(string) === 0 && val(string));
    }

    function rule(name, fn) {
        return (parentArray = []) => {
            debugIndent += 4;

            if (debug) console.log(indent() + "Testing for", name, "at [4m" + new Part("", strStart, originalString).line + ":" +
                new Part("", strStart, originalString).column + "[0m.");
            let result = fn(val => {
                indentLevelsOverTime.push([debugIndent, val]);
                if (debug) console.log(indent() + "\\ [32mFound it:[92m", val, "[0m");
                str = str.substr(val.length);
                parentArray.push(new Token(name, val, strStart, originalString));
                previousStrStart = strStart;
                strStart += val.length;
                return true;
            }, parentArray);

            let match = str.match(/^((\/\*((.|[\r\n])*?)\*\/)|(\/\/.*)|[\s\r\n])+/);
            if (match !== null) {
                if (debug) console.log(indent() + "([33m Skipped whitespace and comments of", match[0].length, "characters at",
                    new Part("", strStart, originalString).line + ":" + new Part("", strStart, originalString).column,
                    "to", new Part("", strStart + match[0].length, originalString).line + ":" +
                    new Part("", strStart + match[0].length, originalString).column, "[0m)");
                str = str.substr(match[0].length);
                strStart += match[0].length;
            }

            /*while (true) {
                if (!((name !== "Multiline Comment" && multiLineComment()) ||
                        (name !== "Singleline Comment" && singleLineComment()) ||
                        (name !== "Whitespace" && ignore()))) return result;
            }*/
            debugIndent -= 4;
            return result;
        }
    }


    const string = lexr("String", /".*?"/);
    const boolean = lexr("Boolean", /true|false/);
    const identifier = lexr("Identifier", /[a-zA-Z][a-zA-Z0-9-_]*/);
    const multiLineComment = lexr("Multiline Comment", /\/\*((?:.|[\r\n])*?)\*\//);
    const singleLineComment = lexr("Singleline Comment", /\/\/.*/);

    const equals = lexs("Equals Symbol", "=");
    const dollar = lexs("Dollar Symbol", "$");
    const openSquareBrack = lexs("Open Square Bracket", "[");
    const closeSquareBrack = lexs("Close Square Bracket", "]");
    const openSquigBrack = lexs("Open Squig Bracket", "{");
    const closeSquigBrack = lexs("Close Squig Bracket", "}");
    const openTriangleBrack = lexs("Open Triangle Bracket", "<");
    const closeTriangleBrack = lexs("Close Triangle Bracket", ">");
    const upArrow = lexs("Up Arrow", "^");
    const openBrack = lexs("Open Bracket", "(");
    const closeBrack = lexs("Close Bracket", ")");
    const at = lexs("At Symbol", "@");
    const hash = lexs("Hash Symbol", "#");
    const semicolon = lexs("Semicolon Symbol", ";");
    const comma = lexs("Comma Symbol", ",");
    const number = lexr("Number", /[0-9](\.[0-9]+)?/);

    const textSection = lexr("Text Section", /<((?:.|[\r\n])*?)>/);

    const ignore = lexr("Whitespace", /\s/);

    let i = 0;
    // Rules
    const tags = rule("Tags", () => {
        if (!openSquigBrack()) return false;
        if (!tag()) return false;

        while (tag());

        return closeSquigBrack();
    });

    const tag = rule("Tag", () => {
        let arr = [], oldCurrentItem = currentItem;
        let part = new Part("Tag", strStart, originalString, {
            name: "[initial tag name] " + ++i,

            flags: {
                macro: false,
                compiled: false,

                auto: false
            },

            attributes: []
        });

        if (at()) {
            part.data.flags.macro = true;
        } else if (hash()) {
            part.data.flags.compiled = true;
        }

        if (identifier(arr)) {
            part.data.name = arr.pop().data.value;
        } else if (upArrow()) {
            part.data.flags.auto = true;
            part.data.name = "^";
        } else {
            return false;
        }
        let origName = part.data.name;

        let noAttributesSection = false;
        if (!attributes(part.data.attributes)) {
            noAttributesSection = true;
        }

        currentItem = part;
        if (!textSection(currentItem.children) && !tags()) {
            if (openSquareBrack() || openSquigBrack() || openTriangleBrack()) throwSyntaxError("Missing tag name", "",
                "Add a tag name or `^` to use the previous tag's name instead.");
            if (noAttributesSection) {
                let errFix = "Check to see that you aren't missing a `[`, `{` or `<`.", idx = strStart;

                if (closeTriangleBrack() || closeSquigBrack()) {
                    errFix = "You seem to have used the wrong bracket. " +
                        "Try using `<` or `{`.";
                    idx = previousStrStart;
                }

                throwSyntaxError("Invalid tag", "", errFix, idx);
            }
            if (!semicolon()) {
                let errFix = "If the tag is not supposed to have a body, add a semicolon at the end of the tag. A `{` " +
                    "or `<` may have also been missed to start the tag's body section.", idx = strStart;

                if (closeTriangleBrack() || closeSquigBrack()) {
                    errFix = "You seem to have used the wrong bracket. " +
                        "Try using `<` or `{`.";
                    idx = previousStrStart;
                }

                throwSyntaxError("Tag must end in semicolon if children are not specified", "", errFix, idx);
            }
        }

        oldCurrentItem.children.push(part.abstract());
        currentItem = oldCurrentItem;

        return true;
    });
    const attribute = rule("Attribute", (a, array) => {
        let arr = [], i = strStart;

        if (expression(arr)) {
            array.push({
                key: "value",
                value: arr[0].abstract()
            });
            return true;
        }

        if (!identifier(arr)) return false;
        if (!equals()) return false;
        if (!expression(arr)) return false;

        array.push({
            key: arr[0].data.value,
            value: arr[1].abstract()
        });

        return true;
    });
    const attributes = rule("Attributes", (a, array) => {
        if (!openSquareBrack()) return false;

        let arr = [];//, oldCurrentItem = currentItem;
        /*currentItem = new Node("Arguments", strStart, originalString, {
            arguments: arr
        });*/

        if (!attribute(arr)) {
            //currentItem = oldCurrentItem;
            return false;
        }
        while (comma()) {
            attribute(arr);
        }

        //currentItem = oldCurrentItem;

        array.push(...arr);

        return closeSquareBrack();
    });
    const expression = rule("Expression", (val, arr) => {
        if (string(arr)) {
            //currentItem.children.push(arr[0]);
            return true;
        }
        if (number(arr)) {
            //currentItem.children.push(arr[0]);
            return true;
        }
        if (boolean(arr)) {
            //currentItem.children.push(arr[0]);
            return true;
        }
        if (dollar() && identifier(arr)) {
            let name = arr.pop();
            arr.push(new Token("ElementValue", name.data.value, strStart, originalString));
            //currentItem.children.push(new Token("ElementKey", arr[1].data.value, strStart, originalString));
            return true;
        }

        return false;
    });

    let start = process.hrtime();
    while (true) {
        if (!tag()) {
            throwSyntaxError("Invalid tag", str.substr(0, 10));
        }
        if (strStart >= originalString.length) break;
    }

    if (debug) {
        indentLevelsOverTime.forEach((info) => {
            let level = info[0], val = info[1];
            console.log(`${spaces(level / 4, "█")} ${spaces(20 - (level / 4), ".")} (${val})`);
        });
    }

    return currentItem.abstract();
};

