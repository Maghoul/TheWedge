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
const clearBtn = document.getElementById("clear-btn");
const tokenForm = document.getElementById("token-form");
const tokenInput = document.getElementById("token-input");
const saveTokenBtn = document.getElementById("save-token");
const tokenError = document.getElementById("token-error");
const apiBaseMetar = "https://avwx.rest/api/metar/";
const apiBaseTaf = "https://avwx.rest/api/taf/";

let etdDate;
let etaDate;

// Initialize API token
let apiToken = localStorage.getItem('avwxToken');
if (!apiToken) {
    tokenForm.classList.remove("hidden");
    flightForm.classList.add("hidden");
} else {
    tokenForm.classList.add("hidden");
    flightForm.classList.remove("hidden");
}

// Handle token save
saveTokenBtn.addEventListener("click", async () => {
    const token = tokenInput.value.trim();
    if (!token) {
        tokenError.textContent = "Please enter a valid AVWX API token.";
        tokenError.classList.remove("hidden");
        tokenError.style.display = "block";
        return;
    }

    // Test token validity with a sample API call
    try {
        const response = await fetch(`${apiBaseMetar}KMEM`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error("Invalid token. Please check your AVWX token.");
            } else if (response.status === 429) {
                throw new Error("API rate limit exceeded. Try again later.");
            } else {
                throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            }
        }
        const data = await response.json();
        if (data.Error) {
            throw new Error(data.Error);
        }
        // Save token to localStorage and update apiToken
        localStorage.setItem('avwxToken', token);
        apiToken = token; // Update apiToken for current session
        tokenForm.classList.add("hidden");
        flightForm.classList.remove("hidden");
        tokenError.classList.add("hidden");
        tokenError.style.display = "none"; // Reset error display
        tokenInput.value = "";
    } catch (error) {
        tokenError.textContent = `Error: ${error.message}`;
        tokenError.classList.remove("hidden");
        tokenError.style.display = "block"; // Ensure error is visible
    }
});

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

// Check time formats on eta and etd
etd.addEventListener("change", () => {
  const result = formatTime(etd.value);
  if (result.error) {
    etdError.textContent = result.error;
    etdError.style.display = "block";
    etd.classList.add("error");
  } else {
    etdError.style.display = "none";
    etd.classList.remove("error");
    etd.value = result.value || ""; // Use the formatted value, or empty if null
    if (etd.value) {
      etdDate = convertToISODate(new Date(), etd.value.replace(":", ""));
    } else {
      etdDate = null; // Reset etdDate if the input is invalid or empty
    }
  }
});

eta.addEventListener("change", () => {
  const result = formatTime(eta.value);
  if (result.error) {
    etaError.textContent = result.error;
    etaError.style.display = "block";
    eta.classList.add("error");
  } else {
    etaError.style.display = "none";
    eta.classList.remove("error");
    eta.value = result.value || ""; // Use the formatted value, or empty if null
    if (eta.value) {
      etaDate = convertToISODate(new Date(), eta.value.replace(":", ""));
    } else {
      etaDate = null; // Reset etaDate if the input is invalid or empty
    }
  }
});

// Check ICAO format on deptApt and arrApt
deptApt.addEventListener("change", () => {
  const result = isValidIcao(deptApt.value.trim());
  if (result.error) {
    deptError.textContent = result.error;
    deptError.style.display = "block";
    deptApt.classList.add("error");
  } else {
    deptError.style.display = "none";
    deptApt.classList.remove("error");
    deptApt.value = result.value || ""; // Use the normalized ICAO code, or empty if null
  }
});

arrApt.addEventListener("change", () => {
  const result = isValidIcao(arrApt.value.trim());
  if (result.error) {
    arrError.textContent = result.error;
    arrError.style.display = "block";
    arrApt.classList.add("error");
  } else {
    arrError.style.display = "none";
    arrApt.classList.remove("error");
    arrApt.value = result.value || ""; // Use the normalized ICAO code, or empty if null
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

// function updateSubmitButtonState() {
//   // Enable the submit button as long as deptApt has a value
//   const deptAptFilled = deptApt.value.trim() !== "";
//   submitBtn.disabled = !deptAptFilled;
// }

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

function validateTimeInput(inputElement, errorElement) {
  const result = formatTime(inputElement.value);
  if (result.error) {
    errorElement.textContent = result.error;
    errorElement.style.display = "block";
    inputElement.classList.add("error");
  } else {
    errorElement.style.display = "none";
    inputElement.classList.remove("error");
    // Don't auto-format during input event; let the change event handle it
  }
  // updateSubmitButtonState();
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

// Update submit button state when deptApt changes
// deptApt.addEventListener("input", () => {
//   updateSubmitButtonState();
// });

validateTimeInput(etd, etdError); // Initial validation
validateTimeInput(eta, etaError); // Initial validation

// Update submit button state on page load
// updateSubmitButtonState();

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
// function isValidIcao(code) {
//     return /^[A-Z]{4}$/.test(code);
// }

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
    results.innerText = 'Error: AVWX API token missing.';
    results.classList.remove("hidden");
    return null;
  }

  const icaoResult = isValidIcao(airportCode);
  if (icaoResult.error) {
    results.innerText = icaoResult.error;
    results.classList.remove("hidden");
    return null;
  }

  try {
    const baseUrl = type === 'metar' ? apiBaseMetar : apiBaseTaf;
    const response = await fetch(`${baseUrl}${icaoResult.value}`, {
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
      results.innerText = `Error: ${data.Error} for ${icaoResult.value}.`;
      results.classList.remove("hidden");
      return null;
    }
    return data;
  } catch (error) {
    console.error(`Failed to fetch ${type} data: ${error.message}`);
    results.innerText = `Error: Unable to fetch ${type} data for ${icaoResult.value}. ${error.message}`;
    results.classList.remove("hidden");
    return null;
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

flightForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validate all fields
  if (!validateForm()) {
    flightForm.classList.add("hidden");
    results.classList.remove("hidden");
    appendBackButton();
    return; // Stop submission if validation fails
  }

  flightForm.classList.add("hidden");
  results.innerText = "";
  results.innerText = "Loading weather data...";
  results.classList.remove("hidden");

  // Sanitize inputs
  const deptCode = deptApt.value.trim().toUpperCase();
  const arrCode = arrApt.value.trim().toUpperCase();

  let output = "";
  let strEtdInfo = "";
  let strEtaInfo = "";

  // Fetch departure weather
  const deptMetar = await getWeatherData(deptCode, 'metar');
  const deptTaf = await getWeatherData(deptCode, 'taf');
  const deptMetarAge = deptMetar ? Math.floor((new Date() - new Date(deptMetar.time.dt)) / 60000) : null; // Age in minutes
  const deptTafAge = deptTaf ? Math.floor((new Date() - new Date(deptTaf.end_time.dt)) / 60000) : null; // Age in minutes
  console.log(`METAR Age: ${deptMetarAge} minutes, TAF Age: ${deptTafAge} minutes`); // Debugging log

  // Log deptMetar and deptTaf to console for debugging
  console.dir(deptMetar);
  console.dir(deptTaf);

  // Determine the station code for departure airport
  const deptStation = deptMetar ? deptMetar.station : (deptTaf ? deptTaf.station : deptCode);

  // Handle ETD forecast if available
  if (etdDate && deptTaf) {
    for (let i = 0; i < (deptTaf?.forecast?.length || 0); i++) {
      const forecast = deptTaf.forecast[i].flight_rules || 'N/A';
      const startTime = deptTaf.forecast[i].start_time.dt || 'N/A';
      const endTime = deptTaf.forecast[i].end_time.dt || 'N/A';

      if (etdDate >= startTime && etdDate <= endTime) {
        strEtdInfo = ` and forecasted as ${forecast} at departure time ${etd.value}Z.`;
      }
    }
  }

  // Add METAR and TAF age notes for departure
  if (deptMetarAge !== null) {
    if (deptMetarAge > 60) {
      strEtdInfo += `<p class="weather-report" style="color: yellow;">Note: ${deptStation} METAR is ${deptMetarAge} minutes old.</p>`;
    } else {
      strEtdInfo += `<p class="weather-report">Note: ${deptStation} METAR is ${deptMetarAge} minutes old.</p>`;
    }
  }
  if (deptTafAge !== null && deptTafAge > 60) {
    strEtdInfo += `<p class="weather-report" style="color: yellow;">Note: ${deptStation} TAF expired ${deptTafAge} minutes ago.</p>`;
  }

  if (deptMetar && deptTaf) {
    output += `<p class="weather-report">${deptStation} is currently ${deptMetar.flight_rules || 'N/A'}${strEtdInfo}</p>` +
              `<p class="weather-report">METAR: ${deptMetar.raw}</p>` +
              `<p class="weather-report">TAF: ${deptStation} ${deptTaf.time.repr} ${deptTaf.forecast[0].raw || 'N/A'}</p>`;
    for (let i = 1; i < deptTaf.forecast.length; i++) {
      const forecast = deptTaf.forecast[i].raw || 'N/A';
      output += `<p class="weather-report indented-forecast">${forecast}</p>`;
    }
  }
  if (deptMetar && !deptTaf) {
    output += `<p class="weather-report">${deptStation} is currently ${deptMetar.flight_rules || 'N/A'}${strEtdInfo}</p>` +
              `<p class="weather-report">METAR: ${deptMetar.raw}</p>`;
  }
  if (deptTaf && !deptMetar) {
    output += `<p class="weather-report">${deptStation} is currently ${deptTaf.flight_rules || 'N/A'}${strEtdInfo}</p>` +
              `<p class="weather-report">TAF: ${deptStation} ${deptTaf.time.repr} ${deptTaf.forecast[0].raw || 'N/A'}</p>`;
    for (let i = 1; i < deptTaf.forecast.length; i++) {
      const forecast = deptTaf.forecast[i].raw || 'N/A';
      output += `<p class="weather-report indented-forecast">${forecast}</p>`;
    }
  }
  if (!deptMetar && !deptTaf) {
    output += `<p class="weather-report">No weather data found for ${deptCode}.</p>`;
    results.classList.add("error");
  }

  // Add horizontal rule if there’s arrival info to follow
  if (arrCode) {
    output += `<hr>`;
  }

  // Fetch arrival weather if provided
  if (arrCode) {
    const arrMetar = await getWeatherData(arrCode, 'metar');
    const arrTaf = await getWeatherData(arrCode, 'taf');
    const arrMetarAge = arrMetar ? Math.floor((new Date() - new Date(arrMetar.time.dt)) / 60000) : null; // Age in minutes
    const arrTafAge = arrTaf ? Math.floor((new Date() - new Date(arrTaf.end_time.dt)) / 60000) : null; // Age in minutes
    console.dir(arrTaf);

    // Determine the station code for arrival airport
    const arrStation = arrMetar ? arrMetar.station : (arrTaf ? arrTaf.station : arrCode);

    // Handle ETA forecast if available

    let intTaf = 0
    if (etaDate && arrTaf) {
      for (let i = 0; i < (arrTaf?.forecast?.length || 0); i++) {
        const forecast = arrTaf.forecast[i].flight_rules || 'N/A';
        const startTime = arrTaf.forecast[i].start_time.dt || 'N/A';
        const endTime = arrTaf.forecast[i].end_time.dt || 'N/A';
        if (etaDate >= startTime && etaDate <= endTime) {
          strEtaInfo = ` and forecasted as ${forecast} at arrival time ${eta.value}Z.`;
          intTaf = i; // Store the index of the matching forecast
        }
      }
    }

    // Check if alternate airport is required
    let strAlternateReq = "";
    if (intTaf >= 0 && intTaf < arrTaf.forecast.length && arrTaf.forecast.length > 1) {
      let etaMinusOne = new Date(etaDate);
      let etaPlusOne = new Date(etaDate);
      etaMinusOne.setUTCHours(etaMinusOne.getUTCHours() - 1); 
      etaMinusOne = etaMinusOne.toISOString(); 
      etaPlusOne.setUTCHours(etaPlusOne.getUTCHours() + 1); 
      etaPlusOne = etaPlusOne.toISOString();
      const altWx = []; 
      altWx.push(arrTaf.forecast[intTaf].flight_rules); // Add the current forecast

      if (intTaf > 0 && etaMinusOne >= arrTaf.forecast[intTaf - 1].start_time.dt && etaMinusOne <= arrTaf.forecast[intTaf - 1].end_time.dt) {
        console.log("ETA minus one hour true: forecast is ", arrTaf.forecast[intTaf - 1].flight_rules);
        altWx.push(arrTaf.forecast[intTaf - 1].flight_rules);
      }
      if (intTaf < arrTaf.forecast.length - 1 && etaPlusOne >= arrTaf.forecast[intTaf + 1].start_time.dt && etaPlusOne <= arrTaf.forecast[intTaf + 1].end_time.dt) {
        console.log("ETA plus one hour true: forecast is ", arrTaf.forecast[intTaf + 1].flight_rules);
        altWx.push(arrTaf.forecast[intTaf + 1].flight_rules);
      }
      console.log("altWx:", altWx);
      altWx.some(wx => {
        if (wx === 'IFR' || wx === 'LIFR') {
            strAlternateReq = `Note: Alternate airport required for IFR +/- 1 hour.`;
            return true; // Stops iteration
        }
        return false;
      });
    }
    console.log(strAlternateReq);

    // Add METAR and TAF age notes for arrival
    if (arrMetarAge !== null) {
      if (arrMetarAge > 60) {
        strEtaInfo += `<p class="weather-report" style="color: yellow;">Note: ${arrStation} METAR is ${arrMetarAge} minutes old.</p>`;
      } else {
        strEtaInfo += `<p class="weather-report">Note: ${arrStation} METAR is ${arrMetarAge} minutes old.</p>`;
      }
    }
    if (arrTafAge !== null && arrTafAge > 60) {
      strEtaInfo += `<p class="weather-report" style="color: yellow;">Note: ${arrStation} TAF expired ${arrTafAge} minutes ago.</p>`;
    }

    if (arrMetar && arrTaf) {
      output += `<p class="weather-report">${arrStation} is currently ${arrMetar.flight_rules || 'N/A'}${strEtaInfo}</p>` +
                `<p class="weather-report" style="color: red;">${strAlternateReq}</p>` +
                `<p class="weather-report">METAR: ${arrMetar.raw}</p>` +
                `<p class="weather-report">TAF: ${arrStation} ${arrTaf.time.repr} ${arrTaf.forecast[0].raw || 'N/A'}</p>`;
      for (let i = 1; i < arrTaf.forecast.length; i++) {
        const forecast = arrTaf.forecast[i].raw || 'N/A';
        output += `<p class="weather-report indented-forecast">${forecast}</p>`;
      }
    }
    if (arrMetar && !arrTaf) {
      output += `<p class="weather-report">${arrStation} is currently ${arrMetar.flight_rules || 'N/A'}${strEtaInfo}</p>` +
                `<p class="weather-report">METAR: ${arrMetar.raw}</p>`;
    }
    if (arrTaf && !arrMetar) {
      output += `<p class="weather-report">${arrStation} is currently ${arrTaf.flight_rules || 'N/A'}${strEtaInfo}</p>` +
                `<p class="weather-report" style="color: red;">${strAlternateReq}</p>` +
                `<p class="weather-report">TAF: ${arrStation} ${arrTaf.time.repr} ${arrTaf.forecast[0].raw || 'N/A'}</p>`;
      for (let i = 1; i < arrTaf.forecast.length; i++) {
        const forecast = arrTaf.forecast[i].raw || 'N/A';
        output += `<p class="weather-report indented-forecast">${forecast}</p>`;
      }
    }
    if (!arrMetar && !arrTaf) {
      output += `<p class="weather-report">No weather data found for ${arrCode}.</p>`;
      results.classList.add("error");
    }
  }

  if (output) {
    results.innerHTML = output; // Using <p> tags, so no need for replace
  }

  // Append back button
  appendBackButton();
});

const backBtn = document.getElementById("back-btn");

clearBtn.addEventListener("click", () => {
  // Reset the form
  flightForm.reset(); // Use flightForm instead of form

  // Reset dynamic placeholders for ETD and ETA
  let etdPlaceholder = new Date();
  let etaPlaceholder = new Date(etdPlaceholder.getTime());
  etdPlaceholder.setUTCHours(etdPlaceholder.getUTCHours() + 1);
  etaPlaceholder.setUTCHours(etaPlaceholder.getUTCHours() + 4);
  etdPlaceholder = etdPlaceholder.toISOString().slice(11, 16);
  etaPlaceholder = etaPlaceholder.toISOString().slice(11, 16);
  deptApt.value = "";
  deptApt.placeholder = "e.g., KMEM";
  arrApt.placeholder = "e.g., KIND";
  etd.placeholder = `e.g., ${etdPlaceholder}`;
  eta.placeholder = `e.g., ${etaPlaceholder}`;

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

  // Update submit button state
  // updateSubmitButtonState();
});