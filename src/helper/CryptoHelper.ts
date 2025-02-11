import * as crypto from "crypto";
import base58 from "bs58";

function doubleSha256(data: Buffer): Buffer {
  return crypto
    .createHash("sha256")
    .update(crypto.createHash("sha256").update(data).digest())
    .digest();
}

export function base64ToNeo3Address(base64Str: string): string {
  const scriptHash = Buffer.from(base64Str, "base64");
  const versionByte = Buffer.from([0x35]);
  const addressBytes = Buffer.concat([versionByte, scriptHash]);
  const checksum = doubleSha256(addressBytes).subarray(0, 4);
  const finalAddress = Buffer.concat([addressBytes, checksum]);
  return base58.encode(finalAddress);
}
