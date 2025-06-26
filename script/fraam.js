// Copyright (c) 2025 Rick Griffin. All rights reserved.
const sleepDebt1 = document.getElementById("sleep-debt1");
const sleepDebt2 = document.getElementById("sleep-debt2");
const sleepDebt3 = document.getElementById("sleep-debt3");
const sleepDebt4 = document.getElementById("sleep-debt4");
const wakefulness1 = document.getElementById("wakefulness1");
const wakefulness2 = document.getElementById("wakefulness2");
const wakefulness3 = document.getElementById("wakefulness3");
const wakefulness4 = document.getElementById("wakefulness4");
const circadian1 = document.getElementById("circadian1");
const circadian2 = document.getElementById("circadian2");
const circadian3 = document.getElementById("circadian3");
const circadian4 = document.getElementById("circadian4");
const workload1 = document.getElementById("workload1");
const workload2 = document.getElementById("workload2");
const workload3 = document.getElementById("workload3");
const workload4 = document.getElementById("workload4");
const fraamForm = document.getElementById("form");
const results = document.getElementById("results");
const clearBtn = document.getElementById("clear-btn");

const assessment = {
	0: {requirement: 'Acceptable Risk', action: 'Continue monitoring for fatigue', color: "var(--primary-color"},
	1: {requirement: 'Minor Risk', action: 'Try to nap or consider strategic caffeine usage', color: "lightgreen"},
	2: {requirement: 'Elevated Risk', action: 'Mitigate risk by napping or consider strategic caffeine usage. Advise other pilot if feeling sleepy', color: "yellow"},
	3: {requirement: 'Hazardous Risk', action: 'Mitigate risk as able, follow ALPA fatigue assessment', color: 'red'}	
};

function assessFatigue () {
	const arrTotals = [sleepDebt1.checked, sleepDebt2.checked, sleepDebt3.checked, sleepDebt4.checked, 
		wakefulness1.checked, wakefulness2.checked, wakefulness3.checked, wakefulness4.checked, 
		circadian1.checked, circadian2.checked, circadian3.checked, circadian4.checked, 
		workload1.checked, workload2.checked, workload3.checked, workload4.checked];

	// In each case below if the boolean is true then 
	// the previous checkbox must also be true
	if (arrTotals[1]) {
		sleepDebt1.checked = true;
		arrTotals[0] = sleepDebt1.checked;
	}
	if (arrTotals[5]) {
		wakefulness1.checked = true;
		arrTotals[4] = wakefulness1.checked;
	}
	if (arrTotals[7]) {
		wakefulness3.checked = true;
		arrTotals[6] = wakefulness3.checked;
	}	
	if (arrTotals[11]) {
		circadian3.checked = true;
		arrTotals[10] = circadian3.checked;
	}	
	if (arrTotals[13]) {
		workload1.checked = true;
		arrTotals[12] = workload1.checked;
	}
	
	// Calculate the total fatigue score
	let totalPoints = 0;
	arrTotals.forEach((checked, index) => {
		if (checked) {
			totalPoints += 1;
		}
	//	console.log(`Checkbox ${index + 1}: ${checked}`)
	});
		
	let level = 0;
	
	if (totalPoints <= 3) {
		level = 0;
	} else if (totalPoints <= 6) {
		level = 1;
	} else if (totalPoints <= 9) {
		level = 2;
	} else {
		level = 3;
	}

    return [totalPoints, level]; // Return color in the array
};

// Function to display a temporary message appended to a specific label
function showMessage(checkboxId, text) {
    // Find the label for the checkbox
    const label = document.querySelector(`label[for="${checkboxId}"]`);
    if (!label) return; // Safety check in case label is missing

    // Remove any existing message to avoid duplicates
    const existingMessage = label.querySelector(".error-message");
    if (existingMessage) existingMessage.remove();

    // Create new message span
    const messageSpan = document.createElement("span");
    messageSpan.className = "error-message";
    messageSpan.textContent = ` ${text}`; // Space for readability
    messageSpan.style.color = "#d32f2f"; // Red for visibility
    messageSpan.style.fontSize = "0.9rem"; // Smaller font
    messageSpan.style.display = "block"; // Ensure it appears below label text
    messageSpan.style.marginTop = "5px";

    // Append message to label
    label.appendChild(messageSpan);

    // Clear message after 5 seconds
    setTimeout(() => {
        messageSpan.remove();
    }, 5000);
}

// Add change event listeners for dependent checkboxes
sleepDebt2.addEventListener("change", () => {
    if (sleepDebt2.checked  && !sleepDebt1.checked) {
        sleepDebt1.checked = true;
        showMessage("sleep-debt1", "If sleep reduced > 4hrs mark both lines.");
    }
});

wakefulness2.addEventListener("change", () => {
    if (wakefulness2.checked && !wakefulness1.checked) {
        wakefulness1.checked = true;
        showMessage("wakefulness1", "If time awake > 6hrs mark both lines.");
    }
});

wakefulness4.addEventListener("change", () => {
    if (wakefulness4.checked && !wakefulness3.checked) {
        wakefulness3.checked = true;
        showMessage("wakefulness3", "If flight time > 12hrs mark both lines.");
    }
});

circadian4.addEventListener("change", () => {
    if (circadian4.checked && !circadian3.checked) {
        circadian3.checked = true;
        showMessage("circadian3", "If flight time > 2hrs in WOCL mark both lines.");
    }
});

workload2.addEventListener("change", () => {
    if (workload2.checked && !workload1.checked) {
        workload1.checked = true;
        showMessage("workload1", "If 3+ flights at night mark both lines.");
    }
});

fraamForm.addEventListener("submit", (e) => {
    e.preventDefault();
	results.innerHTML = "";
    fraamForm.classList.add("hidden");
    const result = assessFatigue();
	const resultNum = result[1];
	
	// console.log("Result Number: ", resultNum);
	// console.log("Fatigue Risk: ", assessment[resultNum].requirement);
	// console.log("Recommend: ", assessment[resultNum].action);
	
	const paraSum = document.createElement("p");
	const paraRisk = document.createElement("p");
	const paraRecommend = document.createElement("p");
	const spanSum = document.createElement("span");
	const spanRisk = document.createElement("span");
	const spanRecommend = document.createElement("span");
	spanSum.style.color = assessment[resultNum].color;
	spanSum.innerText = result[0];
	spanRisk.style.color = assessment[resultNum].color;
	spanRisk.innerText = assessment[resultNum].requirement;
	spanRecommend.style.color = assessment[resultNum].color;
	spanRecommend.innerText = assessment[resultNum].action;
	
	paraSum.innerText = "Sum of Fatigue Factors (10+ is Hazardous): ";
	paraSum.appendChild(spanSum);
	paraRisk.innerText = "Fatigue Risk: ";
	paraRisk.appendChild(spanRisk);
	paraRecommend.innerText = "Recommend: ";
	paraRecommend.appendChild(spanRecommend);

	results.appendChild(paraSum);
	results.appendChild(paraRisk);
	results.appendChild(paraRecommend);

    results.classList.remove("hidden");

	// Append resources
	const resourcesP = document.createElement("p");
	const link = document.createElement("a");
	link.href = "https://scheduling.fdx.alpa.org/fatigue#/fatigue";
	link.target = "_blank";
	link.innerText = "- ALPA Fatigue Assessment"
	resourcesP.appendChild(link);
	results.appendChild(document.createElement("br"));
	results.appendChild(document.createElement("hr"));
	results.appendChild(resourcesP)

    // Append back button
    const backBtn = document.createElement("button");
    backBtn.id = "back-btn";
    backBtn.textContent = "Back";
    results.appendChild(document.createElement("br"));
    results.appendChild(backBtn);
    backBtn.addEventListener("click", () => {
        fraamForm.classList.remove("hidden");
        results.innerText = "";
        results.classList.add("hidden");
    });
});



clearBtn.addEventListener("click", () => {
    // Uncheck all checkboxes
    [sleepDebt1, sleepDebt2, sleepDebt3, sleepDebt4, 
     wakefulness1, wakefulness2, wakefulness3, wakefulness4, 
     circadian1, circadian2, circadian3, circadian4, 
     workload1, workload2, workload3, workload4].forEach(checkbox => {
        checkbox.checked = false;
    });
	// Clear all error messages
    document.querySelectorAll(".error-message").forEach(message => message.remove());
    // Clear and hide results
    results.innerText = "";
    results.classList.add("hidden");
    fraamForm.classList.remove("hidden");
});

