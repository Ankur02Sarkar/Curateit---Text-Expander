const STORAGE_TEXT_PREFIX = "curateit_text_";

const urlParams = new URLSearchParams(window.location.search);
const selectedText = urlParams.get("selectedText");

document.getElementById("expansion").value = selectedText;

document.getElementById("save").addEventListener("click", () => {
  const shortcut = document.getElementById("shortcut").value.trim();
  const expansion = document.getElementById("expansion").value.trim();

  if (!shortcut || !expansion) {
    alert("Both shortcut and expansion are required.");
    return;
  }

  const formattedShortcut = shortcut.startsWith(":")
    ? shortcut
    : `:${shortcut}`;
  chrome.storage.local.set(
    { [STORAGE_TEXT_PREFIX + formattedShortcut]: expansion },
    () => {
      alert("Shortcut saved successfully.");
      window.close();
    }
  );
});
