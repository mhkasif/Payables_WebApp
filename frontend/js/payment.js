$(document).ready(function () {
    initializeFirebase();
});
var fireBaseConfigInfo;
function getFirebaseConfig() {
        return fetch('/firebaseConfig', {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((response) => {
            fireBaseConfigInfo=response;
            console.log(fireBaseConfigInfo);
      
          });
}
function initializeFirebase() {
    getFirebaseConfig().then(function(){
    var firebaseConfig = fireBaseConfigInfo;
    //initialize firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
    }
});
}

function SignOutFirebase() {
    firebase.auth().signOut().then(function () {
        location.href = url + "/signin";
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
