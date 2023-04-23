chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  if (text === "me") {
    const url = "https://ankursarkar.vercel.app";
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.update(tabs[0].id, { url });
    });
  }
});
