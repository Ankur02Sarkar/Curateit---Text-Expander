const STORAGE_PREFIX = "curateit_";
const VARIABLE_PLACEHOLDER = "{*}";

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  chrome.storage.local.get(null, (items) => {
    const savedShortcuts = Object.entries(items)
      .filter(([key]) => key.startsWith(STORAGE_PREFIX))
      .map(([key, value]) => ({
        text: key.replace(STORAGE_PREFIX, ""),
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
  chrome.storage.local.get(STORAGE_PREFIX + shortcutText, (result) => {
    let url = result[STORAGE_PREFIX + shortcutText];
    if (url) {
      url = url.replace(VARIABLE_PLACEHOLDER, variableValue);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.update(tabs[0].id, { url });
      });
    }
  });
});
