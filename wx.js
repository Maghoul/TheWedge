const deptApt = document.getElementById("departure-airport");
const arrApt = document.getElementById("arrival-airport");
const flightForm = document.getElementById("form");
const results = document.getElementById("results");
const clearBtn = document.getElementById("clear-btn");
const apiBaseUrl = "https://avwx.rest/api/metar/";

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

async function getWeatherData(airportCode) {
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
        const response = await fetch(`${apiBaseUrl}${airportCode}`, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('avwxToken'); // Clear invalid token
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
        console.error(`Failed to fetch weather data: ${error.message}`);
        results.innerText = `Error: Unable to fetch weather data for ${airportCode}. ${error.message}`;
        results.classList.remove("hidden");
        return null;
    }
}

flightForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    results.innerText = "Loading weather data...";
    results.classList.remove("hidden");

    // Sanitize inputs
    const deptCode = (deptApt.value || "").trim().toUpperCase();
    const arrCode = (arrApt.value || "").trim().toUpperCase();

    let output = "";
    const deptWeather = await getWeatherData(deptCode);
    if (deptWeather) {
        output += `${deptWeather.station} is currently ${deptWeather.flight_rules || 'N/A'}\n` +
                  `METAR: ${deptWeather.raw}`;
    }

    if (arrCode) {
        const arrWeather = await getWeatherData(arrCode);
        if (arrWeather) {
            output += `\n\n${arrWeather.station} is currently ${arrWeather.flight_rules || 'N/A'}\n` +
                      `METAR: ${arrWeather.raw}`;
        }
    }

    if (output) {
        results.innerText = output;
    }
});

clearBtn.addEventListener("click", () => {
    if (deptApt) deptApt.value = "";
    if (arrApt) arrApt.value = "";
    results.innerText = "";
    results.classList.add("hidden");
    flightForm.querySelector('button[type="submit"]').disabled = !apiToken; // Re-enable if token exists
});