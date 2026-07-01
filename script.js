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
        id: 102,
        type: "income",
        description: "salary",
        amount: 18000,
        category: "Housing",
        date: "2026-06-30",
      },
      {
        id: 103,
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
    currency: "USD",
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
let editingID = null;
let currentFilter = "all";
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
const currencyType = document.querySelectorAll(".currency-type");
const dashboard = document.querySelector("#dashboard");
const settings = document.querySelector("#settings");
const rightbtm = document.querySelector(".right-btm");
const rightsettings = document.querySelector(".right-settings");
const deleteAllTransactionsBtn = document.querySelector(
  "#delete-all-transactions",
);
const tBody = document.querySelector("#transactions-list");
const transactionType = document.querySelector("#transaction-type");

//form data
const type = document.querySelector("#type");
const description = document.querySelector("#description");
const amount = document.querySelector("#amount");
const date = document.querySelector("#date");
const category = document.querySelector("#category");
const settingsForm = document.querySelector("#settings-form");
const setUsername = document.querySelector("#settings-username");
const setCurrency = document.querySelector("#settings-currency");
//Event listeners

darkMode.addEventListener("change", (e) => {
  const isDarkMode = e.target.checked;

  currentUser.darkMode = isDarkMode;
  applyTheme(isDarkMode);
  saveUsers();
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
    Number(amount.value) <= 0 ||
    date.value === "" ||
    category.value === ""
  ) {
    alert("Please fill all the fields appropriately");
    return;
  }
  const transaction = {
    id: editingID ?? Date.now(), //This is nullish coalescing which states = "Use Date.now() only if editingID is null or undefined."
    type: type.value,
    description: description.value,
    amount: Number(amount.value),
    date: date.value,
    category: category.value,
  };

  if (editingID !== null) {
    const transactionindex = currentUser.transactions.findIndex(
      (elem) => elem.id === editingID,
    );
    currentUser.transactions[transactionindex] = transaction;
    editingID = null;
  } else {
    currentUser.transactions.push(transaction);
  }

  saveUsers();
  renderUI();
  form.reset();
  formOverlay.style.display = "none";
});

settingsForm.addEventListener("submit", (e) => {
  e.preventDefault();

  currentUser.name = setUsername.value;
  currentUser.currency = setCurrency.value;
  saveUsers();
  renderUI();
  showPage("dashboard")
});

dashboard.addEventListener("click", () => {
  showPage("dashboard");
});
settings.addEventListener("click", () => {
  showPage("settings");
  renderSettingsUI();
});

deleteAllTransactionsBtn.addEventListener("click", () => {
  deleteAllTransactions();
});

transactionType.addEventListener("change", (e) => {
  currentFilter = e.target.value;
  if (e.target.value === "all") {
    renderTransactions();
    return;
  }

  const filteredTransactions = currentUser.transactions.filter(
    (transaction) => transaction.type === e.target.value,
  );

  renderTransactions(filteredTransactions);
});

//Utility functions
function renderUI() {
  let loggedinUser = currentUser;

  applyTheme(loggedinUser.darkMode);

  userName.textContent = `${loggedinUser.name}`;

  let totals = getTotals(loggedinUser);
  balanceCard.textContent = totals.income - totals.expense;
  incomeCard.textContent = totals.income;
  expenseCard.textContent = totals.expense;
  transactionsCard.textContent = loggedinUser.transactions.length;

  const currencySymbols = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  currencyType.forEach(
    (elem) => (elem.textContent = currencySymbols[loggedinUser.currency]),
  );
  renderChart(totals.income, totals.expense);
  renderTransactions(getFilteredTransactions());
}

renderUI();

function renderSettingsUI() {
  setUsername.value = currentUser.name;
  setCurrency.value = currentUser.currency;
}

function showPage(page) {
  if (page === "dashboard") {
    rightsettings.style.display = "none";
    rightbtm.style.display = "block";
    dashboard.classList.add("activeOption");
    settings.classList.remove("activeOption");
  } else {
    rightbtm.style.display = "none";
    rightsettings.style.display = "block";
    settings.classList.add("activeOption");
    dashboard.classList.remove("activeOption");
  }
}

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
  let totalExpense = 0;
  let totalIncome = 0;

  let money = user.transactions;
  money.forEach((element) => {
    if (element.type === "expense") {
      totalExpense += element.amount;
    } else if (element.type === "income") {
      totalIncome += element.amount;
    }
  });
  return {
    income: totalIncome,
    expense: totalExpense,
  };
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
    options: {
      responsive: true,
      scales:{
        y:{
          ticks:{
            callback:function(value){
              return formatCurrency(value);
            }
          }
        }
      }
    },
  });
}

function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}
function getUser() {
  let allUsers = JSON.parse(localStorage.getItem("users"));
  let loggedinUser =
    allUsers.find((user) => user.id === currentUser.id) || currentUser;
  return loggedinUser;
}

function deleteAllTransactions() {
  if (confirm("Are you sure to delete all transactions?")) {
    currentUser.transactions = [];
  }
  saveUsers();
  renderUI();
}

function renderTransactions(transactionsdata) {
  tBody.innerHTML = "";

  transactionsdata.forEach((elem) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${elem.date}</td>

      <td class="description">${elem.description}</td>

      <td class="category">
        <span class="category-tag">${elem.category}</span>
      </td>

      <td class="${elem.type}">${elem.type === "income" ? "+" : "-"} <span>${getCurrencySymbol()}</span> ${elem.amount}</td>

      <td class="actions">
        <i class="ri-pencil-fill" onclick = "editTransaction(${elem.id})"></i>
        <i class="ri-delete-bin-fill" onclick = "dltTransaction(${elem.id})"></i>
      </td>
    `;

    tBody.append(row);
  });
}

function getFilteredTransactions(){

    switch(currentFilter){

        case "income":
            return currentUser.transactions.filter(trans=>trans.type==="income");

        case "expense":
            return currentUser.transactions.filter(trans=>trans.type==="expense");

        default:
            return currentUser.transactions;

    }

}

function editTransaction(index) {
  let currentTransaction = currentUser.transactions.find(
    (elem) => elem.id === index,
  );

  if (!currentTransaction) return;

  editingID = index;
  formOverlay.style.display = "block";
  type.value = currentTransaction.type;
  description.value = currentTransaction.description;
  amount.value = currentTransaction.amount;
  date.value = currentTransaction.date;
  category.value = currentTransaction.category;
}
function dltTransaction(index) {
  let currentTransactionIndex = currentUser.transactions.findIndex(
    (elem) => elem.id === index,
  );

  currentUser.transactions.splice(currentTransactionIndex, 1);
  saveUsers();
  renderUI();
}

function getCurrencySymbol(){
  switch(currentUser.currency){
    case "USD":
      return "$";
    case "INR":
      return "₹";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    case "JPY":
      return "¥";
    default:
      return ""
  }
}
function formatCurrency(value) {
    return new Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 2
    }).format(value);
}