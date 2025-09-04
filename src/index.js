import { Client, Users, Databases } from "node-appwrite";
import nodemailer from "nodemailer";

export default async ({ req, res, log }) => {
  try {
    const body = JSON.parse(req.body);
    const document = body.payload;

    if (document.status !== "canceled") {
      return res.send("No action needed");
    }

    // 🚀 Respond fast so Appwrite doesn't timeout
    res.send("Email notification queued ✅");

    // Run async in background
    (async () => {
      try {
        // 🔑 Appwrite server client
        const client = new Client()
          .setEndpoint(process.env.APPWRITE_ENDPOINT) // e.g. https://cloud.appwrite.io/v1
          .setProject(process.env.APPWRITE_PROJECT_ID)
          .setKey(process.env.APPWRITE_API_KEY); // must include users.read + databases.read

        const users = new Users(client);
        const databases = new Databases(client);

        // Fetch user email
        let userEmail = document.userId;
        try {
          const user = await users.get(document.userId);
          userEmail = user.email;
        } catch (err) {
          log("⚠️ Could not fetch user, falling back to ID:", err.message);
        }

        // Fetch system name (adjust DB + collection IDs to your setup)
        let systemName = document.systemId;
        try {
          const system = await databases.getDocument(
            process.env.DB_ID,
            process.env.SYSTEMS_COLLECTION,
            document.systemId
          );
          systemName = system.name;
        } catch (err) {
          log("⚠️ Could not fetch system, falling back to ID:", err.message);
        }

        // Configure SMTP
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587", 10),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        // Compose message
        const message = {
          from: process.env.SMTP_USER,
          to: process.env.NOTIFY_EMAIL,
          subject: "🔔 Access Canceled Notification",
          text: `An access was canceled:

- User: ${userEmail}
- System: ${systemName}
- Organization ID: ${document.organizationId}
- Canceled by: ${document.canceledBy}
- At: ${new Date().toISOString()}`,
        };

        const info = await transporter.sendMail(message);
        log("✅ Email sent:", JSON.stringify(info, null, 2));
      } catch (err) {
        log("❌ Background task failed:", err.message);
      }
    })();
  } catch (error) {
    log("❌ Function error:", error.message);
    res.send("Error: " + error.message);
  }
};
