import { getDomain } from "tldts";
import { loginUser, addNewUserToDb } from "./supabase-utils";
import type { Session, User, AuthError } from "@supabase/supabase-js";

export type AuthState =
    | { status: "loggedOut" }
    | { status: "loggedIn", dBUserId: string, loginUserId: string }
    | { status: "error"; message: string };

type SessionStatus = {
    dBUserId: string;
    loginUserId: string;
    expiresAt: string;
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
    chrome.storage.local.get("sessionStatus", (result: Record<string, SessionStatus>) => {
        if (result.sessionStatus?.dBUserId && Number(result.sessionStatus?.expiresAt) > Date.now()) {
            validSessionCallback(result.sessionStatus);
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
            return { status: "loggedIn", dBUserId: user.id, loginUserId: loginUserId };
        } else {
            return { status: "error", message: "Invalid password" };
        }
    } else {
        if (signUpUser !== null && signUpSession !== null) {
            return { status: "loggedIn", dBUserId: signUpUser.id, loginUserId: loginUserId };
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
            const sessionStatus: SessionStatus = { dBUserId: authState.dBUserId, loginUserId: authState.loginUserId, expiresAt: String(Date.now() + 7 * 60 * 1000) };
            chrome.storage.local.set({ sessionStatus });
            break;
        case "loggedOut":
            chrome.storage.local.remove("sessionStatus");
            break;
        case "error":
            chrome.storage.local.remove("sessionStatus");
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