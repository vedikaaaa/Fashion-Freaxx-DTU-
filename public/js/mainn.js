let PRODUCTS = [
  {
    name: "Off-white princess shoes",
    image:
      "https://i.picsum.photos/id/21/3008/2008.jpg?hmac=T8DSVNvP-QldCew7WD4jj_S3mWwxZPqdF0CNPksSko4",
    price: 280,
    id: 1,
  },
  {
    name: "Lady-Gaga Shades",
    image:
      "https://i.picsum.photos/id/64/4326/2884.jpg?hmac=9_SzX666YRpR_fOyYStXpfSiJ_edO3ghlSRnH2w09Kg",
    price: 350,
    id: 1,
  },
  {
    name: "Betty's Green Jacket",
    image:
      "https://i.picsum.photos/id/836/5184/3456.jpg?hmac=_ZfBJnWLbaYFoRWfoj1LNoA_PPzz5EunZNOyXUsUVZ8",
    price: 550,
    id: 1,
  },
];

const cartTotal = [];

const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const usserList = document.getElementById("ussers");
const productsList = document.querySelector("#products");
const snackbar = document.querySelector(".pop-up");

PRODUCTS.map((product) => {
  let text = document.createElement("div");
  text.classList.add("card-container");
  text.innerHTML = `
  <img class="card-image" src=${product.image} />
  <div class="card-data">
    <div>${product.name}</div> 
    <div>&#8377; ${product.price}</div> 
    <button class="add-btn" onclick='addToCart(${product.price})'>Add to cart</button>
   `;
  productsList.appendChild(text);
});

function addToCart(price) {
  let totalCost = 0;
  cartTotal.push(price);
  cartTotal?.forEach((currentPrice) => (totalCost += currentPrice));
  let text = document.createElement("div");
  text.classList.add("snackbar");
  text.innerHTML = `
    <div class='added-cart'>Added To Cart</div>
    <div class='cart-secondary'>
      <span class='subtotal'>Cart subtotal</span> (${cartTotal?.length} ${
    cartTotal?.length > 1 ? "items" : "item"
  }): <span class="snackbar-price">&#8377; ${totalCost}</span></div>
  `;
  snackbar.appendChild(text);
  setTimeout(() => {
    text.style.display = "none";
  }, 4000);
}

// Get ussername and room from URL
const { ussername, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
console.log(ussername);
document.getElementById("cart-btn").addEventListener("click", () => {
  window.location.href = "/cart";
});
const socket = io();

// Join chatroom
socket.emit("joinRoom", { ussername, room });

// Get room and ussers
socket.on("roomussers", ({ room, ussers }) => {
  outputRoomName(room);
  outputussers(ussers);
});

// Message from server
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit("chatMessage", msg);

  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  const p = document.createElement("p");
  p.classList.add("meta");
  p.innerText = message.ussername;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement("p");
  para.classList.add("text");
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector(".chat-messages").appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add ussers to DOM
function outputussers(ussers) {
  usserList.innerHTML = "";
  ussers.forEach((usser) => {
    const li = document.createElement("li");
    li.innerText = usser.ussername;
    usserList.appendChild(li);
  });
}

//Prompt the usser before leave chat room
document.getElementById("leave-btn").addEventListener("click", () => {
  const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
  if (leaveRoom) {
    window.location = "../index.html";
  } else {
  }
});
