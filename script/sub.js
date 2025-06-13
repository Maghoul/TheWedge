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
             
    const arrTimes = [];
    let output = "";
    subTimes.forEach(item => {
        const utcDate = new Date(item.value + 'Z');
        if (!isNaN(utcDate)) {
            localStorage.setItem(item.name, utcDate.toUTCString());
            arrTimes.push(utcDate);
        } else {
            return "Invalid date/time entered.";
        }
    });
    
    const tripCredit = getTripCredit(tripGuarantee.value);
    console.log("Trip Credit:", tripCredit);

    localStorage.setItem('tripGuarantee', tripGuarantee.value);
    
    console.log("Sub Start:", arrTimes[0].toUTCString());
    console.log("Sub End:", arrTimes[1].toUTCString());
    console.log("Trip End:", arrTimes[2].toUTCString());
    console.log("Revised End:", arrTimes[3].toUTCString());
    
    const subDuration = subtractTimes(arrTimes[0], arrTimes[1]);
    const revisedDuration  = subtractTimes(arrTimes[2], arrTimes[3]);
    const revisionCredit = calculateOverage(revisedDuration);
    const subType = (subDuration <= 72) ? "Short" : "Long";
    let subOutput = ""
    if (subDuration >= 8) {
        subOutput += `<h2>Substitution Inquiry</h2>
            <p>Assignment Window:</p>
            <p>&nbsp&nbsp&nbspStart: ${arrTimes[0].toUTCString()}</p>
            <p>&nbsp&nbsp&nbspEnd: ${arrTimes[1].toUTCString()}</p>
            <p>&nbsp&nbsp&nbspDuration: ${subDuration} hrs, ${subType} Sub</p>
            <p>&nbsp&nbsp&nbspGuar Pay: <span style="color: yellow;">${tripCredit} hrs</span></p>
            <hr />
         `
        subOutput += revisionCredit >= tripCredit ?
            `<p><span style="color: yellow; font-size: 1.5rem;">Consider keeping overage:</span></p>
            <p>Two Options Available:</p>
                <p>&nbsp&nbsp&nbsp1. Drop conflict trip(s): Keep overage, hours go to regular makeup bank</p>
                <p>&nbsp&nbsp&nbsp2. Elect OTP: Keep overage, Paid Sub Guarantee now, makeup at 125%, pay removed in 3 bid periods</p>` :
            `<p><span style="color: yellow; font-size: 1.5rem;">Consider remaining in SUB</span></p>
             <p>Paid ACH for trip (no overage) plus SUB guarantee</p>`;
    } else {
        subOutput = `<h2>Substitution Inquiry</h2>
        <p>Update Substitution parameters for SUB information</p>
        
        `
    }
   
    console.log("Duration:", subDuration, "hrs");
    console.log("Revision Length: ", revisedDuration, "hrs");
    
    console.log("Sub Type:", subType);
    console.log("Revision CH:", revisionCredit);

    output += `<h2>Potential Overage</h2>
        <p>Revision extends trip: ${revisedDuration.toFixed(1)} hours:</p>
        <p>&nbsp&nbsp&nbspOverage may pay <span style="color: yellow;">${(revisionCredit).toFixed(1)}</span> credit hours</p>
        <p>&nbsp&nbsp&nbspNote: trip can still be shortened by CRS</p>
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
    tripGuarantee.value = localStorage.getItem('tripGuarantee') ?
        localStorage.getItem('tripGuarantee') :
        '06:00';
	results.classList.remove("error");
});

 clearBtn.addEventListener("click", () => {
    subTimes.forEach(item => {
        item.value = null 
        localStorage.removeItem(item.name)
    });
    localStorage.removeItem('tripGuarantee');
 })