const crypto = require("crypto");
const fs = require("fs");

const decryptFile = (inputFile, outputFile, password) => {
  const key = crypto.createHash("sha256").update(password).digest();

  const encryptedData = fs.readFileSync(inputFile);
  const iv = encryptedData.slice(0, 16);
  const data = encryptedData.slice(16);

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);

  fs.writeFileSync(outputFile, decrypted);
};

decryptFile("/Users/tushaarbharara/Desktop/3d-portfolio/public/models/character.enc", "./public/models/character.glb", "MyCharacter12");
