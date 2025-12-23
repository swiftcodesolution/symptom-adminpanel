import admin from "firebase-admin";

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      `Missing Firebase credentials. Please check your environment variables.
      projectId: ${projectId ? "✓" : "✗"}
      clientEmail: ${clientEmail ? "✓" : "✗"}
      privateKey: ${privateKey ? "✓" : "✗"}`
    );
  }

  // Handle both escaped newlines (\n as text) and actual newlines
  const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: formattedPrivateKey,
    }),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
