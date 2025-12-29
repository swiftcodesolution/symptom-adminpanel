import admin from "firebase-admin";

if (!admin.apps.length) {
  let serviceAccount;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    // Decode Base64 JSON
    serviceAccount = JSON.parse(
      Buffer.from(
        process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        "base64"
      ).toString("utf-8")
    );

    // Ensure private key has actual line breaks
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(
        /\\n/g,
        "\n"
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // Fallback to individual env variables
    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } =
      process.env;

    if (
      !FIREBASE_PROJECT_ID ||
      !FIREBASE_CLIENT_EMAIL ||
      !FIREBASE_PRIVATE_KEY
    ) {
      throw new Error(
        "Missing Firebase Admin credentials in environment variables"
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
