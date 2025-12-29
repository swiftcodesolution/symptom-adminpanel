// scripts\setAdminClaims.ts
import admin from "firebase-admin";

const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64!, "base64").toString()
);

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

async function setAdmin(uid: string) {
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  console.log(`Admin claim set for ${uid}`);
}

// Run: ts-node scripts/setAdminClaims.ts <UID>
setAdmin(process.argv[2]);
