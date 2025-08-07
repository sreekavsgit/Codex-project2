const budgetForm = document.getElementById('budget-form');
const budgetInput = document.getElementById('budget-input');
const expenseForm = document.getElementById('expense-form');
const expenseName = document.getElementById('expense-name');
const expenseAmount = document.getElementById('expense-amount');
const displayBudget = document.getElementById('display-budget');
const displayTotal = document.getElementById('display-total');
const displayRemaining = document.getElementById('display-remaining');
const expensesTableBody = document.querySelector('#expenses-table tbody');

let budget = parseFloat(localStorage.getItem('budget')) || 0;
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

function updateSummary() {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  displayBudget.textContent = budget.toFixed(2);
  displayTotal.textContent = total.toFixed(2);
  displayRemaining.textContent = (budget - total).toFixed(2);
}

function renderExpenses() {
  expensesTableBody.innerHTML = '';
  expenses.forEach((exp, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${exp.name}</td><td>$${exp.amount.toFixed(2)}</td><td><button data-index="${index}" class="delete-btn">X</button></td>`;
    expensesTableBody.appendChild(row);
  });
}

budgetForm.addEventListener('submit', e => {
  e.preventDefault();
  budget = parseFloat(budgetInput.value) || 0;
  localStorage.setItem('budget', budget);
  budgetInput.value = '';
  updateSummary();
});

expenseForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = expenseName.value.trim();
  const amount = parseFloat(expenseAmount.value);
  if (name && !isNaN(amount)) {
    expenses.push({ name, amount });
    localStorage.setItem('expenses', JSON.stringify(expenses));
    expenseName.value = '';
    expenseAmount.value = '';
    renderExpenses();
    updateSummary();
  }
});

expensesTableBody.addEventListener('click', e => {
  if (e.target.classList.contains('delete-btn')) {
    const index = e.target.dataset.index;
    expenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderExpenses();
    updateSummary();
  }
});

function init() {
  if (budget) {
    budgetInput.value = budget.toFixed(2);
  }
  renderExpenses();
  updateSummary();
}

init();
