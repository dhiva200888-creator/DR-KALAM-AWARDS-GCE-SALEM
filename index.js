```javascript
const {
    onDocumentCreated
} = require(
    "firebase-functions/v2/firestore"
);

const admin =
    require("firebase-admin");


// ==========================================
// INITIALIZE FIREBASE ADMIN
// ==========================================

admin.initializeApp();


// ==========================================
// WARDEN MOBILE NUMBER
// ==========================================

// India country code +91
const WARDEN_MOBILE =
    "918072549048";


// ==========================================
// SEND WARDEN SMS
// ==========================================

async function sendWardenSMS(attendance) {

    // MSG91 credentials
    // These MUST be stored securely.

    const authKey =
        process.env.MSG91_AUTHKEY;

    const templateId =
        process.env.MSG91_TEMPLATE_ID;


    if (!authKey) {

        throw new Error(
            "MSG91_AUTHKEY is missing."
        );

    }


    if (!templateId) {

        throw new Error(
            "MSG91_TEMPLATE_ID is missing."
        );

    }


    // ======================================
    // GET ATTENDANCE DETAILS
    // ======================================

    const studentName =

        attendance.studentName ||

        "Student";


    const registerNumber =

        attendance.registerNo ||

        attendance.registerNumber ||

        "N/A";


    const club =

        attendance.club ||

        "Club";


    const time =

        attendance.time ||

        new Date().toLocaleString(

            "en-IN",

            {
                timeZone:
                    "Asia/Kolkata"
            }

        );


    // ======================================
    // MSG91 FLOW API
    // ======================================

    const response =

        await fetch(

            "https://control.msg91.com/api/v5/flow",

            {

                method:
                    "POST",

                headers: {

                    "accept":
                        "application/json",

                    "authkey":
                        authKey,

                    "content-type":
                        "application/json"

                },

                body:

                    JSON.stringify({

                        template_id:
                            templateId,

                        short_url:
                            "0",

                        recipients: [

                            {

                                mobiles:
                                    WARDEN_MOBILE,

                                VAR1:
                                    studentName,

                                VAR2:
                                    registerNumber,

                                VAR3:
                                    club,

                                VAR4:
                                    time

                            }

                        ]

                    })

            }

        );


    const result =
        await response.json();


    console.log(
        "MSG91 response:",
        result
    );


    if (!response.ok) {

        throw new Error(

            JSON.stringify(result)

        );

    }


    return result;

}


// ==========================================
// FIRESTORE TRIGGER
// ==========================================

exports.sendWardenSMS =

    onDocumentCreated(

        "attendance/{attendanceId}",

        async (event) => {

            const snapshot =
                event.data;


            if (!snapshot) {

                console.log(
                    "No attendance document."
                );

                return;

            }


            const attendance =
                snapshot.data();


            console.log(
                "New attendance received:",
                attendance
            );


            try {

                // ==================================
                // SEND SMS
                // ==================================

                const result =

                    await sendWardenSMS(
                        attendance
                    );


                // ==================================
                // UPDATE FIRESTORE
                // ==================================

                await snapshot.ref.update({

                    smsStatus:
                        "sent",

                    smsResponse:
                        result,

                    smsSentAt:

                        admin.firestore
                            .FieldValue
                            .serverTimestamp()

                });


                console.log(
                    "✅ SMS sent successfully."
                );


            }

            catch(error) {

                console.error(
                    "❌ SMS failed:",
                    error
                );


                // ==================================
                // SAVE ERROR
                // ==================================

                await snapshot.ref.update({

                    smsStatus:
                        "failed",

                    smsError:
                        error.message,

                    smsFailedAt:

                        admin.firestore
                            .FieldValue
                            .serverTimestamp()

                });

            }

        }

    );
```