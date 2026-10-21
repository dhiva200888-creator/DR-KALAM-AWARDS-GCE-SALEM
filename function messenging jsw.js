```javascript
importScripts(
    "https://www.gstatic.com/firebasejs/12.3.0/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/12.3.0/firebase-messaging-compat.js"
);


// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

firebase.initializeApp({

    apiKey:
        "YOUR_API_KEY",

    authDomain:
        "YOUR_PROJECT.firebaseapp.com",

    projectId:
        "YOUR_PROJECT_ID",

    storageBucket:
        "YOUR_PROJECT.firebasestorage.app",

    messagingSenderId:
        "YOUR_SENDER_ID",

    appId:
        "YOUR_APP_ID"

});


// ==========================================
// FIREBASE MESSAGING
// ==========================================

const messaging =
    firebase.messaging();


// ==========================================
// BACKGROUND NOTIFICATION
// ==========================================

messaging.onBackgroundMessage(

    function(payload) {

        console.log(
            "Background message:",
            payload
        );


        const notificationTitle =

            payload.notification?.title ||

            "SmartHostel";


        const notificationOptions = {

            body:

                payload.notification?.body ||

                "New hostel attendance received.",

            icon: "/icon.png"

        };


        self.registration.showNotification(

            notificationTitle,

            notificationOptions

        );

    }

);
```