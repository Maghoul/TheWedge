const deptApt = document.getElementById("departure-airport");
const arrApt = document.getElementById("arrival-airport");
const flightForm = document.getElementById("form");
const results = document.getElementById("results");
const clearBtn = document.getElementById("clear-btn");
const apiBaseUrl = "https://avwx.rest/api/metar/";

let apiToken = localStorage.getItem('avwxToken');
if (!apiToken) {
    apiToken = prompt('Enter your AVWX API token (get it from https://account.avwx.rest):');
    if (apiToken) {
        localStorage.setItem('avwxToken', apiToken);
    } else {
        results.innerText = 'Error: AVWX API token required. Please reload and enter a valid token.';
        results.classList.remove("hidden");
        flightForm.querySelector('button[type="submit"]').disabled = true; // Disable submit
        // No return needed; stop execution by disabling form
    }
}

async function getWeatherData(airportCode) {
    try {
        const response = await fetch(`${apiBaseUrl}${airportCode}`, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Error fetching data for ${airportCode}: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Failed to fetch weather data: ${error.message}`);
        results.innerText = `Error: Unable to fetch weather data for ${airportCode}. ${error.message}`;
        return null;
    }
}

flightForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    results.innerText = "Loading weather data...";
    results.classList.remove("hidden");
    const deptWeather = await getWeatherData(deptApt.value);
    let output = "";
    console.log(deptWeather);
    if (deptWeather) {
        output += `${deptWeather.station} is currently ${deptWeather.flight_rules}\n` +
                  `METAR: ${deptWeather.raw}`;
    }
    if (arrApt.value) {
        const arrWeather = await getWeatherData(arrApt.value);
        if (arrWeather) {
            output += `\n\n${arrWeather.station} is currently ${arrWeather.flight_rules}` +
                      `\nMETAR: ${arrWeather.raw}`;
                      
        }
    }
    results.innerText = output || "No weather data available.";

});

clearBtn.addEventListener("click", () => {
    if (deptApt) deptApt.value = "";
    if (arrApt) arrApt.value = "";
    results.innerText = "";
    results.classList.add("hidden");
});