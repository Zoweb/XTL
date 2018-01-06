Contributing to XTL
===================

Contribution Guide
------------------

### Issues
If you find a problem, create an issue. Issues should have a descriptive
    title and contents, that should clearly state what and where the
    issue is. If you think you can fix it, assign yourself, fix it and
    create a pull request.

When creating a branch for an issue fix, call it `hotfix/hotfix-name`.
    In the pull request reference the issue.

### New features
When creating a new feature, create a branch called
    `feature/feature-name`. If there are multiple similar features, the
    branch should be `feature/group/feature-name`.

### Tests
Every function that has some sort of logic should be tested. Put the
    test in a file inside the `/test` directory, and call it something
    useful. Make sure it ends in `.test.js`. If there are multiple
    similar tests, that are for different things, put them in a folder.

### Branches
Only one thing should be worked on in a branch - be specific!

We recommend using SmartGit's *Git-Flow* to do branch management. We use
    it at the default settings.

### Commits
Commits should have a short but descriptive name.

Style Guide
-----------

See http://crockford.com/javascript/code.html. Except for things below.

### Semicolons
Don't be stupid. Just use them. They make everything easier to read and
    not using them can help you to make silly mistakes that could be
    avoided by adding *one character*!

### Variable Declarations
Use `const`, or `let` if the variable will change value.

### Array methods
Use `for (foo of bar)` instead of `bar.forEach`.

When iterating over an object's keys, use `for (foo in bar)`. Remember
    to check `bar.hasOwnProperty(foo)`:

```js
for (foo in bar) {
    if (!bar.hasOwnProperty(foo)) continue;
    ...
}
```

### Comments
Keep them at the same indentation level as everything else in that code
    block.

### Variable names
Use `$` at the start of the variable's name if it is referencing a HTML
    element, for example a jQuery object or something returned by
    `document.getElementById()`.

### Classes
Everyone should use the latest JavaScript. So, use `class` declarations
    instead of fake `function` 'classes'.

### Switch statement
Indent `case` statements by 4 spaces from the `switch` statement, then
    indent the inner statements inside the `case` by another 4 spaces.

### Continue statement
Use it if needed.

### Lines
Make sure they are <= 121 characters long. In Markdown keep them under
    72 lines. If you break a paragraph in Markdown, add an indent on
    every line but the first.

### Lambdas (Arrow functions)
Use them only for functional (side-effect free) code.
```js
// CORRECT
(foo, bar) => {};
(foo = 4) => {};
foo => {};

(foo, bar) => console.log("correct");
(foo = 4) => console.log("correct");
foo => console.log("correct");

(foo, bar) => {
    console.log("correct");
    console.log("2");
}
(foo = 4) => {
    console.log("correct");
    console.log("2");
}

// You get the idea

// INCORRECT
(foo) => {};
foo => {console.log("incorrect");}

// ...
```

### Function declarations
Don't put a space after `function` for anonymous functions:
```js
// CORRECT
function() {}

// INCORRECT
function () {}
```

### Ternary operator
Use it if it makes sense to. Make the `?` and `:` be on newlines if the
    line gets too long (over

```js
// CORRECT
if (foo) {
    bar = 2;
    console.log("set to 2");
}

bar = foo ? 2 : 7;

// INCORRECT
if (foo) {
    bar = 2;
}

bar = foo ? (2, console.log("set to 2")) : undefined;
```

Another problem with that: it uses a comma expression. Don't use them.

### `++` and `--`
Use them instead of `+= 1` and `-= 1`.