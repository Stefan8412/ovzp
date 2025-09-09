import { Client, Users, Databases } from "node-appwrite";
import nodemailer from "nodemailer";

export default async ({ req, res, log }) => {
  try {
    log("🚀 Function started");
    const body = JSON.parse(req.body || "{}");
    log("📦 Incoming payload:", JSON.stringify(body, null, 2));

    res.send("Function executed ✅");

    (async () => {
      try {
        const client = new Client()
          .setEndpoint(process.env.APPWRITE_ENDPOINT)
          .setProject(process.env.APPWRITE_PROJECT_ID)
          .setKey(process.env.APPWRITE_API_KEY);

        const users = new Users(client);
        const databases = new Databases(client);

        log("🔑 Appwrite client initialized");

        const userList = await users.list();
        log("👥 Total users:", userList.total);

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
          subject: "Test Email from Appwrite Function",
          text: "If you see this, your SMTP setup works! ✅",
        };

        await transporter.sendMail(message);
        log("📧 Email sent successfully");
      } catch (err) {
        log("❌ Background error:", err.message);
      }
    })();
  } catch (err) {
    log("❌ Main function error:", err.message);
    res.send("Error: " + err.message);
  }
};
cat > package.json
{
  "name": "notify-access",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "node-appwrite": "^12.0.0",
    "nodemailer": "^6.9.0"
  }
}

