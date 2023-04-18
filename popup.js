const searchInput = document.getElementById("search");
const resultsList = document.getElementById("results");

function filterExpansions(query) {
  return Object.entries(window.expansions).filter(
    ([key, value]) =>
      key.toLowerCase().includes(query.toLowerCase()) ||
      value.toLowerCase().includes(query.toLowerCase())
  );
}

function updateResultsList(filteredExpansions) {
  resultsList.innerHTML = "";

  filteredExpansions.forEach(([key, value]) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `<span>${key}</span> ${value}`;
    resultsList.appendChild(listItem);
  });
}

searchInput.addEventListener("input", (event) => {
  const query = event.target.value.trim();
  const filteredExpansions = filterExpansions(query);
  updateResultsList(filteredExpansions);
});

// Initialize the results list with all expansions
updateResultsList(Object.entries(window.expansions));
