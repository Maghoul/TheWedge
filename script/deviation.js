// Copyright (c) 2025 Rick Griffin. All rights reserved.
"use strict";
const devForm = document.getElementById("form");
const displayMonth = document.getElementById("display-month")
const updateMonthInput = document.getElementById("update-month");
const schedBank = document.getElementById("sched-bank");
const expenses = document.getElementById("expenses");
const remaining = document.getElementById("remaining");
const dbaAvail = document.getElementById("dbaAvail");
const totalExp = document.getElementById("total-expense");
const hotelBank = document.getElementById("hotel-bank");
const applyHotel = document.getElementById("apply-hotel");
const devFwd = document.getElementById('dba-avail-next');
const hotelFwd = document.getElementById('hotel-bank-next')
const updateSchedBankBtn = document.getElementById("update-sched-bank");
const showExpensesBtn = document.getElementById("show-expenses");
const updateDevHotelBtn = document.getElementById("update-banks");
const results = document.getElementById("results"); 
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const monthRegex = /^\d{4}-\d{2}$/;
const now = new Date();

// Function to generate default bank entries for a month
function createDefaultBankEntries(month) { // e.g., "2025-06"
  const date = `${month}-01`;
  return {
    deviationBank: [{ date, amount: 0, amountXfer: 0 }],
    hotelBank: [{ date, amount: 0, spend: 0, earn: 0 }]
  };
}

const defaultData = {
  expenses: [],
  deviationBank: [],
  hotelBank: [],
  scheduledBank: [],
  metadata: { currentMonth: "Jul 2025", totalExpense: 0 }
};

//Initialize month for display
let initialMonth = now.getMonth() + 1;
initialMonth = initialMonth.toString().padStart(2, "0");
updateMonthInput.value = `${now.getFullYear()}-${initialMonth}`;

// Retrieve and validate data from local storage
let data;
try {
  const stored = localStorage.getItem("expenseReport_data");
  if (stored) {
    data = JSON.parse(stored);
  } else {
    // Get current and previous months
    const schedDates = getYearMonthDay();
    const currentMonth = schedDates.currMonth; // e.g., "2025-06"
    const prevMonth = schedDates.prevMonth; // e.g., "2025-05"
    
    // Create default entries for current and previous months
    const currentDefaults = createDefaultBankEntries(currentMonth);
    const prevDefaults = createDefaultBankEntries(prevMonth);
    
    data = {
      ...defaultData,
      deviationBank: [...prevDefaults.deviationBank, ...currentDefaults.deviationBank],
      hotelBank: [...prevDefaults.hotelBank, ...currentDefaults.hotelBank],
      metadata: { currentMonth: schedDates.mmmYYYY, totalExpense: 0 }
    };
  }

  let isValid = true;

  // Validate expenses
  if (!Array.isArray(data.expenses)) {
    console.warn("Expenses is not an array, resetting");
    data.expenses = defaultData.expenses;
    isValid = false;
  } else {
    const expenseIds = new Set();
    for (const expense of data.expenses) {
      if (
        typeof expense.id !== "number" ||
        expenseIds.has(expense.id) ||
        typeof expense.amount !== "number" || expense.amount < 0 || isNaN(expense.amount) || !isFinite(expense.amount) ||
        typeof expense.comment !== "string" ||
        !dateRegex.test(expense.date) || isNaN(new Date(expense.date).getTime()) ||
        new Date(expense.date).toISOString().slice(0, 10) !== expense.date ||
        typeof expense.slide !== "boolean" ||
        !monthRegex.test(expense.slideDate)
      ) {
        console.warn("Invalid expense, resetting expenses");
        data.expenses = defaultData.expenses;
        isValid = false;
        break;
      }
      expenseIds.add(expense.id);
    }
  }

  // Validate deviationBank
  if (!Array.isArray(data.deviationBank)) {
    console.warn("Deviation bank is not an array, resetting");
    data.deviationBank = defaultData.deviationBank;
    isValid = false;
  } else {
    const deviationDates = new Set();
    for (const entry of data.deviationBank) {
      if (
        !dateRegex.test(entry.date) || deviationDates.has(entry.date) ||
        typeof entry.amount !== "number" || isNaN(entry.amount) || !isFinite(entry.amount) ||
        typeof entry.amountXfer !== "number" || isNaN(entry.amountXfer) || !isFinite(entry.amountXfer)
      ) {
        console.warn("Invalid deviation bank entry, resetting deviationBank");
        data.deviationBank = defaultData.deviationBank;
        isValid = false;
        break;
      }
      deviationDates.add(entry.date);
    }
  }

  // Validate hotelBank
  if (!Array.isArray(data.hotelBank)) {
    console.warn("Hotel bank is not an array, resetting");
    data.hotelBank = defaultData.hotelBank;
    isValid = false;
  } else {
    const hotelDates = new Set();
    for (const entry of data.hotelBank) {
      if (
        !dateRegex.test(entry.date) || hotelDates.has(entry.date) ||
        typeof entry.amount !== "number" || isNaN(entry.amount) || !isFinite(entry.amount) ||
        typeof entry.spend !== "number" || isNaN(entry.spend) || !isFinite(entry.spend) ||
        typeof entry.earn !== "number" || isNaN(entry.earn) || !isFinite(entry.earn)
      ) {
        console.warn("Invalid hotel bank entry, resetting hotelBank");
        data.hotelBank = defaultData.hotelBank;
        isValid = false;
        break;
      }
      hotelDates.add(entry.date);
    }
  }

  // Validate scheduledBank
  if (!Array.isArray(data.scheduledBank)) {
    console.warn("Scheduled bank is not an array, resetting");
    data.scheduledBank = defaultData.scheduledBank;
    isValid = false;
  } else {
    const schedBankIds = new Set();
    for (const entry of data.scheduledBank) {
      if (
        typeof entry.id !== "number" ||
        schedBankIds.has(entry.id) ||
        typeof entry.amount !== "number" || entry.amount < 0 || isNaN(entry.amount) || !isFinite(entry.amount) ||
        !dateRegex.test(entry.date) || isNaN(new Date(entry.date).getTime()) ||
        new Date(entry.date).toISOString().slice(0, 10) !== entry.date
      ) {
        console.warn("Invalid scheduled bank entry, resetting scheduledBank");
        data.scheduledBank = defaultData.scheduledBank;
        isValid = false;
        break;
      }
      schedBankIds.add(entry.id);
    }
  }

  // Validate metadata
  if (
    data.metadata == null ||
    typeof data.metadata !== "object" ||
    typeof data.metadata.currentMonth !== "string" ||
    typeof data.metadata.totalExpense !== "number" || isNaN(data.metadata.totalExpense) || !isFinite(data.metadata.totalExpense)
  ) {
    console.warn("Metadata is not a valid object, resetting");
    data.metadata = defaultData.metadata;
    isValid = false;
  }

  if (!isValid) {
    console.warn("Some data sections were invalid and reset to defaults");
    results.textContent = "Some data was reset due to errors";
    results.classList.add("error");
  }

  // Save default data if new
  if (!stored) {
    saveData();
  }

  console.log("Data after validation:", data);
} catch (e) {
  console.error("Parse error:", e);
  const schedDates = getYearMonthDay();
  const currentMonth = schedDates.currMonth;
  const prevMonth = schedDates.prevMonth;
  const currentDefaults = createDefaultBankEntries(currentMonth);
  const prevDefaults = createDefaultBankEntries(prevMonth);
  data = {
    ...defaultData,
    deviationBank: [...prevDefaults.deviationBank, ...currentDefaults.deviationBank],
    hotelBank: [...prevDefaults.hotelBank, ...currentDefaults.hotelBank],
    metadata: { currentMonth: schedDates.mmmYYYY, totalExpense: 0 }
  };
  saveData();
}
// Get the appropriate spending for a particular month
function getAmount(compareMonth, arrCompare) {
  let totalizer = 0;
  const hasSlideDate = arrCompare.some(item => 'slideDate' in item);
  for (let i = 0; i < arrCompare.length; i++) {
    if (hasSlideDate) {
      const sliderDate = arrCompare[i].slideDate;
      if (sliderDate === compareMonth) {
        totalizer += arrCompare[i].amount;
      }
    } else {
      const compareDate = arrCompare[i].date.slice(0, 7);
      if (compareDate === compareMonth) {
        totalizer += arrCompare[i].amount;
      }
    }
  }
  return totalizer;
}

// Round a Number to 2 digits
function twoDigits (num) {
  return Math.round(num * 100) / 100  // rounds a Number to two digits
}

function updateUI() {
  try {
    const schedDates = getYearMonthDay();
    const currentMonth = schedDates.currMonth; // e.g., "2022-06"
    const prevMonth = schedDates.prevMonth; // e.g., "2022-05"
    const nextMonth = schedDates.nextMonth; // e.g., "2022-07"

    // Validate schedDates
    if (
      !dateRegex.test(schedDates.currMonthDay) ||
      !dateRegex.test(schedDates.prevMonthDay) ||
      !dateRegex.test(schedDates.nextMonthDay)
    ) {
      console.error('Invalid schedDates:', schedDates);
      results.innerText = "Invalid month selected";
      results.classList.add("error");
      return;
    }

    // Ensure valid entries exist for prev, curr, and nextMonth
    let dbaPrevMonthEntry = data.deviationBank.find(entry => entry.date === schedDates.prevMonthDay);
    let dbaCurrMonthEntry = data.deviationBank.find(entry => entry.date === schedDates.currMonthDay);
    let dbaNextMonthEntry = data.deviationBank.find(entry => entry.date === schedDates.nextMonthDay);
    let hotelPrevMonthEntry = data.hotelBank.find(entry => entry.date === schedDates.prevMonthDay);
    let hotelCurrMonthEntry = data.hotelBank.find(entry => entry.date === schedDates.currMonthDay);
    let hotelNextMonthEntry = data.hotelBank.find(entry => entry.date === schedDates.nextMonthDay);

    // Create default entries if missing
    if (!dbaPrevMonthEntry) {
      data.deviationBank.push({ date: schedDates.prevMonthDay, amount: 0, amountXfer: 0 });
      dbaPrevMonthEntry = data.deviationBank.find(entry => entry.date === schedDates.prevMonthDay);
    }
    if (!dbaCurrMonthEntry) {
      data.deviationBank.push({ date: schedDates.currMonthDay, amount: 0, amountXfer: 0 });
      dbaCurrMonthEntry = data.deviationBank.find(entry => entry.date === schedDates.currMonthDay);
    }
    if (!dbaNextMonthEntry) {
      data.deviationBank.push({ date: schedDates.nextMonthDay, amount: 0, amountXfer: 0 });
      dbaNextMonthEntry = data.deviationBank.find(entry => entry.date === schedDates.nextMonthDay);
    }
    if (!hotelPrevMonthEntry) {
      data.hotelBank.push({ date: schedDates.prevMonthDay, amount: 0, spend: 0, earn: 0 });
      hotelPrevMonthEntry = data.hotelBank.find(entry => entry.date === schedDates.prevMonthDay);
    }
    if (!hotelCurrMonthEntry) {
      data.hotelBank.push({ date: schedDates.currMonthDay, amount: 0, spend: 0, earn: 0 });
      hotelCurrMonthEntry = data.hotelBank.find(entry => entry.date === schedDates.currMonthDay);
      }
    if (!hotelNextMonthEntry) {
      data.hotelBank.push({ date: schedDates.nextMonthDay, amount: 0, spend: 0, earn: 0 });
      hotelNextMonthEntry = data.hotelBank.find(entry => entry.date === schedDates.nextMonthDay);
    }

    // Save defaults to persist
    saveData();
    
    const schedBankAmount = getAmount(currentMonth, data.scheduledBank);
    const expensesAmount = getAmount(currentMonth, data.expenses);
  
    let dbaAmount = 0;

    if (dbaPrevMonthEntry && dbaCurrMonthEntry &&   // Needed for first time use when no history is recorded
        dbaPrevMonthEntry.amount === 0 && dbaCurrMonthEntry.amount > 0) {
          dbaAmount = twoDigits(dbaCurrMonthEntry.amount);
    } else  if (dbaPrevMonthEntry) {
      dbaAmount = twoDigits(dbaPrevMonthEntry.amountXfer);
      dbaCurrMonthEntry.amount = dbaAmount;
    } else if (dbaCurrMonthEntry) {
      dbaAmount = twoDigits(dbaCurrMonthEntry.amount);
    } else {
      console.warn('Missing deviation bank entry for', dbaPrevMonthEntry ? schedDates.currMonthDay : schedDates.prevMonthDay);
    }

    // Ensure DOM elements exist
    if (!displayMonth || !schedBank || !expenses || !remaining || !dbaAvail || !totalExp || !hotelBank) {
      console.error('Missing required DOM elements');
      return;
    }

    displayMonth.innerText = `${schedDates.mmmYYYY}`;
    schedBank.innerText = `$${schedBankAmount.toFixed(2)}`;
    expenses.innerText = `$${expensesAmount.toFixed(2)}`;
    const difference = twoDigits(schedBankAmount - expensesAmount);
    remaining.innerHTML = difference < 0 ?
      `<span class="negative">($${(-difference).toFixed(2)})</span>` :
      `$${difference.toFixed(2)}`;

    dbaAvail.innerText = `$${dbaAmount.toFixed(2)}`;
    const totalRemaining = twoDigits(schedBankAmount - expensesAmount + dbaAmount);
    totalExp.innerHTML = totalRemaining < 0 ?
      `<span class="negative">($${(-totalRemaining).toFixed(2)})</span>` :
      `$${totalRemaining.toFixed(2)}`;

    // Hotel bank logic
    let hotelAmount = 0;
    if (hotelPrevMonthEntry && hotelCurrMonthEntry &&   // Needed for first time use when no history is recorded
        hotelPrevMonthEntry.amount === 0 && hotelCurrMonthEntry.amount > 0) {
          hotelAmount = twoDigits(hotelCurrMonthEntry.amount);
    } else if (hotelPrevMonthEntry) {
      hotelAmount = twoDigits(hotelPrevMonthEntry.amount - 
        hotelPrevMonthEntry.spend + hotelPrevMonthEntry.earn);
    } else if (hotelCurrMonthEntry) {
      hotelAmount = twoDigits(hotelCurrMonthEntry.amount);
    } else {
      console.warn('Missing hotel bank entry for', schedDates.prevMonthDay);
    }
    hotelBank.innerText = `$${hotelAmount.toFixed(2)}`;

    // Single find for hotel bank
    const hotelSpend = hotelCurrMonthEntry.spend;
    const hotelEarn = hotelCurrMonthEntry.earn;
    const hotelApplied = hotelEarn - hotelSpend
    applyHotel.innerHTML = hotelApplied >= 0 ? `<span>$${(hotelApplied).toFixed(2)}</span>` : 
      `<span class="negative">($${(-hotelApplied).toFixed(2)})</span>`;

    if (hotelFwd) {
      hotelFwd.innerText = `$${(hotelAmount - hotelSpend + hotelEarn).toFixed(2)}`;
    } else {
      console.warn('hotelFwd element not found');
    }

    let dbaRemaining = totalRemaining < 0 ? 0 : (totalRemaining) / 2;
    dbaRemaining = twoDigits(dbaRemaining);
    if (devFwd) {
      devFwd.innerText = `$${dbaRemaining.toFixed(2)}`;
    } else {
      console.warn('devFwd element not found');
    }

    // Update deviation bank amountXfer
    if (dbaCurrMonthEntry) {
      dbaCurrMonthEntry.amountXfer = dbaRemaining;
    } else {
      console.warn('Deviation bank entry not found for', schedDates.currMonthDay);
    }

     // Update Hotel bank amount
    if (hotelCurrMonthEntry) {
      hotelCurrMonthEntry.amount = hotelAmount;
    } else {
      console.warn('Hotel bank entry not found for', schedDates.currMonthDay);
    }

    // Ensure metadata exists
    data.metadata = data.metadata || {};
    data.metadata.currentMonth = schedDates.mmmYYYY;
    data.metadata.totalExpense = expensesAmount;
  } catch (error) {
    console.error('Error in updateUI:', error);
  }
}

// Run saveData immediately
updateUI();
saveData();

// // Save data to local storage
function saveData() {
  try {
    if (
      !Array.isArray(data.expenses) ||
      !Array.isArray(data.deviationBank) ||
      !Array.isArray(data.hotelBank) ||
      !Array.isArray(data.scheduledBank) ||
      typeof data.metadata !== "object"
    ) {
      throw new Error("Invalid data structure");
    }
    // Check for duplicate expense IDs
    const expenseIds = new Set(data.expenses.map(exp => exp.id));
    if (expenseIds.size !== data.expenses.length) {
      throw new Error("Duplicate expense IDs detected");
    }
    localStorage.setItem("expenseReport_data", JSON.stringify(data));
  } catch (e) {
    console.error("Save error:", e);
    results.textContent = "Failed to save data";
  }
}

function appendBackButton() {
  const backBtn = document.createElement("button");
  backBtn.id = "back-btn";
  backBtn.textContent = "Back";
  results.appendChild(document.createElement("br"));
  results.appendChild(backBtn);
  backBtn.addEventListener("click", () => {
    devForm.classList.remove("hidden");
    results.innerText = "";
    results.classList.remove("error");
    results.classList.add("hidden");
  });
}

// Check to see if the expense slide moves to previous or next month
function getSlideDate (checkDate, booSlide) {
  let checkSlideStatusDate = checkDate;
    const [year, numMonth, numDay] = checkSlideStatusDate.split('-').map(Number);
    if (booSlide) {
      let slideMonth = numMonth;
      slideMonth = numDay > 15 ? slideMonth += 1 : slideMonth -= 1;
      checkSlideStatusDate = `${year}-${slideMonth.toString().padStart(2, "0")}`;
    } else {
      checkSlideStatusDate = `${year}-${numMonth.toString().padStart(2, "0")}`;
    }
    return checkSlideStatusDate  
}

// output formats for date usage
  // Based on 2025-06 input, returns {'mmmYYYY': `Jun 2025`, 'currMonthDay': `2025-06-01`, 
  // 'prevMonth': '2025-05', 'prevMonthDay:' `2025-05-01`}
function getYearMonthDay(day = '01', cMonth = updateMonthInput.value) {
  const thisMonth = cMonth;  // e.g., "2025-06"
  const [year, month] = thisMonth.split("-");
  const prevMonthDate = new Date(parseInt(year), parseInt(month) - 2); // Subtract 2 to get previous month
  const nextMonthDate = new Date(parseInt(year), parseInt(month));
  const currMonthDay = `${thisMonth}-${day}`;  // e.g., 2025-06-01
  const prevMonth = `${prevMonthDate.getFullYear()}-${(prevMonthDate.
                  getMonth() + 1).toString().padStart(2, "0")}`;  // e.g., 2025-05
  const nextMonth = `${nextMonthDate.getFullYear()}-${(nextMonthDate.
                  getMonth() + 1).toString().padStart(2, "0")}`;  // e.g., 2025-07
  const nextMonthDay = `${nextMonthDate.getFullYear()}-${(nextMonthDate.
                  getMonth() + 1).toString().padStart(2, "0")}-${day}`;  // e.g., 2025-07-01
  const prevMonthDay = `${prevMonthDate.getFullYear()}-${(prevMonthDate.
                  getMonth() + 1).toString().padStart(2, "0")}-${day}`;  // e.g., 2025-05-01
  const mmmYYYY = months[parseInt(month)-1] + " " + year;  // e.g., Jun 2025
  const ddMMM = `${day} ${months[month - 1]}`;
 
  return {
    'mmmYYYY': mmmYYYY,             // Jun 2025
    'ddMMM': ddMMM,                 // 01 Jun
    'currMonth': thisMonth,         // 2025-06
    'currMonthDay': currMonthDay,   // 2025-06-01
    'prevMonth': prevMonth,         // 2025-05 
    'prevMonthDay': prevMonthDay,   // 2025-05-01
    'nextMonth': nextMonth,         // 2025-07
    'nextMonthDay': nextMonthDay    // 2025-07-01
  }
}


function initiateResults (strBtn) {
  results.innerHTML = `
    <div id="results-div">
      <h1 id="btnID">TBD</h1>
      <hr />
      <h2 id="btnMonth" >Jun 2025</h2>
      <div id="resultsDiv" class="dbResultsContainer">
      </div>
    </div>
  `
  const idBtn = document.getElementById("btnID");
  const btnMonth = document.getElementById("btnMonth");
  const resultsDiv = document.getElementById(`resultsDiv`)
  idBtn.innerText = strBtn;
  btnMonth.innerText = `For ${getYearMonthDay().mmmYYYY}`
  btnMonth.style.textDecoration = "underline";

  return resultsDiv
}

// Helper: Create an action menu with a button
function createActionMenu(type, id) {
  const menu = document.createElement('div');
  menu.className = 'action-menu';
  const btnClass = type === 'modify' ? 'modify-btn' : 'delete-btn';
  const btnText = type === 'modify' ? 'Modify' : 'Delete';
  menu.innerHTML = `<button class="${btnClass} dev-btn" data-id="${id}">${btnText}</button>`;
  return menu;
}

// Helper: Handle action button clicks
function handleActionClick(event, modMenu, delMenu, id, rowGroup, modifyCallback, deleteCallback) {
  event.stopPropagation(); // Prevent bubbling to parent cell
  // Remove action menus
  modMenu.remove();
  delMenu.remove();
  // Unhighlight row
  document.querySelectorAll(`[data-row-group="${rowGroup}"]`).forEach(c => c.classList.remove('selected'));
  // Call appropriate callback
  if (event.target.classList.contains('modify-btn')) {
    modifyCallback(id);
  } else if (event.target.classList.contains('delete-btn')) {
    deleteCallback(id);
  }
}

// Helper: Attach click handlers to grid cells
function attachRowClickHandlers({
  cellSelector,
  idAttr = 'data-id',
  rowGroupAttr = 'data-row-group',
  modifyCellIndex = 0,
  deleteCellIndex = -1,
  modifyCallback,
  deleteCallback
}) {
  document.querySelectorAll(cellSelector).forEach(cell => {
    // Prevent re-binding
    if (!cell.dataset.listenerAttached) {
      cell.addEventListener('click', (e) => {
        // Remove all existing action menus
        document.querySelectorAll('.action-menu').forEach(menu => menu.remove());

        const id = parseInt(cell.getAttribute(idAttr));
        const rowGroup = cell.getAttribute(rowGroupAttr);

        // Create action menus
        const modActionMenu = createActionMenu('modify', id);
        const delActionMenu = createActionMenu('delete', id);

        // Append menus to specified cells
        const rowCells = document.querySelectorAll(`[${rowGroupAttr}="${rowGroup}"]`);
        const modIndex = modifyCellIndex < 0 ? rowCells.length + modifyCellIndex : modifyCellIndex;
        const delIndex = deleteCellIndex < 0 ? rowCells.length + deleteCellIndex : deleteCellIndex;
        rowCells[modIndex].appendChild(modActionMenu);
        rowCells[delIndex].appendChild(delActionMenu);

        // Highlight row group
        document.querySelectorAll(cellSelector).forEach(c => c.classList.remove('selected'));
        rowCells.forEach(c => c.classList.add('selected'));

        // Attach button event listeners
        modActionMenu.querySelector('.modify-btn').addEventListener('click', (e) => {
          handleActionClick(e, modActionMenu, delActionMenu, id, rowGroup, modifyCallback, deleteCallback);
        });

        delActionMenu.querySelector('.delete-btn').addEventListener('click', (e) => {
          handleActionClick(e, modActionMenu, delActionMenu, id, rowGroup, modifyCallback, deleteCallback);
        });
      });
      cell.dataset.listenerAttached = 'true'; // Mark as attached
    }
  });
}

function showAddBankForm() {
  // Remove any existing form container
  const existingForm = document.getElementById('scheduledBankFormContainer');
  if (existingForm) existingForm.remove();
  const [nameMonth, year] = document.getElementById('btnMonth').innerText.slice(4,12).trim().split(" ");  // returns year and month
  const index = months.findIndex(month => month === nameMonth);  //reterns the month index 0 - 11
  const startDate = `${year}-${(index+1).toString().padStart(2, "0")}-15`

  const formContainer = document.createElement('div');
  formContainer.id = 'scheduledBankFormContainer';
  formContainer.innerHTML = `
    <h3>Add Trip Bank</h3>
    <form id="addScheduledBankForm">
      <label>Date: <input type="date" id="scheduledBankDate" required></label><br>
      <label>Amount: <input type="number" id="scheduledBankAmount" step="0.01" min="0" required></label><br>
      <button class="dev-btn" type="submit">Save</button>
      <button class="dev-btn" type="button" id="cancelForm">Cancel</button>
      <hr />
    </form>
  `;
  document.getElementById('resultsDiv').prepend(formContainer);
  document.getElementById('scheduledBankDate').value = startDate;

  // Handle form submission
  document.getElementById('addScheduledBankForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newBank = {
      id: Math.max(0, ...data.scheduledBank.map(exp => exp.id)) + 1, // Generate new unique ID
      date: document.getElementById('scheduledBankDate').value,
      amount: parseFloat(document.getElementById('scheduledBankAmount').value),
    };

    // Basic validation
    if (!dateRegex.test(newBank.date)) {
      results.innerText = "Invalid date format";
      results.classList.add("error");
      return;
    }

    data.scheduledBank.push(newBank);
    saveData();
    formContainer.remove();
    updateSchedBankBtn.click(); // Refresh list
    updateUI(); // Update totals
  });
  
  // Handle cancel
  document.getElementById('cancelForm').addEventListener('click', () => {
    formContainer.remove();
  });
}

// Function to show form for adding a new expense
function showAddExpenseForm(compareMonth) {

  // Remove any existing form container
  const existingForm = document.getElementById('expenseFormContainer');
  if (existingForm) existingForm.remove();

  const [nameMonth, year] = document.getElementById('btnMonth').innerText.slice(4,12).trim().split(" ");  // returns year and month
  const index = months.findIndex(month => month === nameMonth);  //reterns the month index 0 - 11
  const startDate = `${year}-${(index+1).toString().padStart(2, "0")}-15`
  const formContainer = document.createElement('div');
  formContainer.id = 'expenseFormContainer';
  formContainer.innerHTML = `
    <h3>Add Expense</h3>
    <form id="addExpenseForm">
      <label>Date: <input type="date" id="expenseDate" required></label><br>
      <label>Amount: <input type="number" id="expenseAmount" step="0.01" min="0" required></label><br>
      <label>Comment: <input type="text" id="expenseComment"></label><br>
      <label>Slide: <input type="checkbox" id="expenseSlide"></label><br>
      <p>Slide Date: <span id="expenseSlideDate"></span></p>
      <button class="dev-btn" type="submit">Save</button>
      <button class="dev-btn" type="button" id="cancelForm">Cancel</button>
      <hr />
    </form>
  `;
  document.getElementById('resultsDiv').prepend(formContainer);
  document.getElementById('expenseDate').value = startDate;  // set the current month
  document.getElementById('expenseSlideDate').innerText = getSlideDate(startDate, false);  // Initialize Slide Date

  // Initialize slide  date when date selected
  document.getElementById('expenseDate').addEventListener('change', () => {
    const checkSlide = document.getElementById('expenseSlide').checked;
    const newSlideDate = getSlideDate(expenseDate.value, checkSlide);
    document.getElementById('expenseSlideDate').innerText = newSlideDate;
  })

   document.getElementById('expenseSlide').addEventListener('change', (e) => {
    const isChecked = e.target.checked;

    if (!expenseDate.value) {
      return;
    }
    const newSlideDate = getSlideDate(expenseDate.value, isChecked)
    document.getElementById('expenseSlideDate').innerText = newSlideDate;
    })

  // Handle form submission
  document.getElementById('addExpenseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newExpense = {
      id: Math.max(0, ...data.expenses.map(exp => exp.id)) + 1, // Generate new unique ID
      date: document.getElementById('expenseDate').value,
      amount: parseFloat(document.getElementById('expenseAmount').value),
      comment: document.getElementById('expenseComment').value || '',
      slide: document.getElementById('expenseSlide').checked,
      slideDate: document.getElementById('expenseSlideDate').innerText
    };

    // Basic validation
    if (!dateRegex.test(newExpense.date) || !monthRegex.test(newExpense.slideDate)) {
      results.innerText = "Invalid date format";
      results.classList.add("error");
      return;
    }

    data.expenses.push(newExpense);
    saveData();
    formContainer.remove();
    showExpensesBtn.click(); // Refresh list
    updateUI(); // Update totals
  });

  // Handle cancel
  document.getElementById('cancelForm').addEventListener('click', () => {
    formContainer.remove();
  });
}

function showModDevHotel(compareMonth) {
  const compareDate = `${compareMonth}-01`;
  let dev = data.deviationBank.find(d => d.date === compareDate);
  let hotel = data.hotelBank.find(d => d.date === compareDate);

  // Create default entries if missing
  if (!dev) {
    dev = { date: compareDate, amount: 0, amountXfer: 0 };
    data.deviationBank.push(dev); // Add new entry
  }
  if (!hotel) {
    hotel = { date: compareDate, amount: 0, spend: 0, earn: 0 };
    data.hotelBank.push(hotel); // Add new entry
  }

  // Remove any existing form container
  const existingForm = document.getElementById('modDevHotel');
  if (existingForm) existingForm.remove();

  const formContainer = document.createElement('div');
  formContainer.id = 'modDevHotel';
  formContainer.innerHTML = `
    <h3>Modify Deviation / Hotel Banks</h3>
    <form id="modDevHotelForm">
      <p>Change DBA: <input type="number" id="devInfo" step="0.01" min="0" value="${dev.amount}" required></p>
      <p>Change Hotel Bank: <input type="number" id="hotelInfo" step="0.01" min="0" value="${hotel.amount}" required></p>
      <li>Hotel Spend: <input type="number" id="spendInfo" step="0.01" min="0" value="${hotel.spend}" required></li>
      <li>Hotel Earned: <input type="number" id="earnInfo" step="0.01" min="0" value="${hotel.earn}" required></li>
      <button class="dev-btn form-btn" type="submit">Save</button>
      <button class="dev-btn form-btn" type="button" id="cancelForm">Cancel</button>
      <hr />
    </form>
  `;

  const resultsDiv = document.getElementById('resultsDiv');
  if (!resultsDiv) {
    console.error('resultsDiv not found');
    results.innerText = "Error: Unable to display form";
    results.classList.add("error");
    return;
  }
  resultsDiv.prepend(formContainer);

  document.getElementById('modDevHotelForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const updatedDev = {
      date: dev.date,
      amount: parseFloat(document.getElementById('devInfo').value),
      amountXfer: dev.amountXfer // Preserve existing amountXfer
    };
    const updatedHotel = {
      date: hotel.date,
      amount: parseFloat(document.getElementById('hotelInfo').value),
      spend: parseFloat(document.getElementById('spendInfo').value),
      earn: parseFloat(document.getElementById('earnInfo').value)
    };

    // Validation
    if (
      !dateRegex.test(updatedDev.date) ||
      !dateRegex.test(updatedHotel.date) ||
      isNaN(updatedDev.amount) || updatedDev.amount < 0 ||
      isNaN(updatedHotel.amount) || updatedHotel.amount < 0 ||
      isNaN(updatedHotel.spend) || updatedHotel.spend < 0 ||
      isNaN(updatedHotel.earn) || updatedHotel.earn < 0
    ) {
      results.innerText = "Invalid input values";
      results.classList.add("error");
      return;
    }

    // Ensure no duplicate dates
    const devDates = new Set(data.deviationBank.map(d => d.date));
    const hotelDates = new Set(data.hotelBank.map(h => h.date));
    if (devDates.size !== data.deviationBank.length || hotelDates.size !== data.hotelBank.length) {
      results.innerText = "Duplicate dates detected";
      results.classList.add("error");
      return;
    }

    // Update or add entries
    const devIndex = data.deviationBank.findIndex(d => d.date === compareDate);
    const hotelIndex = data.hotelBank.findIndex(h => h.date === compareDate);
    if (devIndex !== -1 && hotelIndex !== -1) {
      data.deviationBank[devIndex] = updatedDev;
      data.hotelBank[hotelIndex] = updatedHotel;
      saveData();
      formContainer.remove();
      updateDevHotelBtn.click();
      updateUI();
    } else {
      results.innerText = "Bank entries not found";
      results.classList.add("error");
    }
  });

  document.getElementById('cancelForm').addEventListener('click', () => {
    formContainer.remove();
  });
}

// Function to show form for modifying a bank
function showModifyBankForm(bankId, compareMonth) {
  const bank = data.scheduledBank.find(bank => bank.id === bankId);
  if (!bank) return;

  // Remove any existing form container
  const existingForm = document.getElementById('scheduledBankFormContainer');
  if (existingForm) existingForm.remove();

  const formContainer = document.createElement('div');
  formContainer.id = 'scheduledBankFormContainer';
  formContainer.innerHTML = `
    <h3>Modify Scheduled Bank</h3>
    <form id="scheduledBankForm">
      <label>Date: <input type="date" id="scheduledBankDate" value="${bank.date}" required></label><br>
      <label>Amount: <input type="number" id="scheduledBankAmount" step="0.01" min="0" value="${bank.amount}" required></label><br>
      <input type="hidden" id="bankId" value="${bank.id}">
      <button class="dev-btn form-btn" type="submit">Save</button>
      <button class="dev-btn form-btn" type="button" id="cancelForm">Cancel</button>
      <hr />
    </form>
  `;

  document.getElementById('resultsDiv').prepend(formContainer);

  // Handle form submission
  document.getElementById('scheduledBankForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const updatedBank = {
      id: parseInt(document.getElementById('bankId').value),
      date: document.getElementById('scheduledBankDate').value,
      amount: parseFloat(document.getElementById('scheduledBankAmount').value)
    };

    // Basic validation
    if (!dateRegex.test(updatedBank.date)) {
      results.innerText = "Invalid date format";
      results.classList.add("error");
      return;
    }

    const index = data.scheduledBank.findIndex(bank => bank.id === updatedBank.id);
    if (index !== -1) {
      data.scheduledBank[index] = updatedBank;
      saveData();
      formContainer.remove();
      updateSchedBankBtn.click(); // Refresh list
      updateUI(); // Update totals
    } else {
      results.innerText = "Bank not found";
      results.classList.add("error");
    }
  });

  // Handle cancel
  document.getElementById('cancelForm').addEventListener('click', () => {
    formContainer.remove();
  });
}

// Function to show form for modifying an expense
function showModifyExpenseForm(expenseId, compareMonth) {
  const expense = data.expenses.find(exp => exp.id === expenseId);
  if (!expense) return;

  // Remove any existing form container
  const existingForm = document.getElementById('expenseFormContainer');
  if (existingForm) existingForm.remove();

  const formContainer = document.createElement('div');
  formContainer.id = 'expenseFormContainer';
  formContainer.innerHTML = `
    <h3>Modify Expense</h3>
    <form id="modifyExpenseForm">
      <label>Date: <input type="date" id="expenseDate" value="${expense.date}" required></label><br>
      <label>Amount: <input type="number" id="expenseAmount" step="0.01" min="0" value="${expense.amount}" required></label><br>
      <label>Comment: <input type="text" id="expenseComment" value="${expense.comment}"></label><br>
      <label>Slide: <input type="checkbox" id="expenseSlide" ${expense.slide ? 'checked' : ''}></label><br>
      <p>Slide Date: <span id="expenseSlideDate">${expense.slideDate}</span></p>
      <input type="hidden" id="expenseId" value="${expense.id}">
      <button type="submit" class="dev-btn">Save</button>
      <button type="button" id="cancelForm" class="dev-btn">Cancel</button>
      <hr />
    </form>
  `;

  document.getElementById('resultsDiv').prepend(formContainer);

  //Need to update slide date if date changes
  document.getElementById('expenseDate').addEventListener('change', (e) => {
    const newDate = (e.target.value).slice(0, 7);  // yyyy-mm
    // const newDay = (e.target.value).slice(8) // dd
    const isChecked = document.getElementById('expenseSlide').checked;
    const newSlideDate = getSlideDate(newDate, isChecked);
    expense.date = e.target.value;     // Save the new date
    expense.slideDate = newSlideDate;  // Save the new slideDate
    document.getElementById('expenseSlideDate').innerText = expense.slideDate;
  })

  document.getElementById('expenseSlide').addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    const newSlideDate = getSlideDate(expense.date, isChecked)
    expense.slideDate = newSlideDate;
    document.getElementById('expenseSlideDate').innerText = expense.slideDate;
    })

  // Handle form submission
  document.getElementById('modifyExpenseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const updatedExpense = {
      id: parseInt(document.getElementById('expenseId').value),
      date: document.getElementById('expenseDate').value,
      amount: parseFloat(document.getElementById('expenseAmount').value),
      comment: document.getElementById('expenseComment').value || '',
      slide: document.getElementById('expenseSlide').checked,
      slideDate: document.getElementById('expenseSlideDate').innerText
    };

    // Basic validation
    if (!dateRegex.test(updatedExpense.date) || !monthRegex.test(updatedExpense.slideDate)) {
      results.innerText = "Invalid date format";
      results.classList.add("error");
      return;
    }

    const index = data.expenses.findIndex(exp => exp.id === updatedExpense.id);
    data.expenses[index] = updatedExpense;
    saveData();
    formContainer.remove();
    showExpensesBtn.click(); // Refresh list
    updateUI(); // Update totals
  });

  // Handle cancel
  document.getElementById('cancelForm').addEventListener('click', () => {
    formContainer.remove();
  });
}

// Function to delete an item from a data array
function deleteItem(itemId, arrayProperty, itemType, refreshCallback) {
  if (confirm(`Are you sure you want to delete this ${itemType}?`)) {
    data[arrayProperty] = data[arrayProperty].filter(item => item.id !== itemId);
    saveData();
    refreshCallback(); // Trigger appropriate grid refresh
    updateUI(); // Update totals
  }
}

// ******* ADD SWIPT LEFT / RIGHT TO MAIN PAGE
// DOM elements
const displayContainer = document.querySelector('.display-container');
const monthInput = document.getElementById('update-month');

// Touch variables
let touchStartX = 0;
let touchEndX = 0;
const SWIPE_THRESHOLD = 50;
let isSwiping = false;

// Swipe event listeners
displayContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
});

displayContainer.addEventListener('touchmove', (e) => {
    const currentX = e.changedTouches[0].clientX;
    const swipeDistance = currentX - touchStartX;

    // Clear previous classes to prevent conflicts
    displayContainer.classList.remove('swipe-left', 'swipe-right');

    if (swipeDistance > SWIPE_THRESHOLD) {
        displayContainer.classList.add('swipe-right');
    } else if (swipeDistance < -SWIPE_THRESHOLD) {
        displayContainer.classList.add('swipe-left');
    }
});

displayContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    displayContainer.classList.remove('swipe-left', 'swipe-right');
    handleSwipe();
});

// Handle swipe
function handleSwipe() {
    if (isSwiping) {
        return;
    }
    isSwiping = true;

    const swipeDistance = touchEndX - touchStartX;
    if (Math.abs(swipeDistance) < SWIPE_THRESHOLD) {
        isSwiping = false;
        return;
    }

    // Parse current month from monthInput.value or default to Jun 2025
    let year, month;
    if (monthInput.value) {
        [year, month] = monthInput.value.split('-').map(Number);
    } else {
        year = 2025;
        month = 6; // Default to June 2025
    }

    // Calculate new month
    if (swipeDistance > 0) {
        // Swipe left: Previous month
        month -= 1;
        if (month < 1) {
            month = 12;
            year -= 1;
        } 
        
     } else {
        // Swipe right: Next month
        month += 1;
        if (month > 12) {
            month = 1;
            year += 1;
        }
    }

    // Update monthInput value
    monthInput.value = `${year}-${String(month).padStart(2, '0')}`;

    // Dispatch synthetic change event
    const changeEvent = new InputEvent('change', { bubbles: true });
    monthInput.dispatchEvent(changeEvent);

    // Reset debounce
    setTimeout(() => {
        isSwiping = false;
    }, 300);
}
// ******* ADD SWIPT LEFT / RIGHT TO MAIN PAGE

updateMonthInput.addEventListener("change", () => {
  updateUI();
  saveData();
});

updateSchedBankBtn.addEventListener("click", () => {
  const resultsDiv = initiateResults('Scheduled Banks');
  devForm.classList.add("hidden");
  results.classList.remove("hidden");
  const schedArray = data.scheduledBank;
  const compareMonth = updateMonthInput.value;

  let output = `<p>Sched Bank: $${getAmount(compareMonth, schedArray).toFixed(2)}</p>
    <div class="schedGrid">
      <div>Date</div>
      <div>Bank</div>
  `;

  // sort the array first
schedArray.sort((a, b) => new Date(a.date) - new Date(b.date));

  for (let i = 0; i < schedArray.length; i++) {
    const compareDate = schedArray[i].date.slice(0, 7);
    if (compareDate === compareMonth) {
      const displayDate = new Date(schedArray[i].date).toISOString().slice(8, 10);  // returns UTC day of Month
      output += `
        <div class="sched-cell" data-id="${schedArray[i].id}" data-row-group="${i}">${getYearMonthDay(displayDate).ddMMM}</div>
        <div class="sched-cell" data-id="${schedArray[i].id}" data-row-group="${i}">$${schedArray[i].amount.toFixed(2)}</div>
      `;
    }
  }

  output += `</div><br />
    <button class="dev-btn" id="add-bank-btn">Add Bank</button>
  `;
  resultsDiv.innerHTML = output;

  // Attach click handlers
  attachRowClickHandlers({
    cellSelector: '.sched-cell',
    idAttr: 'data-id',
    rowGroupAttr: 'data-row-group',
    modifyCellIndex: 0, // First cell (Date)
    deleteCellIndex: -1, // Last cell (Bank)
    modifyCallback: (id) => showModifyBankForm(id, compareMonth),
    deleteCallback: (id) => deleteItem(id, 'scheduledBank', 'bank', () => updateSchedBankBtn.click())
  });

  document.getElementById('add-bank-btn').addEventListener('click', () => {
    showAddBankForm();
  });

  appendBackButton();
});

showExpensesBtn.addEventListener("click", () => {
  const resultsDiv = initiateResults('Add Expenses');
  devForm.classList.add("hidden");
  results.classList.remove("hidden");

  const expenseArray = data.expenses;
  const compareMonth = updateMonthInput.value;

  let output = `<p>Total Expenses: $${getAmount(compareMonth, expenseArray).toFixed(2)}</p>
    <div class="expenseGrid">
      <div>Date</div>
      <div>Cost</div>
      <div>Comment</div>
      <div>Slid</div>
  `;

// Sort the array before running for display
expenseArray.sort((a, b) => new Date(a.date) - new Date(b.date));

  for (let i = 0; i < expenseArray.length; i++) {
    const compareDate = expenseArray[i].slideDate;  // e.g., 2025-06
     
    if (compareDate === compareMonth) {
      const dayDate = new Date(expenseArray[i].date).toISOString().slice(8, 10);  // returns day of Month
      const expDate = expenseArray[i].date.slice(0,7);  // returns expense date yyyy-mm ensures date displays with correct month

      output += `
        <div class="expense-cell" data-id="${expenseArray[i].id}" data-row-group="${i}">${getYearMonthDay(dayDate, expDate).ddMMM}</div>
        <div class="expense-cell" data-id="${expenseArray[i].id}" data-row-group="${i}">$${expenseArray[i].amount.toFixed(2)}</div>
        <div class="expense-cell" data-id="${expenseArray[i].id}" data-row-group="${i}">${expenseArray[i].comment}</div>
        <div class="expense-cell" data-id="${expenseArray[i].id}" data-row-group="${i}">${expenseArray[i].slide ? `<span style="color: yellow;">Yes</span>` : "No"}</div>
      `;
    }
  }

  output += `</div><br />
    <button class="dev-btn" id="add-expense-btn">Add Expense</button>
  `;
  resultsDiv.innerHTML = output;

  // Attach click handlers using helper function
  attachRowClickHandlers({
    cellSelector: '.expense-cell',
    idAttr: 'data-id',
    rowGroupAttr: 'data-row-group',
    modifyCellIndex: 0, // First cell (Date)
    deleteCellIndex: -1, // Last cell (Slid)
    modifyCallback: (id) => showModifyExpenseForm(id, compareMonth),
    deleteCallback: (id) => deleteItem(id, 'expenses', 'expense', () => showExpensesBtn.click())
  });

  // Event listener for Add Expense button
  document.getElementById('add-expense-btn').addEventListener('click', () => {
    showAddExpenseForm(compareMonth);
  });

  appendBackButton();
});

updateDevHotelBtn.addEventListener("click", () => {
  const resultsDiv = initiateResults('Update Deviation / Hotel Bank')
  devForm.classList.add("hidden");
  results.classList.remove("hidden");

  const devBankArray = data.deviationBank;
  const hotelBankArray = data.hotelBank;
  const expenseArray = data.expenses;
  const schedDates = getYearMonthDay();
  const hotelEntry = data.hotelBank.find(d => d.date === schedDates.currMonthDay) || { spend: 0, earn: 0 };

  let output = `<div>
  <p>Avail Deviation Bank: $${getAmount(schedDates.currMonth, devBankArray)}<p>
  <p>Starting Hotel Bank: $${getAmount(schedDates.currMonth, hotelBankArray)}</p>
    <li>Spent: $${hotelEntry.spend.toFixed(2)}</li>
    <li>Earned: $${hotelEntry.earn.toFixed(2)}</li>
  </div>
  <br />
  <button class="dev-btn" id="mod-dev-hotel">Modify</button>
  `
  resultsDiv.innerHTML = output;
   // Event listener for Add Expense button
  document.getElementById('mod-dev-hotel').addEventListener('click', () => {
    showModDevHotel(schedDates.currMonth);
  });

  appendBackButton();
});

