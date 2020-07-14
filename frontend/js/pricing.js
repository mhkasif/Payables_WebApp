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
            location.href = url + "/signin";
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
        location.href = url + "/signin";
    }).catch(function (error) {
        // An error happened.
    });
}

function createCustomer() {
    let billingEmail = UserObject.email;
  
    return fetch('/create-customer', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: billingEmail,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((result) => {
        return result;
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

function subscribeTrial() {
    let customerid = document.querySelector('#customerid').value;
    if(customerid){
        return fetch('/subscribe-trial-subscription', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customerid: customerid,
                priceid: 'price_1H2Y2wIr0OyOmRWpCxbTMjrR'
            }),
        })
            .then((response) => {
                console.log(response);
                return response.json();

            })
            .then((result) => {
                console.log(result);

            });
        }else{
            createCustomer().then(function(resp){
                console.log();
                tblStripeCustomers = db.collection("tbl_stripecustomers");
                tblStripeCustomers.add({
                    CustomerEmail: UserObject.email,
                    customerid: resp.customer.id,
                    UserID : UserObject.uid
                });
                $('#customerid').val(resp.id);
                return fetch('/subscribe-trial-subscription', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        customerid: resp.id,
                        priceid: 'basic'
                    }),
                })
                    .then((response) => {
                        console.log(response);
                        return response.json();
        
                    })
                    .then((result) => {
                        console.log(result);
        
                    });  
            });
        }
   
}