import { signOut } from "../utils/supabase-utils";
import { setBadgeText, updateBadgeTextWithInboxesCount } from "../utils/background-utils";

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "sessionTimeout") {

        chrome.storage.session.remove(["sessionStatus"], () => {
            console.log("Session status removed from RAM.");
        });

        await signOut().then((_) => {
            setBadgeText("LOCK");
        }).catch(err => {
            console.log(err);
        });
    }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    updateBadgeTextWithInboxesCount((await chrome.tabs.get(activeInfo.tabId)).url)
});

chrome.tabs.onUpdated.addListener(async (tabId, _changeInfo, _tab) => {
    updateBadgeTextWithInboxesCount((await chrome.tabs.get(tabId)).url)
});