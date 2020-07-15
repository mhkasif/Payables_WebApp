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

async function createCustomerStart() {
       var customer_email = UserObject.email;
      return fetch('/create-customer', {
          method: 'post',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              email: customer_email,
          }),
      })
        .then((response) => {
          return response.json();
        })
        .then((response) => {
          return response;
    
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
    console.log(UserObject.email);
    let customerid = document.querySelector('#customerid').value;
    if(customerid){
        return fetch('/subscribe-trial-subscription', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customerid: customerid,
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
        }else{
            
                createCustomerStart().then(async function(resp){
                console.log(resp);
                tblStripeCustomers = db.collection("tbl_stripecustomers");
                tblStripeCustomers.add({
                    CustomerEmail: UserObject.email,
                    customerid: resp.customer.id,
                    UserID : UserObject.uid
                });
                $('#customerid').val(resp.customer.id);
                return fetch('/subscribe-trial-subscription', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        customerid: resp.customer.id,
                        priceid: 'basic'
                    }),
                })
                    .then((response) => {
                        console.log(response);
                        return response.json();
        
                    })
                    .then((result) => {
                        console.log(result);
                        tblStripeCustomers = db.collection("tbl_stripecustomers");
                        tblStripeCustomers.where("UserID","==",UserObject.uid).where("CustomerEmail", "==", UserObject.email).get().then(function (querySnapshot) {
                            if (querySnapshot.docs.length > 0) {
                                $('#customerid').val(querySnapshot.docs[0].data().customerid);
                                $("#billingdetailLink").show();
                                getCustomerSubscriptions().then(function (response){
                              
                                if(response.length>0){
                                    if(response[0].status=="active" || response[0].status=="trialing"){
                                        console.log(response[0]);
                                        $(".subbtn").addClass("disable-sub-btn");
                                        var plan = '$'+response[0].plan.amount/100+'/'+response[0].plan.interval;
                                        $("#amtpaid").html('$'+response[0].plan.amount/100);
                                        if(response[0].status=="trialing"){
                                            plan = "7 days trial";
                                            $("#amtpaid").html('$0.00');
                                        }
                                        $("#plan").html(plan);
                                        $("#expdate").html(new Date(response[0].current_period_end*1000).toLocaleDateString());
                                        $("#trandate").html(new Date(response[0].current_period_start*1000).toLocaleDateString());
                                    }else{
                                        $(".subbtn").removeClass("disable-sub-btn");
                                    }
                                }
    
                                });
                            }
                        });
        
                    });  
            });
        
        }
   
}