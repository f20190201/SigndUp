import { useState } from "react";
import { deleteInboxFromDb, getSavedInboxesFromDb } from "../utils/supabase-utils";
import { createInbox, listenForOTP, type Inbox } from "../lib/mail";
import { decryptPassword } from "../lib/crypto";
import { type ToastType } from "./useToast";
import type { AuthState } from "../utils/generic-utils";

export type SavedInbox = {
    id: string;
    email_address: string;
    password: string;
    created_at: string;
    inbox_id: string;
};

export type OTPState = "idle" | "waiting" | "received" | "no_otp";

export type SavedInboxFetchSource = "generic" | "fromDelete";

export function useInbox(userId: string, websiteUrl: string, authState: AuthState) {
    const [savedInboxes, setSavedInboxes] = useState<SavedInbox[]>([]);
    const [activeInbox, setActiveInbox] = useState<SavedInbox | null>(null);
    const [otp, setOtp] = useState<{ otp: string, timestamp: string } | null>(null);
    const [rawMessage, setRawMessage] = useState<string | null>(null);
    const [otpState, setOtpState] = useState<OTPState>("idle");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stopListener, setStopListener] = useState<(() => void) | null>(null);

    async function fetchSavedInboxes(src: SavedInboxFetchSource = "generic") {
        if (src === "generic") setLoading(true);
        const { data, error } = await getSavedInboxesFromDb(userId, websiteUrl);

        if (error) {
            setError("Failed to load saved inboxes.");
            return;
        }

        setSavedInboxes(data ?? []);

        if (data && data.length > 0) {
            setActiveInbox(data[0]);
            stopListener?.();
            startListening({
                id: data[0].id,
                email: data[0].email_address,
                password: decryptPassword(data[0].password, userId),
            });
        } else if (src !== "fromDelete") {
            setActiveInbox(null)
            setOtp(null);
            setOtpState("idle");
        }
        setLoading(false);
    }

    async function generateNewInbox() {
        setLoading(true);
        setError(null);

        try {
            stopListener?.();
            const inbox = await createInbox(websiteUrl, authState);
            let savedInbox: SavedInbox = { id: inbox.id, email_address: inbox.email, password: inbox.password, created_at: new Date().toISOString(), inbox_id: inbox.id }

            setSavedInboxes((prev) => [savedInbox, ...prev]);
            setActiveInbox(savedInbox);

            await startListening({
                id: inbox.id,
                email: inbox.email,
                password: inbox.password
            });
        } catch (err) {
            setError("Failed to generate inbox. Try again.");
        } finally {
            setLoading(false);
        }
    }

    async function selectInbox(inbox: SavedInbox) {
        setActiveInbox(inbox);
        setOtp(null);
        setOtpState("idle");
        stopListener?.();
        await startListening({
            id: inbox.id,
            email: inbox.email_address,
            password: decryptPassword(inbox.password, userId),
        });
    }

    async function startListening(inbox: Inbox) {
        setOtpState("waiting");
        setOtp(null);
        setRawMessage(null);

        const stop = await listenForOTP(
            inbox,
            (receivedOtp, raw, timestamp) => {
                setOtp({ otp: receivedOtp, timestamp });
                setRawMessage(raw);
                setOtpState("received");
            },
            (raw, timestamp) => {
                setRawMessage(raw);
                setOtpState("no_otp");
            },
            (err) => {
                console.error("Poll error:", err);
                setOtpState("idle");
            },
            authState
        );

        setStopListener(() => stop);
    }

    async function deleteInbox(emailId: string, showToast: (message: string, type: ToastType) => void) {
        setLoading(true);
        const res = await deleteInboxFromDb(websiteUrl, emailId, authState);
        if (res.status !== 200) {
            setError("Failed to delete inbox. Try again.");
            showToast("Failed to delete inbox. Try again.", "error");
            setLoading(false);
            return;
        }
        fetchSavedInboxes("fromDelete");
        showToast("Inbox deleted successfully", "success");
    }

    function refresh() {
        if (activeInbox) {
            stopListener?.();
            startListening({
                id: activeInbox.id,
                email: activeInbox.email_address,
                password: decryptPassword(activeInbox.password, userId),
            });
        }
    }

    return {
        savedInboxes,
        activeInbox,
        otp: otp?.otp || null,
        rawMessage,
        otpState,
        timestamp: otp?.timestamp || null,
        loading,
        error,
        fetchSavedInboxes,
        generateNewInbox,
        selectInbox,
        refresh,
        deleteInbox,
        stopListener
    };
}