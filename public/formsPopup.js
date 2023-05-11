document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader");
  const urlParams = new URLSearchParams(window.location.search);
  const shortcut = urlParams.get("shortcut");

  let key;

  if (shortcut) {
    const passedShortcut = document.getElementById("passed-shortcut");
    const formPopupDiv = document.getElementById("form-popup-div");
    const formsDiv = document.querySelector(".formsDiv");

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
            // Create a wrapper div for input fields
            const inputWrapper = document.createElement("div");
            inputWrapper.id = "input-wrapper";

            variableMatches.forEach((variable) => {
              // Skip if we've already created an input field for this variable
              if (variableValues.hasOwnProperty(variable)) {
                return;
              }

              // Set a default value for the variable
              const defaultValue = variable;
              variableValues[variable] = defaultValue;

              // Create a new input field for the variable
              const inputField = document.createElement("input");
              inputField.type = "text";
              inputField.value = defaultValue;
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

              // Append input field to the wrapper div
              inputWrapper.appendChild(inputField);
            });

            // Append the wrapper div to formsDiv
            formsDiv.appendChild(inputWrapper);
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
