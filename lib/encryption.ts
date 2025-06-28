import CryptoJS from "crypto-js"

export async function encryptPassword(password: string, masterPassword: string): Promise<string> {
  try {
    // Create a key from the master password using PBKDF2
    const salt = CryptoJS.lib.WordArray.random(128 / 8)
    const key = CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: 256 / 32,
      iterations: 10000,
    })

    // Encrypt the password
    const encrypted = CryptoJS.AES.encrypt(password, key.toString()).toString()

    // Combine salt and encrypted data
    const result = salt.toString() + ":" + encrypted
    return result
  } catch (error) {
    console.error("Encryption error:", error)
    throw new Error("Failed to encrypt password")
  }
}

export async function decryptPassword(encryptedData: string, masterPassword: string): Promise<string> {
  try {
    // Split salt and encrypted data
    const parts = encryptedData.split(":")
    if (parts.length !== 2) {
      throw new Error("Invalid encrypted data format")
    }

    const salt = CryptoJS.enc.Hex.parse(parts[0])
    const encrypted = parts[1]

    // Recreate the key using the same salt and master password
    const key = CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: 256 / 32,
      iterations: 10000,
    })

    // Decrypt the password
    const decrypted = CryptoJS.AES.decrypt(encrypted, key.toString())
    const result = decrypted.toString(CryptoJS.enc.Utf8)

    if (!result) {
      throw new Error("Invalid master password")
    }

    return result
  } catch (error) {
    console.error("Decryption error:", error)
    throw new Error("Failed to decrypt password")
  }
}

export function generateSalt(): string {
  return CryptoJS.lib.WordArray.random(128 / 8).toString()
}

export async function hashMasterPassword(masterPassword: string, salt: string): Promise<string> {
  const key = CryptoJS.PBKDF2(masterPassword, salt, {
    keySize: 256 / 32,
    iterations: 10000,
  })
  return key.toString()
}
