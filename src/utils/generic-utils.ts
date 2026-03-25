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

export function validateLocalStorageInfo(validSessionCallback: (sessionStatus: Record<string, string>) => void, invalidSessionCallback: () => void) {
    chrome.storage.local.get("sessionStatus", (result: Record<string, Record<string, string>>) => {
        if (result.sessionStatus?.userId && Number(result.sessionStatus?.expiresAt) > Date.now()) {
            validSessionCallback(result.sessionStatus);
        } else {
            invalidSessionCallback();
        }
    })
}