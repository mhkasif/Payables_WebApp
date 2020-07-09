$(document).ready(function () {
    initializeFirebase();
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            UserObject = user;
            $('#userimage').find('img').attr('src', UserObject.photoURL);
            $('#username').text(UserObject.displayName);
        } else {
            location.href = url + "/signin.html";
        }
    });
});

function SignOutFirebase() {
    firebase.auth().signOut().then(function () {
        location.href = "http://localhost/fiver01/signin.html";
    }).catch(function (error) {
        // An error happened.
    });
}
