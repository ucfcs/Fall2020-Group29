

// Function used to grab the JSON Web Token from session storage.
// Used by any api calls for Authorization.
// If there is no token, will return the empty string, which will result in a 401 Unauthorized error getting thrown.
export function getToken() {
    let token = window.sessionStorage.getItem('token');
    if (token === null) {
        return '';
    } else {
        return token;
    }
}

// Development Route, comment out before building for production.
// export const route = "http://127.0.0.1:5000/";

// Production Route, comment out when connecting to local Flask server.
export const route = "http://10.171.204.196/api/faculty/";