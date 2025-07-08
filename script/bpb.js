// Copyright (c) 2025 Rick Griffin. All rights reserved.
const release = document.getElementById('preflight1');
const clearance = document.getElementById('preflight2');
const edt = document.getElementById('preflight8');
const fuel = document.getElementById('preflight3');
const dg = document.getElementById('preflight4');
const finalWandB = document.getElementById('preflight5');
const security = document.getElementById('preflight6');
const perishibleLives = document.getElementById('preflight7');
const gendec = document.getElementById('preflight9');
const preflightChecklist = document.getElementById('preflight-pc');
const preflightChecklistRow = document.getElementById('preflight-checklist-row');
const preflightForm = document.getElementById('form');
const clearBtn = document.getElementById('clear-btn');

// Array of checkboxes for easier iteration
const checkboxes = [release, clearance, edt, fuel, dg, finalWandB, 
    security, perishibleLives, gendec, preflightChecklist];

// Function to update UI based on checkbox state
function updateCheckboxUI(checkbox) {
    const label = checkbox.nextElementSibling;
    if (checkbox.checked) {
        label.style.textDecoration = "line-through";
        label.style.color = "green";
    } else {
        label.style.textDecoration = "none";
        label.style.color = "var(--primary-color)"; // Reset to theme color
    }
}

// Function to update form background based on all checkboxes
function updateFormBackground() {
    // Clear all boxes if the form is stale
    const loadTime = new Date();
    const checklistTimeString = localStorage.getItem('checklistTime');
    const checklistTime = checklistTimeString ? new Date(checklistTimeString) : null;

    // Ensure checklistTime is valid
    if (!checklistTime || isNaN(checklistTime)) {
        clearBoxes();
        return;
    }

    const timeDiff = (loadTime - checklistTime) / 60 / 60 / 1000; // Time Difference in hours
    if (timeDiff > 3) {
        clearBoxes();
        return;
    }
    const allChecked = checkboxes.every(checkbox => checkbox.checked);
    preflightForm.style.backgroundColor = allChecked ? "lightgreen" : "var(--complementary-color)";
    preflightForm.querySelector('h1').style.color = allChecked ?
        "black" :
        "var(--primary-color)";
}

function clearBoxes () {
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        updateCheckboxUI(checkbox);
        // Clear state from localStorage
        localStorage.removeItem(checkbox.id);
        preflightForm.style.backgroundColor = "var(--complementary-color)";
    });
}

// Restore state from localStorage on page load
checkboxes.forEach(checkbox => {
    const savedState = localStorage.getItem(checkbox.id);
    if (savedState !== null) {
        checkbox.checked = savedState === "true";
        updateCheckboxUI(checkbox);
    }
});

// Update form background on page load
updateFormBackground();

fuel.addEventListener("change", () => {
    if (fuel.checked) {
        preflightChecklistRow.classList.remove('hidden'); // Remove the hidden class
    } else {
        preflightChecklistRow.classList.add('hidden'); // Add the hidden class back
    }
});

// Event listener for checkbox changes
preflightForm.addEventListener("change", () => {
    // Update UI for all checkboxes
    checkboxes.forEach(checkbox => {
        updateCheckboxUI(checkbox);
        // Save state to localStorage
        localStorage.setItem(checkbox.id, checkbox.checked);
        localStorage.setItem('checklistTime', new Date().toISOString());
        // localStorage.setItem('checklistTime', '2025-06-11T11:12:53.188Z') // Used for testing
    });
    // Update form background
    updateFormBackground();
});

// Event listener for clear button
clearBtn.addEventListener("click", () => {
    // Uncheck all checkboxes and reset UI
    clearBoxes();
    preflightChecklistRow.classList.add('hidden');
    preflightForm.querySelector('h1').style.color = "var(--primary-color)";
    localStorage.removeItem('checklistTime');
});