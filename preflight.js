const release = document.getElementById('preflight1');
const clearance = document.getElementById('preflight2');
const edt = document.getElementById('preflight8');
const fuel = document.getElementById('preflight3');
const dg = document.getElementById('preflight4');
const finalWandB = document.getElementById('preflight5');
const security = document.getElementById('preflight6');
const perishibleLives = document.getElementById('preflight7');
const gendec = document.getElementById('preflight9');
const preflightForm = document.getElementById('form');
const clearBtn = document.getElementById('clear-btn');

preflightForm.addEventListener("change", () => {
    // Every time a checkbox is checked strike through the label and change text color
    // to indicate completion
    [release, clearance, edt, fuel, dg, finalWandB, security, perishibleLives, 
        gendec].forEach(checkbox => {
        const label = checkbox.nextElementSibling; // Assuming the label is the next sibling
        if (checkbox.checked) {
            label.style.textDecoration = "line-through";
            label.style.color = "green"; // Change text color to green
        } else {
            label.style.textDecoration = "none";    
            label.style.color = ""; // Reset text color
        }
    });
    // Check if all checkboxes are checked
    const allChecked = [release, clearance, edt, fuel, dg, finalWandB, security, perishibleLives, gendec]
        .every(checkbox => checkbox.checked);
    // If all are checked, change the background color of the form
    if (allChecked) {
        preflightForm.style.backgroundColor = "lightgreen"; // Change to light green
    } else {
        preflightForm.style.backgroundColor = ""; // Reset background color
    }
   
});

clearBtn.addEventListener("click", () => {
    // Uncheck all checkboxes and remove strikethrough from every label
    [release, clearance, edt, fuel, dg, finalWandB, security, perishibleLives, 
        gendec, preflightForm].forEach(checkbox => {
        checkbox.checked = false;
        const label = checkbox.nextElementSibling; // Assuming the label is the next sibling
        if (label) {
            label.style.textDecoration = "none"; // Remove strikethrough
            label.style.color = ""; // Reset text color
        }
    });
    preflightForm.style.backgroundColor = ""; // Reset background color

});