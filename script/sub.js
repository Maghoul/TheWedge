const subStart = document.getElementById("sub-start");
const subEnd = document.getElementById("sub-end");
const tripGuarantee = document.getElementById("trip-guarantee");
const tripEnd = document.getElementById("trip-end");
const revised = document.getElementById("revised-trip-end");
const subForm = document.getElementById("form");
const clearBtn = document.getElementById("clear-btn");
const results = document.getElementById("results");

const subTimes = [subStart, subEnd, tripEnd, revised];
const now = new Date();
const subFlowURL = "https://fdx.alpa.org/Portals/7/Documents/Committees/communications/flowcharts/substitution-decision-flowchart.html"
const resources = `<hr />
    <p>Resources:</p>
    <p class="indent">&#9992; <a href="${subFlowURL}" target="_blank">ALPA interactive SUB flow chart</a></p>
    <p class="indent">&#9992; <a href="../images/subflow.png">ALPA SUB flow chart diagram</a></p>
    <p class="indent">&#9992; Overage: CBA 4.BB.3 & 4.BB.4</p>
    <p class="indent">&#9992; Substitution: CBA 25.H</p>
`;

// Initiate form values
subTimes.forEach(item => {
    item.value = localStorage.getItem(item.name) ?
        convertStorage(item.name) :
        item.value = now.toISOString().slice(0, 16);
        console.log(item.name, item.value)
});
tripGuarantee.value = localStorage.getItem('tripGuarantee') ?
    localStorage.getItem('tripGuarantee') :
    '06:00';

// Practice values for testing
// The format is "yyyy-MM-ddThh:mm"
// subStart.value = '2024-04-03T16:10';
// subEnd.value = '2024-04-06T05:40';
// tripEnd.value = '2025-06-16T09:30';
// revised.value = '2025-06-16T21:29';
// tripGuarantee.value = '6:00';

// generate output data
function generateOutput() {
             
    const resultsArray = [];
    let output = "";
 
    subTimes.forEach(item => {
        const utcDate = item.value ? new Date(item.value + 'Z') : null;

        const resultObj = {
            id: item.name,
            value: item.value,
            utcDate: utcDate, // ? utcDate.toISOString() : null,
            output: formatDate(utcDate),
            valid: item.value && !isNaN(utcDate)
        }
        resultsArray.push(resultObj);
        localStorage.setItem(item.name, item.value);
    });

    console.log(resultsArray);

    // Ensure Trip End and Sub End occur after Trip Start and Sub Start

    for (i=0; i < 3; i+=2) {
        if (resultsArray[i+1].utcDate < resultsArray[i].utcDate) {
            output += `<p>The Trip / Sub time(s) should begin before it ends!</p>`
            return output;
        }
    }

    // Ensure trip guarantee is entered if doing the sub inquiry
    if (subStart.value && subEnd.value && subStart.value !== subEnd.value && !tripGuarantee.value) {
        output  += `<p>Please enter the Guarantee Pay</p>`
        return output;
    }

    const tripCredit = getTripCredit(tripGuarantee.value);
    console.log("Trip Credit:", tripCredit);

    localStorage.setItem('tripGuarantee', tripGuarantee.value);
    
    // console.log("Sub Start:", resultsArray[0].value);
    // console.log("Sub End:", resultsArray[1].value);
    // console.log("Trip End:", resultsArray[2].value);
    // console.log("Revised End:", resultsArray[3].value);
    
    const subDuration = subtractTimes(resultsArray[0].utcDate, resultsArray[1].utcDate);
    console.log("subDuration:", subDuration)
    const revisedDuration  = subtractTimes(resultsArray[2].utcDate, resultsArray[3].utcDate);
    const revisionCredit = calculateOverage(revisedDuration);
    const subType = (subDuration <= 72) ? "Short" : "Long";
    let subOutput = ""
    if (subDuration >= 8) {
        subOutput += `<h2>Substitution Inquiry</h2>
            <p>Assignment Window:</p>
            <p class="indent">Start: ${resultsArray[0].output}</p>
            <p class="indent">End: ${resultsArray[1].output}</p>
            <p class="indent">Duration: ${subDuration} hrs -- [${subType} Sub]</p>
            <p class="indent">Guar Pay: <span style="color: yellow;">${tripCredit.toFixed(1)}</span> credit hrs</p>
            <hr />
         `
        subOutput += revisionCredit >= tripCredit ?
            `<p><span style="color: yellow; font-size: 1.5rem;">Consider keeping overage:</span></p>
            <p>Three Options Available:</p>
                <p class="indent" style="padding-left: 25px;">1. Drop conflict trip(s): <span style="color: yellow;">Keep overage</span>, hours go to regular makeup bank</p>
                <p class="indent" style="padding-left: 25px;">2. Elect OTP: <span style="color: yellow;">Keep overage</span>, paid SUB guarantee now, makeup at 125%, pay removed in 3 bid periods</p>
                <p class="indent" style="padding-left: 25px;">3. Remain in SUB: <span style="color: red;">Lose overage</span>, paid SUB guarantee</p>` :
            `<p><span style="color: yellow; font-size: 1.5rem;">Consider remaining in SUB</span></p>
             <p>Paid ACH for trip (no overage) plus SUB guarantee</p>`;
        subOutput += resources;
    } else if (tripCredit) {
        subOutput += `<h2>Trip Guarantee</h2>
        <p>Guar Pay: <span style="color: yellow;">${tripCredit.toFixed(1)}</span> credit hrs</p>
        <p>Update Substitution start/end parameters for SUB Inquiry information</p>
        `
    } else {
        subOutput += `<h2>Substitution Inquiry</h2>
        <p>Update Substitution parameters for SUB information</p>
        `
    }

    console.log("Duration:", subDuration, "hrs");
    console.log("Revision Length: ", revisedDuration, "hrs");
    
    console.log("Sub Type:", subType);
    console.log("Revision CH:", revisionCredit);

    output += `<h2>Potential Overage</h2>
        <p>Extension Window:</p>
        <p class="indent">Trip End: ${resultsArray[2].output}</p>
        <p class="indent">Rev End: ${resultsArray[3].output}</p> 
        <p class="indent">Total Extension: ${revisedDuration.toFixed(1)} hours</p>
        <p class="indent">Overage pays <span style="color: yellow;">~${(revisionCredit).toFixed(1)}</span> credit hours<span class="super">1,2</span></p>
        <p class="indent">&nbsp&nbsp<span style="font-size: 1.0rem;"><span class="super">1</span>trip can still be revised by CRS</span></p>
        <p class="indent" style="line-height: 0.75;">&nbsp&nbsp<span style="font-size: 1.0rem;"><span class="super">2</span>assumes on TAFB credit trip</span></p>
        <hr />`
    output += subOutput;
    return output;
}
// Ensure good input and return credit value
function getTripCredit(value) {
    const regex = /^\d{1,3}(?::[0-5][0-9])?$/;
    if (!regex.test(value)) {
        return NaN;
    }
    if (value.includes(':')) {
        const [hours, minutes] = value.split(':').map(Number);
        return hours + minutes / 60;
    }
    return Number(value);
}

function convertStorage (item) {
    let timeValue = localStorage.getItem(item);
    return new Date(timeValue).toISOString().slice(0, 16);
}

function subtractTimes(time1, time2) {
    return (time2 - time1) / (1000 * 60 * 60);
}

function calculateOverage(timeLength) {
    const creditHours = timeLength / 3.75;
    if (timeLength <= 2) {
        return creditHours;
    } else if (timeLength <= 45) {
        return 1.5 * creditHours;
    } else {
        return 18 + (2 * ((timeLength - 45)/ 3.75));
    }
}

function formatDate(date) {
    // Formats as DDMMMYYHHMMz
    if (!date || isNaN(date)) return "Invalid Date";
    
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    
    const day = String(date.getUTCDate()).padStart(2, "0"); // DD
    const month = months[date.getUTCMonth()]; // MMM
    const year = String(date.getUTCFullYear()).slice(-2); // YY
    const hours = String(date.getUTCHours()).padStart(2, "0"); // HH
    const minutes = String(date.getUTCMinutes()).padStart(2, "0"); // MM
    
    return `${day}${month}${year} ${hours}${minutes}z`;
}

function appendBackButton() {
  const backBtn = document.createElement("button");
  backBtn.id = "back-btn";
  backBtn.textContent = "Back";
  results.appendChild(document.createElement("br"));
  results.appendChild(backBtn);
  backBtn.addEventListener("click", () => {
    subForm.classList.remove("hidden");
    results.innerText = "";
    results.classList.remove("error");
    results.classList.add("hidden");
  });
}

tripGuarantee.addEventListener("focus", () => {
  tripGuarantee.classList.add("focused");
  tripGuarantee.select();
});
tripGuarantee.addEventListener("blur", () => tripGuarantee.classList.remove("focused"));
// tripGuarantee.addEventListener("change", () => 
//   tripGuarantee.value = formatTime(tripGuarantee.value));


 subForm.addEventListener("submit", (e) => {
    e.preventDefault();
    results.innerHTML = "";
    results.innerHTML = generateOutput();
    results.classList.remove("hidden");
    subForm.classList.add("hidden");

    appendBackButton();
 });

 subForm.addEventListener("reset", (e) => {
  e.preventDefault();
  subTimes.forEach(item => {
    item.value = localStorage.getItem(item.name) ?
        convertStorage(item.name) :
        item.value = now.toISOString().slice(0, 16);
        console.log(item.name, item.value)
    });
    tripGuarantee.value = null;
	results.classList.remove("error");
});

 clearBtn.addEventListener("click", () => {
    subTimes.forEach(item => {
        item.value = null 
        localStorage.removeItem(item.name)
    });
    localStorage.removeItem('tripGuarantee');
 })