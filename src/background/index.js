import { signOut } from "../utils/supabase-utils";

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "sessionTimeout") {

        chrome.storage.session.remove(["sessionStatus"], () => {
            console.log("Session status removed from RAM.");
        });

        await signOut().then((_) => {
            chrome.action.setBadgeText({ text: "LOCK" });
        }).catch(err => {
            console.log(err);
        });
    }
});