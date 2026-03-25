import { useState } from "react";
import { addNewInboxToDb, deleteInboxFromDb, getSavedInboxesFromDb } from "../utils/supabase-utils";
import { createInbox, listenForOTP, type Inbox } from "../lib/mail";
import { decryptPassword, encryptPassword } from "../lib/crypto";

export type SavedInbox = {
    id: string;
    email_address: string;
    password: string;
    created_at: string;
    inbox_id: string;
};

export type OTPState = "idle" | "waiting" | "received" | "no_otp";

export function useInbox(userId: string, websiteUrl: string) {
    const [savedInboxes, setSavedInboxes] = useState<SavedInbox[]>([]);
    const [activeInbox, setActiveInbox] = useState<SavedInbox | null>(null);
    const [otp, setOtp] = useState<{ otp: string, timestamp: string } | null>(null);
    const [rawMessage, setRawMessage] = useState<string | null>(null);
    const [otpState, setOtpState] = useState<OTPState>("idle");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stopListener, setStopListener] = useState<(() => void) | null>(null);

    async function fetchSavedInboxes() {
        setLoading(true);
        const { data, error } = await getSavedInboxesFromDb(userId, websiteUrl);

        if (error) {
            setError("Failed to load saved inboxes.");
            return;
        }

        setSavedInboxes(data ?? []);
        if (data && data.length > 0) setActiveInbox(data[0]);
        setLoading(false);
    }

    async function generateNewInbox() {
        setLoading(true);
        setError(null);

        try {
            const inbox = await createInbox();
            const encrypted = encryptPassword(inbox.password, userId);

            const { data, error } = await addNewInboxToDb(userId, websiteUrl, inbox.id, inbox.email, encrypted)

            if (error) throw error;

            setSavedInboxes((prev) => [data, ...prev]);
            setActiveInbox(data);

            await startListening({
                id: data.id,
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
                // email arrived but no OTP found
                setRawMessage(raw);
                setOtpState("no_otp");
            },
            (err) => {
                console.error("Poll error:", err);
                setOtpState("idle");
            }
        );

        setStopListener(() => stop);
    }

    async function deleteInbox(inboxId: string) {
        const { error } = await deleteInboxFromDb(inboxId);
        if (error) {
            setError("Failed to delete inbox. Try again.");
            return;
        }
        fetchSavedInboxes();
    }

    function refresh() {
        if (activeInbox) {
            console.log("avsdv", activeInbox)
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
        deleteInbox
    };
}