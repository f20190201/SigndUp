export function extractOTP(text: string): string | null {

    // clean URLs and image markdown first
    const cleaned = text
        .replace(/https?:\/\/\S+/g, "")
        .replace(/\[.*?\]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    // Layer 1 — keyword immediately before code (numeric or alphanumeric)
    const explicitMatch = cleaned.match(
        /(?:otp|one.time.password|verification.code|verify.code|enter.the.code|enter.code|your.code|use.the.code|use.code|passcode|pin)\D{0,10}([A-Z0-9]{4,8})\b/i
    );
    if (explicitMatch && /\d/.test(explicitMatch[1])) return explicitMatch[1];

    // Layer 2 — "code is XXXX" or "code: XXXX"
    const colonMatch = cleaned.match(
        /(?:code|otp|pin)\s*(?:is|:)\s*([A-Z0-9]{4,8})\b/i
    );
    if (colonMatch && /\d/.test(colonMatch[1])) return colonMatch[1];

    // Layer 3 — fallback, only runs if layers 1 and 2 both fail
    // collect all candidate tokens
    const tokens = [...(cleaned.match(/\b[A-Z0-9]{4,8}\b/gi) ?? [])];

    const filtered = tokens.filter((t) => {
        if (!/\d/.test(t)) return false;               // must have at least 1 digit
        if (/^(19|20)\d{2}$/.test(t)) return false;    // looks like a year
        if (/^[A-Z]{1,2}\d{4,6}$/.test(t) && parseInt(t.replace(/\D/g, "")) > 100000) return false; // postal codes like HR122016
        if (/^\d+$/.test(t) && t.length === 6 && isAddressNumber(cleaned, t)) return false; // address/PIN numbers
        return true;
    });

    // prefer purely numeric 4-6 digit tokens first (most common OTP format)
    const numeric = filtered.filter((t) => /^\d{4,6}$/.test(t));
    if (numeric.length > 0) return numeric[0];

    // then alphanumeric
    return filtered[0] ?? null;
}

function isAddressNumber(text: string, token: string): boolean {
    // check if the token appears near address keywords
    const addressPattern = new RegExp(
        `(?:plot|phase|sector|pin|pincode|zip|postal|haryana|gurgaon|mumbai|delhi|bangalore|road|street|nagar|vihar)\\D{0,30}${token}|${token}\\D{0,30}(?:plot|phase|sector|pin|pincode|zip|postal|haryana|gurgaon|mumbai|delhi|bangalore|road|street|nagar|vihar)`,
        "i"
    );
    return addressPattern.test(text);
}