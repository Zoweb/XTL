const assert = require("assert");
const fs = require("fs");

const Tag = require("../../actions/javascript/tag");

const ifAction = require("../../actions/javascript/if");

describe("Javascript Actions", function() {
    describe("Tag", function() {
        describe("Constructor", function() {
            describe("Name Argument", function() {
                it("should accept tag starting with #", function() {
                    assert.doesNotThrow(() => {
                        new Tag("#valid-tag");
                    }, TypeError);
                });
                it("should accept tag starting with a letter", function() {
                    assert.doesNotThrow(() => {
                        new Tag("valid-tag");
                    }, TypeError);
                });

                it("should not accept tag starting with a dash", function() {
                    assert.throws(() => {
                        new Tag("-invalid-tag");
                    }, TypeError);
                });
                it("should not accept tag starting with a number", function() {
                    assert.throws(() => {
                        new Tag("3invalid-tag");
                    }, TypeError);
                });

                it("should not accept tag containing a hash", function() {
                    assert.throws(() => {
                        new Tag("invalid#tag");
                    }, TypeError);
                });
                it("should not accept a tag containing invalid characters", function() {
                    assert.throws(() => {
                        new Tag("invalid&tag");
                    }, TypeError);
                });

                it("should set name to supplied name, with case converted", function() {
                    assert.equal(new Tag("valid-tag").name, Tag.convertTagNameCase("valid-tag"));
                });
            });
            describe("Attributes Argument", function() {
                describe("Keys", function() {
                    it("should accept tag starting with a letter", function() {
                        assert.doesNotThrow(() => {
                            new Tag("name", {'valid-tag': false});
                        }, TypeError);
                    });

                    it("should not accept tag starting with a dash", function() {
                        assert.throws(() => {
                            new Tag("name", {'-invalid-tag': false});
                        }, TypeError);
                    });
                    it("should not accept tag starting with a number", function() {
                        assert.throws(() => {
                            new Tag("name", {'4invalid-tag': false});
                        }, TypeError);
                    });

                    it("should not accept tag starting with #", function() {
                        assert.throws(() => {
                            new Tag("name", {'#invalid-tag': false});
                        }, TypeError);
                    });
                    it("should not accept tag containing a #", function() {
                        assert.throws(() => {
                            new Tag("name", {'invalid#tag': false});
                        }, TypeError);
                    });
                    it("should not accept a tag containing invalid characters", function() {
                        assert.throws(() => {
                            new Tag("name", {'invalid$tag': false});
                        }, TypeError);
                    });
                });

                describe("Values", function() {
                    it("should accept attributes containing strings", function () {
                        assert.doesNotThrow(() => {
                            new Tag("name", {
                                key: "string",
                                key2: "other string"
                            });
                        }, TypeError);
                    });
                    it("should accept attributes containing numbers", function () {
                        assert.doesNotThrow(() => {
                            new Tag("name", {
                                key: 4,
                                key2: 7.3
                            });
                        }, TypeError);
                    });
                    it("should accept attributes containing booleans", function () {
                        assert.doesNotThrow(() => {
                            new Tag("name", {
                                key: true,
                                key2: false
                            });
                        }, TypeError);
                    });
                    it("should accept attributes containing Tags", function () {
                        assert.doesNotThrow(() => {
                            new Tag("name", {
                                key: new Tag("foo", {key: ""}),
                                key2: new Tag("bar", {key2: ""})
                            });
                        }, TypeError);
                    });

                    it("should accept attributes containing a mixture", function () {
                        assert.doesNotThrow(() => {
                            new Tag("name", {
                                string: "string",
                                number: 4,
                                boolean: true,
                                tag: new Tag("foo", {tag: ""})
                            });
                        }, TypeError);
                    });

                    it("should not accept attributes containing anything else", function () {
                        assert.throws(() => {
                            new Tag("name", {
                                object: {},
                                array: [],
                                'unknown-thing': new Error()
                            });
                        }, TypeError);
                    });
                });

                describe("Overloads", function() {
                    it("should accept an array from overload", function() {
                        assert.doesNotThrow(() => {
                            new Tag("name", []);
                        }, TypeError);
                    });
                });
            });

            describe("Children Argument", function() {
                it("should accept an empty array", function() {
                    assert.doesNotThrow(() => {
                        new Tag("name", {}, []);
                    }, TypeError);
                });
                it("should accept an array full of Tags", function() {
                    assert.doesNotThrow(() => {
                        new Tag("name", {}, [new Tag("name"), new Tag("name")]);
                    }, TypeError);
                });

                it("should not accept an array with any element that is not a Tag", function() {
                    assert.throws(() => {
                        new Tag("name", {}, [new Tag("name"), true]);
                    }, TypeError);
                });
            });
        });

        // TODO: Tag properties
        describe.skip("Properties", function() {});
    });

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