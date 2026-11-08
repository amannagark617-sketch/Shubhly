# Login and wallet setup

Nothing is active until these settings exist. Without them the site behaves exactly as before (no Login button).

## 1. Firebase (login and saved data)
1. Create a project at console.firebase.google.com (or use your existing Google Cloud project).
2. Build > Authentication > Sign-in method: enable **Google** and **Phone**.
3. Authentication > Settings > Authorized domains: add `kundlikaka.in`.
4. Build > Firestore Database > Create database (Native mode). Publish `firestore.rules` (blocks all browser access).
5. Project settings > Your apps > Web app: copy `apiKey` and `appId`.
6. In Google Cloud IAM, give the Cloud Run service account the role **Cloud Datastore User** and **Firebase Authentication Viewer** (needed for token checks).
7. Phone login needs the Blaze plan beyond the free SMS quota. Add test numbers in Authentication while testing.

## 2. Razorpay (top-ups)
1. Dashboard > Settings > API Keys. Start with **Test** keys (`rzp_test_...`).
2. Settings > Webhooks > Add: URL `https://kundlikaka.in/api/account/razorpay-webhook`, events `payment.captured` and `order.paid`, and a secret you choose.
3. Switch to Live keys only after a full test top-up works.

## 3. Environment variables (Cloud Run)
| Name | Value |
|---|---|
| FIREBASE_PROJECT_ID | your project id |
| FIREBASE_WEB_API_KEY | web apiKey |
| FIREBASE_APP_ID | web appId |
| FIREBASE_AUTH_DOMAIN | optional, default `<project>.firebaseapp.com` |
| RAZORPAY_KEY_ID | `rzp_test_...` or `rzp_live_...` |
| RAZORPAY_KEY_SECRET | key secret (use Secret Manager) |
| RAZORPAY_WEBHOOK_SECRET | the webhook secret from step 2 |
| TOPUP_MIN_RUPEES / TOPUP_MAX_RUPEES | optional, 50 / 10000 |

If only the Firebase values are set, people can sign up and see their wallet, and "adding money" shows "available soon".

## How it stays safe
- Amounts are stored on the server when the order is created; the browser cannot change them.
- A payment is credited once, whether the browser confirmation or the webhook arrives first.
- Orders belong to the user who created them; payment signatures are checked.

## Data saved (Firestore)
`users/{uid}` (name, email/phone, balance in paise), `users/{uid}/transactions/{paymentId}`, `orders/{orderId}`.
