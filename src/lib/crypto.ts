import CryptoJS from "crypto-js";

export function encryptPassword(password: string, userId: string): string {
    return CryptoJS.AES.encrypt(password, userId).toString();
}

export function decryptPassword(encrypted: string, userId: string): string {
    const bytes = CryptoJS.AES.decrypt(encrypted, userId);
    return bytes.toString(CryptoJS.enc.Utf8);
}