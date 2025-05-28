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


const assessment = {
	0: {requirement: 'Acceptable', action: 'No mitigation required'},
	1: {requirement: 'Check for mitigation', action: 'identify mitigation to reduce fatigue'},
	2: {requirement: 'Mitigate Risk', action: 'implement mitigation measures to reduce fatigue'},
	3: {requirement: 'Unacceptable', action: 'If unable to mitigate risks, consider fatigue call-out options'}	
};

function assessFatigue () {
	const arrTotals = [sleepDebt1.checked, sleepDebt2.checked, sleepDebt3.checked, sleepDebt4.checked, wakefulness1.checked, wakefulness2.checked, wakefulness3.checked, wakefulness4.checked, circadian1.checked, circadian2.checked, circadian3.checked, circadian4.checked, workload1.checked, workload2.checked, workload3.checked, workload4.checked];

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
		
	let x = 0;
	
	if (totalPoints <= 3) {
		x = 0;
	} else if (totalPoints <= 6) {
		x = 1;
	} else if (totalPoints <= 9) {
		x = 2;
	} else {
		x = 3;
	}
	const finalAssessment = `Fatigue Risk: ${assessment[x].requirement}
	Recommend: ${assessment[x].action}`;
	
	return [totalPoints, finalAssessment]
};

fraamForm.addEventListener("submit", (e) => {
	e.preventDefault();
	const result = assessFatigue();
	results.innerText = `Sum of Fatigue Factors: ${result[0]}\n  ${result[1]}`
	results.classList.remove("hidden");
	
})

