document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const shortcut = urlParams.get("shortcut");

  if (shortcut) {
    const passedShortcut = document.getElementById("passed-shortcut");
    const titleDiv = document.getElementById("form-popup-div");

    // Fetch the form data associated with the shortcut from Chrome storage
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      const STORAGE_FORM_PREFIX = "curateit_form_";
      const key = STORAGE_FORM_PREFIX + shortcut;

      window.chrome.storage.local.get(key, (items) => {
        const formData = items[key];

        if (formData) {
          // Display the form data in the passedShortcut element
          titleDiv.textContent = `Form Data for ${shortcut}:`;
          passedShortcut.value = `${formData}`;
        } else {
          passedShortcut.value = `No form data found for shortcut: ${shortcut}`;
        }
      });
    } else {
      passedShortcut.value = "Chrome storage API not available.";
      console.warn("Chrome storage API not available.");
    }
  }
});

// ...
document.getElementById("insert-btn").addEventListener("click", () => {
  const formData = document.getElementById("passed-shortcut").value;
  const port = chrome.runtime.connect({ name: "popupToContent" });
  port.postMessage({ action: "insertFormData", data: formData });
});
