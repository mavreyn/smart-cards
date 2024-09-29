// server.js
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as googleStrategy } from 'passport-google-oauth20';
import fileUpload from 'express-fileupload';
import axios from 'axios';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';
import admin from 'firebase-admin';
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),  // Replacing escaped newlines
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
  };

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
  
const db = getFirestore();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from Vite frontend
    credentials: true // Allow credentials (cookies, sessions)
}));

app.use(fileUpload()); 

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new googleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
    },
    async function(accessToken, refreshToken, profile, done) {
        // Store or update user profile in Firebase Firestore
        const usersRef = db.collection('users');
        const userDoc = usersRef.doc(profile.id);  // Use Google profile ID as document ID
        
        const userData = {
            displayName: profile.displayName,
            email: profile.emails[0].value,
            photoURL: profile.photos[0].value,
            lastLogin: new Date(),
        };
        
        // Check if user exists, if not, create new user
        const doc = await userDoc.get();
        if (!doc.exists) {
            await userDoc.set(userData);  // New user, store profile in Firestore
        } else {
            await userDoc.update({
                lastLogin: userData.lastLogin // Existing user, update last login
            });
        }

        return done(null, profile);
    }
));

// Serialize user
passport.serializeUser(function(user, done) {
    done(null, user);
});
  
// Deserialize user
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// A route to check if user is logged in
app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).send('Not authenticated');
    }
  });

// Routes for OAuth
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res) {
        // Successful authentication, redirect to frontend
        res.redirect('http://localhost:5173/upload');
    }
);

// A route to check if user is logged in
app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).send('Not authenticated');
    }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.post('/upload', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).send('You need to be logged in to upload files');
      }

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }   
    else {
        console.log(req.files);
    }
    const image = req.files.image;
    const userId = req.user.id; // Google profile ID

    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }

    const uploadPath = path.join(uploadDir, image.name);
    // Example: Use Google Cloud Vision API or similar.
    try {
        // const response = await axios.post('/api/upload', {
        //     image: image.data,
        //     // Additional parameters...
        // });
        // Define where to save the file (for simplicity, storing locally)
        await image.mv(uploadPath);  // Move the file to the upload path 

        console.log('Image uploaded:', image.name, image.data);

        // Save file metadata to Firebase Firestore under the user's profile
        const userRef = db.collection('users').doc(userId);
        await userRef.update({
            files: admin.firestore.FieldValue.arrayUnion({
                fileName: image.name,
                filePath: uploadPath,
                fileSize: image.size,
                uploadedAt: new Date(),
            })
        });

        // Send the response back to the client
        // res.json(response.data);
        res.json({
            message: 'Image uploaded successfully!',
            fileName: image.name,
            fileSize: image.size,
            fileType: image.mimetype
        });
        
    } catch (error) {
        console.error('Error calling image recognition API:', error);
        res.status(500).send('Error processing the image.');
    }
});

// Route to retrieve files uploaded by the authenticated user
app.get('/api/user/files', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send('You need to be logged in to access your files');
    }
  
    try {
      const userRef = db.collection('users').doc(req.user.id);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        return res.status(404).send('User not found');
      }
  
      const userData = userDoc.data();
      res.json(userData.files || []);  // Return the user's files
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching user files');
    }
  });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
