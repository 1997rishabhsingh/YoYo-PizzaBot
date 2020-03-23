const firebaseConfig = {
  apiKey: "AIzaSyDB0ROgaM6IADihpB8Egty2y0SAKh9tcG4",
  authDomain: "yoyopizza-ewjwmh.firebaseapp.com",
  databaseURL: "https://yoyopizza-ewjwmh.firebaseio.com",
  projectId: "yoyopizza-ewjwmh",
  storageBucket: "yoyopizza-ewjwmh.appspot.com",
  messagingSenderId: "456731631604",
  appId: "1:456731631604:web:5248a82286b864a17d63a1"
};
firebase.initializeApp(firebaseConfig);

const table = document.getElementById("order-table");

const dbRef = firebase.database().ref("/orders");
dbRef.on("child_added", snapshot => {
  updateTable(snapshot.key, snapshot.val());
});

function updateTable(key, data) {
  const {
    mobileNo,
    orderTime,
    pizzaKind,
    pizzaQuantity,
    pizzaSize,
    pizzaToppings,
    pizzaType,
    userAddress,
    userName
  } = data;

  const row = table.insertRow(1);
  // row.className = 'row';
  row.insertCell(0).innerHTML = key;
  row.insertCell(1).innerHTML = userName;
  row.insertCell(2).innerHTML = mobileNo;
  row.insertCell(3).innerHTML = pizzaType;
  row.insertCell(4).innerHTML = pizzaSize;
  row.insertCell(5).innerHTML = pizzaToppings ? pizzaToppings : "None";
  row.insertCell(6).innerHTML = pizzaQuantity;
  const date = new Date(orderTime)
    .toLocaleString("en-GB", { timeZone: "Asia/Kolkata", hour12: true })
    .split(", ");
  row.insertCell(7).innerHTML = date[0];
  row.insertCell(8).innerHTML = date[1].toUpperCase();
  row.insertCell(9).innerHTML = userAddress;
}
