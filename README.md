# NodeSculptor 🎨

A fluent, server-side UI engine for Node.js that **compiles** complete, reactive HTML5 documents with scoped CSS and consolidated JavaScript.

NodeSculptor allows you to build complex front-end structures using a pure **name(value)** chaining pattern, while automatically handling ID collisions, surgical DOM updates, and element referencing.

---

## 🚀 Key Features

* **Fluent API:** Every method follows the `name(value)` pattern and returns the object for seamless chaining.
* **Zero-Bundle Reactivity:** Built-in `Proxy` state management that updates the DOM surgically without a heavy library like React or Vue.
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

App.globalStyle('body', { margin: '0', fontFamily: 'sans-serif' });

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
| `globalStyle(sel, rules)` | Styles raw selectors (e.g. `body`, `*`) in the document head. |
| `sharedClass(name, rules)` | Defines a reusable CSS class in the global sheet. |
| `oncreate(fn)` | Runs logic in the browser once `DOMContentLoaded` fires. |
| `render(root, config)` | Compiles the UI. Config supports `title` and `meta`. |
| `output()` | Returns the full HTML string. |
| `save(path)` | Writes the final HTML file to the disk. |

### `NodeElement` (The Element)

| Method | Description |
| --- | --- |
| `.bind(key, fn)` | **Reactive:** Links element text to a `State` key via a transform function. |
| `.ref(name)` | Assigns a nickname for `UI.get('name')` browser access. |
| `.text(val)` | Sets static `textContent`. Automatically sanitized against XSS. |
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
3. **The Injection Phase (Final Output):** A microscopic runtime (approx. 400 bytes) is injected. It uses a **Native Proxy** to listen for state changes and update only the specific DOM IDs linked to those keys.

---

## 🎨 Examples Gallery

### A. Real-time Input Sync

Create a live-previewing input field where the state updates on every keystroke.

```javascript
App.state('msg', 'Type something...');

const inputGroup = App.div().append(
    App.create('input')
        .attribute('placeholder', 'Enter message')
        .on('input', (e) => { State.msg = e.target.value; }),
    
    App.p().bind('msg', (v) => `Preview: ${v}`)
);

```

### B. Reactive List/Array (The Filter Pattern)

While NodeSculptor doesn't have a virtual-dom loop, you can use `State` to filter UI elements by combining `.bind()` with CSS.

```javascript
App.state('searchQuery', '');

App.create('input').on('input', (e) => { State.searchQuery = e.target.value; });

// Use State to control visibility via a Ref
App.div().ref('item').bind('searchQuery', (query) => {
    const el = UI.get('item');
    el.style.display = el.textContent.includes(query) ? 'block' : 'none';
    return "My Secret Item";
});

```

### C. Dynamic Progress Bar

Bind state to styles directly inside a browser event.

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

### D. Multi-Element Sync

One state change can trigger unlimited UI updates across different elements.

```javascript
App.state('isLoggedIn', false);

const nav = App.div().append(
    App.span().bind('isLoggedIn', (v) => v ? 'Welcome User!' : 'Please Login'),
    App.button().bind('isLoggedIn', (v) => v ? 'Logout' : 'Login').click(() => {
        State.isLoggedIn = !State.isLoggedIn;
    })
);

```
