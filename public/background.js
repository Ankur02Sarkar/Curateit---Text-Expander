const STORAGE_PREFIX = "custom_search_shortcut_";

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  chrome.storage.local.get(STORAGE_PREFIX + text, (result) => {
    const url = result[STORAGE_PREFIX + text];
    if (url) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.update(tabs[0].id, { url });
      });
    }
  });
  // const url = localStorage.getItem(STORAGE_PREFIX + text);
  // if (url) {
  //   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //     chrome.tabs.update(tabs[0].id, { url });
  //   });
  // }
});
