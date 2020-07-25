const express = require('express');
const app = express();
const { resolve } = require('path');
const bodyParser = require('body-parser');
const moment = require('moment');
// Replace if using a different env file or config
require('dotenv').config({ path: __dirname + '/exp.env' });
if (
  !process.env.STRIPE_SECRET_KEY ||
  !process.env.STRIPE_PUBLISHABLE_KEY ||
  !process.env.BASIC ||
  !process.env.PREMIUM ||
  !process.env.STATIC_DIR
) {
  console.log(
    'The .env file is not configured. Follow the instructions in the readme to configure the .env file. https://github.com/stripe-samples/subscription-use-cases'
  );
  console.log('');
  process.env.STRIPE_SECRET_KEY
    ? ''
    : console.log('Add STRIPE_SECRET_KEY to your .env file.');

  process.env.STRIPE_PUBLISHABLE_KEY
    ? ''
    : console.log('Add STRIPE_PUBLISHABLE_KEY to your .env file.');

  process.env.BASIC
    ? ''
    : console.log(
      'Add BASIC priceID to your .env file. See repo readme for setup instructions.'
    );

  process.env.STRIPE_SECRET_KEY
    ? ''
    : console.log(
      'Add PREMIUM priceID to your .env file. See repo readme for setup instructions.'
    );

  process.env.STATIC_DIR
    ? ''
    : console.log(
      'Add STATIC_DIR to your .env file. Check .env.example in the root folder for an example'
    );

  process.exit();
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.use(express.static(__dirname + '/' + process.env.STATIC_DIR));
app.engine('html', require('ejs').renderFile);
// Use JSON parser for all non-webhook routes.
app.use((req, res, next) => {
  if (req.originalUrl === '/stripe-webhook') {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});
app.get('/', (req, res) => {

  const path = __dirname + '/' + process.env.STATIC_DIR + '/index.html';
  res.render(path);
});

app.get('/index', function (req, res) {
  const path = __dirname + '/' + process.env.STATIC_DIR + '/index.html';
  res.render(path);
});

app.get('/collaborators', function (req, res) {
  const path = __dirname + '/' + process.env.STATIC_DIR + '/addcollaborators.html';
  res.render(path);
});

app.get('/auditlogs', function (req, res) {
  const path = __dirname + '/' + process.env.STATIC_DIR + '/auditlogs.html';
  res.render(path);
});

app.get('/pricing', function (req, res) {
  const path = __dirname + '/' + process.env.STATIC_DIR + '/pricing.html';
  res.render(path);
});

app.get('/signin', function (req, res) {
  const path = __dirname + '/' + process.env.STATIC_DIR + '/signin.html';
  res.render(path);
});

app.get('/payment', function (req, res) {
  const path = __dirname + '/' + process.env.STATIC_DIR + '/payment.html';
  res.render(path);
});

app.get('/prices', function (req, res) {
  const path = __dirname + '/' + process.env.STATIC_DIR + '/prices.html';
  res.render(path);
});

app.get('/account', function (req, res) {
  const path = __dirname + '/' + process.env.STATIC_DIR + '/account.html';
  res.render(path);
});

app.get('/config', async (req, res) => {

  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    packages: [process.env.BASIC, process.env.PREMIUM, process.env.GOLD],
  });
});

app.get('/firebaseConfig', async (req, res) => {

  res.send({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASEURL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGEBUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDERID,
    appId: process.env.FIREBASE_APP_ID,
  });
});

app.post('/get-discount-coupon', async (req, res) => {
  stripe.coupons.retrieve(
    req.body.coupon,
    function (err, coupon) {
      res.send({ coupon });
    }
  );
});

app.post('/get-cutomer-subscriptions', async (req, res) => {
  console.log(req.body.customerid);
  stripe.subscriptions.list(
    { customer: req.body.customerid },
    function (err, response) {
      var data = response.data;
      data = data.filter(function(el) {
        return el.plan.product === process.env.PRODUCTID;
      });
      response.data = data;
      res.send({ response });
    }
  );
});

app.post('/get-cutomer-subscriptions-active', async (req, res) => {
  console.log(req.body.customerid);
  stripe.subscriptions.list(
    { customer: req.body.customerid },
    function (err, response) {
      var data = response.data;
      data = data.filter(function(el) {
        return el.plan.product === process.env.PRODUCTID && el.status=="active";
      });
      response.data = data;
      if(data.length>0){
        res.send(true);
      }else{
        res.send(false);
      }
    }
  );
});

app.post('/subscribe-trial-subscription', async (req, res) => {
  console.log(req.body.customerid);
  var trialEnd = moment().add(7, 'days').unix();
  const subscription = await stripe.subscriptions.create({
    customer: req.body.customerid,
    items: [{ price: process.env[req.body.priceid.toUpperCase()] }],
    trial_end: trialEnd,
  });
  res.send({ subscription });
});

app.post('/create-customer', async (req, res) => {
   const customerlist = await stripe.customers.list({email:req.body.email});
   console.log(customerlist.data.length);
  if(customerlist.data.length>0){
    console.log("customer fetched");
    const customer = customerlist.data[0];
    res.send({ customer });
  }else{
    console.log("customer creating");
     // Create a new customer object
     const customer = await stripe.customers.create({
      email: req.body.email,
    });

    // save the customer.id as stripeCustomerId
    // in your database.

    res.send({ customer });
  }
});

app.post('/create-customerportal-session', async (req, res) => {
  // Create a new customer object
  const stripenew = require('stripe')(process.env.STRIPE_SECRET_KEY);
  try {
    const session = await stripenew.billingPortal.sessions.create({
      customer: req.body.customerid,
      return_url: process.env.REDIRECTURL,
    });

    res.send({ session });
  } catch (error) {
    return res.status('402').send({ error: { message: error.message } });
  }
  // save the customer.id as stripeCustomerId
  // in your database.

});


app.post('/create-subscription', async (req, res) => {
  if (req.body.coupon != "no-coupon-added") {
    try {
      await stripe.customers.update(req.body.customerId, {
        coupon: req.body.coupon,
      });
    } catch (error) {
      return res.status('402').send({ error: { message: error.message } });
    }
  }
  // Set the default payment method on the customer
  try {
    await stripe.paymentMethods.attach(req.body.paymentMethodId, {
      customer: req.body.customerId,
    });
  } catch (error) {
    return res.status('402').send({ error: { message: error.message } });
  }

  let updateCustomerDefaultPaymentMethod = await stripe.customers.update(
    req.body.customerId,
    {
      invoice_settings: {
        default_payment_method: req.body.paymentMethodId,
      },
    }
  );

  // Create the subscription
  const subscription = await stripe.subscriptions.create({
    customer: req.body.customerId,
    items: [{ price: process.env[req.body.priceId.toUpperCase()] }],
    expand: ['latest_invoice.payment_intent'],
  });

  res.send(subscription);
});

app.post('/retry-invoice', async (req, res) => {
  // Set the default payment method on the customer

  try {
    await stripe.paymentMethods.attach(req.body.paymentMethodId, {
      customer: req.body.customerId,
    });
    await stripe.customers.update(req.body.customerId, {
      invoice_settings: {
        default_payment_method: req.body.paymentMethodId,
      },
    });
  } catch (error) {
    // in case card_decline error
    return res
      .status('402')
      .send({ result: { error: { message: error.message } } });
  }

  const invoice = await stripe.invoices.retrieve(req.body.invoiceId, {
    expand: ['payment_intent'],
  });
  res.send(invoice);
});

app.post('/retrieve-upcoming-invoice', async (req, res) => {
  const subscription = await stripe.subscriptions.retrieve(
    req.body.subscriptionId
  );

  const invoice = await stripe.invoices.retrieveUpcoming({
    subscription_prorate: true,
    customer: req.body.customerId,
    subscription: req.body.subscriptionId,
    subscription_items: [
      {
        id: subscription.items.data[0].id,
        deleted: true,
      },
      {
        price: process.env[req.body.newPriceId.toUpperCase()],
        deleted: false,
      },
    ],
  });
  res.send(invoice);
});

app.post('/cancel-subscription', async (req, res) => {
  // Delete the subscription
  const deletedSubscription = await stripe.subscriptions.del(
    req.body.subscriptionId
  );
  res.send(deletedSubscription);
});

app.post('/update-subscription', async (req, res) => {
  const subscription = await stripe.subscriptions.retrieve(
    req.body.subscriptionId
  );
  const updatedSubscription = await stripe.subscriptions.update(
    req.body.subscriptionId,
    {
      cancel_at_period_end: false,
      items: [
        {
          id: subscription.items.data[0].id,
          price: process.env[req.body.newPriceId.toUpperCase()],
        },
      ],
    }
  );

  res.send(updatedSubscription);
});

app.post('/retrieve-customer-payment-method', async (req, res) => {
  const paymentMethod = await stripe.paymentMethods.retrieve(
    req.body.paymentMethodId
  );

  res.send(paymentMethod);
});
// Webhook handler for asynchronous events.
app.post(
  '/stripe-webhook',
  bodyParser.raw({ type: 'application/json' }),
  async (req, res) => {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers['stripe-signature'],
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(err);
      console.log(`⚠️  Webhook signature verification failed.`);
      console.log(
        `⚠️  Check the env file and enter the correct webhook secret.`
      );
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    const dataObject = event.data.object;

    // Handle the event
    // Review important events for Billing webhooks
    // https://stripe.com/docs/billing/webhooks
    // Remove comment to see the various objects sent for this sample
    switch (event.type) {
      case 'invoice.paid':
        // Used to provision services after the trial has ended.
        // The status of the invoice will show up as paid. Store the status in your
        // database to reference when a user accesses your service to avoid hitting rate limits.
        break;
      case 'invoice.payment_failed':
        // If the payment fails or the customer does not have a valid payment method,
        //  an invoice.payment_failed event is sent, the subscription becomes past_due.
        // Use this webhook to notify your user that their payment has
        // failed and to retrieve new card details.
        break;
      case 'invoice.finalized':
        // If you want to manually send out invoices to your customers
        // or store them locally to reference to avoid hitting Stripe rate limits.
        break;
      case 'customer.subscription.deleted':
        if (event.request != null) {
          // handle a subscription cancelled by your request
          // from above.
        } else {
          // handle subscription cancelled automatically based
          // upon your subscription settings.
        }
        break;
      case 'customer.subscription.trial_will_end':
        // Send notification to your user that the trial will end
        break;
      default:
      // Unexpected event type
    }
    res.sendStatus(200);
  }
);
var server_port = 4242 || process.env.PORT || 80;
var server_host = 'localhost' || '0.0.0.0';
app.listen(process.env.PORT || 5000, () => console.log(`Node server listening on port ${80}!`));
// app.listen(4243, () => console.log(`Node server listening on port ${4243}!`));
