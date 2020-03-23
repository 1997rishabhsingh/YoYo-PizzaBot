const functions = require("firebase-functions");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Card, Suggestion } = require("dialogflow-fulfillment");
const { dialogflow } = require("actions-on-google");
const admin = require("firebase-admin");

const app = dialogflow({ debug: true });

admin.initializeApp({
  databaseURL: "https://yoyopizza-ewjwmh.firebaseio.com/"
});

let order = {};
let currentOrderId;

app.intent("pizza.order.veg", (conv, params) => {
  order.pizzaKind = params.pizzaKind;
});
app.intent("pizza.order.non-veg", (conv, params) => {
  order.pizzaKind = params.pizzaKind;
});
app.intent("pizza.order.size", (conv, params) => {
  order.pizzaType = params.pizzaType;
});
app.intent("pizza.order.toppings", (conv, params) => {
  order.pizzaSize = params.pizzaSize;
});
app.intent("pizza.order.toppings - yes", (conv, params) => {});

app.intent("pizza.order.details", (conv, params) => {
  try {
    order.pizzaToppings = params.pizzaToppings;
    order.pizzaQuantity = params.pizzaQuantity;
    order.userName = params.userName;
    order.mobileNo = params.mobileNo;
    order.userAddress = params.userAddress;
    order.orderTime = Date.now();

    currentOrderId = generateOrderNumber();
    admin
      .database()
      .ref("/orders/" + currentOrderId)
      .set(order);

    conv.ask("Awesome! Your order has been placed 😋😋😋");
    conv.ask(`Your order id is ${currentOrderId}`);
    conv.ask("Let me if you want to know your order status.");
  } catch (e) {
    conv.ask("Sorry a problem occured. Can you please place the order again");
    console.log(e);
  }
});

app.intent("pizza.order.status - current", async (conv, params) => {
  const status = await getOrderStatus(currentOrderId);
  conv.close(status);
});

app.intent("pizza.order.statusById", async (conv, params) => {
  const status = await getOrderStatus(params.orderId);
  conv.close(status);
});

function generateOrderNumber() {
  let now = Date.now().toString();
  now += now + Math.floor(Math.random() * 10);
  return [now.slice(0, 4), now.slice(10, 14)].join("");
}

async function getOrderStatus(orderId) {
  const snapshot = await admin
    .database()
    .ref("/orders/" + orderId)
    .once("value");
  const data = snapshot.val();
  const orderTime = data ? data.orderTime : "";

  if (!orderTime) return "Invalid order id";

  const timeNow = Date.now();

  const diff = Math.abs(orderTime - timeNow) / 6e4;
  if (diff >= 0 && diff <= 15) {
    return `Your delicious ${data.pizzaType} is being prepared`;
  } else if (diff > 15 && diff <= 30) {
    return `Your delicious ${
      data.pizzaType
    } is on its way. It'll be there in ${Math.ceil(30 - diff)} minutes`;
  } else {
    return "We apologize that we have failed to deliver the pizza on time. You can now have it for free!";
  }
}
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
