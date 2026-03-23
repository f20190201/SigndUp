import { useState } from "react";
import { supabase } from "../lib/supabase";
import { createInbox, listenForOTP, type Inbox } from "../lib/mail";
import { decryptPassword, encryptPassword } from "../lib/crypto";

export type SavedInbox = {
    id: string;
    email_address: string;
    password: string;
    created_at: string;
};

export type OTPState = "idle" | "waiting" | "received" | "no_otp";

export function useInbox(userId: string, websiteUrl: string) {
    const [savedInboxes, setSavedInboxes] = useState<SavedInbox[]>([]);
    const [activeInbox, setActiveInbox] = useState<SavedInbox | null>(null);
    const [otp, setOtp] = useState<string | null>(null);
    const [rawMessage, setRawMessage] = useState<string | null>(null);
    const [otpState, setOtpState] = useState<OTPState>("idle");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stopListener, setStopListener] = useState<(() => void) | null>(null);

    async function fetchSavedInboxes() {
        const { data, error } = await supabase
            .from("user_site_inboxes")
            .select("*")
            .eq("user_id", userId)
            .eq("website_url", websiteUrl)
            .order("created_at", { ascending: false });

        if (error) {
            setError("Failed to load saved inboxes.");
            return;
        }

        setSavedInboxes(data ?? []);
        if (data && data.length > 0) setActiveInbox(data[0]);
    }

    async function generateNewInbox() {
        setLoading(true);
        setError(null);

        try {
            const inbox = await createInbox();
            const encrypted = encryptPassword(inbox.password, userId);

            const { data, error } = await supabase
                .from("user_site_inboxes")
                .insert({
                    user_id: userId,
                    website_url: websiteUrl,
                    email_address: inbox.email,
                    password: encrypted,
                })
                .select()
                .single();

            if (error) throw error;

            setSavedInboxes((prev) => [data, ...prev]);
            setActiveInbox(data);
            // saveActiveInboxToStorage(data);

            // use original plain password, not the encrypted one from data
            await startListening({
                id: data.id,
                email: inbox.email,
                password: inbox.password,
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
            (receivedOtp, raw) => {
                setOtp(receivedOtp);
                setRawMessage(raw);
                setOtpState("received");
            },
            (raw) => {
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
        otp,
        rawMessage,
        otpState,
        loading,
        error,
        fetchSavedInboxes,
        generateNewInbox,
        selectInbox,
        refresh,
    };
}