const STORAGE_LINKS_PREFIX = "curateit_links_";
const VARIABLE_PLACEHOLDER = /{([^}]+)}/g;

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveAsShortcut",
    title: "Save as Shortcut",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "saveAsShortcut") {
    const selectedText = info.selectionText;
    chrome.windows.create({
      url:
        chrome.runtime.getURL("shortcutPopup.html") +
        `?selectedText=${encodeURIComponent(selectedText)}`,
      type: "popup",
      width: 600,
      height: 320,
    });
  }
});

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  chrome.storage.local.get(null, (items) => {
    const savedShortcuts = Object.entries(items)
      .filter(([key]) => key.startsWith(STORAGE_LINKS_PREFIX))
      .map(([key, value]) => ({
        text: key.replace(STORAGE_LINKS_PREFIX, ""),
        url: value,
      }));

    const suggestions = savedShortcuts
      .filter(
        (shortcut) =>
          !text || shortcut.text.split("/")[0].startsWith(text.split("/")[0])
      )
      .map((shortcut) => ({
        content: shortcut.text,
        description: `<match>${shortcut.text}</match> - <url>${shortcut.url}</url>`,
      }));

    suggest(suggestions);
  });
});

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  const [shortcutText, ...rest] = text.split("/");
  const variableValue = rest.join("/");
  chrome.storage.local.get(STORAGE_LINKS_PREFIX + shortcutText, (result) => {
    let url = result[STORAGE_LINKS_PREFIX + shortcutText];
    if (url) {
      url = url.replace(VARIABLE_PLACEHOLDER, (match, variable) => {
        return variableValue;
      });
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.update(tabs[0].id, { url });
      });
    }
  });
});
