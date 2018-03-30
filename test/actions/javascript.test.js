const assert = require("assert");
const fs = require("fs");

const Tag = require("../../actions/javascript/tag");

const ifAction = require("../../actions/javascript/if");

describe("Javascript Actions", function() {
    // TODO: When meta is ready
    describe.skip("Mixin", function() {});

    describe("If", function() {
        describe("Left, Compare, Right overload", function() {
            it("should keep children if condition is true", function() {
                let children = [new Tag("successful")];
                let args = {
                    left: 5,
                    compare: "=",
                    right: 5
                };
                let tag = new Tag("if", args, children);

                let result = ifAction(tag, args, children);

                assert.deepStrictEqual(result, children);
            });
            it("should not keep children if condition is false", function() {
                let children = [new Tag("successful")];
                let args = {
                    left: 4,
                    compare: "=",
                    right: 5
                };
                let tag = new Tag("if", args, children);

                let result = ifAction(tag, args, children);

                assert.deepStrictEqual(result, []);
            });

            it("should not throw an error if comparison is invalid", function() {
                let children = [new Tag("successful")];
                let args = {
                    left: 4,
                    compare: "foo",
                    right: 5
                };
                let tag = new Tag("if", args, children);

                assert.throws(() => {
                    ifAction(tag);
                });
            });
        });
    });

    // TODO: Finish of tests
});