// Global Variables

let users = JSON.parse(localStorage.getItem("users")) || [
  {
    id: 1,
    name: "Rishabh",
    email: "rishabh@gmail.com",
    password: "123456",
    currency: "INR",
    darkMode: true,

    transactions: [
      {
        id: 101,
        type: "expense",
        description: "Rent",
        amount: 8000,
        category: "Housing",
        date: "2026-06-30",
      },
      {
        id: 101,
        type: "income",
        description: "salary",
        amount: 18000,
        category: "Housing",
        date: "2026-06-30",
      },
      {
        id: 101,
        type: "income",
        description: "salary",
        amount: 18000,
        category: "Housing",
        date: "2026-06-30",
      },
    ],
  },
  {
    id: 2,
    name: "Radhika",
    email: "radhika@gmail.com",
    password: "123456",
    currency: "INR",
    darkMode: false,

    transactions: [
      {
        id: 1001,
        type: "income",
        description: "salary",
        amount: 80000,
        category: "Housing",
        date: "2026-06-30",
      },
    ],
  },
];

const currentUser = users[0];

let chart = null;

//DOM elements
const userName = document.querySelector("#user-name");
const formOverlay = document.querySelector(".form-overlay");
const addTransaction = document.querySelector("#add-transation");
const formClose = document.querySelector(".close-btn");
const form = document.querySelector("form");
const darkMode = document.querySelector("#dark");
const chartCanvas = document.querySelector("#cashFlowChart");
const balanceCard = document.querySelector("#balance");
const incomeCard = document.querySelector("#income");
const expenseCard = document.querySelector("#expense");
const transactionsCard = document.querySelector("#transactions");
const dashboard = document.querySelector("#dashboard")
const settings = document.querySelector("#settings")
const rightbtm = document.querySelector(".right-btm")
const rightsettings = document.querySelector(".right-settings")
const deleteTransactionsBtn = document.querySelector("#delete-all-transactions")



//form data
const type = document.querySelector("#type");
const description = document.querySelector("#description");
const amount = document.querySelector("#amount");
const date = document.querySelector("#date");
const category = document.querySelector("#category");

//Event listeners

darkMode.addEventListener("change", (e) => {
  const isDarkMode = e.target.checked;

  currentUser.darkMode = isDarkMode;
  applyTheme(isDarkMode);
  saveUsers();
  // console.log(getUser());
});

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

  // console.log(currentUser);
  currentUser.transactions.push(transaction);

  saveUsers();
  renderUI();
  form.reset();
  formOverlay.style.display = "none";
});

dashboard.addEventListener("click",()=>{
    rightsettings.style.display = "none";
    rightbtm.style.display = "block"
    dashboard.classList.add("activeOption")
    settings.classList.remove("activeOption")
})
settings.addEventListener("click",()=>{
    rightbtm.style.display = "none";
    rightsettings.style.display = "block"
    settings.classList.add("activeOption")
    dashboard.classList.remove("activeOption")
})

deleteTransactionsBtn.addEventListener("click",()=>{
  deleteAllTransactions();
})


//Utility functions
function renderUI() {
  // console.log("fetching user");
  let loggedinUser = getUser();

  applyTheme(loggedinUser.darkMode);

  userName.textContent = `${loggedinUser.name}`;

  let totals = getTotals(loggedinUser);
  balanceCard.textContent = totals[0] - totals[1];
  incomeCard.textContent = totals[0];
  expenseCard.textContent = totals[1];
  transactionsCard.textContent = loggedinUser.transactions.length;

  renderChart(totals[0], totals[1]);
}

renderUI();




function applyTheme(isDarkMode) {
  if (isDarkMode) {
    document.body.setAttribute("data-theme", "dark");
    darkMode.checked = true;
  } else {
    document.body.removeAttribute("data-theme");
    darkMode.checked = false;
  }
}

function getTotals(user) {
  let totalExpense = 0,
    totalIncome = 0;
  //   let loggedinUser = users.find((user) => user.id === currentUser.id);
  // console.log(user);
  // console.log("Inside getTotal user");
  let money = user.transactions;
  money.forEach((element) => {
    if (element.type === "expense") {
      totalExpense += element.amount;
    } else if (element.type === "income") {
      totalIncome += element.amount;
    }
  });
  return [totalIncome, totalExpense];
}

function renderChart(totalIncome, totalExpense) {
  if (chart) {
    chart.destroy();
  }
  chart = new Chart(chartCanvas, {
    type: "bar",

    data: {
      labels: ["Income vs expense"],
      datasets: [
        {
          label: "Income",
          data: [totalIncome],
          borderColor: "#01792d",
          backgroundColor: "#16a34a",
        },
        {
          label: "expense",
          data: [totalExpense],
          borderColor: "#b60a2f",
          backgroundColor: "#dc2626",
        },
      ],
    },
  });
}

function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}
function getUser() {
  let allUsers = JSON.parse(localStorage.getItem("users"));
  let loggedinUser = allUsers.find((user) => user.id === currentUser.id) || currentUser;
  return loggedinUser;
}

function deleteAllTransactions(){
  // console.log("delete transactions button clicked")
  // console.log(currentUser)
  currentUser.transactions = [];
  saveUsers();
  renderUI();
}

