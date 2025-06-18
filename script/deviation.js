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

const defaultData = {
  expenses: [],
  deviationBank: [],
  hotelBank: [],
  scheduledBank: [],
  metadata: { currentMonth: "Jul 2025", totalExpense: 0 } // Align with JSON
};

//Initialize month for display
let initialMonth = now.getMonth() + 1;
initialMonth = initialMonth.toString().padStart(2, "0");
updateMonthInput.value = `${now.getFullYear()}-${initialMonth}`;
// const schedMonth = updateMonthInput.value;

// Retrieve and validate data from local storage
let data;
try {
  const stored = localStorage.getItem("expenseReport_data");
  data = stored ? JSON.parse(stored) : defaultData;
  let isValid = true; // Track overall validity

  // console.log("Data before validation:", data);

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
  data.deviationBank = [];
  isValid = false;
} else {
  for (const entry of data.deviationBank) {
    if (
      !dateRegex.test(entry.date) || isNaN(new Date(entry.date).getTime()) ||
      new Date(entry.date).toISOString().slice(0, 10) !== entry.date ||
      typeof entry.amount !== "number" || isNaN(entry.amount) || !isFinite(entry.amount) ||
      typeof entry.amountXfer !== "number" || isNaN(entry.amountXfer) || !isFinite(entry.amountXfer)
    ) {
      console.warn("Invalid deviation bank entry, resetting deviationBank");
      data.deviationBank = [];
      isValid = false;
      break;
    }
  }
}
// Validate hotelBank
if (!Array.isArray(data.hotelBank)) {
  console.warn("Hotel bank is not an array, resetting");
  data.hotelBank = [];
  isValid = false;
} else {
  for (const entry of data.hotelBank) {
    if (
      !dateRegex.test(entry.date) ||
      typeof entry.amount !== "number" || isNaN(entry.amount) || !isFinite(entry.amount) ||
      typeof entry.spend !== "number" || isNaN(entry.spend) || !isFinite(entry.spend) ||
      typeof entry.earn !== "number" || isNaN(entry.earn) || !isFinite(entry.earn)
    ) {
      console.warn("Invalid hotel bank entry, resetting hotelBank");
      data.hotelBank = [];
      isValid = false;
      break;
    }
  }
}

  // Validate scheduledBank
  if (!Array.isArray(data.scheduledBank)) {
    console.warn("Scheduled bank is not an array, resetting");
    data.scheduledBank = defaultData.scheduledBank;
    isValid = false;
  } else {
    const schedBankIds = new Set();
    let validSchedBank = true;
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
        validSchedBank = false;
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
  // Notify user if any section was reset
  if (!isValid) {
    console.warn("Some data sections were invalid and reset to defaults");
    // Optionally show warning in #results, e.g., results.textContent = "Some data was reset due to errors";
  }
  console.log("Data after validation:", data);
} catch (e) {
  console.error("Parse error:", e);
  data = defaultData;
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
        // console.log("DBA:", arrCompare[i].amount);
        totalizer += arrCompare[i].amount;
        // console.log("Bank Value:", totalizer, "at index:", i);
      }
    }
  }
  return totalizer;
}

function updateUI() {
  const schedMonth = updateMonthInput.value; // e.g., "2025-07"
  const schedMonthDay = `${schedMonth}-01`  // e.g., "2025-07-01"
  const schedBankAmount = getAmount(schedMonth, data.scheduledBank);
  const expensesAmount = getAmount(schedMonth, data.expenses); 
  const [year, monthNum] = schedMonth.split("-"); // [2025, 7]
  const prevMonthDate = new Date(parseInt(year), parseInt(monthNum) - 2); // Subtract 2 to get previous month
  const prevMonth = `${prevMonthDate.getFullYear()}-${(prevMonthDate.getMonth() + 1).toString().padStart(2, "0")}-01`;
  displayMonth.innerText = `${months[parseInt(monthNum) - 1]} ${year}`;
  schedBank.innerText = `$${schedBankAmount.toFixed(2)}`;
  expenses.innerText = `$${expensesAmount.toFixed(2)}`;
  const difference = schedBankAmount - expensesAmount;
  remaining.innerHTML = difference < 0 ?
    `<span class="negative">($${(-difference).toFixed(2)})</span>` :
    `$${difference.toFixed(2)}`;
  const dbaAmount = getAmount(schedMonth, data.deviationBank)
  dbaAvail.innerText = `$${dbaAmount.toFixed(2)}`;
  const totalRemaining = schedBankAmount - expensesAmount + dbaAmount;
  totalExp.innerHTML = totalRemaining < 0 ?
    `<span class="negative">($${(-totalRemaining).toFixed(2)})</span>` :
    `$${totalRemaining.toFixed(2)}`;
  const hotelAmount = data.hotelBank.find(entry => entry.date === prevMonth)?.amount || 0;
  hotelBank.innerText = `$${hotelAmount.toFixed(2)}`;
  const hotelSpend = (data.hotelBank.find(s => s.date === schedMonthDay)).spend;
  const hotelEarn = (data.hotelBank.find(e => e.date === schedMonthDay)).earn;
  hotelFwd.innerText = `$${(hotelAmount - hotelSpend + hotelEarn).toFixed(2)}`
   
  // const dbaSpent = difference > 0 ? 0 :    // Nothing spent if expense < bank
  //       totalRemaining < 0 ? dbaAmount :   // Everything spent if Total is negative
  //       difference;                        // Only difference spent if total is positive             


  const dbaRemaining = totalRemaining < 0 ? 0 :  // No DBA if total is still negative
        (totalRemaining) / 2;
  devFwd.innerText = `$${dbaRemaining.toFixed(2)}`

  
  
  

  
  console.log("Remaining", difference, 'total remain', totalRemaining, )
  console.log("dba to forward", dbaRemaining)




  data.metadata.totalExpense = expensesAmount;
}

//Initialize Screen data to the inital month
updateUI();

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
    // console.log("check Date", checkDate, "Status:", booSlide);
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
  const thisMonth = updateMonthInput.value;
  idBtn.innerText = strBtn;
  const [year, monthNum] = thisMonth.split("-");
  btnMonth.innerText = `For ${months[parseInt(monthNum) - 1]} ${year}`
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
  console.log(`${event.target.textContent} clicked, ID:`, id, 'Menus before remove:', document.querySelectorAll('.action-menu').length);
  // Remove action menus
  modMenu.remove();
  delMenu.remove();
  console.log('Menus after remove:', document.querySelectorAll('.action-menu').length);
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
        console.log('Cell clicked, ID:', cell.getAttribute(idAttr), 'Row group:', cell.getAttribute(rowGroupAttr));
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
    console.log("Date should look like:", expenseDate.value)
    const checkSlide = document.getElementById('expenseSlide').checked;
    const newSlideDate = getSlideDate(expenseDate.value, checkSlide);
    document.getElementById('expenseSlideDate').innerText = newSlideDate;
  })

   document.getElementById('expenseSlide').addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    // console.log("test", expenseDate.value)
    if (!expenseDate.value) {
      // console.log("No Way Jose");
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

// Function to modify dev and hotel banks
function showModDevHotel (compareMonth) {
  // compareMonth in form 2025-06
  const compareDate = `${compareMonth}-01`
  const dev = data.deviationBank.find(d => d.date === compareDate)
  const hotel = data.hotelBank.find(d => d.date === compareDate)

  console.log(compareDate, dev, hotel)

  


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

  // console.log("Expense:", expense);
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

  document.getElementById('expenseSlide').addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    const newSlideDate = getSlideDate(expense.date, isChecked)
    // console.log("The Slide to save", newSlideDate)
    expense.slideDate = newSlideDate;
    document.getElementById('expenseSlideDate').innerText = expense.slideDate;
    // console.log("Saved data", document.getElementById('expenseSlideDate').innerText)
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

updateMonthInput.addEventListener("change", () => {
   updateUI();
  //  saveData();
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

  for (let i = 0; i < schedArray.length; i++) {
    const compareDate = schedArray[i].date.slice(0, 7);
    if (compareDate === compareMonth) {
      output += `
        <div class="sched-cell" data-id="${schedArray[i].id}" data-row-group="${i}">${schedArray[i].date}</div>
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

  for (let i = 0; i < expenseArray.length; i++) {
    const compareDate = expenseArray[i].slideDate;
    if (compareDate === compareMonth) {
      let displayDate = expenseArray[i].date;
      const [year, monthNum, dayNum] = displayDate.split("-").map(Number);
      displayDate = `${dayNum} ${months[monthNum - 1]}`;

      output += `
        <div class="expense-cell" data-id="${expenseArray[i].id}" data-row-group="${i}">${displayDate}</div>
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
  const compareMonth = updateMonthInput.value;
  const compareDate = `${compareMonth}-01`
  const [year, monthNum] = updateMonthInput.value.split("-"); 
  
  const prevMonthDate = new Date(parseInt(year), parseInt(monthNum) - 2); // Subtract 2 to get previous month
  const prevMonth = `${prevMonthDate.getFullYear()}-${(prevMonthDate.getMonth() + 1).toString().padStart(2, "0")}`;

  console.log(year, monthNum, prevMonthDate, prevMonth)

  console.log("Dev Bank:", getAmount(compareMonth, devBankArray))
  console.log("Hotel Bank:", getAmount(prevMonth, hotelBankArray))

  // This gets the current hotel bank but should pull bank from previous month
  // Hotel bank starts with the end of the previous month, then adds
  // Earning and subtracts Spendings for the final value
  let output = `<div>
  <p>Avail Deviation Bank: $${getAmount(compareMonth, devBankArray)}<p>
  <p>Starting Hotel Bank: $${getAmount(compareMonth, hotelBankArray)}</p>
  <li>Spent: $${(data.hotelBank.find(d => d.date === compareDate).spend)}</li>
  <li>Earned: $${(data.hotelBank.find(d => d.date === compareDate).earn)}</li>
  </div>
  <br />
  <button class="dev-btn" id="mod-dev-hotel">Modify</button>
  `
  resultsDiv.innerHTML = output;
console.log((data.hotelBank.find(d => d.date === compareDate).spend))
  // Event listener for Add Expense button
  document.getElementById('mod-dev-hotel').addEventListener('click', () => {
    showModDevHotel(compareMonth);
  });

  appendBackButton();
});

