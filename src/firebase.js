// Firebase is loaded only when the account settings exist, so the site costs nothing extra until then.
// It does two jobs: check the login token the browser sends, and open Firestore for saving data.

/** The settings the browser needs to start Firebase Login. All of these are public by design. */
export function firebasePublicConfig(env = process.env) {
  const projectId = (env.FIREBASE_PROJECT_ID || "").trim();
  const apiKey = (env.FIREBASE_WEB_API_KEY || "").trim();
  const appId = (env.FIREBASE_APP_ID || "").trim();
  if (!projectId || !apiKey || !appId) return null;
  return { apiKey, appId, projectId, authDomain: (env.FIREBASE_AUTH_DOMAIN || "").trim() || `${projectId}.firebaseapp.com` };
}

let cached;
/** Opens Firebase once and reuses it. On Cloud Run it signs in as the service account automatically. */
export function firebaseServices(env = process.env) {
  cached ||= (async () => {
    const { initializeApp, getApps, applicationDefault } = await import("firebase-admin/app");
    const { getAuth } = await import("firebase-admin/auth");
    const { getFirestore } = await import("firebase-admin/firestore");
    const app = getApps()[0] || initializeApp({ projectId: env.FIREBASE_PROJECT_ID, credential: applicationDefault() });
    const db = getFirestore(app);
    try { db.settings({ ignoreUndefinedProperties: true }); } catch { /* already set */ }
    const auth = getAuth(app);
    return {
      db,
      /** A login token from the browser, checked. Returns who it belongs to. */
      async verifyToken(token) {
        const d = await auth.verifyIdToken(token);
        return {
          uid: d.uid,
          name: d.name || "",
          email: d.email || "",
          phone: d.phone_number || "",
          picture: d.picture || "",
          provider: d.firebase?.sign_in_provider || "",
        };
      },
    };
  })();
  return cached;
}
