const Tag = require("./tag");

/**
 * Meta information about a tag, including a list of tags and other information
 */
module.exports = class TagMeta {
    /**
     * For internal use only
     * @private
     */
    constructor(tags, index, defineTag) {
        if (index > 0) this.previousTag = tags[index - 1];
        else this.previousTag = null;

        if (index < tags.length - 1) this.nextTag = tags[index + 1];
        else this.nextTag = null;

        this.tags = tags;
        this.tagIndex = index;

        this._defineTag = defineTag;
    }

    /**
     * Define a new action that will last for the rest of the program
     * @param {Tag} tag - The tag. Action name will be created from the tag's name.
     */
    defineTempConstantAction(tag) {
        if (!tag instanceof Tag) throw new TypeError("Invalid tag");

        this._defineTag(tag);
    }
};