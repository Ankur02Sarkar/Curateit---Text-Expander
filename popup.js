const searchInput = document.getElementById("search");
const resultsList = document.getElementById("results");
const expansionForm = document.getElementById("expansion-form");
const expansionKeyInput = document.getElementById("expansion-key");
const expansionValueInput = document.getElementById("expansion-value");
const saveExpansionButton = document.getElementById("save-expansion");
const cancelExpansionButton = document.getElementById("cancel-expansion");

let currentEditingKey = null;

async function filterExpansions(query) {
  const expansions = await window.expansionsManager.getExpansions();
  return Object.entries(expansions).filter(
    ([key, value]) =>
      key.toLowerCase().includes(query.toLowerCase()) ||
      value.toLowerCase().includes(query.toLowerCase())
  );
}

async function updateResultsList(filteredExpansions) {
  resultsList.innerHTML = "";

  filteredExpansions.forEach(([key, value]) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `<span>${key}</span> ${value}`;
    listItem.onclick = () => {
      currentEditingKey = key;
      expansionKeyInput.value = key;
      expansionValueInput.value = value;
      expansionForm.style.display = "block";
    };
    resultsList.appendChild(listItem);
  });
}

searchInput.addEventListener("input", async (event) => {
  const query = event.target.value.trim();
  const filteredExpansions = await filterExpansions(query);
  await updateResultsList(filteredExpansions);
});

expansionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const key = expansionKeyInput.value.trim();
  const value = expansionValueInput.value.trim();

  if (currentEditingKey) {
    await window.expansionsManager.editExpansion(currentEditingKey, key, value);
  } else {
    await window.expansionsManager.addExpansion(key, value);
  }

  expansionForm.style.display = "none";
  expansionKeyInput.value = "";
  expansionValueInput.value = "";
  currentEditingKey = null;
  await updateResultsList(await filterExpansions(""));
});

cancelExpansionButton.addEventListener("click", () => {
  expansionForm.style.display = "none";
  expansionKeyInput.value = "";
  expansionValueInput.value = "";
  currentEditingKey = null;
});

// Initialize the results list with all expansions
(async () => {
  await updateResultsList(await filterExpansions(""));
})();
