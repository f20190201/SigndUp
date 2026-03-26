import { getDomain } from "tldts";
import { loginUser, addNewUserToDb } from "./supabase-utils";

export type AuthState =
    | { status: "loggedOut" }
    | { status: "loggedIn", dBUserId: string | undefined }
    | { status: "error"; message: string };

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

export async function handleSignUpSignIn(userId: string, password: string): Promise<AuthState> {

    const { data: { user, session }, error } = await addNewUserToDb(userId, password);
    if (user === null && session === null && error?.code === "user_already_exists") {

        const { data: { user, session }, error: _error } = await loginUser(userId, password);
        if (user !== null && session !== null) {
            return { status: "loggedIn", dBUserId: user.id };
        } else {
            return { status: "error", message: "Invalid password" };
        }
    } else {
        return { status: "loggedIn", dBUserId: user?.id };
    }
}