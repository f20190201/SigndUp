import { findAndPopulateCredsFields } from "./Helpers";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "GET_CURRENT_SITE") {
        sendResponse({ hostname: window.location.hostname });
    } else if (message.type === "AUTOFILL") {
        const { email, password } = message.payload;
        const result = findAndPopulateCredsFields(email, password);
        sendResponse(result);
    }
    return true;
});
