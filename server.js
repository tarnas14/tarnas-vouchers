// server.js
// where your node app starts

// init project
const express = require('express');
const voucherifyClient = require('voucherify');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session')
const SQLiteStore = require('connect-sqlite3')(session);

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(session({
  store: new SQLiteStore({dir: ".data"}),
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // month
}));

app.get("/", (request, response) => {
  if (request.session.views) {
    console.log("[Re-visit] %s - %s", request.session.id, request.session.views);
    request.session.views++;
  } else {
    request.session.views = 1;
    console.log("[New-visit] %s", request.session.id);
  }
  response.sendFile(__dirname + '/views/index.html');
});

const voucherify = voucherifyClient({
    applicationId: process.env.APPLICATION_ID,
    clientSecretKey: process.env.CLIENT_SECRET_KEY
});
// publishes coupons for the user from campaigns
app.get("/init", (request, response) => {
  const customerId = request.session.id;
  console.log("[Create customer] customer: %s", customerId);
  voucherify.customers.create({ source_id: customerId })
  .then(customer => {
    request.session.customerId = customer.id;
    console.log("[Create customer][Success] customer: %s", customerId);
    console.log("[Publish coupons] customer: %s", customerId);
    return Promise.all(publishForCustomer(customer.source_id));
  })
  .then(coupons => {
    console.log("[Publish coupons][Success] customer: %s, coupons: %j", customerId, coupons);
    response.status(200).json(coupons);
  })
  .catch(error => console.error("[Publish coupons][Error] customer: %s, error: %j", customerId, error));
});


function publishForCustomer(id) {
  const params = {
    customer: {
      source_id: id
    }
  };
  return [
    "regular-percentage", 
    "regular-amount",
    "cart-more-50",
    "cart-includes-2solaris",
    "redemption-limit",
    "expiry-date",
    "start-date",
    "gift-card", 
    "upsell", 
    "mix", 
    "enable", 
    "country"
  ].map(campaign => voucherify.publish(Object.assign(params, { campaign })));
}

app.get("/redemptions", (request, response) => {
  if (!request.session.id) return response.sendStatus(404);
  console.log("[Redemptions] customer: %s", request.session.id);
  voucherify.customers.get(request.session.id)
    .then(customer => {
      return voucherify.redemptions.list({ customer: customer.id })
    })
    .then(redemptionsList => {
      console.log("[Redemptions][Success] customer:%s, redemptions: %j", request.session.id, redemptionsList);
      response.status(200).json(redemptionsList.redemptions);
    })
    .catch(error => {
      console.error("[Redemptions][Error] customer: %s, error: %j", request.session.id, error);
      response.sendStatus(404);
    });
});

// update customer address
app.post("/customer", (request, response) => {
  console.log("[Customer update] customer: %s, address: %j", request.session.id, request.body);
  voucherify.customers.update({
    id: request.session.customerId,
    address: request.body.address
  }).then(result => {
    console.log("[Customer update][Success] customer: %s, body: %j", request.session.id, result);
    response.sendStatus(200);
  }).catch(error => {
    console.error("[Customer update][Error] customer: %s, error: %j", request.session.id, error);
    response.sendStatus(404);
  });
});

app.post("/redeem", (request, response) => {
  console.log("[Redeem] customer: %s, cart: %j", request.session.id, request.body); 
  const body = request.body;
  voucherify.redemptions.redeem(body.code, {
    customer: {
      source_id: request.session.id,
      address: body.customer.address
    },
    order: {
      amount: body.amount,
      items: body.items
    }, 
    metadata: {
      channel : "showcase"
    }
  })
  .then(result => {
    console.log("[Redeem][Success] customer: %s, redemption: %j", request.session.id, result);
    response.status(200).json({
      valid: true,
      result: result
    });
  })
  .catch(error => {
    console.error("[Redeem][Error] customer: %s, error: %j", request.session.id, error);
    response.status(200).json({
      valid: false,
      result: error
    });
  });
});

// handles enable/disable button
app.post("/enable", (request, response) => {
  const code = request.body.code;
  console.log("[Enable] customer: %s, code: %s", request.session.id, code);
  voucherify.vouchers.enable(code)
    .then(result => {
    console.log("[Enable][Success] customer: %s, code: %s", request.session.id, code);
    response.sendStatus(200);
  })
    .catch(error => {
      console.log("[Enable][Error] customer: %s, error: %j", request.session.id, error);
      response.sendStatus(404);
  });
});

app.post("/disable", (request, response) => {
  const code = request.body.code;
  console.log("[Disable] customer: %s, code: %s", request.session.id, code);
  voucherify.vouchers.disable(code)
    .then(result => {
    console.log("[Disable][Success] customer: %s, code: %s", request.session.id, code);
    response.sendStatus(200);
  })
    .catch(error => {
     console.log("[Disable][Error] customer: %s, error: %j", request.session.id, error);
    response.sendStatus(404);
  });
});


const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
