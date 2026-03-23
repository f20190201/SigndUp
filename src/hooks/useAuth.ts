import { useState } from "react";
import { supabase } from "../lib/supabase";

type AuthState = "idle" | "loading" | "error" | "success";

export function useAuth() {
    const [state, setState] = useState<AuthState>("idle");
    const [error, setError] = useState<string | null>(null);

    async function login(userId: string): Promise<boolean> {
        setState("loading");
        setError(null);

        try {
            const { data, error } = await supabase
                .from("user_site_inboxes")
                .select("user_id")
                .eq("user_id", userId)
                .limit(1);

            if (error) throw error;

            // If no rows found, it's a new user — that's fine, we allow them in
            setState("success");
            return true;
        } catch (err: any) {
            setState("error");
            setError("Could not connect. Check your connection and try again.");
            return false;
        }
    }

    return { login, state, error };
}