const Sculptor = require('./Sculptor');


const App = new Sculptor();

const box = { backgroundColor: 'white', padding: '40px', borderRadius: '12px', width: '320px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const input = { width: '100%', padding: '12px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '6px' };

const login = App.div().id('v-login').uniqueClass(box);
const register = App.div().id('v-register').uniqueClass(box).css({ display: 'none' });

// 1. LOGIN SCRIPT (Inside .click)
login.append(App.h2().text('Login'))
    .append(App.input().attribute('placeholder', 'Email').uniqueClass(input))
    .append(App.button().text('Enter').uniqueClass({ width: '100%', padding: '10px' })
        .click(() => {
            // This is the login logic script
            console.log("Login sequence started...");
            alert("Logging in...");
        })
    )
    .append(App.div().text('Switch to Register').css({ cursor: 'pointer', color: 'blue', marginTop: '10px' })
        .click(() => {
            // View Switching Script
            document.getElementById('v-login').style.display = 'none';
            document.getElementById('v-register').style.display = 'block';
        })
    );

// 2. REGISTER SCRIPT (Inside .click)
register.append(App.h2().text('Register'))
    .append(App.input().attribute('placeholder', 'Full Name').uniqueClass(input))
    .append(App.button().text('Create Account').uniqueClass({ width: '100%', padding: '10px' })
        .click(() => {
            // This is the register logic script
            console.log("Register sequence started...");
            alert("Registering User...");
        })
    )
    .append(App.div().text('Switch to Login').css({ cursor: 'pointer', color: 'blue', marginTop: '10px' })
        .click(() => {
            // View Switching Script
            document.getElementById('v-login').style.display = 'block';
            document.getElementById('v-register').style.display = 'none';
        })
    );

// 3. INITIALIZATION SCRIPT (Inside .oncreate)
App.oncreate(() => {
    console.log("Page is ready. Scripts are loaded at the bottom of the body.");
});

const page = App.div().append(login).append(register);
App.render(page, { title: 'Auth UI' }).save('index.html');


