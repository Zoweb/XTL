/**********************************************************\
 * Runs the parser using `example.xtl`, then logs the AST *
\**********************************************************/

const parse = require("./parser");
const fs = require("fs");
const util = require("util");

let result = parse(fs.readFileSync("example.xtl", "utf8"), true, true);

util.inspect.styles.boolean = "red";
util.inspect.styles.name = "yellow";
util.inspect.styles.string = "green";
util.inspect.styles.number = "magenta";
console.log(util.inspect(result, {
    showHidden: true,
    depth: null,
    colors: true
}));