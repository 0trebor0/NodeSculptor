# NodeSculptor 🎨

A fluent, server-side UI engine for Node.js that **compiles** complete HTML5 documents with scoped CSS and consolidated JavaScript.

NodeSculptor allows you to build complex front-end structures using a pure **name(value)** chaining pattern, while automatically handling ID collisions, script buffering, and element referencing.

---

## 🚀 Key Features

* **Fluent API:** Every method follows the `name(value)` pattern and returns the object for seamless chaining.
* **The Reference System:** Use `.ref('name')` on the server and `UI.get('name')` in the browser—no more manual `document.getElementById`.
* **Scoped Styling:** `uniqueClass()` generates collision-proof classes, while `sharedClass()` allows for reusable styles.
* **Consolidated Scripts:** All event listeners and lifecycle hooks are injected into a **single script tag** at the bottom of the `<body>`.
* **Static Compiler Architecture:** Designed to be built once and served as static HTML, avoiding `JSDOM` overhead on every request.

---

## 📦 Installation

```bash
npm install nodesculptor

```

---

## 🛠 Usage Examples

### 1. Basic Build Step (Static Generation)

```javascript
const Sculptor = require('nodesculptor');
const App = new Sculptor();

App.sharedClass('btn', { padding: '10px 20px', cursor: 'pointer' });

const container = App.div().ref('wrapper').css({ textAlign: 'center' });

container.append(
    App.h1().text('Build-Time UI'),
    App.button().text('Hide Me').class('btn')
        .click(() => {
            UI.get('wrapper').style.display = 'none';
        })
);

// Compile and save to static file
App.render(container, { title: 'NodeSculptor App' }).save('index.html');

```

### 2. Component Pattern (Reusable UI)

Because NodeSculptor is a compiler, you can create reusable functions that return `NodeElement` objects.

```javascript
const Card = (title, description) => {
    return App.div().uniqueClass({ 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        padding: '16px' 
    }).append(
        App.h3().text(title),
        App.p().text(description),
        App.button().text('Select').click(() => alert('Selected!'))
    );
};

App.render([
    Card('Product A', 'Best choice'),
    Card('Product B', 'Budget friendly')
]).save('products.html');

```

---

## 🌐 Express.js Integration

Since NodeSculptor is a **compiler**, you should avoid rebuilding the DOM on every request to maintain high performance.

### 1. Static Asset Pattern (Recommended)

Compile your files to a `public` or `dist` folder and serve them via static middleware.

```javascript
const express = require('express');
const app = express();

app.use(express.static('public'));
app.listen(3000);

```

### 2. Startup Memoization

Compile the page **once** when the server starts and store the string in memory.

```javascript
const UI = new Sculptor();
const layout = UI.main().append(UI.h1().text('Cached Dashboard'));

// Compile ONCE at startup
const CACHED_HTML = UI.render(layout).output();

app.get('/dashboard', (req, res) => {
    res.send(CACHED_HTML); 
});

```

---

## 📚 API Reference

### `Sculptor` (The Engine)

| Method | Description |
| --- | --- |
| `create(tag)` | Factory for any HTML element (e.g. `App.create('section')`). |
| `sharedClass(name, rules)` | Defines a reusable CSS class in the global sheet. |
| `oncreate(fn)` | Bundles logic into a `window.load` listener in the final script. |
| `render(root, config)` | Compiles the UI. Config supports `title`, `css` (hrefs), and `icon`. |
| `output()` | Returns the full `dom.serialize()` HTML string. |
| `save(path)` | Writes the final HTML file to the file system. |

### `NodeElement` (The Element)

| Method | Description |
| --- | --- |
| `.ref(name)` | Assigns a nickname for `UI.get(name)` browser access. |
| `.id(val)` | Sets the standard HTML `id`. |
| `.text(val)` | Sets the `textContent` of the element. |
| `.class(val)` | Adds CSS classes (accepts string or array). |
| `.attribute(k, v)` | Sets a custom HTML attribute. |
| `.css(styles)` | Sets inline styles via an object. |
| `.uniqueClass(rules)` | Creates and applies a scoped, unique CSS class. |
| `.on(event, fn)` | Attaches a browser-side event listener. |
| `.click(fn)` | Shorthand for `.on('click', fn)`. |
| `.child(tag)` | Creates, appends, and returns a new `NodeElement`. |
| `.append(...children)` | Appends multiple children (accepts nested arrays). |

---

## 🎓 Advanced Guide: The Compiler

### 🏗 Deep Dive: How it Works

NodeSculptor manages a virtual lifecycle through three distinct phases:

1. **The Synthesis Phase (Server-Side):**
When you chain methods, NodeSculptor builds a **Live DOM Tree** using `JSDOM`. This catches invalid nesting and structural errors during the build step.
2. **The Dehydration Phase (`.render()`):**
The compiler flattens the object graph. CSS properties are converted from `camelCase` to `kebab-case`. Event handlers are stringified into the **Script Buffer**.
3. **The Injection Phase (Final Output):**
The compiler generates a **Reference Map** (`UI._m`) and injects it along with the buffered scripts into a **single script tag at the bottom of the `<body>**`. This ensures the DOM is fully loaded before the JS executes.

### 🚫 Compiler Constraints

Since handlers are **stringified**, you must treat `.on()` and `.click()` as isolated islands.

* **No Server Closures:** Variables in your Node script aren't available in the browser handlers.
* **Data Injection:** To pass data, inject it as a literal using a `new Function` or template strings:
```javascript
const myData = "Hello";
App.button().click(new Function(`alert("${myData}")`));

```
