// ==========================================
// SMART CLASSROOM QR SCANNER
// ==========================================

let scanner = null;
let scannerRunning = false;
let scannedData = null;


// ==========================================
// GET ELEMENTS
// ==========================================

const startButton =
    document.getElementById("startScannerButton");

const stopButton =
    document.getElementById("stopScannerButton");

const recordButton =
    document.getElementById("recordAttendanceButton");


// ==========================================
// CHECK PAGE
// ==========================================

console.log("scanner.js loaded successfully.");


// Check QR library
if (typeof Html5Qrcode === "undefined") {

    console.error(
        "Html5Qrcode library was NOT loaded."
    );

} else {

    console.log(
        "Html5Qrcode library loaded successfully."
    );

}


// ==========================================
// START BUTTON
// ==========================================

if (startButton) {

    startButton.addEventListener(
        "click",
        startScanner
    );

}


// ==========================================
// STOP BUTTON
// ==========================================

if (stopButton) {

    stopButton.addEventListener(
        "click",
        stopScanner
    );

}


// ==========================================
// RECORD BUTTON
// ==========================================

if (recordButton) {

    recordButton.addEventListener(
        "click",
        recordScannedAttendance
    );

}


// ==========================================
// START SCANNER
// ==========================================

async function startScanner() {

    console.log("Start Scanner button clicked.");


    // Prevent duplicate scanner
    if (scannerRunning) {

        console.log(
            "Scanner is already running."
        );

        return;

    }


    // Check library
    if (typeof Html5Qrcode === "undefined") {

        alert(
            "QR Scanner library is not loaded.\n\n" +
            "Please check your internet connection and reload the page."
        );

        return;

    }


    // Check reader
    const reader =
        document.getElementById("reader");


    if (!reader) {

        alert(
            "Scanner area was not found."
        );

        return;

    }


    try {

        // ==========================================
        // CHECK CAMERA
        // ==========================================

        console.log(
            "Checking available cameras..."
        );


        const cameras =
            await Html5Qrcode.getCameras();


        console.log(
            "Available cameras:",
            cameras
        );


        if (!cameras || cameras.length === 0) {

            throw new Error(
                "No camera detected."
            );

        }


        // ==========================================
        // SELECT CAMERA
        // ==========================================

        let cameraId =
            cameras[0].id;


        // Try to find rear camera
        for (const camera of cameras) {

            const label =
                camera.label.toLowerCase();


            if (
                label.includes("back") ||
                label.includes("rear") ||
                label.includes("environment")
            ) {

                cameraId =
                    camera.id;

                break;

            }

        }


        console.log(
            "Using camera:",
            cameraId
        );


        // ==========================================
        // CREATE SCANNER
        // ==========================================

        scanner =
            new Html5Qrcode("reader");


        // ==========================================
        // CONFIG
        // ==========================================

        const config = {

            fps: 10,

            qrbox: {
                width: 250,
                height: 250
            }

        };


        // ==========================================
        // START CAMERA
        // ==========================================

        await scanner.start(

            cameraId,

            config,

            onScanSuccess,

            onScanFailure

        );


        scannerRunning = true;


        console.log(
            "Scanner started successfully."
        );


        // ==========================================
        // BUTTONS
        // ==========================================

        if (startButton) {

            startButton.style.display =
                "none";

        }


        if (stopButton) {

            stopButton.style.display =
                "block";

        }

    } catch (error) {

        console.error(
            "Unable to start scanner:",
            error
        );


        scannerRunning = false;
        scanner = null;


        alert(
            "Unable to start the camera.\n\n" +

            "Please check:\n" +

            "• Camera permission is allowed\n" +

            "• You are using HTTPS or localhost\n" +

            "• Your device has a camera\n" +

            "• No other application is using the camera"
        );

    }

}


// ==========================================
// QR SUCCESS
// ==========================================

function onScanSuccess(decodedText) {

    console.log(
        "QR CODE DETECTED:",
        decodedText
    );


    // Prevent duplicate scan
    if (scannedData !== null) {

        return;

    }


    try {

        // Convert QR text to JSON
        const data =
            JSON.parse(decodedText);


        console.log(
            "QR DATA:",
            data
        );


        // ==========================================
        // VALIDATE QR
        // ==========================================

        if (
            !data.name &&
            !data.office &&
            !data.position
        ) {

            throw new Error(
                "Not an attendance QR."
            );

        }


        scannedData = data;


        // ==========================================
        // DISPLAY NAME
        // ==========================================

        document.getElementById(
            "resultName"
        ).textContent =
            data.name || "-";


        // ==========================================
        // DISPLAY OFFICE
        // ==========================================

        document.getElementById(
            "resultOffice"
        ).textContent =
            data.office || "-";


        // ==========================================
        // DISPLAY POSITION
        // ==========================================

        document.getElementById(
            "resultPosition"
        ).textContent =
            data.position || "-";


        // ==========================================
        // DISPLAY DATE
        // ==========================================

        document.getElementById(
            "resultDate"
        ).textContent =
            data.dateTime ||
            new Date().toLocaleString();


        // ==========================================
        // SHOW RESULT
        // ==========================================

        document.getElementById(
            "noScanResult"
        ).style.display =
            "none";


        document.getElementById(
            "scanResult"
        ).style.display =
            "block";


        // Stop camera
        stopScanner();


    } catch (error) {

        console.error(
            "Invalid QR code:",
            error
        );

    }

}


// ==========================================
// SCAN FAILURE
// ==========================================

function onScanFailure(error) {

    // Ignore continuous scan failures.
    // This is normal while searching for QR codes.

}


// ==========================================
// STOP SCANNER
// ==========================================

async function stopScanner() {

    console.log(
        "Stopping scanner..."
    );


    if (!scanner) {

        scannerRunning = false;

        if (startButton) {
            startButton.style.display =
                "block";
        }

        if (stopButton) {
            stopButton.style.display =
                "none";
        }

        return;

    }


    try {

        if (scannerRunning) {

            await scanner.stop();

        }


        await scanner.clear();


    } catch (error) {

        console.error(
            "Error stopping scanner:",
            error
        );

    }


    scanner = null;

    scannerRunning = false;


    // ==========================================
    // BUTTONS
    // ==========================================

    if (startButton) {

        startButton.style.display =
            "block";

    }


    if (stopButton) {

        stopButton.style.display =
            "none";

    }


    console.log(
        "Scanner stopped."
    );

}


// ==========================================
// RECORD ATTENDANCE
// ==========================================

function recordScannedAttendance() {

    if (!scannedData) {

        alert(
            "Please scan a QR code first."
        );

        return;

    }


    // ==========================================
    // CURRENT TIME
    // ==========================================

    const now =
        new Date();


    // ==========================================
    // CREATE RECORD
    // ==========================================

    const record = {

        name:
            scannedData.name || "",

        office:
            scannedData.office || "",

        position:
            scannedData.position || "",

        dateTime:
            now.toISOString(),

        displayDateTime:
            now.toLocaleString(
                "en-US",
                {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true
                }
            )

    };


    // ==========================================
    // GET EXISTING RECORDS
    // ==========================================

    let records = [];


    try {

        const saved =
            localStorage.getItem(
                "attendanceRecords"
            );


        if (saved) {

            records =
                JSON.parse(saved);

        }


        if (!Array.isArray(records)) {

            records = [];

        }

    } catch (error) {

        console.error(
            "Could not read attendance records:",
            error
        );

        records = [];

    }


    // ==========================================
    // ADD RECORD
    // ==========================================

    records.push(record);


    // ==========================================
    // SAVE
    // ==========================================

    localStorage.setItem(
        "attendanceRecords",
        JSON.stringify(records)
    );


    // ==========================================
    // SUCCESS
    // ==========================================

    alert(
        "Attendance recorded successfully!"
    );


    // ==========================================
    // RESET
    // ==========================================

    scannedData = null;


    document.getElementById(
        "scanResult"
    ).style.display =
        "none";


    document.getElementById(
        "noScanResult"
    ).style.display =
        "block";


    console.log(
        "Attendance saved:",
        record
    );

}