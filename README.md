# NodeSculptor 🎨

A fluent, server-side UI engine for Node.js that "sculpts" complete HTML5 documents with scoped CSS and consolidated JavaScript.

NodeSculptor allows you to build complex front-end structures using a pure **name(value)** chaining pattern, while automatically handling ID collisions and script buffering.

## 🚀 Key Features

* **Fluent API:** Every method follows the `name(value)` pattern and returns the object for seamless chaining.
* **Scoped Styling:** `uniqueClass()` automatically generates collision-proof CSS classes in the `<head>`.
* **Consolidated Scripts:** All event listeners (`.click()`, `.on()`) and lifecycle hooks (`.oncreate()`) are buffered and injected into a **single script tag** at the bottom of the `<body>`.
* **JSDOM Powered:** Real DOM node manipulation on the server side for maximum compatibility.
* **Zero Boilerplate:** One-line `render().save()` workflow.

## 📦 Installation

```bash
npm install jsdom

```

## 🛠 Usage Example

```javascript
const Sculptor = require('./NodeSculptor');
const App = new Sculptor();

const page = App.div()
    .uniqueClass({ padding: '20px', textAlign: 'center' })
    .append(
        App.button()
            .text('Click Me')
            .uniqueClass({ backgroundColor: 'blue', color: 'white' })
            .click(() => alert('Hello from NodeSculptor!'))
    );

App.render(page, { title: 'My Sculpted Page' })
   .save('index.html');

```

## 🏗 How it Works

1. **The Style Buffer:** When you define a `uniqueClass`, NodeSculptor generates a unique name (e.g., `.sc-cls-1`) and stores the rules. During render, these are flushed into a `<style>` tag in the `<head>`.
2. **The Script Buffer:** When you attach an event, the function is stringified. NodeSculptor ensures the element has a unique ID and maps the listener in a single `<script>` block inside the `<body>`.
3. **The Lifecycle:** `oncreate()` hooks are wrapped in a `window.onload` listener to ensure logic fires only when the DOM is ready.
