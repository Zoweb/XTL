const Part = require("./Part");

// TODO: Write tests

/**
 * Stores information about a token
 */
module.exports = class Token extends Part {
    /**
     * Creates a new Token
     * @param {string} name
     * @param {string} value
     * @param {int} index
     * @param {string} source
     */
    constructor(name, value, index, source) {
        super(name, index, source, {
            value: value
        });
    }
};