const { JSDOM } = require('jsdom');
const fs = require('fs');

let dom = new JSDOM(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title></title></head><body></body></html>`);
let document = dom.window.document;

class NodeElement {
    constructor(tag, engine) {
        try {
            this.el = document.createElement(tag);
            this.engine = engine;
        } catch (e) {
            throw new Error(`[NodeSculptor] Failed to create element <${tag}>: ${e.message}`);
        }
    }

    id(value) { this.el.id = value; return this; }
    text(value) { this.el.textContent = value; return this; }
    class(value) {
        try {
            let list = Array.isArray(value) ? value : [value];
            this.el.classList.add(...list);
        } catch (e) {
            console.error(`[NodeSculptor] Error adding class: ${e.message}`);
        }
        return this;
    }
    attribute(key, value) { this.el.setAttribute(key, value); return this; }
    css(styles) { Object.assign(this.el.style, styles); return this; }

    uniqueClass(rules) {
        let name = this.engine.generateClassName();
        this.engine.defineClass(name, rules);
        this.el.classList.add(name);
        return this;
    }

    oncreate(fn) {
        this.engine.oncreate(fn);
        return this;
    }

    on(event, fn) {
        if (typeof fn !== 'function') {
            throw new Error(`[NodeSculptor] .on('${event}', ...) expects a function, received ${typeof fn}`);
        }
        if (!this.el.id) {
            this.el.id = this.engine.generateId();
        }
        this.engine.scriptBuffer.push(
            `document.getElementById('${this.el.id}').addEventListener('${event}', ${fn.toString()});`
        );
        return this;
    }

    click(fn) { return this.on('click', fn); }

    append(child) {
        try {
            if (!child) return this;
            let node = child instanceof NodeElement ? child.el : child;
            this.el.appendChild(node);
        } catch (e) {
            console.error(`[NodeSculptor] Append failed: ${e.message}`);
        }
        return this;
    }
}

class Sculptor {
    constructor() {
        this.scriptBuffer = [];
        this.styleBuffer = [];
        this.loadBuffer = []; 
        this.idCounter = 0;
        this.classCounter = 0;
        this.lastRendered = "";
    }

    sharedClass(name, rules) {
        this.defineClass(name, rules);
        return this;
    }

    oncreate(fn) {
        if (typeof fn !== 'function') throw new Error(`[NodeSculptor] .oncreate() expects a function.`);
        this.loadBuffer.push(`(${fn.toString()})();`);
        return this;
    }

    generateId() {
        this.idCounter++;
        return `sc-id-${this.idCounter}-${Math.random().toString(36).substring(2, 5)}`;
    }

    generateClassName() {
        this.classCounter++;
        return `sc-cls-${this.classCounter}`;
    }

    defineClass(name, rules) {
        try {
            let cssString = Object.entries(rules)
                .map(([prop, val]) => {
                    let key = prop.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
                    return `${key}: ${val};`;
                }).join(' ');
            this.styleBuffer.push(`.${name} { ${cssString} }`);
        } catch (e) {
            console.error(`[NodeSculptor] CSS Definition Error: ${e.message}`);
        }
        return this;
    }

    create(tag) { return new NodeElement(tag, this); }
    div() { return this.create('div'); }
    button() { return this.create('button'); }
    input() { return this.create('input'); }
    h2() { return this.create('h2'); }

    render(root, config = {}) {
        try {
            if (!root) throw new Error("No root element provided to render.");

            let head = document.querySelector('head');
            let body = document.querySelector('body');
            
            document.querySelector('title').textContent = config.title || "";
            body.innerHTML = ""; 

            if (this.styleBuffer.length > 0) {
                let styleTag = document.createElement('style');
                styleTag.textContent = `\n${this.styleBuffer.join('\n')}\n`;
                head.appendChild(styleTag);
                this.styleBuffer = [];
            }

            let elements = Array.isArray(root) ? root : [root];
            elements.forEach((item, index) => {
                if (!item) throw new Error(`Element at index ${index} is undefined.`);
                let node = item instanceof NodeElement ? item.el : item;
                body.appendChild(node);
            });

            let finalScripts = [...this.scriptBuffer];
            if (this.loadBuffer.length > 0) {
                finalScripts.push(`window.addEventListener('load', () => {\n  ${this.loadBuffer.join('\n  ')}\n});`);
            }

            if (finalScripts.length > 0) {
                let scriptTag = document.createElement('script');
                scriptTag.textContent = `\n${finalScripts.join('\n')}\n`;
                body.appendChild(scriptTag);
                this.scriptBuffer = [];
                this.loadBuffer = [];
            }

            this.lastRendered = dom.serialize();
        } catch (e) {
            console.error(`[NodeSculptor Render Error] ${e.message}`);
        }
        return this;
    }

    save(path) {
        try {
            if (!this.lastRendered) throw new Error("Nothing to save. Call render() first.");
            fs.writeFileSync(path, this.lastRendered);
        } catch (e) {
            console.error(`[NodeSculptor Save Error] Failed to write to ${path}: ${e.message}`);
        }
        return this;
    }

    output() {
        return this.lastRendered;
    }
}

module.exports = Sculptor;