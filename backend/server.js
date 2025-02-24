// filepath: /server.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const dotenv = require("dotenv");
const ImageKit = require("imagekit");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_ENDPOINT,
});

app.post("/uploadPfp", upload.single("file"), async (req, res) => {
  try {
    const uid = req.body.uid;
    if (!uid) {
      throw new Error("UID is required");
    }

    const fileBuffer = req.file.buffer;
    const base64File = fileBuffer.toString("base64");

    const folderPath = `pfp/${uid}`;

    const randomFileName = `${uid}-${Date.now()}.jpg`;

    const uploadResponse = await imagekit.upload({
      file: base64File,
      fileName: randomFileName,
      folder: folderPath, 
      useUniqueFileName: false,
      overwriteFile: false,
      filePath: `${folderPath}/${randomFileName}`,
    });

    return res.json(uploadResponse);
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.get("/auth", (req, res) => {
  const authParameters = imagekit.getAuthenticationParameters();
  res.json(authParameters);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
