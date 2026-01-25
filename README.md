# NodeSculptor 🎨

A fluent, server-side UI engine for Node.js that "sculpts" complete HTML5 documents with scoped CSS and consolidated JavaScript.

NodeSculptor allows you to build complex front-end structures using a pure **name(value)** chaining pattern, while automatically handling ID collisions and script buffering.

## 🚀 Key Features

* **Fluent API:** Every method follows the `name(value)` pattern and returns the object for seamless chaining.
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

const page = App.div()
    .uniqueClass({ padding: '50px' })
    .append(
        App.button().text('Click Me').class('btn')
            .click(() => alert('Hello from the browser!'))
    );

App.render(page, { title: 'NodeSculptor App' }).save('index.html');

```

## 📚 API Reference

### `Sculptor` (The Engine)

| Method | Description |
| --- | --- |
| `create(tag)` | Factory for any HTML element. |
| `sharedClass(name, rules)` | Defines a reusable CSS class. |
| `oncreate(fn)` | Logic that runs on `window.onload`. |
| `render(root, config)` | Compiles UI. `root` can be a `NodeElement` or `Array`. |

### `NodeElement` (The Element)

| Method | Description |
| --- | --- |
| `.id(val)` / `.text(val)` | Sets ID or Text Content. |
| `.uniqueClass(rules)` | Generates a scoped, collision-free class. |
| `.on(event, fn)` | Attaches a browser-side event listener. |
| `.append(child)` | Nests elements. |

## 🎓 Advanced Guide

### State Management & SPA Logic

NodeSculptor allows you to maintain "state" in the browser by initializing variables in an `oncreate()` block.

```javascript
App.oncreate(() => {
    window.state = { views: ['home', 'settings'] };
});

// View switching logic
App.button().text('Switch View').click(() => {
    document.getElementById('home').style.display = 'none';
    document.getElementById('settings').style.display = 'block';
});

```

### The Function Bridge

When you pass a function to `.on()`, NodeSculptor stringifies it.

* **🚫 Server Variables:** You cannot use Node.js variables inside handlers.
* **✅ Browser APIs:** You have full access to `window`, `document`, `fetch`, and `localStorage`.

## 🏗 How it Works

1. **Style Buffer:** CSS objects are converted to kebab-case and flushed into the `<head>`.
2. **Script Buffer:** Functions are stringified and mapped to unique IDs, then bundled into one `<script>` at the end of the `<body>`.
3. **Validation:** The engine catches non-function inputs or undefined elements and logs them with `[NodeSculptor]` prefixes.
