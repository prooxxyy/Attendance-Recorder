function addAttendance() {

    let name = document.getElementById("name").value.trim();
    let office = document.getElementById("office").value.trim();
    let position = document.getElementById("position").value.trim();

    if (name === "" || office === "" || position === "") {
        alert("Please complete all fields.");
        return;
    }

    // Current date and time
    const now = new Date();

    const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    };

    const dateTime = now.toLocaleString("en-US", options);

    // Display date and time
    document.getElementById("datetime").value = dateTime;

    // Add to table (newest on top)
    const tbody = document.querySelector("#attendanceTable tbody");

    const row = tbody.insertRow(0);

    row.insertCell(0).textContent = name;
    row.insertCell(1).textContent = office;
    row.insertCell(2).textContent = position;
    row.insertCell(3).textContent = dateTime;

    saveAttendance(name, office, position, dateTime); 

    // Clear the form
    document.getElementById("name").value = "";
    document.getElementById("office").value = "";
    document.getElementById("position").value = "";
    document.getElementById("datetime").value = "";

    // Show popup
    document.getElementById("successModal").style.display = "block";
}

function closeModal() {
    document.getElementById("successModal").style.display = "none";
}

// Close if clicked outside
window.onclick = function(event) {
    let modal = document.getElementById("successModal");

    if (event.target === modal) {
        modal.style.display = "none";
    }
}

function downloadExcel() {
   const table = document.getElementById("attendanceTable");
    const rows = table.querySelectorAll("tbody tr");

    if (rows.length === 0) {
        alert("No attendance records to download yet.");
        return;
    }

    const workbook = XLSX.utils.table_to_book(table, { sheet: "Attendance" });
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `NextGen_Smart_Classroom_Attendance_${today}.xlsx`);

    // Clear the table and saved records after download
    document.querySelector("#attendanceTable tbody").innerHTML = "";
    localStorage.removeItem("attendanceRecords");
}

window.addEventListener("DOMContentLoaded", loadAttendance);

function loadAttendance() {
    const records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];
    const tbody = document.querySelector("#attendanceTable tbody");

    // Records are stored oldest-first; reverse so the newest shows on top
    records.slice().reverse().forEach(record => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = record.name;
        row.insertCell(1).textContent = record.office;
        row.insertCell(2).textContent = record.position;
        row.insertCell(3).textContent = record.dateTime;
    });
}

function saveAttendance(name, office, position, dateTime) {
    const records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];
    records.push({ name, office, position, dateTime });
    localStorage.setItem("attendanceRecords", JSON.stringify(records));
}