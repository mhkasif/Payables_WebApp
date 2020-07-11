$(document).ready(function () {
    getFirebaseConfig().then(function(){
    initializeFirebase();
    getFirebaseConfig().then(function(){
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            UserObject = user;
            $('#userimage').find('img').attr('src', UserObject.photoURL);
            $('#username').text(UserObject.displayName);
        } else {
            location.href = url + "/signin.html";
        }
    });});
});
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
      
          });
}

function SignOutFirebase() {
    firebase.auth().signOut().then(function () {
        location.href = url + "/signin.html";
    }).catch(function (error) {
        // An error happened.
    });
}


function getCustomerSubscriptions() {
    let customerid = document.querySelector('#customerid').value;
    return fetch('/get-cutomer-subscriptions', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            customerid: customerid,
        }),
    })
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        return response.response.data;
  
      });
}


function createCustomerPortalSession() {
    let customerid = document.querySelector('#customerid').value;

    return fetch('/create-customerportal-session', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            customerid: customerid,
        }),
    })
        .then((response) => {
            console.log(response);
            return response.json();
        })
        .then((result) => {
            console.log(result);
            var win = window.open(result.session.url, '_blank');
            if (win) {
                //Browser has allowed it to be opened
                win.focus();
            }
            return result;
        });
}