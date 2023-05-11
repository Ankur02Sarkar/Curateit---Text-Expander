document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader");
  const urlParams = new URLSearchParams(window.location.search);
  const shortcut = urlParams.get("shortcut");

  let key;

  if (shortcut) {
    const passedShortcut = document.getElementById("passed-shortcut");
    const formPopupDiv = document.getElementById("form-popup-div");
    // const saveButton = document.getElementById("save-btn");

    let templateText = "";
    let variableValues = {};

    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      const STORAGE_FORM_PREFIX = "curateit_form_";
      key = STORAGE_FORM_PREFIX + shortcut;

      window.chrome.storage.local.get(key, (items) => {
        const formData = items[key];

        if (formData) {
          formPopupDiv.innerHTML = `Form Data for <span class="formsSpan"> ${shortcut} </span>`;
          templateText = formData;
          passedShortcut.value = `${formData}`;

          // Find variables in the form data and create an input field for each
          const variablePattern = /\{.*?\}/g;
          const variableMatches = formData.match(variablePattern);
          if (variableMatches) {
            variableMatches.forEach((variable) => {
              // Set a default value for the variable
              const defaultValue = variable;
              variableValues[variable] = defaultValue;

              // Create a new input field for the variable
              const inputField = document.createElement("input");
              inputField.type = "text";
              inputField.value = defaultValue; // Set the input field's initial value to the default value
              inputField.placeholder = `Enter value for ${variable} placeholder`;
              inputField.addEventListener("input", (event) => {
                variableValues[variable] = event.target.value;

                // Update text area value when user changes input field
                let replacedData = templateText;
                for (const [variable, value] of Object.entries(
                  variableValues
                )) {
                  replacedData = replacedData.split(variable).join(value);
                }
                passedShortcut.value = replacedData;
              });

              formPopupDiv.appendChild(inputField);
            });
          }
        } else {
          passedShortcut.value = `No form data found for shortcut: ${shortcut}`;
        }
        loader.style.display = "none";
      });
    } else {
      passedShortcut.value = "Chrome storage API not available.";
      console.warn("Chrome storage API not available.");
      loader.style.display = "none";
    }

    // saveButton.addEventListener("click", () => {
    //   // Update Chrome storage with the new form data
    //   const newFormData = passedShortcut.value;
    //   const storageItem = {};
    //   storageItem[key] = newFormData;
    //   window.chrome.storage.local.set(storageItem, () => {
    //     console.log("Form data saved.");
    //   });
    // });
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

  window.parent.postMessage({ action: "close" }, "*");
});
