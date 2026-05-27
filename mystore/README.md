# Acentra

"Your Vision, Our Code. Your Growth, Our Mission."

**From Hardware to Web — Complete IT Solutions**

A modern, full-featured business website with real-time chat system, admin dashboard, and comprehensive service management. Built with vanilla JavaScript, Firebase, and a focus on security and user experience.

## 🌟 Features

### 🎯 **Main Website**
- **Responsive Design** — Mobile-first, optimized for all devices
- **Dynamic Content** — Live project stats, dynamic portfolio loading
- **SEO Optimized** — Meta tags, structured data, sitemap
- **Smooth Animations** — Scroll reveals, typing effects, particle system
- **Service Showcase** — IT & PC Services, Web Development, Creative Media
- **Anti-Debug Protection** — Blocks DevTools, disables right-click

### 💬 **Smart Chat System**
- **Bot-First Interaction** — Instant FAQ responses without sign-in
- **Live Agent Escalation** — Google OAuth for human support
- **Real-Time Presence** — Shows online/offline status accurately
- **Email Notifications** — Alerts admins when users request live chat
- **Rate Limiting** — Prevents spam and abuse
- **Typing Animations** — Natural conversation feel

### 🛡️ **Admin Dashboard**
- **Project Management** — Track status, deadlines, client info
- **Request Handling** — Service requests with status tracking
- **Live Chat Management** — Real-time messaging with presence indicators
- **Team Assignment** — Assign chats to specific team members
- **Analytics** — Project stats, completion rates, performance metrics
- **Role-Based Access** — Main admin vs team member permissions

## 🚀 Quick Start

### Prerequisites
- Firebase Project (Authentication + Firestore)
- EmailJS Account (for notifications)
- Web Server (Live Server extension recommended)

### 1. Firebase Setup

**Create Project:**
```
1. Go to https://console.firebase.google.com
2. Click "Add project" → name it "ramas-tech"
3. Enable Google Analytics (optional)
```

**Enable Authentication:**
```
1. Go to Authentication → Sign-in method
2. Enable "Google" provider
3. Add your domain to authorized domains
```

**Enable Firestore:**
```
1. Go to Firestore Database → Create database
2. Start in "test mode" (for development)
3. Choose region: asia-southeast1 (for Philippines)
```

**Get Firebase Config:**
```
1. Project Settings → General → Your apps
2. Click Web (</>) → Register app
3. Copy the firebaseConfig object
4. Update firebase-config.js with your config
```

**Deploy Security Rules:**
```javascript
// Copy the rules from firebase-config.js comments (lines 27-67)
// Paste in Firestore → Rules tab
```

### 2. EmailJS Setup

**Create Account & Service:**
```
1. Go to https://www.emailjs.com
2. Create account → Add Email Service (Gmail recommended)
3. Create Email Template for notifications
4. Get: Public Key, Service ID, Template ID
```

**Update Credentials in script.js:**
```javascript
const EMAILJS_PUBLIC_KEY = "your_public_key_here";
const EMAILJS_SERVICE_ID = "service_xxxxxxx";  
const EMAILJS_TEMPLATE_ID = "template_xxxxxxx";
```

### 3. Admin Configuration

**Add Admin Emails in firebase-config.js:**
```javascript
window.ADMIN_EMAILS = [
  "ramaserljay5@gmail.com",
  "your-admin@gmail.com",
  "team-member@gmail.com"
];
```

### 4. Local Development

```bash
# Clone/download project
# Open in VS Code
# Install Live Server extension
# Right-click index.html → "Open with Live Server"
# Access admin: triple-click footer year OR go to /admin.html
```

## 📁 File Structure

```
mystore/
├── 📄 index.html          # Main website
├── 📄 admin.html          # Admin dashboard
├── 📄 script.js           # Main functionality + chat system
├── 📄 admin.js            # Admin dashboard logic
├── 📄 styles.css          # Main website styles  
├── 📄 admin.css           # Admin dashboard styles
├── 📄 firebase-config.js  # Firebase config + security rules
├── 📄 404.html           # Custom error page
├── 📄 robots.txt         # SEO robots directive
├── 📄 sitemap.xml        # SEO sitemap
├── 📄 firebase.json      # Firebase hosting config
└── 📁 img/               # Images, logos, team photos
    ├── logolandscape.png
    ├── logocircle.png
    ├── luste.jpg         # Team member photos
    ├── tibor.jpg
    ├── pastor.jpg
    ├── casas.jpg
    ├── bitar.jpg
    └── torres.jpg
```

## 💬 Chat System Flow

### 🤖 Bot Interaction (No Sign-in)
```
1. User clicks chat widget
2. Bot greets with typing animation
3. Shows 6 quick options:
   • Our Services
   • Pricing  
   • Hours & Availability
   • Location
   • Turnaround Time
   • Chat with Agent
4. Bot responds from knowledge base
5. User can return to main menu anytime
```

### 👨‍💼 Live Agent Escalation  
```
1. User clicks "Chat with Agent"
2. Bot explains connection process
3. Google sign-in screen appears
4. Email alert sent to admin immediately  
5. Real-time messaging begins
6. Admin sees live online/offline status
```

## 🛡️ Admin Dashboard

### Access Methods
- **Hidden Access:** Triple-click footer year on main site
- **Direct URL:** `/admin.html`
- **Authentication:** Google sign-in (authorized emails only)

### Dashboard Sections

**📊 Dashboard:**
- Total projects counter
- Active projects tracker  
- Completed projects stats
- Recent project activity

**📋 Projects:**
- Full project lifecycle management
- Status tracking (Pending → In Progress → Review → Completed)
- Client information & deadlines
- Project filtering & search

**📥 Requests:**  
- Service inquiry management
- Status updates (New → Contacted → Converted → Archived)
- Convert to projects functionality
- Client contact tracking

**💬 Messages:**
- Real-time chat interface
- Live presence indicators (Online/Last seen Xm ago)
- Team assignment capabilities
- Chat archival system
- Unread message counters

### Team Roles & Permissions

| Role | Access Level |
|------|-------------|
| **Main Admin** | Full access to all features |
| **Team Members** | Assigned chats + projects only |

**Current Team:**
- **Erl Jay Ramas** — CEO & Lead Developer
- **John Mark Luste** — Lead Developer  
- **Jasper Tibor** — Backend Engineer
- **Jose Lito Pastor** — Frontend Engineer
- **Ramonito Casas** — Systems & Infrastructure Engineer
- **John Mark Bitar** — Software Engineer
- **Carlos Miguel Torres** — QA Engineer & IT Operations

## 🎨 Customization

### Brand Colors
```css
/* Update in styles.css */
:root {
  --primary: #007BFF;        /* Main blue */
  --primary-hover: #339DFF;  /* Hover blue */
  --neon: #39FF14;           /* Accent green */
  --bg: #1E1E1E;            /* Dark background */
}
```

### Bot Knowledge Base
```javascript
// Update in script.js (line ~487)
const botResponses = {
  "services": "Your custom services description...",
  "pricing": "Your custom pricing info...", 
  "contact": "Your custom contact details..."
};
```

### Team Photos
```
Replace images in /img/ folder:
- luste.jpg, tibor.jpg, pastor.jpg
- casas.jpg, bitar.jpg, torres.jpg
Keep filenames same or update HTML references
```

## 🚀 Deployment

### Firebase Hosting (Recommended)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting (if not done)
firebase init hosting

# Deploy
firebase deploy --only hosting
```

### Manual Deployment
```
1. Upload all files to web server
2. Update Firebase authorized domains
3. Update EmailJS allowed origins  
4. Test admin access & chat functionality
```

### GitHub Pages
```
1. Push to GitHub repository
2. Settings → Pages → Deploy from branch
3. Update Firebase/EmailJS domain settings
```

## 🛠️ Tech Stack

**Frontend:**
- HTML5 (Semantic markup, structured data)
- CSS3 (Custom properties, animations, responsive design)
- Vanilla JavaScript (ES6+, no frameworks for performance)

**Backend Services:**
- Firebase Authentication (Google OAuth)
- Firestore (Real-time NoSQL database)  
- EmailJS (Server-free email notifications)

**Security:**
- Firebase Security Rules (Database access control)
- Anti-debugging protection (DevTools blocking)
- Role-based admin permissions
- Rate limiting on chat messages

## 🔧 Development

### Local Testing
```bash
# Serve with live reload
npx live-server

# Or use VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

### Firebase Emulator (Optional)
```bash
firebase init emulators
firebase emulators:start
```

## 🐛 Troubleshooting

### Chat System Issues
```
❌ Chat not loading
✅ Check browser console for Firebase errors
✅ Verify firebase-config.js has correct credentials
✅ Ensure Firestore security rules are deployed

❌ Sign-in failing  
✅ Check Google Auth is enabled in Firebase
✅ Verify domain is in authorized domains list
✅ Clear browser cache/try incognito

❌ Messages not sending
✅ Check Firestore security rules allow user writes
✅ Verify user email is authenticated
✅ Check rate limiting (5 messages per 10 seconds)
```

### Admin Dashboard Issues
```
❌ Admin access denied
✅ Ensure email is in ADMIN_EMAILS array
✅ Google account email must match exactly
✅ Try signing out and back in

❌ Real-time updates not working
✅ Check Firestore connection in console
✅ Verify security rules allow admin reads
✅ Test with different browser/incognito
```

### Email Notifications Failed
```
❌ No email alerts received
✅ Check EmailJS credentials in script.js
✅ Verify template ID exists and is active
✅ Test EmailJS service connection
✅ Check spam folder for notifications
```

## 📞 Support & Contact

**Primary Contact:**  
📧 ramaserljay5@gmail.com  
📱 Facebook: [Erl Jay Ramas](https://www.facebook.com/erljayramas)  
💼 LinkedIn: [Erl Jay Ramas](https://www.linkedin.com/in/erl-jay-ramas-1114b4332/)

**Website:**  
🌐 Live Site: [acentratech.web.app](https://acentratech.web.app)

---

**🚀 Built with excellence by the Acentra team**