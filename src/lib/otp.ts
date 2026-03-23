export function extractOTP(text: string): string | null {
    const tokens = text.match(/\b[A-Z0-9]{3,8}\b/gi) ?? [];
    return tokens.find((t) => /\d/.test(t)) ?? null;
}