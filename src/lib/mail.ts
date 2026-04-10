import { extractOTP } from "./otp";
import { type AuthState, getVisitorIdFromAuthState } from "../utils/generic-utils";
import DOMPurify from "dompurify";
import { maxPollCount } from "./constants";

export type Inbox = {
    id: string;
    email: string;
    password: string;
};

export async function createInbox(websiteUrl: string, authState: AuthState): Promise<Inbox> {
    console.log("authh", authState);
    const visitorId = getVisitorIdFromAuthState(authState);

    const res = await fetch(`${import.meta.env.VITE_WORKER_URL}/functions/v1/generate-inbox`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authState.status === "loggedIn" ? authState.authToken : undefined}` },
        body: JSON.stringify({ websiteUrl, visitorId }),
    });

    switch (res.status) {
        case (200): {
            const account = await res.json();
            return {
                id: account.id,
                email: account.emailId,
                password: account.password,
            };
        }
        case (401): {
            throw new Error("Unauthorized");
        }
        case (404): {
            throw new Error("Not Found");
        }
        case (429): {
            const errText = (await res.json()).error;
            throw new Error(errText);
        }
        case (500): {
            throw new Error("Internal Server Error");
        }
        default: {
            throw new Error("Something went wrong");
        }
    }

    // const account = await res.json();

    // return {
    //     id: account.id,
    //     email: account.emailId,
    //     password: account.password,
    // };
}

function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html);
}

export async function listenForOTP(
    inbox: Inbox,
    onOTP: (otp: string, raw: string, timestamp: string) => void,
    onNoOTP: (raw: string, timestamp: string, isPollingTimedOut: boolean) => void,
    onError: (err: unknown) => void,
    authState: AuthState
): Promise<() => void> {
    const controller = new AbortController();
    const { signal } = controller;
    let lastMessageId: string | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let pollCount = 0;

    async function poll() {
        if (signal.aborted || pollCount === maxPollCount) {
            controller.abort();
            if (pollCount === maxPollCount) onNoOTP("", "", true);
            return;
        };

        try {
            const listRes = await fetch(`${import.meta.env.VITE_WORKER_URL}/messages?inbox=${inbox.email}`, {
                headers: { Authorization: `Bearer ${authState.status === "loggedIn" ? authState.authToken : undefined}`, apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
                signal,
            });

            const messages = await listRes.json();

            if (messages && messages.length > 0) {
                const latest = messages[0];

                if (latest.id !== lastMessageId) {
                    lastMessageId = latest.id;
                    const msg = latest;
                    const dirtyText = (msg.subject || "") + (msg.body || "") + (msg.rawMessage || "");
                    const rawMessage = sanitizeHtml(msg.rawMessage || "");
                    const otp = extractOTP(dirtyText);

                    if (otp) {
                        onOTP(otp, rawMessage, msg.receivedAt);

                    } else {
                        onNoOTP(rawMessage, msg.receivedAt, false);
                    }
                    controller.abort();
                    return;
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error && err.name === "AbortError") return;
            onError(err);
        }
        pollCount++;
        if (!signal.aborted) {
            timeoutId = setTimeout(poll, 3000);
        }
    }

    poll();

    return () => {
        controller.abort();
        if (timeoutId) clearTimeout(timeoutId);
    };
}