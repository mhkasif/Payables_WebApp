function subscribeTrial() {
    createCustomerStart().then(async function (resp) {
        console.log(resp);
        $("#customerid").val(resp.customer.id);
        tblStripeCustomers = db.collection("tbl_stripecustomers");
        tblStripeCustomers.add({
            CustomerEmail: UserObject.email,
            customerid: resp.customer.id,
            UserID: UserObject.uid
        });
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
                tblStripeCustomers = db.collection("tbl_stripecustomers");
                tblStripeCustomers.where("UserID", "==", UserObject.uid).where("CustomerEmail", "==", UserObject.email).get().then(function (querySnapshot) {
                    if (querySnapshot.docs.length > 0) {
                        getCustomerSubscriptions().then(function (response) {

                            if (response.length > 0) {
                                if (response[0].status == "active" || response[0].status == "trialing") {
                                    location.href = url + "/index";
                                }
                            }

                        });
                    }
                });

            });
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

function sendEmail() {
    return fetch('/send-verification-email', {
method: 'post',
headers: {
    'Content-Type': 'application/json',
},
body: JSON.stringify({
    email: UserObject.email,uid:UserObject.uid
}),
})
.then((response) => {
  console.log(response);
  return response;
})
.then((response) => {
    console.log(response);
    return response;
});
}
