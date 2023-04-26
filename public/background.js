const STORAGE_PREFIX = "custom_search_shortcut_";

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  chrome.storage.local.get(null, (items) => {
    const savedShortcuts = Object.entries(items)
      .filter(([key]) => key.startsWith(STORAGE_PREFIX))
      .map(([key, value]) => ({
        text: key.replace(STORAGE_PREFIX, ""),
        url: value,
      }));

    const suggestions = savedShortcuts
      .filter((shortcut) => !text || shortcut.text.startsWith(text))
      .map((shortcut) => ({
        content: shortcut.text,
        description: `<match>${shortcut.text}</match> - <url>${shortcut.url}</url>`,
      }));

    suggest(suggestions);
  });
});

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  chrome.storage.local.get(STORAGE_PREFIX + text, (result) => {
    const url = result[STORAGE_PREFIX + text];
    if (url) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.update(tabs[0].id, { url });
      });
    }
  });
});
