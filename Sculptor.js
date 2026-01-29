const { JSDOM } = require('jsdom');
const fs = require('fs');

class NodeElement {
    constructor(tag, engine) {
        try {
            this.engine = engine;
            this.el = engine.document.createElement(tag);
        } catch (e) {
            throw new Error(`[NodeSculptor] Failed to create element <${tag}>: ${e.message}`);
        }
    }

    child(tag) {
        let childNode = this.engine.create(tag);
        this.append(childNode);
        return childNode;
    }

    id(value) { this.el.id = value; return this; }
    text(value) { this.el.textContent = value; return this; }

    ref(name) {
        if (!this.el.id) this.el.id = this.engine.generateId();
        this.engine.refs[name] = this.el.id;
        return this;
    }

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

    oncreate(fn) {
        this.engine.oncreate(fn);
        return this;
    }

    on(event, fn) {
        if (typeof fn !== 'function') throw new Error(`[NodeSculptor] .on expects a function.`);
        if (!this.el.id) this.el.id = this.engine.generateId();

        this.engine.scriptBuffer.push(
            `document.getElementById('${this.el.id}').addEventListener('${event}', ${fn.toString()});`
        );
        return this;
    }

    click(fn) { return this.on('click', fn); }

    append(...children) {
        children.flat().forEach(child => {
            if (!child) return;
            let node = child instanceof NodeElement ? child.el : child;
            this.el.appendChild(node);
        });
        return this;
    }
}

class Sculptor {
    constructor() {
        this.dom = new JSDOM(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title></title></head><body></body></html>`);
        this.document = this.dom.window.document;

        this.scriptBuffer = [];
        this.styleBuffer = [];
        this.loadBuffer = [];
        this.stateBuffer = {};
        this.refs = {};
        this.lastRendered = "";
    }

    globalStyle(selector, rules) {
        return this.defineClass(selector, rules, true);
    }

    sharedClass(name, rules) {
        this.defineClass(name, rules);
        return this;
    }

    defineClass(selector, rules, isRawSelector = false) {
        try {
            let cssString = Object.entries(rules)
                .map(([prop, val]) => {
                    let key = prop.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
                    return `${key}: ${val};`;
                }).join(' ');
            
            let finalSelector = isRawSelector ? selector : `.${selector}`;
            this.styleBuffer.push(`${finalSelector} { ${cssString} }`);
        } catch (e) {
            console.error(`[NodeSculptor] CSS Definition Error: ${e.message}`);
        }
        return this;
    }

    state(key, value) { 
        this.stateBuffer[key] = value; 
        return this; 
    }

    generateId() { 
        return `_${Math.random().toString(36).substring(2, 9)}`; 
    }

    generateClassName() { 
        return `_${Math.random().toString(36).substring(2, 7)}`; 
    }

    oncreate(fn) {
        if (typeof fn !== 'function') throw new Error(`[NodeSculptor] .oncreate() expects a function.`);
        this.loadBuffer.push(`(${fn.toString()})();`);
        return this;
    }

    create(tag) { return new NodeElement(tag, this); }

    div() { return this.create('div'); }
    span() { return this.create('span'); }
    section() { return this.create('section'); }
    article() { return this.create('article'); }
    nav() { return this.create('nav'); }
    header() { return this.create('header'); }
    footer() { return this.create('footer'); }
    main() { return this.create('main'); }
    h1() { return this.create('h1'); }
    h2() { return this.create('h2'); }
    h3() { return this.create('h3'); }
    p() { return this.create('p'); }
    label() { return this.create('label'); }
    a() { return this.create('a'); }
    button() { return this.create('button'); }
    input() { return this.create('input'); }
    textarea() { return this.create('textarea'); }
    select() { return this.create('select'); }
    option() { return this.create('option'); }
    img() { return this.create('img'); }
    ul() { return this.create('ul'); }
    li() { return this.create('li'); }
    canvas() { return this.create('canvas'); }
    strong() { return this.create('strong'); }
    hr() { return this.create('hr'); }
    svg() { return this.create('svg'); }
    path() { return this.create('path'); }

    render(root, config = {}) {
        try {
            let document = this.document;
            let head = document.querySelector('head');
            let body = document.querySelector('body');

            const crush = (js) => js
                .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') 
                .replace(/\s+/g, ' ')                   
                .replace(/{\s+/g, '{').replace(/\s+}/g, '}') 
                .replace(/;\s+/g, ';')
                .trim();

            document.querySelector('title').textContent = config.title || "Sculpted Page";
            body.innerHTML = "";

            // --- Meta Tag Support ---
            if (config.meta) {
                let metas = Array.isArray(config.meta) ? config.meta : [config.meta];
                metas.forEach(m => {
                    let meta = document.createElement('meta');
                    Object.entries(m).forEach(([attr, val]) => meta.setAttribute(attr, val));
                    head.appendChild(meta);
                });
            }

            // --- External Script Support ---
            if (config.scripts) {
                let scrs = Array.isArray(config.scripts) ? config.scripts : [config.scripts];
                scrs.forEach(src => {
                    let script = document.createElement('script');
                    script.src = src;
                    head.appendChild(script);
                });
            }

            if (config.css) {
                let cssFiles = Array.isArray(config.css) ? config.css : [config.css];
                cssFiles.forEach(href => {
                    let link = document.createElement('link');
                    link.rel = 'stylesheet'; link.href = href;
                    head.appendChild(link);
                });
            }

            if (config.icon) {
                let icon = document.createElement('link');
                icon.rel = 'shortcut icon'; icon.href = config.icon; icon.type = 'image/x-icon';
                head.appendChild(icon);
            }

            if (this.styleBuffer.length > 0) {
                let styleTag = document.createElement('style');
                styleTag.textContent = crush(this.styleBuffer.join(' '));
                head.appendChild(styleTag);
                this.styleBuffer = [];
            }

            let elements = Array.isArray(root) ? root : [root];
            elements.forEach(item => {
                let node = item instanceof NodeElement ? item.el : item;
                body.appendChild(node);
            });

            const runtime = `
                window.UI={_m:${JSON.stringify(this.refs)},get:(n)=>document.getElementById(window.UI._m[n])};
                const _cbs={};window.watchState=(k,f)=>{(_cbs[k]=_cbs[k]||[]).push(f)};
                window.State=new Proxy(${JSON.stringify(this.stateBuffer)}, {
                    set(t,k,v){if(t[k]===v)return true;t[k]=v;if(_cbs[k])_cbs[k].forEach(f=>f(v));return true}
                });
            `;

            let scriptTag = document.createElement('script');
            scriptTag.textContent = `(function(){${crush(runtime)}${crush(this.scriptBuffer.join(''))}window.addEventListener('load',()=>{${crush(this.loadBuffer.join(''))}})})()`;
            
            body.appendChild(scriptTag);

            this.scriptBuffer = [];
            this.loadBuffer = [];
            this.refs = {};
            this.lastRendered = this.dom.serialize();
        } catch (e) {
            console.error(`[NodeSculptor Render Error] ${e.message}`);
        }
        return this;
    }

    save(path) {
        fs.writeFileSync(path, this.lastRendered);
        return this;
    }

    output() {
        return this.lastRendered;
    }
}

module.exports = Sculptor;