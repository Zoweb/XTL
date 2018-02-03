/**
 * Copyright (c) 2018, zoweb
 *
 * See the license in the LICENSE file (downloaded with this repository, in the root folder)
 * By using this code, you agree to the license in the file specified (the MIT license)
 */

const Token = require("./token");
const Part = require("./part");
const TokenArray = require("./token-array");
const {ParserSyntaxError} = require("./parser-error");

class Tokeniser {
    static get endOfFile() {
        return Token.fromName("EOF");
    }

    /**
     * Create a token from a RegExp pattern
     * @param {string} name - The token's name
     * @param {RegExp} pattern - The pattern to match when searching for tokens
     * @returns {Token}
     */
    createLexr(name, pattern) {
        this.rules.push({
            name: name,
            matches: source => pattern.test(source) && source.match(pattern).index === 0 ? source.match(pattern)[0] : null
        });
        return Token.fromName(name);
    }

    /**
     * Create a token from a string
     * @param {string} name - The token's name
     * @param {string} value - The string to match (exactly) when searching for tokens
     * @returns {Token}
     */
    createLexs(name, value) {
        this.rules.push({
            name: name,
            matches: source => source.indexOf(value) === 0 ? value : null
        });
        return Token.fromName(name);
    }

    /**
     * Specify a pattern to ignore when tokenising
     * @param {RegExp} pattern - The pattern to ignore
     */
    ignore(pattern) {
        if (this.skips.indexOf(pattern) === -1) {
            this.skips.push(pattern);
        }
    }

    /**
     * Tokenises the source.
     * Note: If `force` is true, YOU NEED TO HAVE AN EOF LEX. Otherwise there will be an infinite loop!
     * @param {boolean} [force=false] - Forces the tokeniser to continue even if there is a syntax error. Useful for a syntax highlighter
     * @returns TokenArray
     */
    tokenise(force = false) {
        let tokens = [], match;

        do {
            match = false;

            for (const lex of this.rules) {
                let val = lex.matches(this.srcCut);
                if (!val) continue;

                tokens.push(new Token(lex.name, val, this.index, this.src));
                this.index += val.length;
                this.srcCut = this.srcCut.substr(val.length);

                match = true;
                break;
            }
            for (const skip of this.skips) {
                let skipMatch = this.srcCut.match(skip);
                if (skipMatch && skipMatch.index === 0) {

                    this.index += skipMatch[0].length;
                    this.srcCut = this.srcCut.substr(skipMatch[0].length);

                    match = true;
                    break;
                }
            }

            if (!match && this.index < this.src.length && force) {
                console.warn("Found syntax error but force tokenise is enabled ( at", this.index, ")");

                this.index++;
                this.srcCut = this.srcCut.substr(1);

                tokens.push(new Token("INVALID", "", this.index, this.src));

                match = true;
            }

            if (this.index === this.src.length) break;
        } while (match);

        if (this.index !== this.src.length) throw new ParserSyntaxError(new Part("", this.index, this.src));
        return new TokenArray(tokens);
    }

    /**
     * Create a new tokeniser from text
     * @param {string} source - The source text
     */
    constructor(source) {
        this.src = source;
        this.srcCut = source;

        this.index = 0;

        this.rules = [];
        this.skips = [];
    }
}
module.exports = Tokeniser;