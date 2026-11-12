
// ===== LIVE CLOCK =====
const clock = document.getElementById("clock");

function updateClock() {
    if (clock) {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString();
    }
}

updateClock();
setInterval(updateClock, 1000);


// ===== GET FORM ELEMENTS =====
const form = document.getElementById("expense-form");


// ===== TOAST NOTIFICATION =====
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


// ===== SHOW ERROR MESSAGE =====
function showError(field, message) {
    const error = document.querySelector('[data-for="' + field + '"]');

    if (error) {
        error.textContent = message;
    }
}


// ===== CLEAR ERROR MESSAGES =====
function clearErrors() {
    const errors = document.querySelectorAll(".error");

    errors.forEach(function (error) {
        error.textContent = "";
    });
}


// ===== GET SAVED EXPENSES =====
function getExpenses() {
    const savedExpenses = localStorage.getItem("expenses");

    if (savedExpenses) {
        try {
            const expenses = JSON.parse(savedExpenses);
            return Array.isArray(expenses) ? expenses : [];
        } catch (error) {
            return [];
        }
    }

    return [];
}


// ===== DISPLAY RECENT EXPENSE =====
function displayRecent(expense) {
    const recent = document.getElementById("recent");
    const recentList = document.getElementById("recent-list");

    if (recent && recentList) {
        recentList.innerHTML = "";

        const li = document.createElement("li");

        li.textContent =
            expense.title + " - " +
            expense.amount + " Lek - " +
            expense.category + " - " +
            expense.date;

        recentList.appendChild(li);
        recent.style.display = "block";
    }
}


// ===== ADD EXPENSE =====
if (form) {
    form.addEventListener("submit", function (event) {

        event.preventDefault();

        clearErrors();

        // Get input values
        const title = document.getElementById("title").value.trim();
        const amount = document.getElementById("amount").value;
        const category = document.getElementById("category").value;
        const date = document.getElementById("date").value;

        let valid = true;

        // Validate title
        if (title === "") {
            showError("title", "Please enter an expense title.");
            valid = false;
        }

        // Validate amount
        if (amount === "" || Number(amount) <= 0 ||
            !Number.isInteger(Number(amount))) {
            showError("amount", "Enter a valid positive whole amount.");
            valid = false;
        }

        // Validate category
        if (category === "") {
            showError("category", "Please choose a category.");
            valid = false;
        }

        // Validate date
        if (date === "") {
            showError("date", "Please select a date.");
            valid = false;
        }

        // Stop if validation fails
        if (!valid) {
            return;
        }

        // Create expense object
        const expense = {
            id: Date.now(),
            title: title,
            amount: Number(amount),
            category: category,
            date: date
        };

        // Get existing expenses
        const expenses = getExpenses();

        // Add new expense
        expenses.push(expense);

        // Save to localStorage
        localStorage.setItem("expenses", JSON.stringify(expenses));

        // Display recently added expense
        displayRecent(expense);

        // Show success message
        showToast("Expense added successfully!");

        // Reset form
        form.reset();
    });
}
