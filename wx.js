const deptApt = document.getElementById("departure-airport");
const arrApt = document.getElementById("arrival-airport");
const flightForm = document.getElementById("form");
const results = document.getElementById("results");
const clearBtn = document.getElementById("clear-btn");
const apiBaseMetar = "https://avwx.rest/api/metar/";
const apiBaseTaf = "https://avwx.rest/api/taf/";

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

    // Fetch departure weather
    const deptMetar = await getWeatherData(deptCode, 'metar');
    if (deptMetar) {
        output += `${deptMetar.station} is currently ${deptMetar.flight_rules || 'N/A'}\n` +
                  `METAR: ${deptMetar.raw}\n`;
    }
    const deptTaf = await getWeatherData(deptCode, 'taf');
    console.log(deptTaf);
    if (deptTaf) {
        output += `\nTAF: ${deptTaf.raw}\n`;
    }

    // Fetch arrival weather if provided
    if (arrCode) {
        const arrMetar = await getWeatherData(arrCode, 'metar');
        if (arrMetar) {
            output += `\n\n${arrMetar.station} is currently ${arrMetar.flight_rules || 'N/A'}\n` +
                      `METAR: ${arrMetar.raw}\n`;
        }
        const arrTaf = await getWeatherData(arrCode, 'taf');
        if (arrTaf) {
            output += `\nTAF: ${arrTaf.raw}\n`;
        }
    }

    if (output) {
        results.innerText = output;
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
    if (deptApt) deptApt.value = "";
    if (arrApt) arrApt.value = "";
    results.innerText = "";
    results.classList.add("hidden");
    flightForm.querySelector('button[type="submit"]').disabled = !apiToken;
});