const { JSDOM } = require('jsdom');
const fs = require('fs');

class NodeElement {
    constructor(tag, engine) {
        try {
            this.engine = engine;
            this.el = engine.document.createElement(tag);
        } catch (e) {
            throw new Error(`[NodeSculptor] Failed to create <${tag}>: ${e.message}`);
        }
    }

    // --- Core API ---
    id(value) { this.el.id = value; return this; }
    text(value) { this.el.textContent = value; return this; }
    attribute(key, value) { this.el.setAttribute(key, value); return this; }
    css(styles) { Object.assign(this.el.style, styles); return this; }
    
    class(value) {
        let list = Array.isArray(value) ? value : [value];
        this.el.classList.add(...list);
        return this;
    }

    uniqueClass(rules) {
        let name = this.engine.generateClassName();
        this.engine.defineClass(name, rules);
        this.el.classList.add(name);
        return this;
    }

    // --- Reactivity & Binding ---
    bind(stateKey, templateFn = (val) => val) {
        if (!this.el.id) this.el.id = this.engine.generateId();
        this.engine.scriptBuffer.push(
            `window.watchState('${stateKey}', (val) => { 
                const el = document.getElementById('${this.el.id}');
                if (el) el.textContent = (${templateFn.toString()})(val); 
            });`
        );
        return this;
    }

    // --- Events & Lifecycle ---
    ref(name) {
        if (!this.el.id) this.el.id = this.engine.generateId();
        this.engine.refs[name] = this.el.id;
        return this;
    }

    on(event, fn) {
        if (!this.el.id) this.el.id = this.engine.generateId();
        this.engine.scriptBuffer.push(
            `document.getElementById('${this.el.id}').addEventListener('${event}', ${fn.toString()});`
        );
        return this;
    }

    click(fn) { return this.on('click', fn); }
    oncreate(fn) { this.engine.oncreate(fn); return this; }

    // --- Structure ---
    append(...children) {
        children.flat().forEach(child => {
            if (!child) return;
            this.el.appendChild(child instanceof NodeElement ? child.el : child);
        });
        return this;
    }
}

class Sculptor {
    constructor() {
        this.dom = new JSDOM(`<!DOCTYPE html><html lang="en"><head></head><body></body></html>`);
        this.document = this.dom.window.document;
        this.scriptBuffer = [];
        this.styleBuffer = [];
        this.loadBuffer = [];
        this.stateBuffer = {};
        this.refs = {};
    }

    // Obfuscated ID Generator: Generates random hex-like strings (e.g., "_x7a2b9")
    generateId() { 
        return `_${Math.random().toString(36).substring(2, 9)}`; 
    }

    // Obfuscated Class Generator: Generates short random strings (e.g., "_k9s2")
    generateClassName() { 
        return `_${Math.random().toString(36).substring(2, 7)}`; 
    }

    create(tag) { return new NodeElement(tag, this); }
    state(key, value) { this.stateBuffer[key] = value; return this; }
    
    defineClass(selector, rules, isRaw = false) {
        let css = Object.entries(rules).map(([p, v]) => {
            let key = p.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
            return `${key}: ${v};`;
        }).join(' ');
        this.styleBuffer.push(`${isRaw ? selector : '.' + selector} { ${css} }`);
        return this;
    }

    oncreate(fn) { this.loadBuffer.push(`(${fn.toString()})();`); return this; }

    // Element Shorthands
    div() { return this.create('div'); }
    button() { return this.create('button'); }
    h1() { return this.create('h1'); }
    span() { return this.create('span'); }
    p() { return this.create('p'); }

    render(root, config = {}) {
        const doc = this.document;
        const head = doc.querySelector('head');
        const body = doc.querySelector('body');
        head.innerHTML = body.innerHTML = "";

        // Internal JS Crusher to protect logic and save space
        const crush = (js) => js
            .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // Strip comments
            .replace(/\s+/g, ' ')                   // Collapse whitespace
            .replace(/{\s+/g, '{').replace(/\s+}/g, '}') 
            .replace(/;\s+/g, ';')
            .trim();

        const title = doc.createElement('title');
        title.textContent = config.title || "Sculpted Page";
        head.appendChild(title);

        if (this.styleBuffer.length) {
            const style = doc.createElement('style');
            style.textContent = this.styleBuffer.join('').replace(/\s+/g, ' ');
            head.appendChild(style);
        }

        (Array.isArray(root) ? root : [root]).forEach(node => body.appendChild(node.el || node));

        // Compressed Runtime
        const runtime = `
            window.UI={_m:${JSON.stringify(this.refs)},get:(n)=>document.getElementById(window.UI._m[n])};
            const _cbs={};window.watchState=(k,f)=>{(_cbs[k]=_cbs[k]||[]).push(f)};
            window.State=new Proxy(${JSON.stringify(this.stateBuffer)},{
                set(t,k,v){if(t[k]===v)return true;t[k]=v;if(_cbs[k])_cbs[k].forEach(f=>f(v));return true}
            });
        `;

        const script = doc.createElement('script');
        script.textContent = `(function(){${crush(runtime)}${crush(this.scriptBuffer.join(''))}window.addEventListener('DOMContentLoaded',()=>{${crush(this.loadBuffer.join(''))}})})()`;
        
        body.appendChild(script);

        this.lastRendered = this.dom.serialize();
        return this;
    }

    save(path) { fs.writeFileSync(path, this.lastRendered); return this; }
    output() { return this.lastRendered; }
}

module.exports = Sculptor;
