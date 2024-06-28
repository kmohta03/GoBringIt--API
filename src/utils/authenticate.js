const admin = require('firebase-admin');

// Initialize Firebase Admin SDK once globally
try {
    if (!admin.apps.length) {
        const firebaseServiceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(firebaseServiceAccount),
        });
        console.log('fb', firebaseServiceAccount)
        console.log("Firebase Admin initialized successfully.");
    }
} catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    throw new Error("Initialization of Firebase Admin failed.");
}

