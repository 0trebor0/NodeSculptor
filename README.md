# NodeSculptor 🎨

A fluent, server-side UI engine for Node.js that "sculpts" complete HTML5 documents with scoped CSS and consolidated JavaScript.

NodeSculptor allows you to build complex front-end structures using a pure **name(value)** chaining pattern, while automatically handling ID collisions and script buffering.

## 🚀 Key Features

* **Fluent API:** Every method follows the `name(value)` pattern and returns the object for seamless chaining.
* **Scoped Styling:** `uniqueClass()` generates collision-proof classes, while `sharedClass()` allows for reusable styles.
* **Consolidated Scripts:** All event listeners (`.click()`, `.on()`) and lifecycle hooks (`.oncreate()`) are injected into a **single script tag** at the bottom of the `<body>`.
* **Flat Rendering:** Pass a single element or an `Array` of elements to `render()` for clean, flat HTML structures.
* **Smart Error Handling:** Prefixed console warnings and input validation help you debug UI logic on the server.
* **Zero Boilerplate:** One-line `render().save()` workflow with built-in `viewport` and `charset` support.

## 📦 Installation

```bash
npm install nodesculptor

```

## 🛠 Usage Example

```javascript
const Sculptor = require('nodesculptor');
const App = new Sculptor();

// 1. Define shared styles
App.sharedClass('auth-card', { 
    padding: '20px', 
    borderRadius: '12px', 
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)' 
});

// 2. Build views with the name(value) pattern
const login = App.div().class('auth-card')
    .append(App.h2().text('Login'))
    .append(App.button().text('Enter')
        .uniqueClass({ backgroundColor: 'green', color: 'white' })
        .click(() => alert('Welcome!'))
    );

const register = App.div().class('auth-card').css({ display: 'none' });

// 3. Render flat siblings (no extra wrapper div)
App.render([login, register], { title: 'My Sculpted Page' })
   .save('index.html');

```

## 🏗 How it Works

1. **The Style Buffer:** Styles defined via `uniqueClass` or `sharedClass` are flushed into a single `<style>` tag in the `<head>` during rendering.
2. **The Script Buffer:** Event listeners are stringified and mapped to unique IDs. These are bundled into a single `<script>` block at the bottom of the `<body>` to ensure the DOM is ready before execution.
3. **Error Handling:** The engine validates inputs (like ensuring `.on()` receives a function) and provides descriptive `[NodeSculptor]` error logs in your terminal.