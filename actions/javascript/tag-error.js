/**
 * Represents an error from an incorrect tag
 */
module.exports = class TagError extends Error {
    /**
     * Creates a new instance of TagError with the specified message
     * @param {string?} message
     */
    constructor(message) {
        super(message);
    }
};