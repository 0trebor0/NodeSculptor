# NodeSculptor 🎨

A fluent, server-side UI engine for Node.js that **compiles** complete, reactive HTML5 documents with scoped CSS and consolidated JavaScript.

NodeSculptor allows you to build complex front-end structures using a pure **name(value)** chaining pattern, while automatically handling ID collisions, surgical DOM updates, and element referencing.

---

## 🚀 Key Features

* **Fluent API:** Every method follows the `name(value)` pattern and returns the object for seamless chaining.
* **Zero-Bundle Reactivity:** Built-in `Proxy` state management that updates the DOM surgically without needing massive external runtimes.
* **The Reference System:** Use `.ref('name')` on the server and `UI.get('name')` in the browser—no more manual `document.getElementById`.
* **Scoped & Global Styling:** `uniqueClass()` generates collision-proof classes dynamically during the build.
* **Static Compiler Architecture:** Built with `JSDOM` for structure, but outputs pure, lightweight HTML/JS for the client.

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

App.defineClass('body', { margin: '0', fontFamily: 'sans-serif' }, true);

const container = App.div().css({ padding: '20px' });

container.append(
    App.h1().text('Hello World'),
    App.button().text('Alert Me').click(() => alert('Compiled!'))
);

App.render(container).save('index.html');

```

### 2. Reactivity & State Management

NodeSculptor features a "surgical" reactivity system. You define state on the server, and the compiler injects a reactive Proxy into the browser that updates **only** the necessary elements.

```javascript
const App = new Sculptor();

// 1. Define Initial State
App.state('count', 0);

const ui = App.div().append(
    // 2. Bind UI to State
    // Text updates automatically when State.count changes
    App.h1().bind('count', (v) => `Count is: ${v}`),

    // 3. Mutate State in Browser listeners
    App.button().text('+1').click(() => {
        State.count++; 
    })
);

App.render(ui).save('index.html');

```

---

## 🌐 Express.js Integration

Since NodeSculptor is a **compiler**, it is designed for maximum speed. You should compile your layouts **once** during the server startup and serve the cached string.

### The "Startup Cache" Pattern

```javascript
const express = require('express');
const Sculptor = require('nodesculptor');
const app = express();

function buildDashboard() {
    const UI = new Sculptor();
    UI.state('user', 'Developer');
    
    const layout = UI.div().css({ textAlign: 'center' }).append(
        UI.h1().bind('user', (name) => `Welcome, ${name}`),
        UI.button().text('Log Out').click(() => { State.user = 'Guest'; })
    );

    return UI.render(layout, { title: 'Dashboard' }).output();
}

// Compile once at startup
const DASHBOARD_PAGE = buildDashboard();

app.get('/', (req, res) => {
    res.send(DASHBOARD_PAGE);
});

app.listen(3000, () => console.log('Server running on port 3000'));

```

---

## 📚 API Reference

### `Sculptor` (The Engine)

| Method | Description |
| --- | --- |
| `state(key, value)` | Initializes reactive state accessible via `window.State` in-browser. |
| `defineClass(sel, rules, isRaw)` | Styles selectors. Set `isRaw` to true for tags (e.g. `body`), false for classes. |
| `oncreate(fn)` | Runs logic in the browser once `DOMContentLoaded` fires. |
| `render(root, config)` | Compiles the UI. Config supports `title` and `meta`. |
| `output()` | Returns the full HTML string. |
| `save(path)` | Writes the final HTML file to the disk. |

### `NodeElement` (The Element)

| Method | Description |
| --- | --- |
| `.bind(key, fn)` | **Reactive:** Links element text to a `State` key via a transform function. |
| `.ref(name)` | Assigns a nickname for `UI.get('name')` browser access. |
| `.text(val)` | Sets static `textContent`. |
| `.uniqueClass(rules)` | Creates and applies a scoped, collision-proof CSS class. |
| `.on(event, fn)` | Attaches a browser-side event listener. |
| `.click(fn)` | Shorthand for `.on('click', fn)`. |
| `.append(...children)` | Appends multiple children (accepts nested arrays). |

---

## 🎓 Advanced Guide: The Compiler

### 🏗 Deep Dive: How it Works

NodeSculptor manages a virtual lifecycle through three distinct phases:

1. **The Synthesis Phase (Server-Side):** NodeSculptor builds a **Live DOM Tree** using `JSDOM`. This ensures structural integrity during the build.
2. **The Dehydration Phase (`.render()`):** The compiler flattens the graph. CSS is converted to `kebab-case`. State is stringified, and the **Surgical Binding** map is created.
3. **The Injection Phase (Final Output):** A microscopic runtime is injected. It uses a **Native Proxy** to listen for state changes and update only the specific DOM IDs linked to those keys.

---

## 🎨 Examples Gallery

### A. Real-time Input Sync

```javascript
App.state('msg', 'Type something...');

const inputGroup = App.div().append(
    App.create('input')
        .attribute('placeholder', 'Enter message')
        .on('input', (e) => { State.msg = e.target.value; }),
    
    App.p().bind('msg', (v) => `Preview: ${v}`)
);

```

### B. Dynamic Progress Bar

```javascript
App.state('progress', 0);

const bar = App.div().uniqueClass({ height: '10px', background: 'blue' }).ref('bar');

const intervalBtn = App.button().text('Start Loading').click(() => {
    let interval = setInterval(() => {
        State.progress += 5;
        UI.get('bar').style.width = State.progress + '%';
        if(State.progress >= 100) clearInterval(interval);
    }, 100);
});

```
## 📁 Recommended Project Structure

```text
my-sculptor-app/
├── public/          # Compiled output
│   └── index.html
├── src/
│   ├── components/  # Reusable UI pieces
│   │   └── Card.js
│   └── main.js      # Compiler & Server logic
├── package.json
└── .gitignore

```

---

## 🏗️ 1. The Reusable Component (`src/components/Card.js`)

In NodeSculptor, components are just functions that return a `NodeElement`.

```javascript
module.exports = function Card(App, title, content) {
    return App.div().uniqueClass({
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        margin: '10px 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }).append(
        App.h1().text(title).css({ marginTop: '0' }),
        App.p().text(content)
    );
};

```

---

## 🚀 2. The Main Script (`src/main.js`)

This script defines the state, assembles the page using your components, and renders the final file.

```javascript
const Sculptor = require('nodesculptor');
const Card = require('./components/Card');
const fs = require('fs');
const path = require('path');

const App = new Sculptor();

// 1. Setup Global Styles
App.defineClass('body', {
    backgroundColor: '#f4f7f6',
    color: '#333',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    display: 'flex',
    justifyContent: 'center',
    padding: '50px'
}, true);

// 2. Define Reactive State
App.state('clicks', 0);
App.state('lastUpdated', new Date().toLocaleTimeString());

// 3. Assemble UI
const layout = App.div().css({ width: '100%', maxWidth: '500px' }).append(
    Card(App, 'NodeSculptor Dashboard', 'This page was compiled on the server and is now reactive in the browser.'),
    
    App.div().uniqueClass({ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        textAlign: 'center' 
    }).append(
        App.h1().bind('clicks', (v) => `Button Clicked: ${v} times`),
        App.p().bind('lastUpdated', (v) => `Last interaction: ${v}`),
        
        App.button()
            .text('Increment Counter')
            .uniqueClass({
                padding: '10px 20px',
                fontSize: '16px',
                cursor: 'pointer',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
            })
            .click(() => {
                State.clicks++;
                State.lastUpdated = new Date().toLocaleTimeString();
            })
    )
);

// 4. Compile and Save
const html = App.render(layout, { title: 'My Sculptor App' }).output();

const outPath = path.join(__currentDir, '../public/index.html');
if (!fs.existsSync(path.dirname(outPath))) fs.mkdirSync(path.dirname(outPath));

App.save(outPath);
console.log('Successfully sculpted: /public/index.html');

```

---

## 🛠️ 3. How to Run

1. **Initialize:** `npm init -y`
2. **Install Dependencies:** `npm install nodesculptor`
3. **Run Build:** `node src/main.js`
4. **View:** Open `public/index.html` in any browser.

### 💡 Pro Tip: Development Workflow

You can add a simple "watch" script to your `package.json` so that the page re-compiles whenever you change your code:

```json
"scripts": {
  "build": "node src/main.js",
  "dev": "node --watch src/main.js"
}

```
