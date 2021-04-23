// Constant used to set whether we should run the system in development mode or production mode.
// Should always be set to false before merging to main or building frontend.
const DEV_MODE = true;

// Function used to grab the JSON Web Token from session storage.
// Used by any api calls for Authorization.
// If there is no token, will return the empty string, which will result in a 401 Unauthorized error getting thrown.
function getToken() {
    let token = window.sessionStorage.getItem('token');
    if (token === null) {
        return '';
    } else {
        return token;
    }
}

export const headers = DEV_MODE ? {
    'Content-Type': 'application/json'
} : {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + getToken()
}

// APIs route to dev server if DEV_MODE true, otherwise they route to the production server.
export const route = DEV_MODE ? "http://127.0.0.1:5000/faculty/" : "http://10.171.204.196/api/faculty/";


