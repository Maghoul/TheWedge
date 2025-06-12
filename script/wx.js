const deptApt = document.getElementById("departure-airport");
const arrApt = document.getElementById("arrival-airport");
const flightForm = document.getElementById("form");
const etd = document.getElementById("etd");
const etdError = document.getElementById("etd-error");
const etaError = document.getElementById("eta-error");
const deptError = document.getElementById("dept-error");
const arrError = document.getElementById("arr-error");
const eta = document.getElementById("eta");
const submitBtn = flightForm.querySelector('button[type="submit"]');
const results = document.getElementById("results");
const favorite = document.getElementById("favorite");
const swapBtn = document.getElementById("swap-btn");
const clearBtn = document.getElementById("clear-btn");
const tokenForm = document.getElementById("token-form");
const tokenInput = document.getElementById("token-input");
const saveTokenBtn = document.getElementById("save-token");
const tokenError = document.getElementById("token-error");
const apiBaseMetar = "https://avwx.rest/api/metar/";
const apiBaseTaf = "https://avwx.rest/api/taf/";

let etdDate, etaDate;

// Initialize API token
let apiToken = `BDE7HzwQLhJYWBIGURMLGSJaWxEEPU07AhcEKUVbIAUBAhgfGBpZODYsLQ==`;

//set dynamic placeholders ETA and ETD
let etdPlaceholder = new Date();
let etaPlaceholder = new Date(etdPlaceholder.getTime());
etdPlaceholder.setUTCHours(etdPlaceholder.getUTCHours() + 1); // Adjust to UTC+1 for one hour from now
etaPlaceholder.setUTCHours(etaPlaceholder.getUTCHours() + 4); // Adjust to UTC+2 for four hours from now
etdPlaceholder = etdPlaceholder.toISOString().slice(11, 16);
etaPlaceholder = etaPlaceholder.toISOString().slice(11, 16);
etd.placeholder = `e.g., ${etdPlaceholder}`; 
eta.placeholder = `e.g., ${etaPlaceholder}`;

// Add Departure and Arrival Airport placeholders
if (localStorage.getItem('deptAirport')) {
    deptApt.value = localStorage.getItem('deptAirport');
} else if (localStorage.getItem('favoriteAirport')) {
    deptApt.value = localStorage.getItem('favoriteAirport');
} else {
    deptApt.value = "KMEM";
}

// localStorage.getItem('deptAirport') ? deptApt.value = localStorage.getItem('deptAirport') : deptApt.value = "KMEM";
localStorage.getItem('arrAirport') ? arrApt.value = localStorage.getItem('arrAirport') : arrApt.placeholder = "e.g., KIND";

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

// Generalized validation function
function validateInput(input, errorElement, validateFn, dateVar = null) {
  const result = validateFn(input.value.trim());
  if (result.error) {
    errorElement.textContent = result.error;
    errorElement.style.display = "block";
    input.classList.add("error");
  } else {
    errorElement.style.display = "none";
    input.classList.remove("error");
    input.value = result.value || ""; // Use validated value or empty string
    if (dateVar && input.value) {
      if (dateVar === "etdDate") {
        etdDate = convertToISODate(new Date(), input.value.replace(":", ""));
        // console.log("etdDate set to:", etdDate);
      } else if (dateVar === "etaDate") {
        etaDate = convertToISODate(new Date(), input.value.replace(":", ""));
        // console.log("etaDate set to:", etaDate);
      }
    } else if (dateVar) {
      if (dateVar === "etdDate") {
        etdDate = null;
        // console.log("etdDate reset to null");
      } else if (dateVar === "etaDate") {
        etaDate = null;
        // console.log("etaDate reset to null");
      }
    }
  }
}

// Add event listeners for time and ICAO inputs
etd.addEventListener("change", () => validateInput(etd, etdError, formatTime, "etdDate"));
eta.addEventListener("change", () => validateInput(eta, etaError, formatTime, "etaDate"));
deptApt.addEventListener("change", () => validateInput(deptApt, deptError, isValidIcao));
arrApt.addEventListener("change", () => validateInput(arrApt, arrError, isValidIcao));

// put token in correct form
   apiToken = xorDecrypt(atob(apiToken), 'huh');

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

function formatTime(input) {
  if (!input) return { value: input, error: null }; // Return empty input with no error

  // Define final formats: HH:MM, H:MM, HHMM, HMM
  const timeFormat = /^((\d{1,2}:\d{2})|(\d{4}))$/;
  // Allow partial inputs during typing
  const intermediateFormat = /^(\d{1,2}(:\d{0,2})?|\d{1,3})?$/;

  // If the input doesn't match the final format, check if it's a valid intermediate state
  if (!timeFormat.test(input)) {
    if (intermediateFormat.test(input)) {
      return { value: input, error: null }; // Allow partial input while typing
    }
    return { value: null, error: "Invalid time format (e.g., 1234, 12:34, 234, 2:34)" };
  }

  // Extract digits (remove colons if present)
  let digits = input.replace(/\D/g, "");

  // Pad with leading zeros if needed (e.g., "234" → "0234")
  digits = digits.padStart(4, "0");

  // Extract hours and minutes
  let hours = parseInt(digits.slice(0, 2), 10);
  let minutes = parseInt(digits.slice(2, 4), 10);

  // Clamp values
  hours = Math.min(Math.max(hours, 0), 23);
  minutes = Math.min(Math.max(minutes, 0), 59);

  // Format as HH:mm
  const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  return { value: formattedTime, error: null };
}

// Real-time validation for time inputs
function validateTimeInput(inputElement, errorElement) {
  const result = formatTime(inputElement.value);
  if (result.error) {
    errorElement.textContent = result.error;
    errorElement.style.display = "block";
    inputElement.classList.add("error");
  } else {
    errorElement.style.display = "none";
    inputElement.classList.remove("error");
  }
}

etd.addEventListener("input", () => validateTimeInput(etd, etdError));
eta.addEventListener("input", () => validateTimeInput(eta, etaError));

validateTimeInput(etd, etdError); // Initial validation
validateTimeInput(eta, etaError); // Initial validation

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

function isValidIcao(code) {
  if (!code) return { value: code, error: null }; // Return empty input with no error

  // Convert to uppercase immediately for consistent validation
  const normalizedCode = code.trim().toUpperCase();

  // Check if the code is exactly 4 uppercase letters
  if (!/^[A-Z]{4}$/.test(normalizedCode)) {
    return { value: null, error: `Invalid ICAO code "${code}". Use 4 letters (e.g., KMEM).` };
  }

  return { value: normalizedCode, error: null }; // Return valid ICAO code
}
  
async function getWeatherData(airportCode, type = 'metar') {
  if (!apiToken) {
    return { error: 'AVWX API token missing.' };
  }
  
 
  const icaoResult = isValidIcao(airportCode);
  if (icaoResult.error) {
    return { error: icaoResult.error };
  }

  try {
    const baseUrl = type === 'metar' ? apiBaseMetar : apiBaseTaf;
    const response = await fetch(`${baseUrl}${icaoResult.value}?options=info`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('avwxToken');
        flightForm.querySelector('button[type="submit"]').disabled = true;
        return { error: 'Invalid AVWX token. Please reload and enter a new token.' };
      } else if (response.status === 404) {
        // Handle case where TAF data is not available
        return { error: `No ${type.toUpperCase()} data available for ${icaoResult.value}.` };
      } else {
        throw new Error(response.statusText);
      }
    }

    // Read the response as text first to check if it's empty
    const text = await response.text();
    if (!text) {
      // Handle empty response (no TAF data)
      return { error: `No ${type.toUpperCase()} data available for ${icaoResult.value}.` };
    }

    // Try to parse the text as JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (jsonError) {
      // Handle invalid JSON response
      return { error: `Invalid ${type.toUpperCase()} data format for ${icaoResult.value}.` };
    }

    if (data.Error) {
      return { error: `${data.Error} for ${icaoResult.value}.` };
    }

    return { data }; // Return the data if successful
  } catch (error) {
    console.error(`Failed to fetch ${type} data: ${error.message} `);
    return { error: `Unable to fetch ${type.toUpperCase()} data for ${icaoResult.value}. ${error.message} ` };
  }
}

function validateForm() {
  let errors = [];

  // Validate deptApt (required)
  const deptAptValue = deptApt.value.trim().toUpperCase();
  if (!deptAptValue) {
    errors.push("Departure Airport is required.");
  } else {
    const deptIcaoResult = isValidIcao(deptAptValue);
    if (deptIcaoResult.error) {
      errors.push(deptIcaoResult.error);
    }
  }

  // Validate arrApt (optional)
  const arrAptValue = arrApt.value.trim().toUpperCase();
  if (arrAptValue) {
    const arrIcaoResult = isValidIcao(arrAptValue);
    if (arrIcaoResult.error) {
      errors.push(arrIcaoResult.error);
    }
  }

  // Validate etd (optional)
  const etdResult = formatTime(etd.value);
  if (etd.value && etdResult.error) {
    errors.push(`Invalid Departure Time: ${etdResult.error}`);
  }

  // Validate eta (optional)
  const etaResult = formatTime(eta.value);
  if (eta.value && etaResult.error) {
    errors.push(`Invalid Arrival Time: ${etaResult.error}`);
  }

  // If there are errors, display them and return false
  if (errors.length > 0) {
    results.innerHTML = `<p class="weather-report">${errors.join("</p><p class='weather-report'>")}</p>`;
    results.classList.remove("hidden");
    results.classList.add("error");
    return false;
  }

  return true; // Form is valid
}

function appendBackButton() {
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
}

function xorDecrypt(ciphertext, key) {
  let plaintext = '';
  for (let i = 0; i < ciphertext.length; i++) {
    const keyChar = key.charCodeAt(i % key.length);
    const cipherChar = ciphertext.charCodeAt(i);
    plaintext += String.fromCharCode(cipherChar ^ keyChar);
  }
  return plaintext;
}

function colorFlightRules(flightRules) {
  switch (flightRules) {
    case 'VFR':
      return '<span style="color: lightgreen;">VFR</span>';
    case 'MVFR':
      return '<span style="color: yellow;">MVFR</span>';
    case 'IFR':
      return '<span style="color: orange;">IFR</span>';
    case 'LIFR':
      return '<span style="color: red;">LIFR</span>';
    case 'N/A':
      return '<span style="color: var(--primary-color);">N/A</span>'; // Use gray for N/A
    default:
      return '<span style="color: var(--primary-color);"></span>'; // Default color for unknown flight rules
  }
}

function generateWeatherOutput(airportCode, type, timeStr, timeDate) {
  let output = "";
  let timeInfo = "";
  let timeAge = "";
  let tafWarning = "";

  // Log timeDate for debugging
  // console.log(`generateWeatherOutput for ${type}: timeDate =`, timeDate);

  // Fetch weather data
  const metarResult = getWeatherData(airportCode, 'metar');
  const tafResult = getWeatherData(airportCode, 'taf');
  const location = type === 'ETD' ? 'departure' : 'arrival';
  
  return Promise.all([metarResult, tafResult]).then(([metarResult, tafResult]) => {
    let metar = null, taf = null;

    // Extract data or handle errors
    if (metarResult.data) {
      metar = metarResult.data;
    } else if (metarResult.error) {
      output += `<p class="weather-report error">${metarResult.error}</p>`;
    }

    if (tafResult.data) {
      taf = tafResult.data;
    } else if (tafResult.error) {
      tafWarning = `<p class="weather-report error">${tafResult.error}</p>`;
    }

    console.log("METAR: ", metar);
    console.log("TAF: ", taf);
    
    const metarAge = metar ? Math.floor((new Date() - new Date(metar.time.dt)) / 60000) : null;
    const tafAge = taf ? Math.floor((new Date() - new Date(taf.end_time.dt)) / 60000) : null;
    const flightRules = metar ? colorFlightRules(metar.flight_rules || 'N/A') : (taf ? colorFlightRules(taf.flight_rules || 'N/A') : 'N/A');

    const station = metar ? metar.station : (taf ? taf.station : airportCode);
    const city = metar ? metar.info.city : airportCode;

    // Handle time-specific forecast (ETD or ETA)
    let alternateReq = "";
    if (timeDate && taf && Array.isArray(taf.forecast)) {
      const parsedTimeDate = new Date(timeDate);
      let matchingForecastIndex = -1;
      if (!isNaN(parsedTimeDate)) { // Ensure valid date
        for (let i = 0; i < taf.forecast.length; i++) {
          const forecast = taf.forecast[i].flight_rules || 'N/A';
          const startTime = new Date(taf.forecast[i].type === 'BECMG' ? taf.forecast[i].transition_start.dt : taf.forecast[i].start_time.dt);
          const endTime = new Date(taf.forecast[i].end_time.dt);
          // console.log(`Forecast ${i} for ${type}:`, { parsedTimeDate, startTime, endTime, inRange: parsedTimeDate >= startTime && parsedTimeDate <= endTime });
          if (parsedTimeDate >= startTime && parsedTimeDate <= endTime) {
            timeInfo = ` and forecasted as ${colorFlightRules(forecast)} at ${location} time ${timeStr}Z.`;
            matchingForecastIndex = i;
            break; // Exit loop after finding the first match
          }
        }
      } else {
        console.warn(`Invalid timeDate for ${type}:`, timeDate);
      }

      // Check for alternate airport requirement
      if (matchingForecastIndex >= 0 && taf.forecast.length > 1 && !isNaN(parsedTimeDate)) {
        try {
          let timeMinusOne = new Date(parsedTimeDate);
          let timePlusOne = new Date(parsedTimeDate);
          timeMinusOne.setUTCHours(timeMinusOne.getUTCHours() - 1);
          timePlusOne.setUTCHours(timePlusOne.getUTCHours() + 1);
          const altWx = [taf.forecast[matchingForecastIndex].flight_rules];

          if (matchingForecastIndex > 0 && timeMinusOne >= new Date(taf.forecast[matchingForecastIndex - 1].start_time.dt) &&
            timeMinusOne <= new Date(taf.forecast[matchingForecastIndex - 1].end_time.dt)) {
            altWx.push(taf.forecast[matchingForecastIndex - 1].flight_rules);
          }
          if (matchingForecastIndex < taf.forecast.length - 1 &&
              timePlusOne >= new Date(taf.forecast[matchingForecastIndex + 1].start_time.dt) &&
              timePlusOne <= new Date(taf.forecast[matchingForecastIndex + 1].end_time.dt)) {
            altWx.push(taf.forecast[matchingForecastIndex + 1].flight_rules);
          }
          if (altWx.some(wx => wx === 'IFR' || wx === 'LIFR')) {
            alternateReq = `Note: Alternate airport required for IFR +/- 1 hour.`;
          }
        } catch (error) {
          console.error(`Error in alternate airport check for ${type}:`, error.message);
          alternateReq = `Note: Unable to check alternate requirements due to invalid ${type} time.`;
        }
      }
      // Fallback if no forecast match
      if (!timeInfo && timeStr) {
        timeInfo = `; no specific TAF forecast available for ${location} time ${timeStr}Z.`;
      }
    }

    // Add METAR and TAF age notes
    if (metarAge !== null) {
      timeAge = `<span class="weather-report" style="color: ${metarAge > 60 ? 'yellow' : 'lightgreen'};">[-- ${metarAge} minutes old --]</span>`;
    }
    if (tafAge !== null && tafAge > 60) {
      timeInfo += `<p class="weather-report" style="color: red;">Note: ${station} TAF expired ${tafAge} minutes ago.</p>`;
    }

    // Build output based on available data
    if (metar && taf) {
      output += `<p class="weather-report">${city} is currently ${flightRules}${timeInfo}</p>` +
                `<p class="weather-report" style="color: red;">${alternateReq}</p>` +
                `<p class="weather-report">METAR: ${metar.raw} ${timeAge}</p>` +
                `<p class="weather-report">TAF: ${station} ${taf.time.repr} ${taf.forecast[0]?.raw || 'N/A'}</p>`;
      if (Array.isArray(taf.forecast)) {
        for (let i = 1; i < taf.forecast.length; i++) {
          // console.log(`Rendering forecast ${i}:`, taf.forecast[i].raw);
          output += `<p class="weather-report indented-forecast">${taf.forecast[i].raw || 'N/A'}</p>`;
        }
      }
    } else if (metar) {
      output += `<p class="weather-report">${city} is currently ${flightRules}${timeInfo}</p>` +
                `<p class="weather-report">METAR: ${metar.raw} ${timeAge}</p>`;
    } else if (taf) {
      output += `<p class="weather-report">${city} is currently ${flightRules}${timeInfo}</p>` +
                `<p class="weather-report" style="color: red;">${alternateReq}</p>` +
                `<p class="weather-report">TAF: ${station} ${taf.time.repr} ${taf.forecast[0]?.raw || 'N/A'}</p>`;
      if (Array.isArray(taf.forecast)) {
        for (let i = 1; i < taf.forecast.length; i++) {
          // console.log(`Rendering forecast ${i}:`, taf.forecast[i].raw);
          output += `<p class="weather-report indented-forecast">${taf.forecast[i].raw || 'N/A'}</p>`;
        }
      }
    } else {
      output += `<p class="weather-report">No weather data found for ${airportCode}.</p>`;
    }

    // Append TAF warning if it exists
    if (tafWarning) {
      output += tafWarning;
    }

    return output;
  });
}

flightForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Ensure internet connection
  if (!navigator.onLine) {
    results.innerText = "Please connect to the internet for weather information."
    flightForm.classList.add("hidden");
    results.classList.remove("hidden");
    appendBackButton();
    return;
  }

  // Validate all fields
  if (!validateForm()) {
    flightForm.classList.add("hidden");
    results.classList.remove("hidden");
    appendBackButton();
    return;
  }

  flightForm.classList.add("hidden");
  results.innerHTML = "Loading weather data...";
  results.classList.remove("hidden");
  results.classList.remove("error");

  // Sanitize inputs
  const deptCode = deptApt.value.trim().toUpperCase();
  const arrCode = arrApt.value.trim().toUpperCase();

  if (favorite.checked) {
    localStorage.setItem('favoriteAirport', deptCode);
    favorite.checked = false;
  }

  localStorage.setItem('deptAirport', deptCode);
  localStorage.setItem('arrAirport', arrCode);

  // Fetch and display weather data

  let output = await generateWeatherOutput(deptCode, 'ETD', etd.value, etdDate);

  if (arrCode) {
    output += `<hr>`;
    output += await generateWeatherOutput(arrCode, 'ETA', eta.value, etaDate);
  }

  if (output) {
    results.innerHTML = output;
  }

  appendBackButton();
});

const backBtn = document.getElementById("back-btn");

clearBtn.addEventListener("click", () => {
  // Reset the form
  flightForm.reset(); 

  // Reset dynamic placeholders for ETD and ETA
  let etdPlaceholder = new Date();
  let etaPlaceholder = new Date(etdPlaceholder.getTime());
  etdPlaceholder.setUTCHours(etdPlaceholder.getUTCHours() + 1);
  etaPlaceholder.setUTCHours(etaPlaceholder.getUTCHours() + 4);
  etdPlaceholder = etdPlaceholder.toISOString().slice(11, 16);
  etaPlaceholder = etaPlaceholder.toISOString().slice(11, 16);

  if (localStorage.getItem('favoriteAirport')) {
      deptApt.value = localStorage.getItem('favoriteAirport');
  } else {
      deptApt.value = "";
  }

  deptApt.placeholder = "e.g., KMEM";
  arrApt.placeholder = "e.g., KIND";
  etd.placeholder = `e.g., ${etdPlaceholder}`;
  eta.placeholder = `e.g., ${etaPlaceholder}`;
  localStorage.removeItem('deptAirport'); // Clear stored departure airport
  localStorage.removeItem('arrAirport'); // Clear stored arrival airport

  // Reset validation UI for time inputs
  [etdError, etaError].forEach(error => {
    error.style.display = "none";
  });
  [etd, eta].forEach(input => {
    input.classList.remove("error");
  });

  // Reset etdDate and etaDate
  etdDate = null;
  etaDate = null;

  // Hide results
  results.innerText = "";
  results.classList.add("hidden");
  results.classList.remove("error");
});

swapBtn.addEventListener("click", () => {
  // Swap values of departure and arrival airports
  const temp = deptApt.value;
  deptApt.value = arrApt.value;
  arrApt.value = temp;

  // Reset validation UI
  [deptError, arrError].forEach(error => {
    error.style.display = "none";
  });
  [deptApt, arrApt].forEach(input => {
    input.classList.remove("error");
  });

  // Reset etdDate and etaDate
  etdDate = null;
  etaDate = null;

  // Clear results
  results.innerText = "";
});