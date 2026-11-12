
// ======================================
// EXPENSES PAGE - JAVASCRIPT LIBRARY
// ======================================

// ===== LIVE CLOCK =====
const clock = document.getElementById("clock");

function updateClock() {
    if (clock) {
        clock.textContent = new Date().toLocaleTimeString();
    }
}

updateClock();
setInterval(updateClock, 1000);


// ===== GET ELEMENTS =====
const expenseList = document.getElementById("expense-list");
const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("filter-category");
const emptyMessage = document.getElementById("empty-message");

const totalStat = document.getElementById("stat-total");
const countStat = document.getElementById("stat-count");
const averageStat = document.getElementById("stat-average");
const biggestStat = document.getElementById("stat-biggest");

const countLabel = document.getElementById("count");

const modal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");


// ===== LOCAL STORAGE =====
function getExpenses() {
    const saved = localStorage.getItem("expenses");

    if (saved) {
        try {
            const expenses = JSON.parse(saved);
            return Array.isArray(expenses) ? expenses : [];
        } catch (error) {
            return [];
        }
    }

    return [];
}

function saveExpenses(expenses) {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}


// ===== TOAST MESSAGE =====
function showToast(message) {
    const toast = document.getElementById("toast");

    if (toast) {
        toast.textContent = message;
        toast.style.display = "block";

        setTimeout(function () {
            toast.style.display = "none";
        }, 3000);
    }
}


// ===== UPDATE STATISTICS =====
function updateStatistics(expenses) {

    const total = expenses.reduce(function (sum, expense) {
        return sum + Number(expense.amount);
    }, 0);

    const count = expenses.length;

    let average = 0;
    let biggest = null;

    if (count > 0) {
        average = total / count;

        biggest = expenses.reduce(function (largest, expense) {
            if (Number(expense.amount) > Number(largest.amount)) {
                return expense;
            }
            return largest;
        });
    }

    totalStat.textContent = total.toLocaleString() + " Lek";
    countStat.textContent = count;
    averageStat.textContent = Math.round(average).toLocaleString() + " Lek";

    if (biggest) {
        biggestStat.textContent =
            biggest.title + " (" +
            Number(biggest.amount).toLocaleString() + " Lek)";
    } else {
        biggestStat.textContent = "none";
    }
}


// ===== DISPLAY EXPENSES =====
function displayExpenses() {

    const expenses = getExpenses();

    // Get search and category values
    const searchValue = searchInput.value.toLowerCase().trim();
    const categoryValue = categoryFilter.value;

    // Filter expenses
    const filteredExpenses = expenses.filter(function (expense) {

        const matchesSearch = expense.title
            .toLowerCase()
            .includes(searchValue);

        const matchesCategory =
            categoryValue === "" ||
            expense.category === categoryValue;

        return matchesSearch && matchesCategory;
    });

    // Clear previous rows
    expenseList.innerHTML = "";

    // Update statistics using ALL expenses
    updateStatistics(expenses);

    // Update visible count
    countLabel.textContent = "(" + filteredExpenses.length + ")";

    // Show empty message
    if (filteredExpenses.length === 0) {
        emptyMessage.style.display = "block";

        if (expenses.length > 0) {
            emptyMessage.textContent = "No matching expenses found.";
        }
    } else {
        emptyMessage.style.display = "none";
    }

    // Create table rows
    filteredExpenses.forEach(function (expense) {

        const row = document.createElement("tr");

        // Date
        const dateCell = document.createElement("td");
        dateCell.textContent = expense.date;

        // Title
        const titleCell = document.createElement("td");
        titleCell.textContent = expense.title;

        // Category
        const categoryCell = document.createElement("td");
        categoryCell.textContent = expense.category;

        // Amount
        const amountCell = document.createElement("td");
        amountCell.textContent =
            Number(expense.amount).toLocaleString() + " Lek";
        amountCell.className = "num";

        // Actions
        const actionsCell = document.createElement("td");
        actionsCell.className = "actions";

        // Edit button
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "btn btn-primary action-btn";
        editButton.dataset.id = expense.id;

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "btn btn-danger action-btn";
        deleteButton.dataset.id = expense.id;

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);

        // Add cells to row
        row.appendChild(dateCell);
        row.appendChild(titleCell);
        row.appendChild(categoryCell);
        row.appendChild(amountCell);
        row.appendChild(actionsCell);

        expenseList.appendChild(row);
    });
}


// ===== SEARCH AND CATEGORY FILTER =====
searchInput.addEventListener("input", displayExpenses);

categoryFilter.addEventListener("change", displayExpenses);


// ===== DELETE INDIVIDUAL EXPENSE =====
expenseList.addEventListener("click", function (event) {

    const id = event.target.dataset.id;

    if (!id) {
        return;
    }

    // Delete expense
    if (event.target.textContent === "Delete") {

        const confirmed = confirm("Are you sure you want to delete this expense?");

        if (confirmed) {
            let expenses = getExpenses();

            expenses = expenses.filter(function (expense) {
                return String(expense.id) !== String(id);
            });

            saveExpenses(expenses);
            displayExpenses();

            showToast("Expense deleted successfully!");
        }
    }

    // Edit expense
    if (event.target.textContent === "Edit") {

        const expenses = getExpenses();

        const expense = expenses.find(function (item) {
            return String(item.id) === String(id);
        });

        if (expense) {
            document.getElementById("edit-id").value = expense.id;
            document.getElementById("edit-title").value = expense.title;
            document.getElementById("edit-amount").value = expense.amount;
            document.getElementById("edit-category").value = expense.category;
            document.getElementById("edit-date").value = expense.date;

            clearEditErrors();

            modal.classList.add("open");
        }
    }
});


// ===== CLEAR EDIT ERRORS =====
function clearEditErrors() {
    const errors = editForm.querySelectorAll(".error");

    errors.forEach(function (error) {
        error.textContent = "";
    });
}


// ===== SHOW EDIT ERROR =====
function showEditError(field, message) {
    const error = editForm.querySelector('[data-for="' + field + '"]');

    if (error) {
        error.textContent = message;
    }
}


// ===== SAVE EDITED EXPENSE =====
editForm.addEventListener("submit", function (event) {

    event.preventDefault();

    clearEditErrors();

    const id = document.getElementById("edit-id").value;
    const title = document.getElementById("edit-title").value.trim();
    const amount = document.getElementById("edit-amount").value;
    const category = document.getElementById("edit-category").value;
    const date = document.getElementById("edit-date").value;

    let valid = true;

    if (title === "") {
        showEditError("title", "Please enter a title.");
        valid = false;
    }

    if (amount === "" || !Number.isInteger(Number(amount)) ||
        Number(amount) <= 0) {
        showEditError("amount", "Enter a valid positive whole amount.");
        valid = false;
    }

    if (category === "") {
        showEditError("category", "Please select a category.");
        valid = false;
    }

    if (date === "") {
        showEditError("date", "Please select a date.");
        valid = false;
    }

    if (!valid) {
        return;
    }

    let expenses = getExpenses();

    expenses = expenses.map(function (expense) {

        if (String(expense.id) === String(id)) {
            return {
                id: expense.id,
                title: title,
                amount: Number(amount),
                category: category,
                date: date
            };
        }

        return expense;
    });

    saveExpenses(expenses);

    modal.classList.remove("open");

    displayExpenses();

    showToast("Expense updated successfully!");
});


// ===== CANCEL EDIT =====
document.getElementById("cancel-edit").addEventListener("click", function () {
    modal.classList.remove("open");
    clearEditErrors();
});


// ===== DELETE ALL EXPENSES =====
document.getElementById("clear-all").addEventListener("click", function () {

    const expenses = getExpenses();

    if (expenses.length === 0) {
        showToast("There are no expenses to delete.");
        return;
    }

    const confirmed = confirm("Delete all expenses? This cannot be undone.");

    if (confirmed) {
        localStorage.removeItem("expenses");

        displayExpenses();

        showToast("All expenses deleted!");
    }
});


// ===== LOAD SAMPLE DATA =====
document.getElementById("load-sample").addEventListener("click", function () {

    const samples = [
        {
            id: Date.now() + 1,
            title: "Coffee with friends",
            amount: 350,
            category: "Food",
            date: "2026-11-10"
        },
        {
            id: Date.now() + 2,
            title: "Bus ticket",
            amount: 100,
            category: "Transport",
            date: "2026-11-09"
        },
        {
            id: Date.now() + 3,
            title: "Programming book",
            amount: 1500,
            category: "Books",
            date: "2026-11-08"
        },
        {
            id: Date.now() + 4,
            title: "Lunch",
            amount: 600,
            category: "Food",
            date: "2026-11-07"
        }
    ];

    const expenses = getExpenses();

    saveExpenses(expenses.concat(samples));

    displayExpenses();

    showToast("Sample expenses added!");
});


// ===== INITIAL DISPLAY =====
displayExpenses();
