/**
 * Copyright (c) 2018, zoweb
 *
 * See the license in the LICENSE file (downloaded with this repository, in the root folder)
 * By using this code, you agree to the license in the file specified (the MIT license)
 */

const Part = require("./part");
const Token = require("./token");
const Parser = require("./rule");
const ParserError = require("./parser-error");
const fs = require("fs");

function acctime() {
    let hrTime = process.hrtime();
    return hrTime[0] * 1000 + hrTime[1] / 1000000;
}

function removeEdges(source) {
    return source.substr(1, source.length - 2);
}

module.exports = function(source) {
    const parser = new Parser(source);

    const string =      parser.createLexr("String", /".*?"/);
    const boolean =     parser.createLexr("Boolean", /true|false/);
    const textSection = parser.createLexr("TextSection", /<((?:.|[\r\n])*?)>/);
    const identifier =  parser.createLexr("Identifier", /[a-zA-Z][a-zA-Z0-9-_]*/);
    const number =      parser.createLexr("Number", /[0-9](\.[0-9]+)?/);
    const eof =         Parser.endOfFile;

    const equals =             parser.createLexs("EqualityComparison", "=");
    const openSquareBrack =    parser.createLexs("OpenAttributesArea", "[");
    const closeSquareBrack =   parser.createLexs("CloseAttributesArea", "]");
    const openSquigBrack =     parser.createLexs("OpenChildrenArea", "{");
    const closeSquigBrack =    parser.createLexs("CloseChildrenArea", "}");
    const dollar =             parser.createLexs("AttributeTagNameIndicator", "$");
    const star =               parser.createLexs("AttributeNodeIndicator", "*");
    const upArrow =            parser.createLexs("AutoIndicator", "^");
    const at =                 parser.createLexs("MacroIndicator", "@");
    const hash =               parser.createLexs("CompileIndicator", "#");
    const semicolon =          parser.createLexs("EndStatement", ";");
    const comma =              parser.createLexs("Separator", ",");

    parser.ignore(/\/\*((?:.|[\r\n])*?)\*\//);
    parser.ignore(/\/\/.*/);
    parser.ignore(/\s+/);

    const tokens = parser.tokenise();

    function parseTags(container) {
        while (tokens.lookAhead().name !== closeSquigBrack.name && tokens.lookAhead().name !== eof.name) {
            let tag = parseTag();
            container.push(tag);
        }

        // Skip the "}" so that we don't think that it is the end of the parent group too
        tokens.skip();
    }

    function parseTag() {
        let tagData = {
            name: "",
            attributes: {},
            children: [],
            compiled: false,
            macro: false,
            text: {
                use: false,
                value: ""
            }
        };

        parseTagName(tagData);
        let token = tokens.next();

        switch (token.name) {
            case openSquareBrack.name: {
                parseTagAttributes(tagData);
                token = tokens.next();
                switch (token.name) {
                    case openSquigBrack.name:
                        parseTags(tagData.children);
                        break;
                    case textSection.name:
                        tagData.text.use = true;
                        tagData.text.value = removeEdges(token.data.value);
                        break;
                    case semicolon.name:
                        break;
                    default:
                        throw new ParserError(token, [openSquigBrack, semicolon], "Add children or a semicolon if there are no children.");
                }
                break;
            }
            case openSquigBrack.name:
                parseTags(tagData.children);
                break;
            case textSection.name:
                tagData.text.use = true;
                tagData.text.value = removeEdges(token.data.value);
                break;
            case semicolon.name:
                break;
            default:
                throw new ParserError(token, [openSquareBrack, openSquigBrack, semicolon], "Add attributes or children, or a semicolon when both are empty.");
        }

        return tagData;
    }

    function parseTagName(data) {
        let token = tokens.next();

        switch (token.name) {
            case identifier.name:
                data.name = token.data.value;
                break;
            case upArrow.name:
                data.name = null;
                break;
            case hash.name:
                if (data.macro) throw new ParserError(token, identifier, "A tag can't be a macro and compiled. Remove either the `#` or the `@`.");
                if (data.compiled) throw new ParserError(token, identifier, "Can't use compile indicator more than once.");
                data.compiled = true;
                parseTagName(data);
                break;
            case at.name:
                if (data.compiled) throw new ParserError(token, identifier, "A tag can't be a macro and compiled. Remove either the `#` or the `@`.");
                if (data.macro) throw new ParserError(token, identifier, "Can't use macro indicator more than once.");
                data.macro = true;
                parseTagName(data);
                break;
            default:
                throw new ParserError(token, [identifier, upArrow, hash, at], "Put a tag name or a `^` here.");
        }
    }

    function parseTagAttributes(data) {
        let token;

        attributeLoop: while (true) {
            parseTagAttribute(data);

            token = tokens.next();
            switch (token.name) {
                case comma.name:
                    break;
                case closeSquareBrack.name:
                    break attributeLoop;
                default:
                    throw new ParserError(token, [comma, closeSquareBrack], "Use a `,` to separate attributes, or a `]` to end the attribute section.");
            }
        }
    }

    function parseTagAttribute(data) {
        let token = tokens.next(), attributeData = {
            name: "",
            value: "",
            type: ""
        };

        switch (token.name) {
            case identifier.name: {
                attributeData.name = token.data.value;

                token = tokens.next();
                if (token.name !== equals.name) throw new ParserError(token, equals, "Use `=` as the key/value separator.");

                token = tokens.next();
                attributeData.value = token.data.value;
                switch (token.name) {
                    case string.name:
                        attributeData.type = "string";
                        attributeData.value = removeEdges(attributeData.value);
                        break;
                    case number.name:
                        attributeData.type = "number";
                        break;
                    case boolean.name:
                        attributeData.type = "boolean";
                        break;
                    case dollar.name: {
                        attributeData.type = "tag";

                        token = tokens.next();
                        if (token.name === identifier.name) {
                            attributeData.value = token.data.value;
                        } else {
                            throw new ParserError(token, identifier, "Expected action name here.");
                        }
                        break;
                    }
                    case star.name:
                        attributeData.type = "node";
                        attributeData.value = parseTag();
                        break;
                    default:
                        throw new ParserError(token, [string, number, boolean, star, dollar], "Put a primitive (string, number, boolean, tag name, node) here.");
                }

                break;
            }
            case string.name:
                attributeData.name = "value";
                attributeData.value = removeEdges(token.data.value);
                attributeData.type = "string";
                break;
            case number.name:
                attributeData.name = "value";
                attributeData.value = token.data.value;
                attributeData.type = "number";
                break;
            case boolean.name:
                attributeData.name = "value";
                attributeData.value = token.data.value;
                attributeData.type = "boolean";
                break;
            case dollar.name: {
                attributeData.name = "value";
                attributeData.type = "tag";

                token = tokens.next();
                if (token.name === identifier.name) {
                    attributeData.value = token.data.value;
                } else {
                    throw new ParserError(token, identifier, "Expected action name here.");
                }
                break;
            }
            case star.name:
                attributeData.name = "value";
                attributeData.type = "node";
                attributeData.value = parseTag();
                break;
            case closeSquareBrack.name:
                tokens.reload();
                break;
            default:
                throw new ParserError(token, [identifier, string, number, boolean], "Use an attribute name or a value here.");
        }

        data.attributes[attributeData.name] = attributeData;
    }

    let tags = [];
    parseTags(tags);

    return tags;
};

process.on("uncaughtException", err => {
    if (!err.token) {
        return console.error(err);
    }

    let changeColourCharacter = "\u001b";

    let text = `${changeColourCharacter}[91mIt looks like an error has occurred: ${changeColourCharacter}[0m${err.shortMessage} ${changeColourCharacter}[91mat ${changeColourCharacter}[0m${changeColourCharacter}[4m${err.token.position()}${changeColourCharacter}[0m.`;

    let line = err.token.source.split("\n")[err.token.line - 1],
        indentAmount = /^\s+/.test(line) ? line.match(/^\s+/)[0].length : 0;
    line = "·".repeat(indentAmount) + line.trim();
    line = `${line.substr(0, err.token.column - 1)}${changeColourCharacter}[91m${line.substr(err.token.column - 1, err.token.data.value ? err.token.data.value.length : 1)}${changeColourCharacter}[0m${line.substr(err.token.column + (err.token.data.value ? err.token.data.value.length - 1 : 0))}`;

    console.error(text);
    console.log(` ${changeColourCharacter}[33mError-producing code: ${changeColourCharacter}[32m[L${err.token.line}]${changeColourCharacter}[0m ${line.substr(0, 80)} …`);
    console.log(" ".repeat(25 + err.token.line.toString().length + err.token.column), "↑");
    if (err.help) {
        console.log(`${changeColourCharacter}[36mSuggestions: ${changeColourCharacter}[0m${err.help}`);
    } else if (err instanceof ParserError.ParserSyntaxError) {
        console.log(`${changeColourCharacter}[36mAs this is a tokenising error, we don't know how you can fix it.${changeColourCharacter}[0m`);
    } else {
        console.log(`${changeColourCharacter}[36mWe don't know how to fix this yet.${changeColourCharacter}[0m`);
    }

    console.log("\nStack:");
    console.error(err.stack);
});