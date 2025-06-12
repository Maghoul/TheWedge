const numberCrew = 3;
const eta = document.getElementById("eta");
const startTime = document.getElementById("start-time");
const endRest = document.getElementById("end-rest");
const restPeriods = 1;
const transition = document.getElementById("transition");
const results = document.getElementById("results");
const restForm = document.getElementById("form");
const clearBtn = document.getElementById("clear-btn");
const localBox = document.getElementById("local-box");
const beginLabel = document.getElementById("begin-label");
const etaLabel = document.getElementById("eta-label");
//const backDiv = document.querySelector(".back");

const baseDate = new Date();
let etaDate = new Date(baseDate.getTime());
let beginDate = new Date(baseDate.getTime());
let varTime = "Z"

//Initialize defaults
etaDate.setUTCHours(etaDate.getUTCHours() + 9);
eta.value = etaDate.toISOString().slice(11,16);
beginDate.setUTCMinutes(beginDate.getUTCMinutes() + 10);
startTime.value = beginDate.toISOString().slice(11, 16);
transition.value = 7;
endRest.value = 55;

localBox.addEventListener("change", () => {
    etaDate = new Date(baseDate.getTime());
	beginDate = new Date(baseDate.getTime());
  if (localBox.checked) {
	etaDate.setHours(etaDate.getHours() + 9);
	eta.value = etaDate.toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute: '2-digit'});
	beginDate.setMinutes(beginDate.getMinutes() + 10);
	startTime.value = beginDate.toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute: '2-digit'});
	beginLabel.innerText = "Begin rest (Local)";
	etaLabel.innerText = "ETA (Local)"
	varTime = "L";
	  
  } else {
	etaDate.setUTCHours(etaDate.getUTCHours() + 9);
    eta.value = etaDate.toISOString().slice(11, 16);
    beginDate.setUTCMinutes(beginDate.getUTCMinutes() + 10);
    startTime.value = beginDate.toISOString().slice(11, 16);
    beginLabel.innerText = "Begin rest (Zulu)";
	etaLabel.innerText = "ETA (Zulu)";	
	varTime = "Z";
  } 
});

let utcPlus = new Date();
utcPlus.setUTCHours(utcPlus.getUTCHours() + 9);
eta.value = utcPlus.toISOString().slice(11, 16);


let currentTime = new Date();
currentTime.setUTCMinutes(currentTime.getUTCMinutes() + 10);
startTime.value = currentTime.toISOString().slice(11, 16);

eta.addEventListener("focus", () => {
  eta.classList.add("focused");
  eta.select(); 
});
eta.addEventListener("blur", () => eta.classList.remove("focused"));
eta.addEventListener("change", () => 
	eta.value = formatTime(eta.value));
startTime.addEventListener("focus", () => {
  startTime.classList.add("focused");
  startTime.select();
});
startTime.addEventListener("blur", () => startTime.classList.remove("focused"));
startTime.addEventListener("change", () => 
  startTime.value = formatTime(startTime.value));
endRest.addEventListener("focus", () => {
  endRest.classList.add("focused"); 
  endRest.select(); 
});
endRest.addEventListener("blur", () => endRest.classList.remove("focused"));
transition.addEventListener("focus", () => {
  transition.classList.add("focused");
  transition.select();
});
transition.addEventListener("blur", () => transition.classList.remove("focused")); 

function formatTime(input) {
  if (!input) return input;
  // Remove non-digits
  let digits = input.replace(/\D/g, "");
  // Handle 1–4 digits
  if (digits.length < 3 || digits.length > 4) return input;
  // Pad with leading zeros if needed (e.g., "430" → "0430")
  digits = digits.padStart(4, "0");
  // Extract hours and minutes
  let hours = parseInt(digits.slice(0, 2), 10);
  let minutes = parseInt(digits.slice(2, 4), 10);
  // Clamp values
  hours = Math.min(Math.max(hours, 0), 23);
  minutes = Math.min(Math.max(minutes, 0), 59);
  // Format as HH:mm
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function timeToMin(timeStr) {
  if (!timeStr || !/^[0-2][0-9]:[0-5][0-9]$/.test(timeStr)) {
    throw new Error("Invalid time format (use HH:mm, e.g., 14:30)");
  }
  const [hours, min] = timeStr.split(":").map(Number);
  if (isNaN(hours) || isNaN(min)) {
    throw new Error("Invalid time values");
  }
  return hours * 60 + min;
}

function adjustForMidnight(minutes) {
  // Normalize to 0–1440 range using modulo
  return ((minutes % 1440) + 1440) % 1440;
} 

function displayTimeFormat(minutes) {
  const hours = Math.floor(Math.abs(minutes) / 60);
  const mins = Math.floor(Math.abs(minutes) % 60);
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function subtractTimes(endTime, startTime) {
  let diffMin = timeToMin(endTime) - timeToMin(startTime);
  diffMin = adjustForMidnight(diffMin);
  return displayTimeFormat(diffMin);
}

function calcRest() {  
  const minPrior = parseInt(endRest.value, 10);
  const transitionMins = parseInt(transition.value, 10);
  const eTA = formatTime(eta.value);
  const start = formatTime(startTime.value); 

  results.classList.remove("error");
  const output = [];

  if (
    isNaN(numberCrew) ||
    isNaN(minPrior) ||
    isNaN(restPeriods) ||
    isNaN(transitionMins) ||
    !eTA ||
    !start
  ) {
    results.classList.add("error");
    results.innerText = "Error: Please enter valid numbers and times (HH:mm).";
    return;
  }

  try {
    let endCrewRestMin = timeToMin(eTA) - minPrior;
    endCrewRestMin = adjustForMidnight(endCrewRestMin);
    const endCrewRest = displayTimeFormat(endCrewRestMin);
    output.push(`Rest: ${start}${varTime} - ${endCrewRest}${varTime}\nETA: ${eTA}${varTime}`);    

    let totalRest = subtractTimes(endCrewRest, start);
    totalRest = timeToMin(totalRest);

    if (totalRest <= 0) {
      results.classList.add("error");
      results.innerText = "Error: Start time must be before end rest time.";
      return;
    }

    totalRest = totalRest - (numberCrew * restPeriods - 1) * transitionMins;

    if (totalRest < numberCrew * restPeriods) {
      results.classList.add("error");
      results.innerText = "Error: Total rest too short for all pilots.";
      return;
    }

    const pilotRestLength = Math.round(totalRest / (numberCrew * restPeriods));
    let computedRest = displayTimeFormat(pilotRestLength);
    output.push(`Rest / Pilot: ${computedRest}`);
	const pilotStartTime = [];
    let restStartTime = start;

    for (let i = 0; i < numberCrew * restPeriods; i++) {
      let getMins = timeToMin(restStartTime) + pilotRestLength;
      let pilotEndRestMin = adjustForMidnight(getMins);
      let pilotEndRest = displayTimeFormat(pilotEndRestMin);
      let checkEnd = Math.abs(timeToMin(pilotEndRest) - timeToMin(endCrewRest));
      if (checkEnd <= 1) {
        pilotEndRest = endCrewRest; 
      }
      pilotStartTime.push(`Pilot ${i + 1}: ${restStartTime}${varTime} - ${pilotEndRest}${varTime}`);
      output.push(pilotStartTime[i]);

      let nextRest = getMins + transitionMins;
      nextRest = adjustForMidnight(nextRest);
      restStartTime = displayTimeFormat(nextRest);  
    }
	// Display results
	results.innerHTML = "";
	output.forEach((line, index) => {
		const textNode = document.createTextNode(line);
		results.appendChild(textNode);
		if (index < output.length - 1) {
			results.appendChild(document.createElement("br"));
		}
		if (index === 1) {
			results.appendChild(document.createElement("hr"));
		};
	});

  } catch (error) {
    results.classList.add("error");
    results.innerText = `Error: ${error.message}`;
  }
}

restForm.addEventListener("submit", (e) => {
  e.preventDefault();
  restForm.classList.add("hidden");
  results.innerHTML = "";
  calcRest();
  results.classList.remove("hidden");
  // Append back button
  const backBtn = document.createElement("button");
    backBtn.id = "back-btn";
	backBtn.textContent = "Back";
	results.appendChild(document.createElement("br"));
	results.appendChild(backBtn);
	backBtn.addEventListener("click", () => {
		restForm.classList.remove("hidden");
        results.innerText = "";
        results.classList.remove("error");
	    results.classList.add("hidden");
	}); 
});

const backBtn = document.getElementById("back-btn");

restForm.addEventListener("reset", (e) => {
  e.preventDefault();
  eta.value = utcPlus.toISOString().slice(11, 16);
  startTime.value = currentTime.toISOString().slice(11, 16);
  transition.value = 7;
  endRest.value = 55;
  localBox.checked = false; 
    beginLabel.innerText = "Begin rest (Zulu)";
    etaLabel.innerText = "ETA (Zulu)";
	varTime = "Z";
	results.classList.remove("error");
});

clearBtn.addEventListener("click", () => {
	eta.value = "";
	startTime.value = "";
	transition.value = "";
	endRest.value = "";
	localBox.checked = false; 
    beginLabel.innerText = "Begin rest (Zulu)";
    etaLabel.innerText = "ETA (Zulu)";
	varTime = "Z";
	results.classList.remove("error");
});
