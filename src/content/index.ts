chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "GET_CURRENT_SITE") {
        sendResponse({ hostname: window.location.hostname });
    }
});