eXtensible Tag Language (XTL)
=============================
A new way to write XML, but as a programming language!

How It Works
------------

It's quite simple: you write XTL code, run the compiler (optionally with
    a target runtime language) and use the generated code in your
    application or website.

XTL is not just another alternative XML language, however. A common
    annoyance with writing XML is that there is no actual programming -
    you cannot create variables, use conditionals or loops, or use
    maths. That is where XTL aims to help.

XTL has tags called 'actions' that can run code depending on arguments.
    These then output new XML that is displayed on the page. Actions
    can be run either during compile time or on the client.

Targets
-------

 - Compiler has not been created yet (only specification) so no there
    are no targets

### Future Targets

 - Plain XML (no runtime)
 - HTML and JavaScript
 - XAML and C#.net (WPF)
 - XAML and VB.net (WPF)
 - AXML and Java (Android)

If you can think of any other XML-based targets, please create an issue.

Custom Action API
-----------------

**Note:** No API has been created yet, this is just an idea of what it
    will be.

Custom actions are created using NodeJS. Actions are supported in every
    language, but you will need to create an individual file for each
    language (other than JavaScript).

```js
const xtl = require("xtl-lang");
```

### Create an action
Use the `xtl.registerAction(string actionName, object options)` method
    to create a new action.

 - `actionName`: The tag name that the action will use. Must be a valid
    tag name.
 - `options`
    - `object targets`: JS target will be used for
        - `string cs`: The path to the action's C# equivalent. If not
            specified, no c# code will be generated.
        - `string vb`: The path to the action's VB equivalent. If not
            specified, no VB code will be generated.
        - `string js`: The path to the action's JS equivalent. If not
            specified, no JS code will be generated.
        - `string jar`: The path to the action's Java equivalent. If not
            specified, no Java code will be generated.

Target method format:
`xtl.tag[] method({string: object} args, xtl.tag[] children)`

#### Action Examples:

##### C#
```cs
//! BEGIN IMPORTS
using ...;
//! BEGIN DELEGATE
delegate(Tag tag, Dictionary<string, object> args, Tag[] children)
{
    if (args.ContainsKey("foo"))
    {
        return children;
    }
    else
    {
        return new Tag[0];
    }
};

```

##### Visual Basic
```vb
'! BEGIN IMPORTS
Imports ...
'! BEGIN DELEGATE
Function(ByVal tag As Tag, ByVal args As Dictionary(Of String, Object), ByVal children As Tag())
    If args.ContainsKey("foo") Then
        Return children
    Else
        Return New Tag() {}
    End If
End Function
```

##### JavaScript
```js
function(tag, args, children) {
    if (typeof args.foo !== "undefined") {
        return children;
    } else {
        return [];
    }
}
```

##### Java
```java
//! BEGIN IMPORTS
import ...;
//! BEGIN DELEGATE
(tag, args, children) -> {
    if (args.containsKey("foo")) {
        return children;
    } else {
        return new Tag[0];
    }
}
```

### The API
The API is the same for everything. However, names will follow that
    language's conventions so it is recommended to either follow them
    yourself or use autocomplete. Styles below are for C# and VB.
    Builtin class names may be different.

#### `Xtl.Tag`

The tag class. Stores information about a tag, including its name, args
    and children.

##### Fields:
 - `string Name`: The tag's name.
 - `Dictionary<string, object> Attributes`: Tag attributes.
    Value may be a string, number, boolean or `Xtl.Tag`.
 - `Xtl.Tag[] Children`: The tag's children tags.
 - `Dictionary<string, object> CustomProperties`: Custom properties.
 - `Xlt.TagMeta Meta`: Meta information.

##### Constructors
 - `Xtl.Tag(string name)`: Create an empty tag
 - `Xtl.Tag(string name, Dictionary<string, object> attributes)`: Create
    an empty tag with attributes
 - `Xtl.Tag(string name, Xtl.Tag[] children)`: Create a tag with
    specified children.
 - `Xtl.Tag(string name, Dictionary<string, object> attributes, Xtl.Tag[] children)`:
    Create a tag with children and attributes.

#### `Xlt.TagMeta`

Instances of this class contain meta information about a tag.

##### Fields:
 - `Tag PreviousTag`: The previous tag.
 - `Tag NextTag`: The next tag.
 - `Tag[] Tags`: A list of every tag.
 - `int TagIndex`: The index of this tag in the `Tags` array.

##### Methods:
 - `void DefineTempConstantAction(Tag tag)`: Defines a new action.