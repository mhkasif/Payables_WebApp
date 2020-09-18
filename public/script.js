let stripe, customer, price, card;
let apiURL = "";
//pricing object for public
let priceInfo = {
  monthly: {
    amount: '10.00',
    name: 'Monthly',
    interval: 'monthly',
    currency: 'USD',
  },
  yearly: {
    amount: '99.00',
    name: 'Yearly',
    interval: 'yearly',
    currency: 'USD',
    },
};
let GlobalCouponResult;
//Initializing stripe elements on form
function stripeElements(publishableKey) {
  stripe = Stripe(publishableKey);

  if (document.getElementById('card-element')) {
    let elements = stripe.elements();

    // Card Element styles
      let style = {
      hidePostalCode:true,
      base: {
        fontSize: '16px',
        color: '#32325d',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          color: '#a0aec0',
        },
      },
    };

    card = elements.create('card', { style: style });

    card.mount('#card-element');

      card.on('focus', function () {
      let el = document.getElementById('card-element-errors');
      el.classList.add('focused');
    });

    card.on('blur', function () {
      let el = document.getElementById('card-element-errors');
      el.classList.remove('focused');
    });

      card.on('change', function (event) {

          displayError(event);

    });
  }

 

  let paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
    paymentForm.addEventListener('submit', function (evt) {
   
        evt.preventDefault();
        changeLoadingState(true);
        GlobalCouponResult = null;
        getDiscountCoupon().then((result) => {
      
            if (result.result) {
                GlobalCouponResult = result;
                

      // If a previous payment was attempted, get the lastest invoice
      const latestInvoicePaymentIntentStatus = localStorage.getItem(
        'latestInvoicePaymentIntentStatus'
      );

      if (latestInvoicePaymentIntentStatus === 'requires_payment_method') {
        const invoiceId = localStorage.getItem('latestInvoiceId');
        const isPaymentRetry = true;
        // create new payment method & retry payment on invoice with new payment method
        createPaymentMethod({
          card,
          isPaymentRetry,
          invoiceId,
        });
      } else {
        // create new payment method & create subscription
        createPaymentMethod({ card });
      }
            }else{
              changeLoadingState(false);
            }
        });
    });
  }
}

//Error/form authentication
function displayError(event) {
  changeLoadingStatePrices(false);
  let displayError = document.getElementById('card-element-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
}

//Creating payment for user on pressing subscribe button
function createPaymentMethod({ card, isPaymentRetry, invoiceId }) {
  const params = new URLSearchParams(document.location.search.substring(1));
    const customerId = $('#customerid').val();
  // Set up payment method for recurring usage
  let billingName = document.querySelector('#name').value;

  // let priceId = document.getElementById('priceId').innerHTML.toUpperCase();
    let priceId = $('#priceid').val();

  stripe
    .createPaymentMethod({
      type: 'card',
      card: card,
      billing_details: {
        name: billingName,
      },
    })
    .then((result) => {
      if (result.error) {
        displayError(result);
      } else {
        if (isPaymentRetry) {
          // Update the payment method and retry invoice payment
          retryInvoiceWithNewPaymentMethod({
            customerId: customerId,
            paymentMethodId: result.paymentMethod.id,
            invoiceId: invoiceId,
            priceId: priceId,
          });
        } else {
          // Create the subscription
            createSubscription({
                customerId: customerId,
                paymentMethodId: result.paymentMethod.id,
                priceId: priceId,
            }).then(function (resp) { console.log(resp);});
        }
      }
    });
}

//Go to pricing page
function goToPaymentPage(priceId) {
  // Show the payment screen
  document.querySelector('#payment-form').classList.remove('hidden');

  document.getElementById('total-due-now').innerText = getFormattedAmount(
    priceInfo[priceId].amount
  );

  // Add the price selected
  document.getElementById('price-selected').innerHTML =
    '→ Subscribing to ' +
    '<span id="priceId" class="font-bold">' +
    priceInfo[priceId].name +
    '</span>';

  // Update the border to show which price is selected
  changePriceSelection(priceId);
}

function changePrice() {
  demoChangePrice();
}

function switchPrices(newPriceIdSelected) {
  const params = new URLSearchParams(document.location.search.substring(1));
  const currentSubscribedpriceId = params.get('priceId');
  const customerId = params.get('customerId');
  const subscriptionId = params.get('subscriptionId');
  // Update the border to show which price is selected
  changePriceSelection(newPriceIdSelected);

  changeLoadingStatePrices(true);

  // Retrieve the upcoming invoice to display details about
  // the price change
  retrieveUpcomingInvoice(customerId, subscriptionId, newPriceIdSelected).then(
    (upcomingInvoice) => {
      // Change the price details for price upgrade/downgrade
      // calculate if it's upgrade or downgrade
      document.getElementById(
        'current-price-subscribed'
      ).innerHTML = capitalizeFirstLetter(currentSubscribedpriceId);

      document.getElementById(
        'new-price-selected'
      ).innerText = capitalizeFirstLetter(newPriceIdSelected);

      document.getElementById('new-price-price-selected').innerText =
        '$' + upcomingInvoice.amount_due;

      let nextPaymentAttemptDateToDisplay = getDateStringFromUnixTimestamp(
        upcomingInvoice.next_payment_attempt
      );
      document.getElementById(
        'new-price-start-date'
      ).innerHTML = nextPaymentAttemptDateToDisplay;

      changeLoadingStatePrices(false);
    }
  );

  if (currentSubscribedpriceId != newPriceIdSelected) {
    document.querySelector('#price-change-form').classList.remove('hidden');
  } else {
    document.querySelector('#price-change-form').classList.add('hidden');
  }
}

function confirmPriceChange() {
  const params = new URLSearchParams(document.location.search.substring(1));
  const subscriptionId = params.get('subscriptionId');
  let newPriceId = document.getElementById('new-price-selected').innerHTML;

  updateSubscription(newPriceId.toUpperCase(), subscriptionId).then(
    (result) => {
      let searchParams = new URLSearchParams(window.location.search);
      searchParams.set('priceId', newPriceId.toUpperCase());
      searchParams.set('priceHasChanged', true);
      window.location.search = searchParams.toString();
    }
  );
}



//Creating customer on stripe using api
function createCustomer() {
  let billingEmail = document.querySelector('#email').value;

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
//Get coupon details
function getDiscountCoupon() {
    let discountCoupon = document.querySelector('#coupon').value;
    $("#error-message-coupon").hide();
        return fetch('/get-discount-coupon', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                coupon: discountCoupon,
            }),
        })
            .then((response) => {
                console.log(response);
                return response.json();

            })
            .then((result) => {
                console.log(result);
                if (discountCoupon) {
                    if (result.coupon) {
                        if (result.coupon.valid) {
                            $("#error-message-coupon").hide();
                            return { result: true, coupon: discountCoupon };
                        } else {
                            $("#error-message-coupon").text("Coupon expired");
                            $("#error-message-coupon").show();
                            return { result: false, coupon: null };
                        }
                    } else {
                        $("#error-message-coupon").show();
                        $("#error-message-coupon").text("Invalid Coupon");
                        return { result: false, coupon: null };
                    }
                } else {
                    return { result: true, coupon: null };
                }

            });
   
}


function handleCustomerActionRequired({
  subscription,
  invoice,
  priceId,
  paymentMethodId,
  isRetry,
}) {
  if (subscription && subscription.status === 'active') {
    // subscription is active, no customer actions required.
    return { subscription, priceId, paymentMethodId };
  }

  // If it's a first payment attempt, the payment intent is on the subscription latest invoice.
  // If it's a retry, the payment intent will be on the invoice itself.
  let paymentIntent = invoice
    ? invoice.payment_intent
    : subscription.latest_invoice.payment_intent;

  if (
    paymentIntent.status === 'requires_action' ||
    (isRetry === true && paymentIntent.status === 'requires_payment_method')
  ) {
    return stripe
      .confirmCardPayment(paymentIntent.client_secret, {
        payment_method: paymentMethodId,
      })
      .then((result) => {
        if (result.error) {
          // start code flow to handle updating the payment details
          // Display error message in your UI.
          // The card was declined (i.e. insufficient funds, card has expired, etc)
          throw result;
        } else {
          if (result.paymentIntent.status === 'succeeded') {
            // There's a risk of the customer closing the window before callback
            // execution. To handle this case, set up a webhook endpoint and
            // listen to invoice.paid. This webhook endpoint returns an Invoice.
            return {
              priceId: priceId,
              subscription: subscription,
              invoice: invoice,
              paymentMethodId: paymentMethodId,
            };
          }
        }
      });
  } else {
    // No customer action needed
    return { subscription, priceId, paymentMethodId };
  }
}

function handlePaymentMethodRequired({
  subscription,
  paymentMethodId,
  priceId,
}) {
  if (subscription.status === 'active') {
    // subscription is active, no customer actions required.
    return { subscription, priceId, paymentMethodId };
  } else if (
    subscription.latest_invoice.payment_intent.status ===
    'requires_payment_method'
  ) {
    // Using localStorage to store the state of the retry here
    // (feel free to replace with what you prefer)
    // Store the latest invoice ID and status
    localStorage.setItem('latestInvoiceId', subscription.latest_invoice.id);
    localStorage.setItem(
      'latestInvoicePaymentIntentStatus',
      subscription.latest_invoice.payment_intent.status
    );
    throw { error: { message: 'Your card was declined.' } };
  } else {
    return { subscription, priceId, paymentMethodId };
  }
}
var fireBaseConfigInfo;

//Getting firebase configurations from api
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

var db, UserObject, tblUsers,tblStripeCustomers;
//Initialize firebase app
function initializeFirebase1() {
  getFirebaseConfig().then(function(){
    var firebaseConfig = fireBaseConfigInfo;
    //initialize firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);


        db = firebase.firestore();
        tblUsers = db.collection("tbl_users");
     

    }

    tblStripeCustomers = db.collection("tbl_stripecustomers");
    tblStripeCustomers.where("UserID", "==", UserObject.uid).where("CustomerEmail", "==", UserObject.email).get().then(function (querySnapshot) { 
        if (querySnapshot.docs.length > 0) {
            $('#customerid').val(querySnapshot.docs[0].data().customerid);
        } else {
            createCustomer().then((result) => {
                customer = result.customer;
                tblStripeCustomers.add({
                    CustomerEmail: UserObject.email,
                    customerid: customer.id,
                    UserID: UserObject.uid
                }).then(function(){
                  db.collection('tbl_audit_log').add({
                    content: `New Stripe Customer Registered ${UserObject.email} with customerID ${customer.id}</b>`,
                    now: (new Date()).getTime(),
                    groupid:localStorage.getItem("groupid"),
                    party: '',
                    date: '',
                    amount: '',
                    user: localStorage.getItem("user"),
                    refId: UserObject.uid,
                    collection: 'tbl_stripecustomers'
                });
                });
                $('#customerid').val(customer.id);
            });
        }
    });
   
  });
}

//On payment success function handler
function onSubscriptionComplete(result) {
  console.log(result);
  // Payment was successful. Provision access to your service.
  // Remove invoice from localstorage because payment is now complete.
    clearCache();
    console.log(result);
  // Change your UI to show a success message to your customer.
    onSubscriptionSampleDemoComplete(result);
    
  // Call your backend to grant access to your service based on
  // the product your customer subscribed to.
  // Get the product by using result.subscription.price.product
}

//Creating subscription on stripe
function createSubscription({ customerId, paymentMethodId, priceId }) {
  return (
    fetch('/create-subscription', {
      method: 'post',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        customerId: customerId,
        paymentMethodId: paymentMethodId,
          priceId: priceId,
          coupon: (GlobalCouponResult.coupon ? GlobalCouponResult.coupon:"no-coupon-added")
      }),
    })
          .then((response) => {
              console.log(response);
        return response.json();
      })
      // If the card is declined, display an error to the user.
      .then((result) => {
        if (result.error) {
          // The card had an error when trying to attach it to a customer
          throw result;
        }
        return result;
      })
      // Normalize the result to contain the object returned
      // by Stripe. Add the addional details we need.
      .then((result) => {
        return {
          // Use the Stripe 'object' property on the
          // returned result to understand what object is returned.
          subscription: result,
          paymentMethodId: paymentMethodId,
          priceId: priceId,
        };
      })
      // Some payment methods require a customer to do additional
      // authentication with their financial institution.
      // Eg: 2FA for cards.
      .then(handleCustomerActionRequired)
      // If attaching this card to a Customer object succeeds,
      // but attempts to charge the customer fail. You will
      // get a requires_payment_method error.
      .then(handlePaymentMethodRequired)
      // No more actions required. Provision your service for the user.
      .then(onSubscriptionComplete)
      .catch((error) => {
        // An error has happened. Display the failure to the user here.
        // We utilize the HTML element we created.
        displayError(error);
      })
  );
}

function retryInvoiceWithNewPaymentMethod({
  customerId,
  paymentMethodId,
  invoiceId,
  priceId,
}) {
  return (
    fetch('/retry-invoice', {
      method: 'post',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        customerId: customerId,
        paymentMethodId: paymentMethodId,
        invoiceId: invoiceId,
      }),
    })
      .then((response) => {
        return response.json();
      })
      // If the card is declined, display an error to the user.
      .then((result) => {
        if (result.error) {
          // The card had an error when trying to attach it to a customer
          throw result;
        }
        return result;
      })
      // Normalize the result to contain the object returned
      // by Stripe. Add the addional details we need.
      .then((result) => {
        return {
          // Use the Stripe 'object' property on the
          // returned result to understand what object is returned.
          invoice: result,
          paymentMethodId: paymentMethodId,
          priceId: priceId,
          isRetry: true,
        };
      })
      // Some payment methods require a customer to be on session
      // to complete the payment process. Check the status of the
      // payment intent to handle these actions.
      .then(handleCustomerActionRequired)
      // No more actions required. Provision your service for the user.
      .then(onSubscriptionComplete)
      .catch((error) => {
        // An error has happened. Display the failure to the user here.
        // We utilize the HTML element we created.
        displayError(error);
      })
  );
}

function retrieveUpcomingInvoice(customerId, subscriptionId, newPriceId) {
  return fetch('/retrieve-upcoming-invoice', {
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      customerId: customerId,
      subscriptionId: subscriptionId,
      newPriceId: newPriceId,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((invoice) => {
      return invoice;
    });
}

function cancelSubscription() {
  changeLoadingStatePrices(true);
  const params = new URLSearchParams(document.location.search.substring(1));
  const subscriptionId = params.get('subscriptionId');

  return fetch('/cancel-subscription', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subscriptionId: subscriptionId,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((cancelSubscriptionResponse) => {
      return subscriptionCancelled(cancelSubscriptionResponse);
    });
}

function updateSubscription(priceId, subscriptionId) {
  return fetch('/update-subscription', {
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      subscriptionId: subscriptionId,
      newPriceId: priceId,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      return response;
    });
}

function retrieveCustomerPaymentMethod(paymentMethodId) {
  return fetch('/retrieve-customer-payment-method', {
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      paymentMethodId: paymentMethodId,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      return response;
    });
}


//Get stripe configurations from api
function getConfig() {
  return fetch('/config', {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      // Set up Stripe Elements
      stripeElements(response.publishableKey);

    });
}

getConfig();

/* ------ Sample helpers ------- */

function getFormattedAmount(amount) {
  // Format price details and detect zero decimal currencies
  var amount = amount;
  var numberFormat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'symbol',
  });
  var parts = numberFormat.formatToParts(amount);
  var zeroDecimalCurrency = true;
  for (var part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false;
    }
  }
  amount = zeroDecimalCurrency ? amount : amount;
  var formattedAmount = numberFormat.format(amount);

  return formattedAmount;
}

function capitalizeFirstLetter(string) {
  let tempString = string.toLowerCase();
  return tempString.charAt(0).toUpperCase() + tempString.slice(1);
}

function getDateStringFromUnixTimestamp(date) {
  let nextPaymentAttemptDate = new Date(date * 1000);
  let day = nextPaymentAttemptDate.getDate();
  let month = nextPaymentAttemptDate.getMonth() + 1;
  let year = nextPaymentAttemptDate.getFullYear();

  return month + '/' + day + '/' + year;
}

// For demo purpose only
function getCustomersPaymentMethod() {
  let params = new URLSearchParams(document.location.search.substring(1));

  let paymentMethodId = params.get('paymentMethodId');
  if (paymentMethodId) {
    retrieveCustomerPaymentMethod(paymentMethodId).then(function (response) {
      document.getElementById('credit-card-last-four').innerText =
        capitalizeFirstLetter(response.card.brand) +
        ' •••• ' +
        response.card.last4;

      document.getElementById(
        'subscribed-price'
      ).innerText = capitalizeFirstLetter(params.get('priceId'));
    });
  }
}

getCustomersPaymentMethod();

// Shows the cancellation response
function subscriptionCancelled() {
  document.querySelector('#subscription-cancelled').classList.remove('hidden');
  document.querySelector('#subscription-settings').classList.add('hidden');
}
function addDays(theDate, days) {
    return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
}
/* Shows a success / error message when the payment is complete */
function onSubscriptionSampleDemoComplete({
  priceId: priceId,
  subscription: subscription,
  paymentMethodId: paymentMethodId,
  invoice: invoice,
}) {
  let subscriptionId;
  let currentPeriodEnd;
  let customerId;
  if (subscription) {
    subscriptionId = subscription.id;
    currentPeriodEnd = subscription.current_period_end;
    if (typeof subscription.customer === 'object') {
      customerId = subscription.customer.id;
    } else {
      customerId = subscription.customer;
    }
  } else {
    const params = new URLSearchParams(document.location.search.substring(1));
    subscriptionId = invoice.subscription;
    currentPeriodEnd = params.get('currentPeriodEnd');
    customerId = invoice.customer;
  }

    var expiryDate = new Date(new Date().getTime() + (5 * 24 * 60 * 60 * 1000));
    if (getUrlParameter("package") == "1") {
        expiryDate = addDays(new Date(), 30);
    }
    if (getUrlParameter("package") == "2") {
        expiryDate = addDays(new Date(), 90);
    }
    if (getUrlParameter("package") == "3") {
        addDays(new Date(), 365);
    }
    tblUsers = db.collection("tbl_users");
    tblUsers.where("UserID", "==", UserObject.uid).get().then(function (resp) {
        tblUsers.doc(resp.docs[0].id).update({
            PaymentVerified: true,
            PackageID: getUrlParameter("package"),
            Email: UserObject.email,
            AmountPaid: priceInfo[priceId].amount,
            TransactionDate: firebase.firestore.Timestamp.fromDate(new Date()).toDate(),
            ExpiryDate: firebase.firestore.Timestamp.fromDate(expiryDate).toDate(),
            TransactionID: subscriptionId

        }).then(function () {
          changeLoadingState(false);
          SwalConfirmBoxPaymentSuccess("Payment is successful",GotoDashboard());
            });

    });

  //window.location.href =
  //  '/account.html?subscriptionId=' +
  //  subscriptionId +
  //  '&priceId=' +
  //  priceId +
  //  '&currentPeriodEnd=' +
  //  currentPeriodEnd +
  //  '&customerId=' +
  //  customerId +
  //  '&paymentMethodId=' +
  //  paymentMethodId;
}

function demoChangePrice() {
  document.querySelector('#monthly').classList.remove('border-pasha');
  document.querySelector('#yearly').classList.remove('border-pasha');
  document.querySelector('#price-change-form').classList.add('hidden');

  // Grab the priceId from the URL
  // This is meant for the demo, replace with a cache or database.
  const params = new URLSearchParams(document.location.search.substring(1));
  const priceId = params.get('priceId').toLowerCase();

  // Show the change price screen
  document.querySelector('#prices-form').classList.remove('hidden');
  document
    .querySelector('#' + priceId.toLowerCase())
    .classList.add('border-pasha');

  let elements = document.querySelectorAll(
    '#submit-' + priceId + '-button-text'
  );
  for (let i = 0; i < elements.length; i++) {
    elements[0].childNodes[3].innerText = 'Current';
  }
  if (priceId === 'yearly') {
    document.getElementById('submit-yearly').disabled = true;
    document.getElementById('submit-monthly').disabled = false;
  } else {
    document.getElementById('submit-yearly').disabled = false;
    document.getElementById('submit-monthly').disabled = true;
  }
}

function GotoDashboard(){
  window.location.href ="/index";
}
// Changes the price selected
function changePriceSelection(priceId) {
  //document.querySelector('#monthly').classList.remove('border-pasha');
  //document.querySelector('#yearly').classList.remove('border-pasha');
  //document
  //  .querySelector('#' + priceId.toLowerCase())
  //  .classList.add('border-pasha');
}

// Show a spinner on subscription submission
function changeLoadingState(isLoading) {
  if (isLoading) {
    document.querySelector('#button-text').classList.add('hidden');
    document.querySelector('#loadingbtn').classList.remove('hidden');
    document.querySelector('#payment-form button').disabled = true;
  } else {
    document.querySelector('#button-text').classList.remove('hidden');
    document.querySelector('#loadingbtn').classList.add('hidden');
    document.querySelector('#payment-form button').disabled = false;
  }
}

// Show a spinner on subscription submission
function changeLoadingStatePrices(isLoading) {
  return;
  if (isLoading) {
    document.querySelector('#button-text').classList.add('hidden');
    document.querySelector('#loadingbtn').classList.remove('hidden');

    document.querySelector('#submit-monthly').classList.add('invisible');
    document.querySelector('#submit-yearly').classList.add('invisible');
    if (document.getElementById('confirm-price-change-cancel')) {
      document
        .getElementById('confirm-price-change-cancel')
        .classList.add('invisible');
    }
  } else {
    document.querySelector('#button-text').classList.remove('hidden');
    document.querySelector('#loadingbtn').classList.add('hidden');

    document.querySelector('#submit-monthly').classList.remove('invisible');
    document.querySelector('#submit-yearly').classList.remove('invisible');
    if (document.getElementById('confirm-price-change-cancel')) {
      document
        .getElementById('confirm-price-change-cancel')
        .classList.remove('invisible');
      document
        .getElementById('confirm-price-change-submit')
        .classList.remove('invisible');
    }
  }
}

function clearCache() {
  localStorage.clear();
}

function resetDemo() {
  clearCache();
  window.location.href = '/';
}