var TotalAllowedUsers = 0;
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
//getting firebase app configuration from api
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
//Sign out from firebase
function SignOutFirebase() {
    firebase.auth().signOut().then(function () {
        location.href = url + "/signin";
    }).catch(function (error) {
        // An error happened.
    });
}

//Creating new customer on stripe
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

//Get active subscriptions of user from stripe through api
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
          console.log(response.response);
        return response.response.data;
  
      });
    
}


//Get number of members allowed to the user / collaborators allowed to be added
function getCustomerMembersAllowed() {
    let customerid = document.querySelector('#customerid').value;
    return fetch('/get-cutomer-members-allowed', {
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
          console.log(response.response);
        return response.response.data;
  
      });
    
}

//Subscribing for more members
function confirmAddMembers(){
    let memcount = document.querySelector('#memberCount').value;
    Swal.fire({
        title: '<strong>New Member</strong>',
        icon: 'info',
        html:
          'Sure you want to add <b>'+memcount+'</b>? ',
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText:
          '<span style="width:100%" onclick="addmemberstosubscription();"><i class="fa fa-check"></i>Yes<span>',
        cancelButtonText:
          '<i class="fa fa-close"></i> Cancel',
      });
}
//Adding members to subscription in stripe
function addmemberstosubscription() {
    let membercount = document.querySelector('#memberCount').value;
    
    let customerid = document.querySelector('#customerid').value;
    return fetch('/customer-add-team-member', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            customerid: customerid,
            member:membercount
        }),
    })
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: membercount+' new members added to your subscription.',
            showConfirmButton: false,
            timer: 1500
          });
        return response;
  
      });
    
}

//Stripe customer portal session call
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

//Subscribe for trial - new customers only
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
                priceid: 'monthly'
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
                }).then(function(){
                    db.collection('tbl_audit_log').add({
                        content: `New Stripe Customer Registered ${UserObject.email} with customerID ${resp.customer.id}</b>`,
                        now: (new Date()).getTime(),
                        party: '',
                        date: '',
                        amount: '',
                        groupid:localStorage.getItem("groupid"),
                        user: localStorage.getItem("user"),
                        refId: UserObject.uid,
                        collection: 'tbl_stripecustomers'
                    });
                });
                $('#customerid').val(resp.customer.id);
                return fetch('/subscribe-trial-subscription', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        customerid: resp.customer.id,
                        priceid: 'monthly'
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
