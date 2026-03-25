import { extractOTP } from "./otp";

const BASE_URL = "https://api.mail.tm";

export type Inbox = {
    id: string;
    email: string;
    password: string;
};

async function getDomain(): Promise<string> {
    const res = await fetch(`${BASE_URL}/domains`);
    const data = await res.json();
    return data["hydra:member"][0].domain;
}

export async function createInbox(): Promise<Inbox> {
    const domain = await getDomain();
    const username = Math.random().toString(36).substring(2, 10);
    const password = Math.random().toString(36).substring(2, 18);
    const address = `${username}@${domain}`;

    const res = await fetch(`${BASE_URL}/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password }),
    });

    const account = await res.json();

    return {
        id: account.id,
        email: address,
        password,
    };
}

async function getToken(email: string, password: string): Promise<string> {
    const res = await fetch(`${BASE_URL}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: email, password }),
    });
    const data = await res.json();
    return data.token;
}

export async function listenForOTP(
    inbox: Inbox,
    onOTP: (otp: string, raw: string, timestamp: string) => void,
    onNoOTP: (raw: string, timestamp: string) => void,
    onError: (err: unknown) => void
): Promise<() => void> {
    const token = await getToken(inbox.email, inbox.password);
    const controller = new AbortController();
    const { signal } = controller;
    let lastMessageId: string | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    async function poll() {
        if (signal.aborted) return;

        try {
            const listRes = await fetch(`${BASE_URL}/messages?page=1`, {
                headers: { Authorization: `Bearer ${token}` },
                signal,
            });
            const data = await listRes.json();
            const messages = data["hydra:member"];

            if (messages && messages.length > 0) {
                const latest = messages[0];

                if (latest.id !== lastMessageId) {
                    lastMessageId = latest.id;

                    const msgRes = await fetch(`${BASE_URL}/messages/${latest.id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                        signal,
                    });
                    const msg = await msgRes.json();
                    const text = msg.text || "" + msg.intro || "" + msg.subject || "";
                    const otp = extractOTP(text);

                    if (otp) {
                        onOTP(otp, text, msg.createdAt);
                        controller.abort();
                        return;
                    } else {
                        // email arrived but no OTP detected
                        onNoOTP(text, msg.createdAt);
                    }
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error && err.name === "AbortError") return;
            onError(err);
        }

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