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

// Export both the admin and auth instances
const auth = admin.auth();

async function authenticateToken(event) {
    console.log('Received event:', event);
    const token = event.headers.authorization?.split(' ')[1]; // More resilient access of token
    console.log('Authorization token:', token);

    if (!token) {
        console.log('No token provided');
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Unauthorized: No token provided' })
        };
    }

    try {
        console.log('Verifying token');
        const decodedToken = await auth.verifyIdToken(token);
        console.log('Authenticated user:', decodedToken.email);
        event.user = decodedToken;
        console.log('Authentication successful, proceeding with event:', event);
        return event;  // Continue with the event processing
    } catch (error) {
        console.error('Error verifying Firebase ID token:', error);
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Unauthorized: Invalid token' })
        };
    }
}


module.exports = {
    admin, // Firebase admin instance
    auth,  // Firebase auth instance for verifying tokens
    authenticateToken // Function to authenticate tokens
};
