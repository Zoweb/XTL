const Part = require("./Part");

class TokenArray {
    _tokenIndexToSourceIndex(index) {
        return this.tokens.reduce((prev, current) => {
            prev += current.length;
            if (prev > index) prev = index;
            return prev;
        }, 0);
    }

    next() {
        this.index++;
        return this.cut.shift() || new Part("EOF", this._tokenIndexToSourceIndex(this.index), "");
    }
    skip() {
        this.index++;
        this.cut.shift();
    }
    lookAhead() {
        return this.cut[0] || new Part("EOF", this._tokenIndexToSourceIndex(this.index), "");
    }
    reload() {
        this.index--;
        this.cut.unshift(this.tokens[this.index]);
    }

    constructor(tokens) {
        this.tokens = tokens;
        this.cut = tokens.slice(0); // simple clone
        this.index = 0;
    }
}
module.exports = TokenArray;