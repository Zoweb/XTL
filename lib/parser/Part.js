/**
 * Stores information about a part in an ST
 */
module.exports = class Node {
    /**
     * Gets the line that this Node is, from the source
     * @returns {number}
     */
    get line() {
        if (this._line) return this._line;

        this._line = 1;
        this._row = 1;
        for (let i = 0; i < this.index; i++) {
            if (!(this.source[i] === "\n")) {
                this._row++;
                continue;
            }

            this._row = 1;
            this._line++;
        }

        return this._line;
    }

    /**
     * Gets the column in the line that this Node is at, from the source
     * @returns {number}
     */
    get column() {
        if (typeof this._row === "undefined") this.line;
        return this._row;
    }

    /**
     * Creates a new instance of Node
     * @param {string} name - The name of this part
     * @param {int} index - The index in source that this part is at
     * @param {string} source - The source code that this part is from
     * @param {object} data - Any extra data about this part
     */
    constructor(name, index, source, data = {}) {
        this.name = name;
        this.index = index;
        this.source = source;
        this.data = data;
        this.children = [];

        // remove the `source` key
        // but first we have to generate the line information
        this.line;
        delete this.source;
    }

    abstract() {
        let retObj = {
            type: this.name,
            children: this.children
        };

        if (this.data.value && Object.keys(this.data).length === 1) retObj.value = this.data.value;
        else retObj.data = this.data;

        return retObj;
    }

    position() {
        return `${this.line}:${this.column}`;
    }
};