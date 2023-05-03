const STORAGE_TEXT_PREFIX = "curateit_text_";
const STORAGE_FORM_PREFIX = "curateit_form_";

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
    font-family: Arial, sans-serif;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }

  .suggestion-item {
    cursor: pointer;
    padding: 2px 4px;
  }

  .suggestion-item:hover {
    background-color: #eee;
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
    return "div";
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
  const tagName = target.tagName.toLowerCase();

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
      openFormsPopup(match[1]);
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

    suggestionBox.innerHTML = suggestions
      .map((suggestion) => `<div class="suggestion-item">${suggestion}</div>`)
      .join("");

    suggestionBox.onclick = (e) => {
      if (e.target.classList.contains("suggestion-item")) {
        const selectedExpansion = e.target.textContent;

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
        suggestionBox.style.display = "none";
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

  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.style.border = "none";
  iframe.style.width = "400px";
  iframe.style.height = "600px";
  iframe.style.position = "absolute";
  iframe.style.left = "50%";
  iframe.style.top = "50%";
  iframe.style.transform = "translate(-50%, -50%)";

  overlay.appendChild(iframe);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });
}

// function openFormsPopup() {
//   const url = chrome.runtime.getURL("formsPopup.html");
//   createIframeOverlay(url);
// }

function openFormsPopup(val) {
  const shortcut = ":" + val;
  const storageKey = STORAGE_FORM_PREFIX + shortcut;

  if (window.chrome && window.chrome.storage) {
    window.chrome.storage.local.get(storageKey, (items) => {
      if (items[storageKey]) {
        const url = chrome.runtime.getURL(
          `formsPopup.html?shortcut=${encodeURIComponent(shortcut)}`
        );
        const popupWidth = 400;
        const popupHeight = 600;
        const left = window.innerWidth / 2 - popupWidth / 2;
        const top = window.innerHeight / 2 - popupHeight / 2;

        window.open(
          url,
          "_blank",
          `toolbar=no, 
          location=no, 
          directories=no, 
          status=no, 
          menubar=no, 
          scrollbars=no, 
          resizable=no, 
          copyhistory=no, 
          width=${popupWidth}, 
          height=${popupHeight}, 
          top=${top}, 
          left=${left}`
        );
      } else {
        console.log("No form found for the given shortcut.");
      }
    });
  } else {
    console.warn("window.chrome.storage.local is not available.");
  }
}

document.addEventListener("input", handleInputEvent);
document.addEventListener("input", showSuggestions);
document.addEventListener("click", (event) => {
  if (!event.target.closest("#suggestion-box")) {
    suggestionBox.style.display = "none";
  }
});
