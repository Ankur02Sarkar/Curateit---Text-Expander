document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader");
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
          titleDiv.innerHTML = `Form Data for <span class="formsSpan"> ${shortcut} </span>`;
          passedShortcut.value = `${formData}`;
        } else {
          passedShortcut.value = `No form data found for shortcut: ${shortcut}`;
        }
        loader.style.display = "none"; // Hide loader when data is loaded
      });
    } else {
      passedShortcut.value = "Chrome storage API not available.";
      console.warn("Chrome storage API not available.");
      loader.style.display = "none"; // Hide loader when data is loaded
    }
  }
});

document.getElementById("insert-btn").addEventListener("click", () => {
  const formData = document.getElementById("passed-shortcut").value;
  window.parent.postMessage(
    {
      action: "insertFormData",
      data: formData,
    },
    "*"
  );
  console.log("sent from popup - ", formData);

  // Post a 'close' event to the parent window
  window.parent.postMessage({ action: "close" }, "*");
});
