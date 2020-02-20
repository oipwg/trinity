import CryptoJS from 'crypto-js';

export function decrypt(encryptedMnemonic, password) {
    let decrypted = CryptoJS.AES.decrypt(encryptedMnemonic, password);
    let plaintext = decrypted.toString(CryptoJS.enc.Utf8);

    return plaintext;
}

export function encrypt(mnemonic, password) {
    let encrypted = CryptoJS.AES.encrypt(mnemonic, password).toString();

    return encrypted;
}
