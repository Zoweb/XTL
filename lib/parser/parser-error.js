function englishArrayJoin(array, endSeparator = "and") {
    //return array.map((el, i) => i < array.length - 1 ? el + (i < array.length - 2 ? "," : "") : endSeparator + " " + el).join(" ");
    if (array.length === 0) return "";
    if (array.length === 1) return array[0];
    return [array.slice(0, -1).join(", "), endSeparator, array.slice(-1)].join(" ");
}

class ParserError extends Error {
    /**
     * Create a new parser error
     * @param {Part} found - The found token
     * @param {Part|Part[]} expected - The expected token
     * @param {string} helpMessage - A message to help the user fix the error
     */
    constructor(found, expected, helpMessage = "") {
        if (!(expected instanceof Array)) expected = [expected];
        let expectedNames = expected.map(e => e.name);

        super(`Expected ${englishArrayJoin(expectedNames, "or")}, found ${found.name} at ${found.position()}`);

        this.expected = expected;
        this.found = found;
        this.help = helpMessage;
        this.token = found;
        this.shortMessage = `Expected ${englishArrayJoin(expectedNames, "or")}, found ${found.name}.`;
    }
}
module.exports = ParserError;

class ParserSyntaxError extends Error {
    constructor(token) {
        super(`Invalid token at ${token.position()}`);

        this.token = token;
        this.shortMessage = `Invalid token`;
    }
}
module.exports.ParserSyntaxError = ParserSyntaxError;
