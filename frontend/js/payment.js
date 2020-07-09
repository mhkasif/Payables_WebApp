$(document).ready(function () {
    initializeFirebase();
});

function initializeFirebase() {
    var firebaseConfig = {
        apiKey: "AIzaSyCtH9KgxZjcSUAXo2Z75LyzRe0WO4mwg7g",
        authDomain: "fiver-1-safeer.firebaseapp.com",
        databaseURL: "https://fiver-1-safeer.firebaseio.com",
        projectId: "fiver-1-safeer",
        storageBucket: "fiver-1-safeer.appspot.com",
        messagingSenderId: "410280896300",
        appId: "1:410280896300:web:91495e0238d6558979ae89"
    };
    //initialize firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
    }
}

function SignOutFirebase() {
    firebase.auth().signOut().then(function () {
        location.href = url + "/signin.html";
    }).catch(function (error) {
        // An error happened.
    });
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};
