const deptApt = document.getElementById("departure-airport");
const arrApt = document.getElementById("arrival-airport");
const flightForm = document.getElementById("form");
const etd = document.getElementById("etd");
const eta = document.getElementById("eta");
const results = document.getElementById("results");
const clearBtn = document.getElementById("clear-btn");
const apiBaseMetar = "https://avwx.rest/api/metar/";
const apiBaseTaf = "https://avwx.rest/api/taf/";

let etdDate;
let etaDate;

// Initialize API token
let apiToken = localStorage.getItem('avwxToken');
if (!apiToken) {
    apiToken = prompt('Enter your AVWX API token (get it from https://account.avwx.rest):');
    if (apiToken) {
        localStorage.setItem('avwxToken', apiToken);
    } else {
        results.innerText = 'Error: AVWX API token required. Please reload and enter a valid token.';
        results.classList.remove("hidden");
        flightForm.querySelector('button[type="submit"]').disabled = true;
    }
}

//set dynamic placeholders ETA and ETD
let etdPlaceholder = new Date();
let etaPlaceholder = new Date(etdPlaceholder.getTime());
etdPlaceholder.setUTCHours(etdPlaceholder.getUTCHours() + 1); // Adjust to UTC+1 for one hour from now
etaPlaceholder.setUTCHours(etaPlaceholder.getUTCHours() + 4); // Adjust to UTC+2 for four hours from now
etdPlaceholder = etdPlaceholder.toISOString().slice(11, 16);
etaPlaceholder = etaPlaceholder.toISOString().slice(11, 16);
etd.placeholder = `e.g., ${etdPlaceholder}`; 
eta.placeholder = `e.g., ${etaPlaceholder}`;

// Add focus and blur event listeners to input fields
deptApt.addEventListener("focus", () => {
    deptApt.classList.add("focused");
    deptApt.select();
});
deptApt.addEventListener("blur", () => deptApt.classList.remove("focused"));
arrApt.addEventListener("focus", () => {
    arrApt.classList.add("focused");
    arrApt.select();
});
arrApt.addEventListener("blur", () => arrApt.classList.remove("focused"));
etd.addEventListener("focus", () => {
    etd.classList.add("focused");   
    etd.select();
});
etd.addEventListener("blur", () => etd.classList.remove("focused"));
eta.addEventListener("focus", () => {
    eta.classList.add("focused");
    eta.select();
}); 
eta.addEventListener("blur", () => eta.classList.remove("focused"));

//Check time formats on eta and etd
etd.addEventListener("change", () => {
    etd.value = formatTime(etd.value);
    if (etd.value) {    
        etdDate = convertToISODate(new Date(), etd.value.replace(":", ""));
    }
});
eta.addEventListener("change", () => {
    eta.value = formatTime(eta.value);
    if (eta.value) {
        etaDate = convertToISODate(new Date(), eta.value.replace(":", ""));
    }
});

// Convert time to full UTC time

function convertToISODate(date, timeStr) {
    if (!timeStr || !/^\d{4}$/.test(timeStr)) {
        throw new Error("Invalid time format (should be HHmm, e.g., 1430)");
    }
    const baseDate = new Date(date.getTime()); // Copy the input date
    const hours = parseInt(timeStr.slice(0, 2), 10);
    const minutes = parseInt(timeStr.slice(2, 4), 10);

    date.setUTCHours(hours, minutes, 0, 0);
    if (date < baseDate) {
        date.setUTCDate(date.getUTCDate() + 1); // Adjust to next day if time is in the past
    }
     return date.toISOString();
}

// Add Time functions from frm.js
function formatTime(input) {
  if (!input) return input;
  // Remove non-digits
  let digits = input.replace(/\D/g, "");
  // Handle 1–4 digits
  if (digits.length < 3 || digits.length > 4) return "Invalid time format (should be HHmm, e.g., 1430)";
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


// Validate ICAO code (4 letters)
function isValidIcao(code) {
    return /^[A-Z]{4}$/.test(code);
}

async function getWeatherData(airportCode, type = 'metar') {
    if (!apiToken) {
        results.innerText = 'Error: AVWX API token missing.';
        results.classList.remove("hidden");
        return null;
    }
    if (!isValidIcao(airportCode)) {
        results.innerText = `Error: Invalid ICAO code "${airportCode}". Use 4 letters (e.g., KDEN).`;
        results.classList.remove("hidden");
        return null;
    }
    try {
        const baseUrl = type === 'metar' ? apiBaseMetar : apiBaseTaf;
        const response = await fetch(`${baseUrl}${airportCode}`, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('avwxToken');
                results.innerText = 'Error: Invalid AVWX token. Please reload and enter a new token.';
                flightForm.querySelector('button[type="submit"]').disabled = true;
            } else {
                throw new Error(response.statusText);
            }
            results.classList.remove("hidden");
            return null;
        }
        const data = await response.json();
        if (data.Error) {
            results.innerText = `Error: ${data.Error} for ${airportCode}.`;
            results.classList.remove("hidden");
            return null;
        }
        return data;
    } catch (error) {
        console.error(`Failed to fetch ${type} data: ${error.message}`);
        results.innerText = `Error: Unable to fetch ${type} data for ${airportCode}. ${error.message}`;
        results.classList.remove("hidden");
        return null;
    }
}

flightForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    flightForm.classList.add("hidden");
    results.innerText = "";
    results.innerText = "Loading weather data...";
    results.classList.remove("hidden");

    // Sanitize inputs
    const deptCode = (deptApt.value || "").trim().toUpperCase();
    const arrCode = (arrApt.value || "").trim().toUpperCase();

    let output = "";
    let strEtdInfo = "";
    let strEtaInfo = "";

    // Fetch departure weather
    const deptMetar = await getWeatherData(deptCode, 'metar');
    const deptTaf = await getWeatherData(deptCode, 'taf');
    if (etdDate) {
        for (let i = 0; i < (deptTaf?.forecast?.length || 0); i++) {
            const forecast = deptTaf.forecast[i].flight_rules || 'N/A';
            const startTime = deptTaf.forecast[i].start_time.dt || 'N/A';
            const endTime = deptTaf.forecast[i].end_time.dt || 'N/A';

            if (etdDate >= startTime && etdDate <= endTime) {
                strEtdInfo = ` and forecasted as ${forecast} at departure time ${etd.value}Z.`
            }
        }
    }

    if (deptMetar && deptTaf) {
        output += `${deptMetar.station} is currently ${deptMetar.flight_rules || 'N/A'}${strEtdInfo}\n` +
                  `METAR: ${deptMetar.raw}\n\n` +
                  `TAF: ${deptTaf.raw}\n`;
    }
    if (deptMetar && !deptTaf) {
        output += `${deptMetar.station} is currently ${deptMetar.flight_rules || 'N/A'}\n` +
                  `METAR: ${deptMetar.raw}\n`;
    }
    if (deptTaf && !deptMetar) {
        output += `${deptTaf.station} is currently ${deptTaf.flight_rules || 'N/A'}\n` +
                  `\nTAF: ${deptTaf.raw}\n`;
    }
    if (!deptMetar && !deptTaf) {
        output += `No weather data found for ${deptCode}.`;
        results.classList.add("error");
    }

    // Add horizontal rule if there’s arrival info to follow
    if (arrCode) {
        output += `\n<hr>\n`; // Add the HR between departure and arrival
    }

    // Fetch arrival weather if provided
    if (arrCode) {
        const arrMetar = await getWeatherData(arrCode, 'metar');
        const arrTaf = await getWeatherData(arrCode, 'taf');
        console.dir(arrTaf);
       

        if (etaDate) {
            for (let i = 0; i < (arrTaf?.forecast?.length || 0); i++) {
                const forecast = arrTaf.forecast[i].flight_rules || 'N/A';
                const startTime = arrTaf.forecast[i].start_time.dt || 'N/A';
                const endTime = arrTaf.forecast[i].end_time.dt || 'N/A';

                console.log(`Forecast: ${forecast}, Start: ${startTime}, End: ${endTime}`);
                console.log(`ETA Date: ${etaDate}`);

                if (etaDate >= startTime && etaDate <= endTime) {
                    strEtaInfo = ` and forecasted as ${forecast} at arrival time ${eta.value}Z.`;
                }
            }
        }

        if (arrMetar && arrTaf) {
            output += `\n${arrMetar.station} is currently ${arrMetar.flight_rules || 'N/A'}${strEtaInfo}\n` +
                        `METAR: ${arrMetar.raw}\n\n` +
                        `TAF: ${arrTaf.raw}\n`;
        }

        if (arrMetar && !arrTaf) {
            output += `\n\n${arrMetar.station} is currently ${arrMetar.flight_rules || 'N/A'}\n` +
                      `METAR: ${arrMetar.raw}\n`;
        }
    
        if (arrTaf && !arrMetar) {
            output += `\nTAF: ${arrTaf.raw}\n`;
        }

        if (!arrMetar && !arrTaf) {
            output += `No weather data found for ${arrCode}.`;
            results.classList.add("error");
        }
    }

    if (output) {
        results.innerHTML = output.replace(/\n/g, '<br>'); // Replace newlines with <br> for proper rendering
    }

// Append back button
  const backBtn = document.createElement("button");
    backBtn.id = "back-btn";
	backBtn.textContent = "Back";
	results.appendChild(document.createElement("br"));
	results.appendChild(backBtn);
	backBtn.addEventListener("click", () => {
		flightForm.classList.remove("hidden");
        results.innerText = "";
        results.classList.remove("error");
	    results.classList.add("hidden");
	}); 
});

const backBtn = document.getElementById("back-btn");

clearBtn.addEventListener("click", () => {
    if (deptApt) {
        deptApt.value = "";
        deptApt.placeholder = "e.g., KMEM";
    };

    if (arrApt) arrApt.value = "";
    if (etd) etd.value = "";
    if (eta) eta.value = "";
    results.innerText = "";
    results.classList.add("hidden");
    flightForm.querySelector('button[type="submit"]').disabled = !apiToken;
});