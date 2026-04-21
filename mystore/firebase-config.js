/* ============================================================
  FIREBASE CONFIGURATION — Acentra
  ============================================================
   
   SETUP INSTRUCTIONS:
   ───────────────────
   1. Go to https://console.firebase.google.com
   2. Click "Add project" → name it (e.g. "ramas-tech")
   3. Go to Project Settings (⚙) → General → "Your apps" → click Web (</>)
   4. Register your app → copy the firebaseConfig object
   5. Replace the placeholder values below with your real config

   ENABLE AUTHENTICATION:
   ──────────────────────
   6. Go to Authentication → Sign-in method
   7. Enable "Google" (use ramaserljay5@gmail.com as support email)

   ENABLE FIRESTORE:
   ─────────────────
   9. Go to Firestore Database → Create database
   10. Start in "test mode" (for development)
   11. Choose nearest region (asia-southeast1 for PH)

   FIRESTORE SECURITY RULES (paste in Firestore → Rules):
   ───────────────────────────────────────────────────────
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {

       // Helper: check if user is admin
       function isAdmin() {
         return request.auth != null
           && request.auth.token.email in [
             'ramaserljay5@gmail.com',
             'jasper.yahoo.co@gmail.com',
             'luste.johnmark19@gmail.com',
             'johnmarkbitar0.0@gmail.com',
             'ramonitocasas07@gmail.com',
             'pleasehir3m3@gmail.com',
             'mrfist7000@gmail.com',
             'torjarica@gmail.com'
           ];
       }

       // Main admin
       function isMainAdmin() {
         return request.auth != null
           && request.auth.token.email == 'ramaserljay5@gmail.com';
       }

       match /chats/{chatId} {
         // Users create/read/write their OWN chat (chatId == UID)
         // Main admin reads/writes ALL chats
         // Other admins read/write chats assigned to them
         allow create: if request.auth != null
           && request.auth.uid == chatId;
         allow read, update, delete: if request.auth != null
           && (request.auth.uid == chatId
               || isMainAdmin()
               || (isAdmin() && resource.data.assignedTo != null
                   && resource.data.assignedTo == request.auth.token.email));

         match /messages/{messageId} {
           allow create: if request.auth != null
             && (request.auth.uid == chatId
                 || isMainAdmin()
                 || (isAdmin() && get(/databases/$(database)/documents/chats/$(chatId)).data.assignedTo != null
                     && get(/databases/$(database)/documents/chats/$(chatId)).data.assignedTo == request.auth.token.email));
           allow read, update, delete: if request.auth != null
             && (request.auth.uid == chatId
                 || isMainAdmin()
                 || (isAdmin() && get(/databases/$(database)/documents/chats/$(chatId)).data.assignedTo != null
                     && get(/databases/$(database)/documents/chats/$(chatId)).data.assignedTo == request.auth.token.email));
         }
       }

       match /projects/{projectId} {
         allow read: if request.auth != null;
         allow write: if isAdmin();
       }

       match /requests/{requestId} {
         // Only allow creates with exact allowed fields; lock status to 'new'
         allow create: if request.resource.data.keys().hasOnly(['name', 'contact', 'service', 'device', 'details', 'budget', 'deadline', 'status', 'createdAt'])
           && request.resource.data.keys().hasAll(['name', 'contact', 'service', 'status'])
           && request.resource.data.name != ''
           && request.resource.data.contact != ''
           && request.resource.data.status == 'new';
         allow read, update, delete: if isAdmin();
       }

       match /portfolio/{itemId} {
         allow read: if true;
         allow write: if isAdmin();
       }

       match /stats/{docId} {
         allow read: if true;
         allow write: if isAdmin();
       }
     }
   }
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyA4H3EhQhE8zeFx-FsYdjJ_4sPq7toIfes",
  authDomain: "ramas-solution.firebaseapp.com",
  projectId: "ramas-solution",
  storageBucket: "ramas-solution.firebasestorage.app",
  messagingSenderId: "519026898073",
  appId: "1:519026898073:web:ec23c7f7ffe25d0e5bf408",
  measurementId: "G-GE8BKLXM9F"
};

// Initialize Firebase (only if not already initialized)
if (typeof firebase !== 'undefined') {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
}

window.ADMIN_EMAILS = [
    "mrfist7000@gmail.com",
  "ramaserljay5@gmail.com",
  "jasper.yahoo.co@gmail.com",
  "luste.johnmark19@gmail.com",
  "johnmarkbitar0.0@gmail.com",
  "ramonitocasas07@gmail.com",
  "pleasehir3m3@gmail.com",
  "torjarica@gmail.com",
];
