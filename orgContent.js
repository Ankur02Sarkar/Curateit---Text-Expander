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
z-index: 9999;
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

// Functions to handle text expansion for different websites
function handleSite(target, originalText, expandedText) {
    if (originalText !== expandedText) {
        if (target.value !== undefined) {
            target.value = expandedText;
        } else {
            target.textContent = expandedText;
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

    const host = window.location.hostname;

    const originalText = target.value || target.textContent;
    const expandedText = expandText(originalText);

    handleSite(target, originalText, expandedText);
}

// Functions for suggestion box
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

    const cursorPosition = target.selectionStart;
    const textBeforeCursor = target.value.substring(0, cursorPosition);
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
    suggestionBox.style.display = "block";
    suggestionBox.style.left = `${targetRect.left}px`;
    suggestionBox.style.top = `${targetRect.top + targetRect.height}px`;

    suggestionBox.innerHTML = suggestions
        .map((suggestion) => `<div class="suggestion-item">${suggestion}</div>`)
        .join("");

    suggestionBox.onclick = (e) => {
        if (e.target.classList.contains("suggestion-item")) {
            const selectedExpansion = e.target.textContent;
            target.setRangeText(
                expansions[selectedExpansion],
                lastColonIndex,
                cursorPosition,
                "end"
            );
            suggestionBox.style.display = "none";
        }
    };
}

document.addEventListener("input", handleInputEvent);
document.addEventListener("input", showSuggestions);
document.addEventListener("click", (event) => {
    if (!event.target.closest("#suggestion-box")) {
        suggestionBox.style.display = "none";
    }
});