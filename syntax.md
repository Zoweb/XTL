eXtensible Tag Language (XTL)
=============================
A new way to write HTML, but as a programming language!

The general syntax
------------------

Each tag is written on a new 'line' as follows:

```xtl
tag[args] {
    Children
}
```

**Note**: There do not need to be newlines at any time, they are purely
          for style.

This is the full syntax for tags, used when you need everything (a
    different tag name to the previous one, tag arguments, and tag
    children). However, you do not need to use all of these.

For example, if the tag's name was the same as the previous, the tag
    name can be omitted:

```xtl
[args] {
    Children
}
```

If you were not supplying any arguments to the tag, you could skip the
    arguments section completely:

```xtl
tag {
    Children
}
```

However, if there is no arguments section, a tag name must be specified.
    So, to automatically use the previous tag's name, a `^` symbol must
    be used:

```xtl
^ {
    Children
}
```

If the tag will not have any children, this section can be skipped:

```xtl
tag[args];
other-tag[args];
```

However, if there are no children, it looks unneat to have just single
    words (and arguments). In this case, the line must be terminated
    with a `;`. [<sup>[1]</sup>](#citation-1)

```xtl
tag;
other-tag[arguments];
```

Individual Section Syntax
-------------------------

### Comments
A multiline comment has an opening sequence and a closing sequence.
    Anything between these is skipped in compilation. Multiline comments
    can be nested.

```xtl
/* Multi-
   line
   Comment */

/* Multiline Comment (on a single line) */

/* Comments can be
   /* nested */
   like that. This is still
   a comment */
```

Comments can also be single-line, meaning that anything to the right of
    the opening single-line syntax is ignored:

```xtl
// Single-line comment
tag[// woops, interrupted. doing ] {} wont work
// need to finish it off below, otherwise syntax error
args] {}
```

### Tags

A tag is any character (case insensitive, recommended to use lower case)
    as well as hyphens (`-`), underscores (`_`) and numbers
    (`0`, `1`, ..., `8`, `9`).

If a tag name starts with a hash (`#`), the tag value will be computed
    during compilation, meaning that its value and arguments are
    hardcoded into the output, instead of being executed later on.
    If the tag has a static value and static arguments, the hash is
    ignored.

If a tag name starts with `@`, it references a macro. Macros take in
    parameters, then replace themselves with a new element. They are
    always converted during compilation.

#### Built-in Tags

All tags of the target language, as well as:

 - `if`
 - `else`
 - `define`
 - `mix`
 - `calc`
 - `eq`
 - `attr-name`

#### Built-in Macros

 - `external-css`
 - `google-font`
 - `js`
 - `image`

### Attributes <small>/ Arguments <small>/ Parameters <small>/ oh whatever</small></small></small>

Attributes have a key and a value. Keys can have the same characters as
    tag names, but must not contain (or start with) a hash. Attributes
    are separated by a comma, and are in the format `key=value`.
    Values can be strings (`"string"`), a number (`0.00`), a boolean
    (`true` or `false`), or a tag (`$tag-name[args] { children }`).
    Arguments and children are not required.

If there is an attribute with a key `value`, it's key does not need to
    be specified.

#### Valid attribute examples

```xtl
string-eg[
    "value attribute",
    awesome="yes"
]

number-eg[
    1.2,
    awesome=6
]

boolean-eg[
    false,
    awesome=true
]

#mix["mixin"] {
    a-mixin["hello", test=true]
}
#define[key="test-var", "a test variable"];
#key-eg[
    $mixin // uses value attribute in $mixin's child
    test=$mixin // uses test attribute in $mixin's child, as it exists
    foo=$mixin // uses value attribute in $mixin's child, as foo attribute does not exist,

    bar=$test-var // From #define above. Note: #define does not generate a child.
]
```

Compiles to:

```xml
<string-eg value="value attribute" awesome="yes" data-types="value=str,awesome=str" />
<number-eg value="1.2" awesome="6" data-types="value=num,awesome=num" />
<boolean-eg value="false" awesome="true" data-types="value=bool,awesome=bool" />
<key-eg pregen value="hello" test="true" foo="hello" bar="hello" data-types="value=str,test=bool,foo=str,bar=str" />
```

As shown above, single-child tags can be used as attribute values, where
    the argument value is specified by the argument if it exists on the
    child, otherwise the `value` argument's value. If neither can be
    found, an error will be thrown.

### Children

Children are just other tags, inside the children section of a parent
    tag.

In some languages (like HTML), other languages can be embedded in tags,
    as well as plain text. In this case, surround the text region in
    `<` and `>`. If the whole tag is text, replace the `{` and `}` with
    these characters.

### Default tags

These tags have actions specified by them. If they have a `#` symbol
    before their name, this action will be run when the code is built.
    Otherwise, code will be generated (language depending on the target)
    to compute the values in runtime.

Note, you may add your own custom tag actions through the API, see
    [the API page](README.md#the-api).

 - `if[? left, str compare="=", ? right] { children }`:
    children are removed if comparison returns false.
 - `if[? value] { children }`:
    children are removed if `value` is not 'truthy'.
 - `else { children }`:
    must be directly after an `if`. Children are removed if the above
    `if`'s children are not.

 - `define[str key, ? value]`:
    define a variable, named from `key`, as `value`. Variable is a
    tag where the `value` attribute is the value. Use `define` again to
    overwrite.
 - `mix[str value] { children }`:
    defines a variable named from `value`, with children as specified.

 - `calc[str key, str operation, str? otherkey]`:
    run an operation on key, using with otherkey's value. See operations
    section below. **Note:** overwrites variable.
 - `eq[str key, str operation, str? otherkey]`:
    same as above but does not overwrite variable. Instead becomes a
    single-child tag, with the `value` attribute set to the result.

### Default macros

These are tags that start with `@`, and will be replaced by a new tag
    during compilation. If a macro cannot be found with the specified
    name, a `ReferenceError` will be thrown.

Note, you may add your own custom macros through the API, see
    [the API page](README.md#the-api).

**Warning**: The default macros generate tags for use in the HTML
    target. You may receive errors when running code with built-in
    macros in other targets.

 - `external-css[str value]`:
    Generates a `link rel=stylesheet` tag with a `src` of `value`.
 - `google-font[str value, str? weights]`:
    Loads a Google Font stylesheet using `value` as the font's name
    and `weights` as a comma-separated list of the weights to load.

 - `js[str value]`:
    Loads JavaScript code whose location is `value`. If a body is
    supplied, this will be used as the generated `script` tag's body.

 - `img[str value, boolean? preload]`:
    Loads an image whose location is `value`. Width and height are
    automatic. If `preload` is `true`, will preload the image and
    generate base64 code for the source. When preloading, `value` must
    be relative to the path that the compiler is executed in.

### Operations:

 - `+`: Adds the two sides together, or appends if one is not a number.
    (in that case, it converts both sides to a string)
 - `-`: Subtracts the right side from the left side. Both must be
    numbers.
 - `*`: Multiplies each side. If the left side is not a number, it is
    converted to a string and repeated the right side amount of times.
    Right side must be a number.
 - `/`: Divides the left side by the right side. Both sides must be
    numbers.
 - `%`: Finds the remainder of dividing the left side by the right side.
    Both sides must be numbers.

 - `++`: Adds one two the left side. Right side ignored.
 - `--`: Subtracts one from the left side. Right side ignored.

---

<a id="citation-1" />**<sup>1</sup>As well as parser issues**