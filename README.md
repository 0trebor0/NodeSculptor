# NodeSculptor 🎨

A fluent, server-side UI engine for Node.js that "sculpts" complete HTML5 documents with scoped CSS and consolidated JavaScript.

NodeSculptor allows you to build complex front-end structures using a pure **name(value)** chaining pattern, while automatically handling ID collisions, script buffering, and element referencing.

## 🚀 Key Features

* **Fluent API:** Every method follows the `name(value)` pattern and returns the object for seamless chaining.
* **Smart Referencing:** Use `.ref('name')` on the server and `UI.get('name')` in the browser—no more manual `document.getElementById`.
* **Scoped Styling:** `uniqueClass()` generates collision-proof classes, while `sharedClass()` allows for reusable styles.
* **Consolidated Scripts:** All event listeners and lifecycle hooks are injected into a **single script tag** at the bottom of the `<body>`.
* **Flat Rendering:** Pass a single element or an `Array` of elements to `render()` for clean, flat HTML structures.
* **Smart Error Handling:** Prefixed console warnings and input validation for server-side debugging.
* **Zero Boilerplate:** One-line `render().save()` workflow with built-in `viewport` and `charset` support.

## 📦 Installation

```bash
npm install nodesculptor

```

## 🛠 Usage Example

```javascript
const Sculptor = require('nodesculptor');
const App = new Sculptor();

App.sharedClass('btn', { padding: '10px 20px', cursor: 'pointer' });

// Create a view with a reference
const loginBox = App.div().ref('login-ui').class('auth-container');

loginBox.append(
    App.button().text('Hide Me').class('btn')
        .click(() => {
            // Use the Reference System instead of document.getElementById
            UI.get('login-ui').style.display = 'none';
        })
);

App.render(loginBox, { title: 'NodeSculptor App' }).save('index.html');

```

## 📚 API Reference

### `Sculptor` (The Engine)

| Method | Description |
| --- | --- |
| `create(tag)` | Factory for any HTML element (e.g. `App.create('section')`). |
| `sharedClass(name, rules)` | Defines a reusable CSS class in the global sheet. |
| `oncreate(fn)` | Logic that runs on `window.onload`. Multiple calls are bundled. |
| `render(root, config)` | Compiles UI. `root` can be a `NodeElement` or `Array`. |
| `save(path)` | Writes the final `index.html` to the file system. |

### `NodeElement` (The Element)

| Method | Description |
| --- | --- |
| `.ref(name)` | **New:** Assigns a "nickname" to an element for easy browser-side access. |
| `.id(val)` / `.text(val)` | Sets the standard HTML ID or Text Content. |
| `.uniqueClass(rules)` | Generates a scoped, collision-free class for this element. |
| `.on(event, fn)` | Attaches a browser-side event listener (click, input, etc). |
| `.append(child)` | Nests another `NodeElement` or raw JSDOM node. |

## 🎓 Advanced Guide

### The Reference System (`UI.get`)

Writing `document.getElementById('some-long-id')` inside a stringified function is error-prone. NodeSculptor solves this by mapping server-side references to client-side nodes.

```javascript
const box = App.div().ref('myBox');

App.button().text('Toggle').click(() => {
    const el = UI.get('myBox'); // Refers to the 'box' element above
    el.style.opacity = el.style.opacity === '0' ? '1' : '0';
});

```

### State Management & SPA Logic

Maintain "state" in the browser by initializing variables in an `oncreate()` block.

```javascript
App.oncreate(() => {
    window.state = { currentView: 'home' };
});

// View switching logic using references
App.button().text('Go to Settings').click(() => {
    UI.get('view-home').style.display = 'none';
    UI.get('view-settings').style.display = 'block';
});

```

### The Function Bridge

When you pass a function to `.on()`, NodeSculptor stringifies it for the browser.

* **🚫 Server Variables:** You cannot use Node.js variables (like `process` or `__dirname`) inside handlers.
* **✅ Browser APIs:** You have full access to `window`, `document`, `fetch`, and `localStorage`.

## 🏗 How it Works

1. **Style Buffer:** CSS objects are converted from camelCase to kebab-case and flushed into a single `<style>` tag in the `<head>`.
2. **Reference Map:** The engine generates a lookup table (`UI._m`) that maps your `.ref()` names to the unique generated IDs.
3. **Script Buffer:** Functions are stringified and bundled into one `<script>` at the end of the `<body>` to ensure the DOM is ready.
4. **Validation:** The engine catches non-function inputs or undefined elements and logs them with `[NodeSculptor]` prefixes.