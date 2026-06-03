import { getDomainInboxesCountFromLclStorage, isValidSessionStatus } from "./generic-utils";
import { getDomain } from "tldts";

export function setBadgeText(text: string, color?: string) {
    chrome.action.setBadgeText({ text });
    if (color) {
        chrome.action.setBadgeBackgroundColor({ color });
    }
}

export async function getInboxesCountForCurrentDomainAndUser(url: string): Promise<number | null | undefined> {
    const sessionStatusFromSessionStorage: any = await chrome.storage.session.get("sessionStatus");
    if (isValidSessionStatus(sessionStatusFromSessionStorage)) {
        let dBUserId = sessionStatusFromSessionStorage.sessionStatus.dBUserId;
        let hostname = getDomain(url)
        let domainInboxesCount = await getDomainInboxesCountFromLclStorage();

        if (!domainInboxesCount?.domainInboxesCount || !hostname) {
            return 0;
        }
        return (domainInboxesCount.domainInboxesCount[dBUserId][hostname] ?? 0);
    }
    return undefined;
}

export async function updateBadgeTextWithInboxesCount(url: string) {
    let sessionStatusValidity = await getInboxesCountForCurrentDomainAndUser(url)

    if (sessionStatusValidity == undefined) {
        return;
    }

    const count = sessionStatusValidity || ""
    setBadgeText(String(count));
}