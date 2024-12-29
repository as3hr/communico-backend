import crypto from "crypto";
import { HttpError } from "./http_error";

export const getEncryptedLink = (data: number, isGroup: boolean = false) => {
  var algorithm = "aes-192-cbc";
  var secret = process.env.JWT_SECRET!;
  const key = crypto.scryptSync(secret, "salt", 24);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted =
    cipher.update(data.toString(), "utf8", "hex") + cipher.final("hex");
  const encryptedId = `${iv.toString("hex")}:${encrypted}`;
  const domain = process.env.DOMAIN!;
  const subPath = isGroup ? "/#groups" : "/#chats";
  const link = `${domain}${subPath}/${encryptedId}`;
  console.log("Encrypted Link: ", link);
  return link;
};

export const getDecryptedId = (data: string) => {
  const algorithm = "aes-192-cbc";
  const secret = process.env.JWT_SECRET!;
  const key = crypto.scryptSync(secret, "salt", 24);
  const [ivHex, encryptedData] = data.split(":");
  if (!ivHex || !encryptedData) {
    throw new HttpError(
      "Invalid data format. Missing IV or encrypted data.",
      "BAD_REQUEST",
      400
    );
  }

  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  const decrypted =
    decipher.update(encryptedData, "hex", "utf8") + decipher.final("utf8");

  return decrypted;
};
