import { supabase } from "../lib/supabase";
import type { AuthState } from "./generic-utils";

export async function addNewUserToDb(userId: string, password: string) {
    return await supabase.auth.signUp({
        email: `${userId.toLowerCase().trim()}@disposable-ext.local`,
        password: password,
    });
}

export async function loginUser(userId: string, password: string) {
    return await supabase.auth.signInWithPassword({
        email: `${userId.toLowerCase().trim()}@disposable-ext.local`,
        password: password,
    });
}

export async function getUserFromDb(userId: string) {
    return await supabase
        .from("user_site_inboxes")
        .select("user_id")
        // .eq("user_id", userId)
        .limit(1);
}

export async function getSavedInboxesFromDb(userId: string, websiteUrl: string) {
    return supabase
        .from("user_site_inboxes")
        .select("*")
        .eq("user_id", userId)
        .eq("website_url", websiteUrl)
        .order("created_at", { ascending: false })
}

export async function addNewInboxToDb(userId: string, websiteUrl: string, inboxId: string, email: string, encrypted: string) {
    return supabase
        .from("user_site_inboxes")
        .insert({
            user_id: userId,
            website_url: websiteUrl,
            email_address: email,
            password: encrypted,
            inbox_id: inboxId,
        })
        .select()
        .single();
}

export async function deleteInboxFromDb(websiteUrl: string, emailId: string, authState: AuthState) {

    return await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-inbox`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authState.status === "loggedIn" ? authState.authToken : undefined}` },
        body: JSON.stringify({ websiteUrl, emailId }),
    });
}

export async function signOut() {
    return await supabase.auth.signOut();
}

export async function checkTokenValidity(authToken: string) {
    return await supabase.auth.getUser(authToken);
}