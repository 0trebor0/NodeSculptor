const Sculptor = require('./Sculptor');
const App = new Sculptor();

// --- 1. Shared Styling ---
App.sharedClass('auth-container', {
    width: '350px',
    padding: '30px',
    margin: '100px auto',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
});

App.sharedClass('form-input', {
    width: '100%',
    padding: '12px',
    margin: '8px 0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box'
});

App.sharedClass('toggle-link', {
    color: '#007bff',
    cursor: 'pointer',
    textAlign: 'center',
    marginTop: '15px',
    fontSize: '14px'
});

// --- 2. Login View ---
// We use .ref() instead of .id()
const loginView = App.div().ref('login').class('auth-container');

loginView.append(App.h2().text('Welcome Back'))
    .append(App.input().attribute('type', 'email').attribute('placeholder', 'Email').class('form-input'))
    .append(App.input().attribute('type', 'password').attribute('placeholder', 'Password').class('form-input'))
    .append(App.button().text('Login').uniqueClass({ 
        width: '100%', padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' 
    }).click(() => {
        alert('Attempting Login...');
    }))
    .append(App.div().text('Need an account? Register here.').class('toggle-link').click(() => {
        // Use UI.get() instead of document.getElementById
        UI.get('login').style.display = 'none';
        UI.get('register').style.display = 'block';
    }));

// --- 3. Register View ---
const registerView = App.div().ref('register').class('auth-container').css({ display: 'none' });

registerView.append(App.h2().text('Create Account'))
    .append(App.input().attribute('placeholder', 'Full Name').class('form-input'))
    .append(App.input().attribute('type', 'email').attribute('placeholder', 'Email').class('form-input'))
    .append(App.input().attribute('type', 'password').attribute('placeholder', 'Password').class('form-input'))
    .append(App.button().text('Sign Up').uniqueClass({ 
        width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' 
    }).click(() => {
        alert('Account Created Successfully!');
    }))
    .append(App.div().text('Already have an account? Login.').class('toggle-link').click(() => {
        UI.get('login').style.display = 'block';
        UI.get('register').style.display = 'none';
    }));

// --- 4. Global Script ---
App.oncreate(() => { console.log("Auth UI Initialized."); });
App.oncreate(() => { console.log("Second initialization check."); });

// --- 5. Render ---
App.render([loginView, registerView], { title: 'Auth Portal' }).save('index.html');