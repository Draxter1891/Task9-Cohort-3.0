// Global Variables

let users = JSON.parse(localStorage.getItem("users")) || [
  {
    id: 1,
    name: "Rishabh",
    email: "rishabh@gmail.com",
    password: "123456",
    currency: "INR",
    darkMode: false,

    transactions: [
      {
        id: 101,
        type: "expense",
        description: "Rent",
        amount: 8000,
        category: "Housing",
        date: "2026-06-30",
      },
    ],
  },
];
const currentUser = users[0];

let formOverlay = document.querySelector(".form-overlay");
let addTransaction = document.querySelector("#add-transation");
let formClose = document.querySelector(".close-btn");
let form = document.querySelector("form");

//form data
const type = document.querySelector("#type");
const description = document.querySelector("#description");
const amount = document.querySelector("#amount");
const date = document.querySelector("#date");
const category = document.querySelector("#category");

addTransaction.addEventListener("click", () => {
  formOverlay.style.display = "block";
});
formClose.addEventListener("click", () => {
  formOverlay.style.display = "none";
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (
    description.value.trim() === "" ||
    !amount.value ||
    date.value === "" ||
    category.value === ""
  ) {
    formOverlay.style.display = "none";
    alert("please fill all the fields");
    return;
  }
  const transaction = {
    id: Date.now(),
    type: type.value,
    description: description.value,
    amount: Number(amount.value),
    date: date.value,
    category: category.value,
  };

  console.log(currentUser);
  currentUser.transactions.push(transaction);

  saveUsers();

  form.reset();
  formOverlay.style.display = "none";
});

function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}
