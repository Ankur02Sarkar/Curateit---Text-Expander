const STORAGE_TEXT_PREFIX = "curateit_text_";
const STORAGE_FORM_PREFIX = "curateit_form_";

let currTargetForms = null;
let orgTextForm = null;

function injectStyles(css) {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
}

injectStyles(`
  .suggestion-box {
    position: absolute;
    z-index: 9999999;
    background-color: white;
    color: black;
    border: 1px solid #ccc;
    font-family: "Segoe UI", Arial, sans-serif;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    max-height: 170px;
    overflow: auto;
    display: !grid;
    gap: 10px;
    border-radius: 5px;
  }

  .suggestion-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 2px 4px;
    height: 100%;
    border-bottom: 1px solid #ccc;
    font-size: 0.9em;
    column-gap: 20px;
  }

  .suggestion-item:last-child {
    border-bottom: none;
  }

  .suggestion-item:hover {
    background-color: #f0f0f0;
  }

  .delete-icon {
    width: 16px;
    height: 16px;
    background-image: url('https://img.icons8.com/?size=512&id=99961&format=png');
    background-size: cover;
    border: none;
    cursor: pointer;
    outline: none;
  }

`);

function fetchExpansions(callback) {
  if (window.chrome && window.chrome.storage) {
    window.chrome.storage.local.get(null, (items) => {
      const expansions = Object.fromEntries(
        Object.entries(items).filter(([key]) =>
          key.startsWith(STORAGE_TEXT_PREFIX)
        )
      );
      const formattedExpansions = Object.fromEntries(
        Object.entries(expansions).map(([key, value]) => [
          key.replace(STORAGE_TEXT_PREFIX, ""),
          value,
        ])
      );
      callback(formattedExpansions);
    });
  } else {
    console.warn("window.chrome.storage.local is not available.");
    callback({});
  }
}

function expandText(text, expansions) {
  return text.replace(/:[^\s]+/g, (match) => expansions[match] || match);
}
function getTagForCurrentWebsite() {
  const currentUrl = window.location.href;

  if (currentUrl.includes("https://www.linkedin.com/")) {
    return "p";
  } else if (currentUrl.includes("https://mail.google.com/")) {
    return "div";
  } else {
    return "span";
  }
}

function convertToHtml(text) {
  const lines = text.split("\n");
  let html = "";
  const tag = getTagForCurrentWebsite();
  for (const line of lines) {
    if (line === "") {
      html += `<${tag}><br /></${tag}>`;
    } else {
      html += `<${tag}>${line}</${tag}>`;
    }
  }
  return html;
}

function handleSite(target, originalText, expandedText) {
  if (originalText !== expandedText) {
    if (target.value !== undefined) {
      target.value = expandedText;
    } else {
      const formattedHtml = convertToHtml(expandedText);
      target.innerHTML = formattedHtml;
    }
  }
}

function handleInputEvent(event) {
  const target = event.target;
  console.log("Target is : ", target);
  const tagName = target.tagName.toLowerCase();
  console.log("tag Name is : ", tagName);
  if (
    tagName !== "input" &&
    tagName !== "textarea" &&
    !target.isContentEditable
  ) {
    return;
  }

  fetchExpansions((expansions) => {
    const originalText = target.value || target.textContent;
    const expandedText = expandText(originalText, expansions);
    handleSite(target, originalText, expandedText);
  });
}
function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
}

function createSuggestionBox() {
  const suggestionBox = document.createElement("div");
  suggestionBox.id = "suggestion-box";
  suggestionBox.classList.add("suggestion-box");
  document.body.appendChild(suggestionBox);
  return suggestionBox;
}

const suggestionBox = createSuggestionBox();

function showSuggestions(event) {
  const target = event.target;
  const tagName = target.tagName.toLowerCase();

  if (
    tagName !== "input" &&
    tagName !== "textarea" &&
    !target.isContentEditable
  ) {
    return;
  }

  fetchExpansions((expansions) => {
    let cursorPosition;
    if (target.isContentEditable) {
      const selection = window.getSelection();
      if (selection.rangeCount) {
        const range = selection.getRangeAt(0);
        const tempRange = range.cloneRange();
        tempRange.selectNodeContents(target);
        tempRange.setEnd(range.endContainer, range.endOffset);
        cursorPosition = tempRange.toString().length;
      } else {
        return;
      }
    } else {
      cursorPosition = target.selectionStart;
    }

    const textBeforeCursor = target.value
      ? target.value.substring(0, cursorPosition)
      : target.textContent.substring(0, cursorPosition);
    const lastColonIndex = textBeforeCursor.lastIndexOf(":");

    if (lastColonIndex === -1) {
      suggestionBox.style.display = "none";
      return;
    }
    const formsTriggerPattern = /::forms\/(.+)/;
    const match = textBeforeCursor.match(formsTriggerPattern);

    if (match) {
      currTargetForms = target;
      orgTextForm = currTargetForms.value || currTargetForms.textContent;
      openFormsPopup(match[1], orgTextForm);
      return;
    }

    const typedText = textBeforeCursor.substring(lastColonIndex + 1);
    const suggestions = Object.keys(expansions).filter((key) =>
      key.startsWith(`:${typedText}`)
    );

    if (suggestions.length === 0) {
      suggestionBox.style.display = "none";
      return;
    }

    const targetRect = target.getBoundingClientRect();
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    suggestionBox.style.display = "block";
    suggestionBox.style.left = `${targetRect.left + scrollLeft}px`;

    if (tagName === "input" || tagName === "textarea") {
      suggestionBox.style.top = `${
        targetRect.top + targetRect.height + scrollTop
      }px`;
    } else {
      const range = window.getSelection().getRangeAt(0);
      const rangeRect = range.getBoundingClientRect();
      suggestionBox.style.top = `${
        rangeRect.top + rangeRect.height + scrollTop
      }px`;
    }

    // Update the suggestion-item template to include a delete button
    suggestionBox.innerHTML = suggestions
      .map((suggestion) => {
        // const truncatedExpansion = truncateText(expansions[suggestion], 30); // change the number of chars to be displayed
        const truncatedExpansion = expansions[suggestion];
        return `<div class="suggestion-item">
        <div class="itemWrapper">
          <div>${suggestion}</div>
          <div style="font-size: 0.8em; color: #777; max-width: 80px; max-height: 18px; overflow: hidden;">${truncatedExpansion}</div>
        </div>
          <button class="delete-suggestion delete-icon" data-key="${suggestion}"></button>
        </div>`;
      })
      .join("");

    // Add a function to remove the expansion from the storage
    function removeExpansion(key) {
      if (window.chrome && window.chrome.storage) {
        window.chrome.storage.local.remove(key, () => {
          console.log(`Removed expansion: ${key}`);
        });
      } else {
        console.warn("window.chrome.storage.local is not available.");
      }
    }

    // Update the suggestionBox.onclick function to ignore clicks on the delete button
    suggestionBox.onclick = (e) => {
      console.log("e : ", e.target);
      if (e.target.classList.contains("suggestion-item")) {
        const selectedExpansion = e.target.textContent;
        console.log("sel exp : ", selectedExpansion);
        const shortcut = e.target.children[0].children[0].textContent; // Assuming the shortcut is in the first div of the suggestion item

        console.log(`On Click Shortcut: ${shortcut}`);
        // console.log(`On Click Expansion: ${expansions[selectedExpansion]}`);
        console.log(
          `On Click Expansion: ${e.target.children[0].children[1].textContent}`
        );
        console.log(`On Click Current target: `, target); // Assuming target is in scope
        const targetText = target.value || target.textContent;
        const expanedtxt = e.target.children[0].children[1].textContent;
        console.log("Target Text : ", targetText);

        if (target.isContentEditable) {
          const range = window.getSelection().getRangeAt(0);
          range.setStart(range.endContainer, lastColonIndex);
          range.deleteContents();
          range.insertNode(
            document.createTextNode(expansions[selectedExpansion])
          );
          range.collapse(false);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          target.setRangeText(
            expansions[selectedExpansion],
            lastColonIndex,
            cursorPosition,
            "end"
          );
        }
        handleSite(target, targetText, expanedtxt);

        suggestionBox.style.display = "none";
      } else if (e.target.classList.contains("delete-suggestion")) {
        e.stopPropagation(); // Prevent triggering the suggestion-item click event
        const key = e.target.dataset.key;
        removeExpansion(STORAGE_TEXT_PREFIX + key);
        e.target.parentElement.style.display = "none";
      }
    };
  });
}
  
function createIframeOverlay(url) {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.zIndex = "9999999";
  overlay.id = "overlay"; // Set an id for later reference

  // Create a loader
  const loader = document.createElement("div");
  loader.id = "loader";
  loader.className = "loader";
  overlay.appendChild(loader);

  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.style.border = "none";
  iframe.style.width = "80%";
  iframe.style.height = "70%";
  iframe.style.position = "absolute";
  iframe.style.left = "50%";
  iframe.style.top = "50%";
  iframe.style.transform = "translate(-50%, -50%)";

  iframe.onload = function () {
    document.getElementById("loader").style.display = "none";
  };

  overlay.appendChild(iframe);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });
}

function openFormsPopup(val, currTargetForms, orgTextForm) {
  const shortcut = ":" + val;
  const storageKey = STORAGE_FORM_PREFIX + shortcut;

  if (window.chrome && window.chrome.storage) {
    window.chrome.storage.local.get(storageKey, (items) => {
      if (items[storageKey]) {
        const url = chrome.runtime.getURL(
          `formsPopup.html?shortcut=${encodeURIComponent(
            shortcut
          )}&orgTextForm=${encodeURIComponent(orgTextForm)}`
        );
        createIframeOverlay(url);
      } else {
        console.log("No form found for the given shortcut.");
      }
    });
  } else {
    console.warn("window.chrome.storage.local is not available.");
  }
}

window.addEventListener("message", function (event) {
  if (event.data.action === "close") {
    document.getElementById("overlay").remove();
  }
});

document.addEventListener("input", handleInputEvent);
document.addEventListener("input", showSuggestions);
document.addEventListener("click", (event) => {
  if (!event.target.closest("#suggestion-box")) {
    suggestionBox.style.display = "none";
  }
});

function handleMessage(request, sender, sendResponse) {
  if (request.action === "insertFormData") {
    console.log(request.data);
  }
}

chrome.runtime.onMessage.addListener(handleMessage);

window.addEventListener("message", (event) => {
  if (event.data.action === "insertFormData") {
    const formData = event.data.data;
    handleSite(currTargetForms, orgTextForm, formData);
  }
});
