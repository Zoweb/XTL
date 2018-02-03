/**********************************************************\
 * Runs the parser using `example.xtl`, then logs the AST *
\**********************************************************/

const parse = require("./parser.clean");
const fs = require("fs");
const util = require("util");
const intermediateCompiler = require("../compiler/intermediate");

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

intermediateCompiler()