import assert from "assert";

const { colorize, colorizeToArray } = require(`../${process.env.JSLIB ||
  "lib"}/colorize`);

describe("colorizeToArray", () => {
  test("should return ' <value>' for a scalar value", () =>
    assert.deepEqual([" 42"], colorizeToArray(42)));

  test("should return ' <value>' for 'null' value", () =>
    assert.deepEqual([" null"], colorizeToArray(null)));

  test("should return ' <value>' for 'false' value", () =>
    assert.deepEqual([" false"], colorizeToArray(false)));

  test("should return '-<old value>', '+<new value>' for a scalar diff", () =>
    assert.deepEqual(
      ["-42", "+10"],
      colorizeToArray({ __old: 42, __new: 10 })
    ));

  test("should return '-<old value>', '+<new value>' for 'null' and 'false' diff", () =>
    assert.deepEqual(
      ["-false", "+null"],
      colorizeToArray({ __old: false, __new: null })
    ));

  test("should return '-<removed key>: <removed value>' for an object diff with a removed key", () =>
    assert.deepEqual(
      [" {", "-  foo: 42", " }"],
      colorizeToArray({ foo__deleted: 42 })
    ));

  test("should return '+<added key>: <added value>' for an object diff with an added key", () =>
    assert.deepEqual(
      [" {", "+  foo: 42", " }"],
      colorizeToArray({ foo__added: 42 })
    ));

  test("should return '+<added key>: <added value>' for an object diff with an added key with 'null' value", () =>
    assert.deepEqual(
      [" {", "+  foo: null", " }"],
      colorizeToArray({ foo__added: null })
    ));

  test("should return '+<added key>: <added value>' for an object diff with an added key with 'false' value", () =>
    assert.deepEqual(
      [" {", "+  foo: false", " }"],
      colorizeToArray({ foo__added: false })
    ));

  test("should return '+<added key>: <added stringified value>' for an object diff with an added key and a non-scalar value", () =>
    assert.deepEqual(
      [" {", "+  foo: {", "+    bar: 42", "+  }", " }"],
      colorizeToArray({ foo__added: { bar: 42 } })
    ));

  test("should return ' <modified key>: <colorized diff>' for an object diff with a modified key", () =>
    assert.deepEqual(
      [" {", "-  foo: 42", "+  foo: 10", " }"],
      colorizeToArray({ foo: { __old: 42, __new: 10 } })
    ));

  test("should return '+<inserted item>' for an array diff", () =>
    assert.deepEqual(
      [" [", "   10", "+  20", "   30", " ]"],
      colorizeToArray([
        [" ", 10],
        ["+", 20],
        [" ", 30]
      ])
    ));

  test("should return '-<deleted item>' for an array diff", () =>
    assert.deepEqual(
      [" [", "   10", "-  20", "   30", " ]"],
      colorizeToArray([
        [" ", 10],
        ["-", 20],
        [" ", 30]
      ])
    ));

  test("should handle an array diff with subobject diff", () => {
    const input = [[" "], ["~", { foo__added: 42 }], [" "]];
    const expected = [
      " [",
      "   ...",
      "   {",
      "+    foo: 42",
      "   }",
      "   ...",
      " ]"
    ];
    console.log("output:\n%s", colorizeToArray(input).join("\n"));
    assert.deepEqual(colorizeToArray(input), expected);
  });
});

describe("colorize", () => {
  test("should return a string with ANSI escapes", () =>
    assert.equal(
      colorize({ foo: { __old: 42, __new: 10 } }),
      " {\n\u001b[31m-  foo: 42\u001b[39m\n\u001b[32m+  foo: 10\u001b[39m\n }\n"
    ));

  test("should return a string without ANSI escapes on { color: false }", () =>
    assert.equal(
      colorize({ foo: { __old: 42, __new: 10 } }, { color: false }),
      " {\n-  foo: 42\n+  foo: 10\n }\n"
    ));
});
