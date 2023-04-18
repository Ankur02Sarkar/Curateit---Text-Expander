const expansions = window.expansions;

// Inject CSS for suggestion box
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

function expandText(text) {
  return text.replace(/:\w+/g, (match) => expansions[match] || match);
}

function handleSite(target, originalText, expandedText) {
  if (originalText !== expandedText) {
    if (target.value !== undefined) {
      target.value = expandedText;
    } else {
      target.textContent = expandedText;
    }
  }
}

function getTextBeforeCaret(contentEditableElement) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const clonedRange = range.cloneRange();
  clonedRange.selectNodeContents(contentEditableElement);
  clonedRange.setEnd(range.startContainer, range.startOffset);
  return clonedRange.toString();
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

  const host = window.location.hostname;

  const originalText = target.value || target.textContent;
  const expandedText = expandText(originalText);

  handleSite(target, originalText, expandedText);
}

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

  let cursorPosition;
  let textBeforeCursor;

  if (tagName === "input" || tagName === "textarea") {
    cursorPosition = target.selectionStart;
    textBeforeCursor = target.value.substring(0, cursorPosition);
  } else {
    textBeforeCursor = getTextBeforeCaret(target);
  }

  const lastColonIndex = textBeforeCursor.lastIndexOf(":");

  if (lastColonIndex === -1) {
    suggestionBox.style.display = "none";
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
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
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
      const range = window.getSelection().getRangeAt(0);
      const selectedText = range.toString();
      const startOffset =
        range.startOffset - (selectedText.length - lastColonIndex);
      const endOffset = range.startOffset;
      range.setStart(range.startContainer, startOffset);
      range.setEnd(range.startContainer, endOffset);
      range.deleteContents();
      const expandedNode = document.createTextNode(
        expansions[selectedExpansion]
      );
      range.insertNode(expandedNode);
      range.setStartAfter(expandedNode);
      range.collapse(true);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      suggestionBox.style.display = "none";
    }
  };
}

function createSuggestionBox() {
  const suggestionBox = document.createElement("div");
  suggestionBox.id = "suggestion-box";
  suggestionBox.classList.add("suggestion-box");
  document.body.appendChild(suggestionBox);
  return suggestionBox;
}

const suggestionBox = createSuggestionBox();

document.addEventListener("input", handleInputEvent);
document.addEventListener("input", showSuggestions);
document.addEventListener("click", (event) => {
  if (!event.target.closest("#suggestion-box")) {
    suggestionBox.style.display = "none";
  }
});

/*

display block;
left 603
top 215 --- 391 

*/
