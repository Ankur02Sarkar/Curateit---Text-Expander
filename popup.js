document.getElementById("addExpansionBtn").addEventListener("click", () => {
  chrome.tabs.create({ url: "richText.html" });
});

const displayExpansions = () => {
  const expansionsList = document.getElementById("expansionsList");
  expansionsList.innerHTML = "";

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);

    const listItem = document.createElement("div");
    listItem.classList.add("listItem");

    const shortcut = document.createElement("p");
    shortcut.textContent = `Shortcut: ${key}`;

    const expansion = document.createElement("p");
    expansion.textContent = `Expansion: ${value}`;

    listItem.appendChild(shortcut);
    listItem.appendChild(expansion);
    expansionsList.appendChild(listItem);
  }
};

document.addEventListener("DOMContentLoaded", displayExpansions);
