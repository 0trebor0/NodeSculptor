const Sculptor = require('./Sculptor');
const App = new Sculptor();

// --- 1. Define Shared Blueprints ---
App.sharedClass('auth-box', { 
    backgroundColor: 'white', 
    padding: '40px', 
    borderRadius: '12px', 
    width: '320px', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
});

App.sharedClass('auth-input', { 
    width: '100%', 
    padding: '12px', 
    marginBottom: '10px', 
    border: '1px solid #ddd', 
    borderRadius: '6px' 
});

// --- 2. Build Views ---
const login = App.div().id('v-login').class('auth-box');
const register = App.div().id('v-register').class('auth-box').css({ display: 'none' });

login.append(App.h2().text('Login'))
    .append(App.input().attribute('placeholder', 'Email').class('auth-input'))
    .append(App.button().text('Enter').uniqueClass({ width: '100%', padding: '10px' })
        .click(() => {
            console.log("Login sequence started...");
            alert("Logging in...");
        })
    )
    .append(App.div().text('Switch to Register').css({ cursor: 'pointer', color: 'blue', marginTop: '10px' })
        .click(() => {
            document.getElementById('v-login').style.display = 'none';
            document.getElementById('v-register').style.display = 'block';
        })
    );

register.append(App.h2().text('Register'))
    .append(App.input().attribute('placeholder', 'Full Name').class('auth-input'))
    .append(App.button().text('Create Account').uniqueClass({ width: '100%', padding: '10px' })
        .click(() => {
            console.log("Register sequence started...");
            alert("Registering User...");
        })
    )
    .append(App.div().text('Switch to Login').css({ cursor: 'pointer', color: 'blue', marginTop: '10px' })
        .click(() => {
            document.getElementById('v-login').style.display = 'block';
            document.getElementById('v-register').style.display = 'none';
        })
    );

// --- 3. Global Initialization ---
App.oncreate(() => {
    console.log("Page is ready. Scripts are loaded at the bottom of the body.");
});

const page = App.div().append(login).append(register);
App.render(page, { title: 'Auth UI' }).save('index.html');