import { supabase } from "../lib/supabase";

export async function getUserFromDb(userId: string) {
    return await supabase
        .from("user_site_inboxes")
        .select("user_id")
        .eq("user_id", userId)
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

export async function deleteInboxFromDb(inboxId: string) {
    return supabase
        .from("user_site_inboxes")
        .delete()
        .eq("inbox_id", inboxId);
}