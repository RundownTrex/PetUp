const express = require("express");
const multer = require("multer");
const cors = require("cors");
const dotenv = require("dotenv");
const ImageKit = require("imagekit");
const admin = require("firebase-admin");

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

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
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

app.post("/uploadPetImage", upload.single("file"), async (req, res) => {
  try {
    const uid = req.body.uid;
    if (!uid) {
      throw new Error("UID is required");
    }
    const fileBuffer = req.file.buffer;
    const base64File = fileBuffer.toString("base64");

    const folderPath = `pets/${uid}`;

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

app.post("/uploadProductImage", upload.single("file"), async (req, res) => {
  try {
    const uid = req.body.uid;
    if (!uid) {
      throw new Error("UID is required");
    }
    const fileBuffer = req.file.buffer;
    const base64File = fileBuffer.toString("base64");

    const folderPath = `products/${uid}`;

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

app.post("/sendNotification", express.json(), async (req, res) => {
  try {
    const { userId, title, body, pfp } = req.body;

    if (!userId || !title || !body) {
      return res
        .status(400)
        .json({ error: "userId, title, and body are required" });
    }

    const userRef = admin.firestore().collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;

    if (!fcmToken) {
      return res
        .status(404)
        .json({ error: "User does not have an FCM token registered" });
    }

    const notificationData = {
      title,
      body,
      pfp,
      timestamp: new Date().toISOString(),
      id: Date.now().toString(),
    };

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
      token: fcmToken,
    };

    const response = await admin.messaging().send(message);
    console.log("Successfully sent notification:", response);

    // Get current notifications or initialize empty array
    let recentNotifications = userData.recentNotifications || [];

    // Add new notification to the beginning
    recentNotifications.unshift(notificationData);

    // Limit to 20 most recent notifications
    if (recentNotifications.length > 20) {
      recentNotifications = recentNotifications.slice(0, 20);
    }

    // Update Firestore
    await userRef.update({
      recentNotifications,
    });

    res.json({
      success: true,
      messageId: response,
      notificationSaved: true,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
