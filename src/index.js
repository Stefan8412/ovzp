import { Client, Users, Databases } from "node-appwrite";
import nodemailer from "nodemailer";

export default async ({ req, res, log }) => {
  try {
    const body = JSON.parse(req.body);
    log("📥 Incoming body:", JSON.stringify(body, null, 2));

    const document = body.payload;
    log("📄 Document payload:", JSON.stringify(document, null, 2));
    log("🔔 Event type:", body.events);

    // If status not relevant, skip
    if (!["granted", "canceled"].includes(document.status)) {
      log(`ℹ️ Skipping: status = ${document.status}`);
      return res.send("No action needed");
    }

    // Respond quickly so Appwrite doesn't timeout
    res.send("Email notification queued ✅");

    (async () => {
      try {
        // Appwrite client
        const client = new Client()
          .setEndpoint(process.env.APPWRITE_ENDPOINT)
          .setProject(process.env.APPWRITE_PROJECT_ID)
          .setKey(process.env.APPWRITE_API_KEY);

        const users = new Users(client);
        const databases = new Databases(client);

        // 🔎 Try fetching user
        let userEmail = document.userId;
        try {
          const user = await users.get(document.userId);
          log("👤 User fetched:", JSON.stringify(user, null, 2));
          userEmail = user.email;
        } catch (err) {
          log("⚠️ Could not fetch user, using raw userId:", err.message);
        }

        // 🔎 Try fetching system
        let systemName = document.systemId;
        try {
          const system = await databases.getDocument(
            process.env.DB_ID,
            process.env.SYSTEMS_COLLECTION,
            document.systemId
          );
          log("💻 System fetched:", JSON.stringify(system, null, 2));
          systemName = system.name;
        } catch (err) {
          log("⚠️ Could not fetch system, using raw systemId:", err.message);
        }

        // SMTP
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587", 10),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const message = {
          from: process.env.SMTP_USER,
          to: process.env.NOTIFY_EMAIL,
          subject: `🔔 Access ${document.status} Notification`,
          text: `An access was ${document.status}:

- User: ${userEmail}
- System: ${systemName}
- Organization ID: ${document.organizationId}
- Action by: ${document.canceledBy || "N/A"}
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
