# NodeSculptor 🎨

NodeSculptor is a powerful and elegant server-side UI engine for Node.js that enables developers to programmatically build and **compile** complete, reactive HTML5 documents. It provides a fluent, chainable API to define the structure, styling, and client-side behavior of web pages, outputting pure, lightweight HTML, scoped CSS, and consolidated JavaScript.

It abstracts away the complexities of direct DOM manipulation and traditional templating, allowing you to construct robust front-end interfaces using a pure JavaScript **name(value)** chaining pattern. NodeSculptor automatically handles concerns like ID collisions, performs surgical DOM updates, and simplifies element referencing.

---

## 🚀 Key Features

*   **Fluent API:** Every method follows the `name(value)` pattern and returns the object for seamless chaining, promoting concise and readable code.
*   **Zero-Bundle Reactivity:** Features a built-in `Proxy`-based state management system that intelligently updates only the necessary parts of the DOM in the browser, without requiring large client-side frameworks or bundles.
*   **The Reference System:** Easily assign unique nicknames to your elements using `.ref('name')` on the server. Access them directly in the browser via `window.UI.get('name')`, eliminating the need for manual `document.getElementById` calls.
*   **Scoped & Global Styling:** Utilizes `uniqueClass()` to generate collision-proof, dynamically scoped CSS classes during the compilation phase, alongside options for defining global and shared styles.
*   **Static Compiler Architecture:** Built atop `JSDOM` for robust server-side DOM manipulation, NodeSculptor compiles into pure, optimized HTML, CSS, and JavaScript, ideal for fast-loading static sites or efficient server-rendered applications.

---

## 📦 Installation

To add NodeSculptor to your project, use npm:

```bash
npm install nodesculptor
```

---

## 💡 Core Concepts

NodeSculptor revolves around two primary classes that work in tandem to construct your web pages:

### `Sculptor` (The Engine)

The `Sculptor` class is the main entry point and the orchestrator of your web page. It manages the virtual DOM environment, collects all your styling rules, state definitions, and client-side scripts. You instantiate it once per page or compilation unit.

*   **Page Management**: Handles the overall HTML document structure (head, body, title, meta tags).
*   **Element Factory**: Provides convenient methods (`div()`, `span()`, `h1()`, etc.) to create `NodeElement` instances.
*   **Style Definition**: Manages global, shared, and unique CSS class definitions.
*   **State Initialization**: Defines the initial reactive state for your application.
*   **Compilation**: The `render()` method is where all elements, styles, and scripts are assembled into the final HTML output.

### `NodeElement` (The Element)

A `NodeElement` instance represents a single HTML tag (e.g., `<div>`, `<button>`). It's a wrapper around a `JSDOM` element that provides a rich, chainable API for configuring its properties, children, styles, and behaviors.

*   **Attribute & Content Control**: Set `id`, `text`, `class`, and any custom `attribute`.
*   **Styling**: Apply inline `css` or assign dynamically generated `uniqueClass`es.
*   **Hierarchy**: Add child elements using `child()` or `append()`.
*   **Reactivity**: Bind element content to reactive state variables using `bind()`.
*   **Interactivity**: Attach client-side event listeners (`on`, `click`).
*   **Referencing**: Create named references (`ref`) for easy access in browser JavaScript.

---

## 🛠 Usage Examples

Let's explore how to use NodeSculptor with practical examples.

### 1. Basic Build Step (Static HTML Generation)

This example demonstrates creating a simple static HTML page with a heading and an interactive button.

```javascript
const Sculptor = require('nodesculptor');
const App = new Sculptor();

// Define a global style for the body (isRaw = true for tag selectors)
App.defineClass('body', {
    margin: '0',
    fontFamily: 'sans-serif',
    backgroundColor: '#f0f2f5'
}, true);

// Create a main container div
const container = App.div()
    .css({
        padding: '20px',
        maxWidth: '800px',
        margin: '50px auto',
        backgroundColor: 'white',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        borderRadius: '8px'
    });

// Append children to the container
container.append(
    App.h1().text('Welcome to NodeSculptor!').css({ color: '#333' }),
    App.p().text('This page was generated server-side using NodeSculptor.').css({ fontSize: '1.1em', color: '#555' }),
    App.button()
        .text('Click Me!')
        .css({
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
        })
        .on('mouseover', (e) => e.target.style.opacity = '0.8')
        .on('mouseout', (e) => e.target.style.opacity = '1')
        .click(() => alert('Hello from a compiled button!')) // Client-side click handler
);

// Render the UI and save it to an HTML file
App.render(container, {
    title: 'NodeSculptor Basic Example',
    meta: [
        { name: 'description', content: 'A basic example of a page built with NodeSculptor.' },
        { charset: 'UTF-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
    ]
}).save('index.html');

console.log('index.html has been generated!');
```

### 2. Reactivity & State Management

NodeSculptor's "surgical" reactivity system is a core feature. You define initial state on the server, and the compiler injects a lightweight, reactive Proxy into the browser. This Proxy updates **only** the necessary DOM elements when state changes, ensuring high performance without heavy client-side runtimes.

```javascript
const Sculptor = require('nodesculptor');
const App = new Sculptor();

App.defineClass('body', { margin: '0', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#e0f7fa' }, true);

// 1. Define Initial State on the server
App.state('count', 0);

const ui = App.div()
    .css({ textAlign: 'center', padding: '30px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' })
    .append(
        // 2. Bind UI to State: Text updates automatically when State.count changes
        App.h1().bind('count', (v) => `Count is: ${v}`).css({ color: '#007bff' }),

        // 3. Mutate State in Browser listeners
        App.button()
            .text('+ Increment')
            .css({ padding: '10px 20px', fontSize: '18px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '5px' })
            .click(() => { State.count++; }), // State is accessible as `State` in browser

        App.button()
            .text('- Decrement')
            .css({ padding: '10px 20px', fontSize: '18px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '5px' })
            .click(() => { State.count--; })
    );

App.render(ui, { title: 'NodeSculptor Reactive Counter' }).save('counter.html');

console.log('counter.html has been generated!');
```

### 3. Event Handling and Element Referencing

This example shows how to attach various event listeners and how to reference elements from your client-side JavaScript.

```javascript
const Sculptor = require('nodesculptor');
const App = new Sculptor();

App.defineClass('body', { margin: '0', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8f9fa' }, true);

const interactiveDiv = App.div()
    .uniqueClass({ padding: '20px', border: '2px solid #007bff', borderRadius: '8px', cursor: 'pointer', width: '300px', textAlign: 'center', transition: 'background-color 0.3s' })
    .ref('myInteractiveDiv') // Assign a reference name
    .text('Hover over me, then click me!')
    .on('mouseover', () => {
        // Access the element in the browser using UI.get('refName')
        window.UI.get('myInteractiveDiv').style.backgroundColor = '#e7f3ff';
    })
    .on('mouseout', () => {
        window.UI.get('myInteractiveDiv').style.backgroundColor = 'white';
    })
    .click(() => {
        alert('You clicked the interactive div!');
        window.UI.get('myInteractiveDiv').textContent = 'Clicked!';
    });

App.render(interactiveDiv, { title: 'NodeSculptor Event Handling' }).save('events.html');

console.log('events.html has been generated!');
```

### 4. Advanced Styling with `uniqueClass`, `sharedClass`, and `globalStyle`

NodeSculptor provides flexible ways to style your elements, from inline CSS to globally accessible classes and uniquely scoped styles.

```javascript
const Sculptor = require('nodesculptor');
const App = new Sculptor();

// Global styles applied directly to raw selectors (e.g., 'body', 'h1')
App.globalStyle('body', {
    fontFamily: 'Arial, sans-serif',
    margin: '20px',
    backgroundColor: '#f2f2f2',
    color: '#333'
});
App.globalStyle('h2', { color: '#6a0dad', borderBottom: '1px dashed #6a0dad', paddingBottom: '5px' });

// Shared class that can be explicitly assigned using .class('my-button')
App.sharedClass('my-button', {
    padding: '10px 15px',
    fontSize: '1em',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
});

const styledElements = App.div().append(
    App.h1().text('NodeSculptor Styling Showcase').css({ color: '#0056b3' }),

    App.h2().text('Inline CSS Example'),
    App.p().text('This paragraph has inline styles.').css({ fontStyle: 'italic', color: '#cc0000' }),

    App.h2().text('Unique Class Example'),
    App.div()
        .text('This div uses a unique, scoped class generated on the fly.')
        .uniqueClass({
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '10px',
            border: '1px solid #c3e6cb',
            borderRadius: '5px'
        }),

    App.h2().text('Shared Class Example'),
    App.button()
        .text('Shared Primary Button')
        .class('my-button') // Applying the shared class
        .css({ backgroundColor: '#007bff', color: 'white', border: 'none', marginRight: '10px' }),
    App.button()
        .text('Shared Secondary Button')
        .class('my-button')
        .css({ backgroundColor: '#6c757d', color: 'white', border: 'none' })
);

App.render(styledElements, { title: 'NodeSculptor Styling' }).save('styling.html');

console.log('styling.html has been generated!');
```

---

## 📚 API Reference

### `Sculptor` (The Engine)

| Method | Description | Parameters | Returns | Example |
|---|---|---|---|---|
| `constructor()` | Initializes a new `Sculptor` instance with an in-memory JSDOM environment. | None | `Sculptor` instance | `const App = new Sculptor();` |
| `globalStyle(selector, rules)` | Defines CSS rules for a global selector (e.g., `'body'`, `'h1'`, `'.my-class'`). | `selector`: `string` (CSS selector)<br/>`rules`: `object` (CSS properties as camelCase JavaScript object) | `this` (`Sculptor` instance) | `App.globalStyle('body', { margin: '0', fontFamily: 'sans-serif' });` |
| `sharedClass(name, rules)` | Defines a named CSS class that can be reused across multiple elements. | `name`: `string` (Name of the class, without the leading dot)<br/>`rules`: `object` (CSS properties as camelCase JavaScript object) | `this` (`Sculptor` instance) | `App.sharedClass('btn-primary', { backgroundColor: 'blue', color: 'white' });` |
| `defineClass(selector, rules, isRawSelector)` | Internal method used by `globalStyle` and `sharedClass` to process CSS rules. You generally won't call this directly. | `selector`: `string`<br/>`rules`: `object`<br/>`isRawSelector`: `boolean` | `this` (`Sculptor` instance) | |
| `state(key, value)` | Initializes a reactive state variable accessible via `window.State.key` in the browser. Changes to this state will trigger updates to bound elements. | `key`: `string` (Name of the state variable)<br/>`value`: `any` (Initial value of the state variable) | `this` (`Sculptor` instance) | `App.state('count', 0);` |
| `oncreate(fn)` | Registers a function to be executed in the browser once the `DOMContentLoaded` event fires. Ideal for client-side setup that doesn't rely on specific elements being present. | `fn`: `function` (Client-side JavaScript function) | `this` (`Sculptor` instance) | `App.oncreate(() => console.log('Page loaded!'));` |
| `create(tag)` | Factory method to create a new `NodeElement` instance for a given HTML tag. | `tag`: `string` (HTML tag name, e.g., `'div'`, `'p'`, `'button'`) | `NodeElement` instance | `App.create('svg');` |
| `div()` `span()` ... | Convenience factory methods for common HTML tags, e.g., `App.div()`, `App.p()`, `App.button()`. | None | `NodeElement` instance | `App.div().text('Hello');` |
| `render(root, config)` | Compiles the entire UI into a complete HTML document. | `root`: `NodeElement` \| `Array<NodeElement>` \| `HTMLElement` (The root UI element(s) to be placed in the `<body>`)<br/>`config`: `object` (Optional configuration object) | `this` (`Sculptor` instance) | `App.render(myLayout, { title: 'My Page', meta: [{ name: 'author', content: 'Cline' }] }).output();` |
| `config.title` | (Within `config` object) Sets the title of the HTML document. | `string` | | `config: { title: 'My Awesome Page' }` |
| `config.meta` | (Within `config` object) Adds `<meta>` tags to the document `<head>`. Can be a single object or an array of objects, where each object's keys/values are meta tag attributes. | `object` \| `Array<object>` | | `config: { meta: [{ charset: 'UTF-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }] }` |
| `config.scripts` | (Within `config` object) Adds external JavaScript files to the document `<head>`. Can be a single string URL or an array of URLs. | `string` \| `Array<string>` | | `config: { scripts: ['/path/to/script.js', 'https://example.com/lib.js'] }` |
| `config.css` | (Within `config` object) Adds external CSS stylesheet files to the document `<head>`. Can be a single string URL or an array of URLs. | `string` \| `Array<string>` | | `config: { css: ['/css/style.css', 'https://example.com/theme.css'] }` |
| `config.icon` | (Within `config` object) Sets the favicon for the page. | `string` (URL to the favicon) | | `config: { icon: '/favicon.ico' }` |
| `output()` | Returns the last rendered HTML document as a complete HTML string. | None | `string` (The full HTML document) | `const htmlString = App.output();` |
| `save(path)` | Writes the last rendered HTML document to a specified file path on the disk. | `path`: `string` (File path including filename, e.g., `'./public/index.html'`) | `this` (`Sculptor` instance) | `App.save('./build/index.html');` |

### `NodeElement` (The Element)

| Method | Description | Parameters | Returns | Example |
|---|---|---|---|---|
| `constructor(tag, engine)` | Internal constructor. `NodeElement` instances are typically created via `Sculptor`'s factory methods (e.g., `App.div()`). | `tag`: `string`<br/>`engine`: `Sculptor` instance | `NodeElement` instance | |
| `child(tag)` | Creates a new `NodeElement` of the specified `tag`, appends it as a child to the current element, and returns the *new child* `NodeElement` for further chaining. | `tag`: `string` | `NodeElement` instance (the new child) | `App.div().child('span').text('Nested Span');` |
| `id(value)` | Sets the `id` attribute of the element. | `value`: `string` | `this` (`NodeElement` instance) | `App.div().id('my-unique-id');` |
| `text(value)` | Sets the `textContent` of the element. Escapes HTML. | `value`: `string` | `this` (`NodeElement` instance) | `App.p().text('Hello World!');` |
| `ref(name)` | Assigns a client-side reference `name` to the element. The element's ID will be stored and accessible in the browser via `window.UI.get('name')`. If the element doesn't have an ID, a unique one is generated. | `name`: `string` | `this` (`NodeElement` instance) | `App.input().ref('usernameInput');` |
| `class(value)` | Adds one or more CSS class names to the element. | `value`: `string` \| `Array<string>` | `this` (`NodeElement` instance) | `App.div().class('container').class(['flex', 'centered']);` |
| `attribute(key, value)` | Sets a custom HTML attribute on the element. | `key`: `string` (Attribute name)<br/>`value`: `string` (Attribute value) | `this` (`NodeElement` instance) | `App.img().attribute('src', 'image.jpg').attribute('alt', 'Description');` |
| `css(styles)` | Applies inline CSS styles to the element. | `styles`: `object` (CSS properties as camelCase JavaScript object) | `this` (`NodeElement` instance) | `App.div().css({ backgroundColor: 'red', padding: '10px' });` |
| `uniqueClass(rules)` | Generates a unique, collision-proof CSS class name, defines the `rules` for it, and applies it to the current element. | `rules`: `object` (CSS properties as camelCase JavaScript object) | `this` (`NodeElement` instance) | `App.button().uniqueClass({ backgroundColor: 'green', color: 'white' });` |
| `bind(stateKey, templateFn)` | Links the element's `textContent` to a reactive `State` key. When `window.State.stateKey` changes in the browser, `templateFn` is called with the new value, and its result updates the element's text. | `stateKey`: `string` (The key in `window.State` to bind to)<br/>`templateFn`: `function` (Optional. A client-side function that receives the state value and returns the text to display. Defaults to `(val) => val` if not provided.) | `this` (`NodeElement` instance) | `App.h1().bind('username', (name) => `Welcome, ${name}!`);` |
| `oncreate(fn)` | Registers a function to be executed in the browser when this *specific element* is created and the `DOMContentLoaded` event fires. | `fn`: `function` (Client-side JavaScript function) | `this` (`NodeElement` instance) | `App.canvas().oncreate((el) => { const ctx = el.getContext('2d'); /* ... */ });` |
| `on(event, fn)` | Attaches a client-side event listener to the element. | `event`: `string` (Event type, e.g., `'click'`, `'mouseover'`, `'input'`)<br/>`fn`: `function` (Client-side JavaScript function, receives the event object) | `this` (`NodeElement` instance) | `App.button().on('click', () => alert('Button clicked!'));` |
| `click(fn)` | Shorthand for `.on('click', fn)`. Attaches a click event listener. | `fn`: `function` (Client-side JavaScript function, receives the event object) | `this` (`NodeElement` instance) | `App.button().click(() => console.log('Clicked!'));` |
| `append(...children)` | Appends one or more children to the current element. Children can be `NodeElement` instances, raw `HTMLElement`s, or arrays containing these. | `children`: `NodeElement` \| `HTMLElement` \| `Array<NodeElement \| HTMLElement>` | `this` (`NodeElement` instance) | `App.div().append(App.p().text('Child 1'), App.span().text('Child 2'));` |

---

## 🌐 Express.js Integration

NodeSculptor acts as a **compiler**, meaning it's designed for optimal performance by generating HTML **once** on the server. For web applications, you should compile your layouts during server startup and then serve the cached HTML string.

### The "Startup Cache" Pattern

```javascript
const express = require('express');
const Sculptor = require('nodesculptor');
const app = express();

// Function to build your main UI layout
function buildDashboard() {
    const UI = new Sculptor();
    // Define initial state for this page
    UI.state('user', 'Developer');

    // Construct the UI layout
    const layout = UI.div()
        .css({ textAlign: 'center', padding: '20px', fontFamily: 'sans-serif' })
        .append(
            UI.h1().bind('user', (name) => `Welcome, ${name}!`), // Reactive welcome message
            UI.button()
                .text('Log Out')
                .css({ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' })
                .click(() => { State.user = 'Guest'; }) // Update state on click
        );

    // Render and return the complete HTML string
    return UI.render(layout, { title: 'Dashboard' }).output();
}

// Compile the dashboard page once at server startup
const DASHBOARD_PAGE = buildDashboard();

// Serve the pre-compiled HTML for the root route
app.get('/', (req, res) => {
    res.send(DASHBOARD_PAGE);
});

app.listen(3000, () => console.log('Server running on port 3000. Open http://localhost:3000'));
```

---

## 🎓 Advanced Guide: The Compiler

### 🏗 Deep Dive: How it Works

NodeSculptor manages a virtual lifecycle through three distinct phases:

1.  **The Synthesis Phase (Server-Side):** NodeSculptor leverages `JSDOM` to construct a **Live DOM Tree** in memory. This phase ensures structural integrity and allows for programmatic manipulation of elements, attributes, and styles as if you were working directly in a browser.
2.  **The Dehydration Phase (`.render()`):** During this crucial step, the compiler processes the live DOM tree. CSS properties are converted to `kebab-case`, the initial reactive `State` is stringified, and a **Surgical Binding Map** is created. This map precisely links client-side state variables to specific DOM element IDs that need updating.
3.  **The Injection Phase (Final Output):** A microscopic, highly optimized client-side runtime is injected into the generated HTML. This runtime includes a **Native Proxy** that listens for changes to `window.State`. When a state variable is updated, the Proxy efficiently consults the binding map and updates *only* the linked DOM IDs, ensuring minimal DOM manipulation and maximum performance.

---

## 🎨 Examples Gallery

### A. Real-time Input Sync

Demonstrates how to bind an input field's value to a state variable and display it in real-time.

```javascript
const App = new Sculptor();

App.state('msg', 'Type something...');

const inputGroup = App.div()
    .css({ padding: '20px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '400px', margin: '20px auto' })
    .append(
        App.create('input')
            .attribute('placeholder', 'Enter message')
            .css({ width: '100%', padding: '10px', fontSize: '1em', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' })
            .on('input', (e) => { State.msg = e.target.value; }), // Update state on input

        App.p().bind('msg', (v) => `Preview: ${v}`).css({ fontSize: '1.1em', color: '#333' })
    );

App.render(inputGroup, { title: 'NodeSculptor Input Sync' }).save('input_sync.html');

console.log('input_sync.html has been generated!');
```

### B. Dynamic Progress Bar

An example of a progress bar whose width updates dynamically based on reactive state.

```javascript
const App = new Sculptor();

App.state('progress', 0);

const progressBarContainer = App.div()
    .css({ width: '80%', maxWidth: '500px', backgroundColor: '#e0e0e0', borderRadius: '5px', overflow: 'hidden', margin: '20px auto' })
    .append(
        App.div()
            .uniqueClass({ height: '20px', background: '#4CAF50', width: '0%', transition: 'width 0.1s ease-out' })
            .ref('bar') // Reference for direct DOM manipulation
    );

const intervalBtn = App.button()
    .text('Start Loading')
    .css({ padding: '10px 20px', fontSize: '16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'block', margin: '20px auto' })
    .click(() => {
        let interval = setInterval(() => {
            State.progress += 5;
            // Directly update style using the reference
            if (window.UI.get('bar')) {
                window.UI.get('bar').style.width = State.progress + '%';
            }
            if (State.progress >= 100) {
                clearInterval(interval);
                State.progress = 0; // Reset for next run
            }
        }, 100);
    });

App.render([progressBarContainer, intervalBtn], { title: 'NodeSculptor Progress Bar' }).save('progress_bar.html');

console.log('progress_bar.html has been generated!');
```

## 📁 Recommended Project Structure

For larger applications, organizing your NodeSculptor project with a clear structure is beneficial:

```text
my-sculptor-app/
├── public/          # Compiled output: Contains the generated HTML files ready to be served.
│   └── index.html
├── src/
│   ├── components/  # Reusable UI pieces: Functions that return NodeElement instances, acting as components.
│   │   └── Card.js
│   └── main.js      # Compiler & Server logic: The main script that instantiates Sculptor, defines state, assembles components, and renders/saves the output.
├── package.json
└── .gitignore

```

---

## 🏗️ 1. The Reusable Component (`src/components/Card.js`)

In NodeSculptor, components are simply functions that accept the `Sculptor` instance (often named `App` or `UI`) and any necessary props, then return a configured `NodeElement`.

```javascript
module.exports = function Card(App, title, content) {
    return App.div().uniqueClass({
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        margin: '10px 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        backgroundColor: 'white'
    }).append(
        App.h1().text(title).css({ marginTop: '0', color: '#007bff' }),
        App.p().text(content).css({ color: '#555' })
    );
};
```

---

## 🚀 2. The Main Script (`src/main.js`)

This script serves as the application's entry point. It defines global styles and reactive state, assembles the page using your components, and triggers the compilation and saving of the final HTML file.

```javascript
const Sculptor = require('nodesculptor');
const Card = require('./components/Card');
const fs = require('fs');
const path = require('path');

const App = new Sculptor();

// 1. Setup Global Styles: Apply base styles to the body of the document.
App.defineClass('body', {
    backgroundColor: '#f4f7f6',
    color: '#333',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    display: 'flex',
    justifyContent: 'center',
    padding: '50px'
}, true);

// 2. Define Reactive State: Initialize state variables that will drive UI updates.
App.state('clicks', 0);
App.state('lastUpdated', new Date().toLocaleTimeString());

// 3. Assemble UI: Combine components and elements to build the page layout.
const layout = App.div().css({ width: '100%', maxWidth: '500px' }).append(
    Card(App, 'NodeSculptor Dashboard', 'This page was compiled on the server and is now reactive in the browser.'),

    App.div().uniqueClass({
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
        marginTop: '20px'
    }).append(
        App.h1().bind('clicks', (v) => `Button Clicked: ${v} times`).css({ color: '#28a745' }),
        App.p().bind('lastUpdated', (v) => `Last interaction: ${v}`).css({ color: '#666' }),

        App.button()
            .text('Increment Counter')
            .uniqueClass({
                padding: '10px 20px',
                fontSize: '16px',
                cursor: 'pointer',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                marginTop: '15px'
            })
            .click(() => {
                State.clicks++;
                State.lastUpdated = new Date().toLocaleTimeString();
            })
    )
);

// 4. Compile and Save: Render the UI and save the resulting HTML to a file.
const html = App.render(layout, { title: 'My Sculptor App' }).output();

// Ensure the output directory exists
const outputDir = path.join(__dirname, '../public');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const outPath = path.join(outputDir, 'index.html');
App.save(outPath);
console.log(`Successfully sculpted: ${outPath}`);

```

---

## 🛠️ 3. How to Run

Follow these steps to get your NodeSculptor application up and running:

1.  **Initialize your project:**
    ```bash
    npm init -y
    ```
2.  **Install Dependencies:**
    ```bash
    npm install nodesculptor
    ```
3.  **Run Build Script:** If you have `src/main.js` as shown in the project structure example, run:
    ```bash
    node src/main.js
    ```
    This will compile your UI and generate `public/index.html`.
4.  **View Your Application:** Open the generated `public/index.html` file in any web browser to see your sculpted page.

### 💡 Pro Tip: Development Workflow

For a more efficient development experience, you can add a simple "watch" script to your `package.json`. This will automatically re-compile your page whenever you make changes to your source code, allowing for rapid iteration:

```json
"scripts": {
  "build": "node src/main.js",
  "dev": "node --watch src/main.js"
}
```