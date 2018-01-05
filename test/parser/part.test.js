const assert = require("assert");
const Part = require("../../lib/parser/Part");

describe("Part", function() {
    describe("Location in Source", function() {
        beforeEach(function() {
            this.instance = new Part("test", 30, `multiline
text should
work with differing

lengths (including very long lines, which should not slow it down) and empty



lines.`, {});
        });

        describe("#get line()", function() {
            it("should give the correct line", function() {
                assert.equal(this.instance.line, 3);
            });
        });
        describe("#get column()", function() {
            it("should give the correct column", function() {
                assert.equal(this.instance.column, 9);
            });
        });

        describe("#abstact()", function() {
            before(function() {
                this.abstract = (testData = {}) => {
                    this.instance.data = testData;
                    return this.instance.abstract();
                };
            });

            it("should have the correct name", function() {
                assert.equal(this.abstract().type, "test");
            });
            it("should have a `value` property when only that is set on `data`", function() {
                assert.equal(this.abstract({value: "val"}).value, "val");
            });
            it("should use original object if there is not only a `value` property", function() {
                assert.deepEqual(this.abstract({value: "val", otherProps: true}).data, {value: "val", otherProps: true});
            });
            it("should use the original object if there is no `value` property", function() {
                assert.deepEqual(this.abstract({otherProps: true}).data, {otherProps: true});
            })
        });
    });
});