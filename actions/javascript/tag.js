/**
 * Stores information about a tag
 */
module.exports = class Tag {
    /**
     * Checks that <code>name</code> is a valid tag name
     * @param {string} name - The tag name to test
     * @returns {boolean} <code>true</code> if the tag is valid
     */
    static isValidTagName(name) {
        return /^#?[a-z][a-z0-9-_]*$/gi.test(name);
    }

    static areValidAttributes(attributes) {
        for (const attrib of Object.values(attributes)) {
            if (!(typeof attrib === "string" ||
                    typeof attrib === "number" ||
                    typeof attrib === "boolean" ||
                    attrib instanceof Tag))
                return false;
        }
        for (const attrib of Object.keys(attributes)) {
            if (!/^[a-z][a-z0-9-_]*$/gi.test(attrib)) return false;
        }
        return true;
    }

    /**
     * Converts the tag name's case so that they are case-insensitive
     * @param {string} tagName - A tag name of any case
     * @returns {string} The tag in the target case
     */
    static convertTagNameCase(tagName) {
        return tagName.toLowerCase();
    }

    /**
     * Converts each attribute's key to one case so they are case-insensitive. Modifies original object.
     * @param {object} attributes - The attributes to change the case of
     * @returns {object} The attributes with keys changed to the target case
     */
    static convertAttributeCase(attributes) {
        for (const key in attributes) {
            if (!attributes.hasOwnProperty(key)) continue;

            let lower = key.toLowerCase();
            if (key !== lower) {
                attributes[lower] = attributes[key];
                delete attributes[key];
            }
        }

        return attributes;
    }

    static convertAttributeSubTag(attributes) {
        for (const key in attributes) {
            if (!attributes.hasOwnProperty(key)) continue;
            let value = attributes[key];

            if (value instanceof Tag) {
                if (typeof value.attributes[key] !== "undefined") {
                    attributes[key] = value.attributes[key];
                    continue;
                }
                if (typeof value.attributes.value !== "undefined") {
                    attributes[key] = value.attributes.value;
                    continue;
                }
                if (value.children.length > 0) {
                    if (typeof value.children[0].attributes[key] !== "undefined") {
                        attributes[key] = value.children[0].attributes[key];
                        continue;
                    }
                    if (typeof value.children[0].attributes.value !== "undefined") {
                        attributes[key] = value.children[0].attributes.value;
                        continue;
                    }
                }

                throw new ReferenceError("No `" + key + "` or `value` attribute on tag or first child");
            }
        }

        return attributes;
    }

    /**
     * The tag's name
     * @type {string}
     */
    get name() {
        return this._name;
    }

    /**
     * The tag's attributes
     * @type {{[string]: string | number | boolean | Tag}}
     */
    get attributes() {
        return this._attributes;
    }

    /**
     * @param {{[string]: string | number | boolean | Tag}} value
     */
    set attributes(value) {
        if (typeof value !== "object") throw new TypeError("Attributes must be an object");
        if (!Tag.areValidAttributes(value)) throw new TypeError("Attributes must only contain strings, numbers, " +
            "booleans, and Tags");

        this._attributes = value;
        Tag.convertAttributeCase(this._attributes);
        Tag.convertAttributeSubTag(this._attributes);
    }

    /**
     * The tag's children
     * @returns {Tag[]}
     */
    get children() {
        return this._children;
    }

    /**
     * @param {Tag[]} value
     */
    set children(value) {
        if (!(value instanceof Array && value.every(a => a instanceof Tag)))
            throw new TypeError("Children must be an array of Tags");

        this._children = value;
    }

    get meta() {
        // TODO: Add meta. Requires parser.
        throw new ReferenceError("Not completed");
    }

    /**
     * Creates a new instance of Tag
     * @param {string} name - The tag's name
     * @param {{[string]: string | number | boolean | Tag} | Tag[]} attributes_children - Tag attributes OR children
     * @param {Tag[]} children - The tag's children
     */
    constructor(name, attributes_children = {}, children = []) {
        if (attributes_children instanceof Array) children = attributes_children, attributes_children = {};

        if (!Tag.isValidTagName(name)) throw new TypeError("Invalid tag name");

        this._name = Tag.convertTagNameCase(name);
        this.attributes = attributes_children;
        this.children = children;
        this.customProperties = {};
    }
};