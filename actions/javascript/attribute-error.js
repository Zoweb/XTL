/**
 * Represents an error from an incorrect attribute value
 */
class AttributeError extends Error {
    /**
     * Creates a new instance of AttributeError with the specified message
     * @param {string?} message
     */
    constructor(message) {
        super(message);
    }
}