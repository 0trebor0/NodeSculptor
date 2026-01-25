const { JSDOM } = require('jsdom');
const fs = require('fs');

const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
const document = dom.window.document;

class NodeElement {
    constructor(tag, engine) {
        this.el = document.createElement(tag);
        this.engine = engine;
    }

    // --- name(value) Pattern ---
    id(value) { this.el.id = value; return this; }
    text(value) { this.el.textContent = value; return this; }
    class(value) {
        const list = Array.isArray(value) ? value : [value];
        this.el.classList.add(...list);
        return this;
    }
    attribute(key, value) { this.el.setAttribute(key, value); return this; }
    css(styles) { Object.assign(this.el.style, styles); return this; }

    uniqueClass(rules) {
        const name = this.engine.generateClassName();
        this.engine.defineClass(name, rules);
        this.el.classList.add(name);
        return this;
    }

    // Now NodeElement can trigger oncreate for the global engine
    oncreate(fn) {
        this.engine.oncreate(fn);
        return this;
    }

    on(event, fn) {
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
        const node = child instanceof NodeElement ? child.el : child;
        this.el.appendChild(node);
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

    oncreate(fn) {
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
        const cssString = Object.entries(rules)
            .map(([prop, val]) => {
                const key = prop.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
                return `${key}: ${val};`;
            }).join(' ');
        this.styleBuffer.push(`.${name} { ${cssString} }`);
        return this;
    }

    create(tag) { return new NodeElement(tag, this); }
    div() { return this.create('div'); }
    button() { return this.create('button'); }
    input() { return this.create('input'); }
    h2() { return this.create('h2'); }

    render(root, config = { title: 'Sculptor App' }) {
        const html = this.create('html').attribute('lang', 'en');
        const head = this.create('head');
        const body = this.create('body').css({
            backgroundColor: '#f8f9fa',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            margin: '0',
            fontFamily: 'sans-serif'
        });

        head.append(this.create('meta').attribute('charset', 'UTF-8'));
        head.append(this.create('title').text(config.title));

        if (this.styleBuffer.length > 0) {
            head.append(this.create('style').text(`\n${this.styleBuffer.join('\n')}\n`));
            this.styleBuffer = [];
        }

        body.append(root);

        let finalScripts = [...this.scriptBuffer];
        if (this.loadBuffer.length > 0) {
            // Requirement: window.onload logic inside the body script
            finalScripts.push(`window.addEventListener('load', () => {\n  ${this.loadBuffer.join('\n  ')}\n});`);
        }

        if (finalScripts.length > 0) {
            body.append(this.create('script').text(`\n${finalScripts.join('\n')}\n`));
            this.scriptBuffer = [];
            this.loadBuffer = [];
        }

        html.append(head).append(body);
        this.lastRendered = '<!DOCTYPE html>\n' + html.el.outerHTML;
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