document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const shortcut = urlParams.get("shortcut");

  if (shortcut) {
    const passedShortcut = document.getElementById("passed-shortcut");

    // Fetch the form data associated with the shortcut from Chrome storage
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      const STORAGE_FORM_PREFIX = "curateit_form_";
      const key = STORAGE_FORM_PREFIX + shortcut;

      window.chrome.storage.local.get(key, (items) => {
        const formData = items[key];

        if (formData) {
          // Display the form data in the passedShortcut element
          passedShortcut.textContent = `Form Data for ${shortcut}: ${formData}`;
        } else {
          passedShortcut.textContent = `No form data found for shortcut: ${shortcut}`;
        }
      });
    } else {
      passedShortcut.textContent = "Chrome storage API not available.";
      console.warn("Chrome storage API not available.");
    }
  }
});
