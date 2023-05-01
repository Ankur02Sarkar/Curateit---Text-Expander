const urlParams = new URLSearchParams(window.location.search);
const selectedText = urlParams.get("selectedText");

document.getElementById("expansion").value = selectedText;

document.getElementById("save").addEventListener("click", () => {
  const shortcut = document.getElementById("shortcut").value;
  const expansion = document.getElementById("expansion").value;

  if (!shortcut || !expansion) {
    alert("Both shortcut and expansion are required.");
    return;
  }

  chrome.storage.local.set({ ["curateit_text_" + shortcut]: expansion }, () => {
    alert("Shortcut saved successfully.");
    window.close();
  });
});
