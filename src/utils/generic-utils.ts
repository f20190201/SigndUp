import { getDomain } from "tldts";

export function detectSite(callback: (hostname: string) => void) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        const url = tab?.url ?? "";

        if (!url || url.startsWith("chrome")) {
            callback("unknown");
            return;
        }

        try {
            const hostname = getDomain(url) || new URL(url).hostname;
            callback(hostname);
        } catch {
            callback("unknown");
        }
    });
}