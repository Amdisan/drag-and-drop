const addBtns = document.querySelectorAll(".add-btn:not(.solid)");
const saveItemBtns = document.querySelectorAll(".solid");
const addItemContainers = document.querySelectorAll(".add-container");
const addItems = document.querySelectorAll(".add-item");
// Item Lists
const itemLists = document.querySelectorAll(".drag-item-list");
const backlogList = document.getElementById("backlog-list");
const progressList = document.getElementById("progress-list");
const completeList = document.getElementById("complete-list");
const onHoldList = document.getElementById("onHold-list");

// Items
let updatedOnLoad = false;

// Initialize Arrays
const listArrays = {
  backlogListArray: [],
  progressListArray: [],
  completeListArray: [],
  onHoldListArray: [],
};

// Drag Functionality
let draggedItem;
let nextColumn;
let prevColumn;
let isDragItem;

// Get Arrays from localStorage if available, set default values if not
function getSavedColumns() {
  if (localStorage.getItem("backlogItems")) {
    listArrays.backlogListArray = JSON.parse(localStorage.backlogItems);
    listArrays.progressListArray = JSON.parse(localStorage.progressItems);
    listArrays.completeListArray = JSON.parse(localStorage.completeItems);
    listArrays.onHoldListArray = JSON.parse(localStorage.onHoldItems);
  } else {
    listArrays.backlogListArray = ["Release the course", "Sit back and relax"];
    listArrays.progressListArray = ["Work on projects", "Listen to music"];
    listArrays.completeListArray = ["Being cool", "Getting stuff done"];
    listArrays.onHoldListArray = ["Being uncool"];
  }
}

// Set localStorage Arrays
function updateSavedColumns() {
  const arrayNames = ["backlog", "progress", "complete", "onHold"];
  arrayNames.forEach((arrayName) => {
    const name = `${arrayName}ListArray`;
    localStorage.setItem(`${arrayName}Items`, JSON.stringify(listArrays[name]));
  });
}

// Create DOM Elements for each list item
function createItemEl(columnEl, columnName, columnIdx, item, idx) {
  const id = `${idx}-${columnName}ListItem`;
  const name = `${columnName}ListArray`;
  const selectedArray = listArrays[name];

  const idIdx = id.split("-")[0];
  // List Item
  const listEl = document.createElement("li");
  listEl.classList.add("drag-item");
  listEl.textContent = item;
  listEl.draggable = true;
  listEl.id = id;
  listEl.addEventListener("dragstart", drag);
  listEl.addEventListener("dblclick", () => {
    listEl.contentEditable = true;
    listEl.focus();
  });
  listEl.addEventListener("keyup", () => {
    const selectedColumnEl = itemLists[columnIdx].children[id];
    if (!selectedColumnEl.textContent) {
      selectedArray.splice(idIdx, 1);
      updateDOM();
    }
  });

  listEl.addEventListener("mouseleave", () => {
    const selectedColumnEl = itemLists[columnIdx].children[id];
    const timerBlur = setTimeout(() => {
      listEl.contentEditable = false;
      listEl.blur();
      if (
        selectedColumnEl.textContent &&
        selectedColumnEl.textContent !== selectedArray[idIdx]
      ) {
        selectedArray.splice(idIdx, 1, selectedColumnEl.textContent);
        updateDOM();
      }
      clearTimeout(timerBlur);
    }, 300);
  });

  //append
  columnEl.appendChild(listEl);
}

// Update Columns in DOM - Reset HTML, Filter Array, Update localStorage
function updateDOM() {
  // Check localStorage once
  if (!updatedOnLoad) {
    getSavedColumns();
  }
  // Backlog Column
  backlogList.textContent = "";
  listArrays.backlogListArray.forEach((backlogItem, idx) => {
    createItemEl(backlogList, "backlog", 0, backlogItem, idx);
  });
  // Progress Column
  progressList.textContent = "";
  listArrays.progressListArray.forEach((progressItem, idx) => {
    createItemEl(progressList, "progress", 1, progressItem, idx);
  });
  // Complete Column
  completeList.textContent = "";
  listArrays.completeListArray.forEach((completeItem, idx) => {
    createItemEl(completeList, "complete", 2, completeItem, idx);
  });
  // On Hold Column
  onHoldList.textContent = "";
  listArrays.onHoldListArray.forEach((onHoldItem, idx) => {
    createItemEl(onHoldList, "onHold", 3, onHoldItem, idx);
  });
  // Run getSavedColumns only once, Update Local Storage
  updatedOnLoad = true;
  updateSavedColumns();
}

//add to column list, reset textbox
function addToColumn(colIdx, e) {
  const itemText = addItems[colIdx].textContent;
  const name = `${e.target.closest(".add-btn").id.split("-")[0]}ListArray`;
  const selectedArray = listArrays[name];
  selectedArray.push(itemText);
  //reset text in the div
  addItems[colIdx].textContent = "";
  updateDOM();
}

//show Add item input Box
function showInputBox(colIdx) {
  addBtns[colIdx].style.visibility = "hidden";
  saveItemBtns[colIdx].style.display = "flex";
  addItemContainers[colIdx].style.display = "flex";
}

//hide item input box
function hideInputBox(colIdx, e) {
  addBtns[colIdx].style.visibility = "visible";
  saveItemBtns[colIdx].style.display = "none";
  addItemContainers[colIdx].style.display = "none";
  addToColumn(colIdx, e);
}

//allows array to reflect drag and drop items
function rebuildArrays() {
  const nameNextColumn = `${nextColumn.id.split("-")[0]}ListArray`;
  const namePrevColumn = `${prevColumn.id.split("-")[0]}ListArray`;
  listArrays[nameNextColumn] = [];
  listArrays[namePrevColumn] = [];

  [...nextColumn.children].forEach((item) => {
    listArrays[nameNextColumn].push(item.textContent);
  });
  [...prevColumn.children].forEach((item) => {
    listArrays[namePrevColumn].push(item.textContent);
  });

  updateDOM();
}

//drag function
function drag(e) {
  draggedItem = e.target.closest
    ? e.target.closest(".drag-item")
    : e.target.parentElement;

  prevColumn = draggedItem.closest(".drag-item-list");
}

//allow drop on drag
function allowDrop(e) {
  e.preventDefault();
  e.stopPropagation();
}

//drop function
function drop(e) {
  e.preventDefault();
  e.stopPropagation();
  if (
    nextColumn &&
    nextColumn !== prevColumn &&
    draggedItem.closest(".drag-item-list") &&
    draggedItem.closest(".drag-item-list").id !== this.id
  ) {
    nextColumn.appendChild(draggedItem);
    const timer = setTimeout(() => {
      this.classList.remove("over");
      clearTimeout(timer);
    }, 300);

    rebuildArrays();
  }
}

// dragEnter function
function dragEnter(e) {
  e.stopPropagation();
  //checks drag item for drag leave event to prevent blinking
  isDragItem = e.target.classList.contains("drag-item");
  //prevent adding of the color to background for container where we start dragging
  if (
    draggedItem.closest(".drag-item-list") &&
    draggedItem.closest(".drag-item-list").id !== this.id
  ) {
    nextColumn = this;
    this.classList.add("over");
  }
}

//dragLeave function
function dragLeave(e) {
  e.stopPropagation();
  if (!isDragItem) {
    const timer = setTimeout(() => {
      this.classList.remove("over");
      clearTimeout(timer);
    }, 300);
  }
}

//on load
itemLists.forEach((item) => {
  item.addEventListener("dragover", allowDrop);
  item.addEventListener("drop", drop);
  item.addEventListener("dragenter", dragEnter);
  item.addEventListener("dragleave", dragLeave);
});

addBtns.forEach((btn, idx) =>
  btn.addEventListener("click", () => showInputBox(idx))
);
saveItemBtns.forEach((btn, idx) =>
  btn.addEventListener("click", (e) => hideInputBox(idx, e))
);

updateDOM();
