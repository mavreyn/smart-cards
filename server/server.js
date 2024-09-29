// server.js
import express from 'express';
import fileUpload from 'express-fileupload';
import axios from 'axios';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';
import OpenAI from "openai";
import admin from 'firebase-admin';
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { format } from 'util';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { Strategy as googleStrategy } from 'passport-google-oauth20';
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
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});
  
const db = getFirestore();

const app = express();
const PORT = process.env.PORT || 5000;
const openai = new OpenAI({
    apiKey: process.env.OPEN_API_KEY,
  });
// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from Vite frontend
    credentials: true // Allow credentials (cookies, sessions)
}));

dotenv.config();

app.use(fileUpload());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Function to send a prompt to OpenAI for verification
const verifyReceipt = async (imageData) => {
        try {
        const base64Image = imageData.toString('base64');  // Convert binary image to base64 string
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;
        // Create a message with text and base64-encoded image for the OpenAI Vision model
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",  // Replace with the appropriate Vision model
            messages: [
            {
                role: "user",
                content: [
                { type: "text", text: "Is this a receipt? Please respond with only true or false." },
                {
                    type: "image_url",
                    image_url: {
                      "url": dataUrl,  // Send the base64-encoded image directly
                    "detail": "high"
                    }
                }
            ]
            }
        ]
        });
    
          // Extract the result from OpenAI's response
        let result = response['choices'][0]['message']['content'].trim();  // Use let instead of const to allow reassignment

          // Remove punctuation
        result = result.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    
        // Convert to lowercase and trim extra spaces
        result = result.toLowerCase().trim();
    
    
          // Log the comparison (Node.js uses console.log, not print)
    
          // Return true if the response is 'true', otherwise return false
        return result === 'true';
        } catch (error) {
        console.error('Error verifying the receipt:', error);
        throw new Error('Failed to verify the receipt.');
    }
};
const extractReceiptDetails = async (imageData) => {
    try {
        const base64Image = imageData.toString('base64');  // Convert binary image to base64 string
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;
        
        const response = await openai.chat.completions.create({
            model: "gpt-4o",  // Replace with the appropriate Vision model
            messages: [
                {
                    role: "user",
                    content: [
                            { type: "text", text: 
                                `Obtain each good purchased, followed by the price of the good.An example should look EXACTLY like this:
                                calzone: 2.00
                                multi-grain wraps: 19.77
                                store-brand plant-based food: 1.97
                                store-brand sunflower: 1.97
                                store-brand sunflower: 1.97
                                store-brand sunflower: 1.97
                                bling beads: 4.99
                                great value: 9.97
                                lipton tea: 12.48
                                dry dog food: 12.46
                                tax: 4.59. 
                                If the product appears to be abbreviated, REPLACE do not append  with its normal product name for future categorization.` },
                        {
                            type: "image_url",
                            image_url: {
                                "url": dataUrl,  // Send the base64-encoded image directly
                                "detail": "high"
                            }
                        }
                    ]
                }
            ]
        });

        // Extract the result from OpenAI's response
        const result = response['choices'][0]['message']['content'].trim();

        // convert to json, lower case
        const items = result.split('\n');  // Split the result by new lines
        const receiptData = {
            items: [],
            tax: 0
        };

        // Process each line to extract the product and price
        items.forEach(item => {
            const [name, price] = item.split(':').map(str => str.trim());  // Split by colon and trim spaces
            if (name.toLowerCase() === 'tax') {
                receiptData.tax = parseFloat(price);  // If it's tax, store the tax amount
            } else {
                receiptData.items.push({
                    name: name.toLowerCase(),  // Lowercase the product name
                    price: parseFloat(price)   // Convert the price to a number
                });
            }
        });

        // remove items where name is '' or price is NaN
        receiptData.items = receiptData.items.filter(item => item.name && !isNaN(item.price));


        // add a total price to receiptData
        receiptData.total = parseFloat((receiptData.items.reduce((total, item) => total + item.price, 0) + receiptData.tax).toFixed(2));
        return receiptData;  // Return the extracted goods and prices
    } catch (error) {
        console.error('Error extracting receipt details:', error);
        throw new Error('Failed to extract receipt details.');
    }
};

app.post('/upload', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).send('You need to be logged in to upload files');
      }

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }   
    else{
        console.log(req.files);
    }
    const image = req.files.image;
    const userId = req.user.id; // Google profile ID

    // Step 1: Initialize Firebase Storage and get a reference to the bucket
    const bucket = admin.storage().bucket();
    const fileName = `${Date.now()}_${image.name}`;  // Ensure a unique file name
    const file = bucket.file(fileName);

    // Example: Use Google Cloud Vision API or similar.
    try {
        // Step 2: Upload the image to Firebase Storage
        await file.save(image.data, {
            metadata: {
                contentType: image.mimetype,  // Ensure the file has the correct content type
            },
        });

        // Step 3: Make the file public (optional) and get the download URL
        const downloadURL = format(
            `https://storage.googleapis.com/${bucket.name}/${fileName}`
        );

        console.log('Image uploaded to Firebase Storage:', downloadURL);

        // Step 1: Verify if the image is a receipt using OpenAI's model
        const isReceipt = await verifyReceipt(image.data);
        if (!isReceipt) {
            return res.status(400).json({ message: 'The uploaded file is not recognized as a receipt.' });
        }

        // Step 2: Extract Item Details from the Receipt + Tax
        const receiptDetails = await extractReceiptDetails(image.data);

        // Step 3: Categorize the items in the receipt via pretrained model
        const pythonResponse = await axios.post('http://localhost:5001/autocategorize', {
            items: receiptDetails.items  // Send JSON object containing the items
        }, {
            headers: {
                'Content-Type': 'application/json'  // Make sure Content-Type is set to JSON
            }
        });
        
        const categorizedItems = pythonResponse.data;
        // remove receiptDetails.items and add categorizedItems
        receiptDetails.items = categorizedItems;

        console.log(receiptDetails);

        // Store the receipt data in Firestore under the user's profile, grouped by the image name
        const userRef = db.collection('users').doc(userId);
        await userRef.update({
            receipts: admin.firestore.FieldValue.arrayUnion({
                fileName: image.name,  // Name of the uploaded image
                items: receiptDetails.items,  // Array of categorized items
                tax: receiptDetails.tax,  // Tax amount
                total: receiptDetails.total,  // Total amount
                uploadedAt: new Date(),  // Timestamp of upload
            })
        });

        // Send the response back to the client
        // res.json(response.data);
        res.json({
            message: 'Image uploaded successfully!',
            fileName: image.name,
            fileSize: image.size,
            fileType: image.mimetype,
            productInfo: receiptDetails.items,
            tax: receiptDetails.tax,
            total: receiptDetails.total,
            fileURL: downloadURL  // Return the Firebase Storage URL to the client
        });

    } catch (error) {
        console.error('Error calling image recognition API:', error);
        res.status(500).send('Error processing the image.');
    }
});

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
    passport.authenticate('google', { failureRedirect: 'http://localhost:5173' }),
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
