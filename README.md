# NodeSculptor 🎨

A fluent, server-side UI engine for Node.js that "sculpts" complete HTML5 documents with scoped CSS and consolidated JavaScript.

NodeSculptor allows you to build complex front-end structures using a pure **name(value)** chaining pattern, while automatically handling ID collisions and script buffering.

## 🚀 Key Features

* **Fluent API:** Every method follows the `name(value)` pattern and returns the object for seamless chaining.
* **Scoped Styling:** `uniqueClass()` generates collision-proof classes, while `sharedClass()` allows for reusable styles.
* **Consolidated Scripts:** All event listeners (`.click()`, `.on()`) and lifecycle hooks (`.oncreate()`) are injected into a **single script tag** inside the `<body>`.
* **JSDOM Powered:** Real DOM node manipulation on the server side for maximum compatibility.
* **Zero Boilerplate:** One-line `render().save()` workflow.

## 📦 Installation

```bash
npm install nodesculptor

```

## 🛠 Usage Example

```javascript
const Sculptor = require('nodesculptor');
const App = new Sculptor();

// Define a reusable style
App.sharedClass('primary-btn', { 
    padding: '10px 20px', 
    borderRadius: '5px', 
    cursor: 'pointer' 
});

const page = App.div()
    .uniqueClass({ padding: '40px', textAlign: 'center' })
    .append(
        App.button()
            .text('Click Me')
            .class('primary-btn') // Use shared class
            .uniqueClass({ backgroundColor: 'blue', color: 'white' }) // Use unique class
            .click(() => alert('Hello from NodeSculptor!'))
    );

// Handle page load logic
App.oncreate(() => console.log("DOM is ready!"));

App.render(page, { title: 'My Sculpted Page' })
   .save('index.html');

```

## 🏗 How it Works

1. **The Style Buffer:** Styles defined via `uniqueClass` or `sharedClass` are flushed into a single `<style>` tag in the `<head>` during rendering.
2. **The Script Buffer:** Event listeners are stringified and mapped to unique IDs. These are bundled into a single `<script>` block at the bottom of the `<body>`.
3. **The Lifecycle:** `oncreate()` hooks map to `window.onload` to ensure logic fires correctly in the browser.
