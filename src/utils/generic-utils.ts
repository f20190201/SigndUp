import { getDomain } from "tldts";
import { loginUser, addNewUserToDb, checkTokenValidity } from "./supabase-utils";
import type { Session, User, AuthError } from "@supabase/supabase-js";
import type { ToastType } from "../hooks/useToast";

export type AuthState =
    | { status: "loggedOut" }
    | { status: "loggedIn", dBUserId: string, loginUserId: string, authToken: string }
    | { status: "error"; message: string }
    | { status: "loading" }

type SessionStatus = {
    dBUserId: string;
    loginUserId: string;
    expiresAt: string;
    authToken: string;
}

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

export function validateLocalStorageInfo(validSessionCallback: (sessionStatus: SessionStatus) => void, invalidSessionCallback: () => void) {
    chrome.storage.session.get("sessionStatus", (result: Record<string, SessionStatus>) => {
        if (result.sessionStatus?.dBUserId && Number(result.sessionStatus?.expiresAt) > Date.now()) {
            checkTokenValidity(result.sessionStatus.authToken).then((res) => {
                if (res.data?.user !== null && res.data?.user?.id === result.sessionStatus?.dBUserId) {
                    validSessionCallback({ ...result.sessionStatus, expiresAt: String(Date.now() + 7 * 60 * 1000) });
                } else {
                    invalidSessionCallback();
                }
            }).catch(() => {
                invalidSessionCallback();
            });
        } else {
            invalidSessionCallback();
        }
    })
}

async function doesUserAlreadyExist(signUpUser: User | null, signUpSession: Session | null, signUpError: AuthError | null) {
    if (signUpUser === null && signUpSession === null && signUpError?.code === "user_already_exists") {
        return true;
    }
    return false;
}

export async function handleSignUpSignIn(loginUserId: string, password: string): Promise<AuthState> {

    const { data: { user: signUpUser, session: signUpSession }, error: signUpError } = await addNewUserToDb(loginUserId, password);

    if (await doesUserAlreadyExist(signUpUser, signUpSession, signUpError)) {
        const { data: { user, session }, error: _error } = await loginUser(loginUserId, password);
        if (user !== null && session !== null) {
            chrome.action.setBadgeText({ text: "" });
            return { status: "loggedIn", dBUserId: user.id, loginUserId: loginUserId, authToken: session.access_token };
        } else {
            return { status: "error", message: "Invalid password" };
        }
    } else {
        if (signUpUser !== null && signUpSession !== null) {
            chrome.action.setBadgeText({ text: "" });
            return { status: "loggedIn", dBUserId: signUpUser.id, loginUserId: loginUserId, authToken: signUpSession.access_token };
        } else {
            return { status: "error", message: "Failed to authenticate" };
        }
    }
}

export function isValidSession(authState: AuthState) {
    switch (authState.status) {
        case "loggedIn":
            return true;
        case "loggedOut":
            return false;
        case "error":
            return false;
    }
}

export function getValidDbUserId(authState: AuthState) {
    switch (authState.status) {
        case "loggedIn":
            return authState.dBUserId;
        case "loggedOut":
            return null;
        case "error":
            return null;
    }
}

export function setSessionStatus(authState: AuthState) {
    switch (authState.status) {
        case "loggedIn":
            const sessionStatus: SessionStatus = { dBUserId: authState.dBUserId, loginUserId: authState.loginUserId, expiresAt: String(Date.now() + 7 * 60 * 1000), authToken: authState.authToken };
            chrome.storage.session.set({ sessionStatus });
            break;
        case "loggedOut":
            chrome.storage.session.remove("sessionStatus");
            break;
        case "error":
            chrome.storage.session.remove("sessionStatus");
            break;
    }
}

export function generateStrongPassword(length = 10) {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()";

    const all = upper + lower + numbers + symbols;

    function getRandomChar(str: string) {
        const arr = new Uint32Array(1);
        crypto.getRandomValues(arr);
        return str[arr[0] % str.length];
    }

    let password = [
        getRandomChar(upper),
        getRandomChar(lower),
        getRandomChar(numbers),
        getRandomChar(symbols),
    ];

    for (let i = password.length; i < length; i++) {
        password.push(getRandomChar(all));
    }

    // Shuffle
    password = password.sort(() => Math.random() - 0.5);

    return password.join("");
}

export function sendMessageToContentScript(type: string, payload: any): Promise<{ result: string, message: string }> {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id!, {
                type: type,
                payload: payload
            }, (response) => {
                resolve(response);
            });
        });
    });
}

export function clearDataOnLogout(setAuthState: (val: AuthState) => void, stopListener: (() => void) | null, showToast: (msg: string, type?: ToastType) => void) {
    chrome.alarms.clear("sessionTimeout");
    setAuthState({ status: "loggedOut" });
    chrome.storage.session.remove("sessionStatus");
    stopListener?.()
    showToast("Logged out successfully", "success");
}