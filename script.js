// ================= FIREBASE CONFIG =================

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "worknest-8da58.firebaseapp.com",
    projectId: "worknest-8da58",
    storageBucket: "worknest-8da58.appspot.com",
    messagingSenderId: "673928983491",
    appId: "1:673928983491:web:ddcd8252f16e9dfb850376"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();


// ================= STUDENT LOGIN =================

function usernameToEmail(username) {
    return username.includes("@") ? username : username + "@worknest.com";
}

async function loginStudent() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Enter login details");
        return;
    }

    const email = usernameToEmail(username);

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        localStorage.setItem("loggedInStudent", userCredential.user.email);
        window.location.href = "dashboard.html";
    } catch (error) {
        try {
            const newUser = await auth.createUserWithEmailAndPassword(email, password);
            localStorage.setItem("loggedInStudent", newUser.user.email);
            window.location.href = "dashboard.html";
        } catch (err) {
            alert(err.message);
        }
    }
}

function checkLogin() {
    if (!localStorage.getItem("loggedInStudent")) {
        window.location.href = "login.html";
    }
}

function logout() {
    auth.signOut();
    localStorage.removeItem("loggedInStudent");
    window.location.href = "index.html";
}


// ================= REGISTER STUDENT PROFILE =================

function registerStudent() {
   

    let student = {
        name: document.getElementById("name").value,
        skill: document.getElementById("skills").value,
        date: document.getElementById("date").value,
        location: document.getElementById("location").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value
    };

    db.collection("students").add(student)
        .then(() => alert("Profile Saved"))
        .catch(err => alert(err.message));
}


// ================= POST JOB =================

async function postJob() {
    console.log("Posting Job...");

    let job = {
        title: document.getElementById("title").value,
        skill: document.getElementById("skill").value,
        date: document.getElementById("date").value,
        location: document.getElementById("location").value,
        salary: document.getElementById("salary").value,
        type: document.getElementById("jobType").value,
        contactPerson: document.getElementById("contactPerson").value,
        contactPhone: document.getElementById("contactPhone").value,
        status: "Pending"
    };

    await db.collection("jobs").add(job);
    alert("Job Posted Successfully!");
    console.log("Job Posted Successfully!");
}


// ================= LOAD JOBS FOR STUDENT =================

function loadJobs() {
    const container = document.getElementById("jobList");
    container.innerHTML = "";

    db.collection("jobs").where("status", "==", "Approved")
        .get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const job = doc.data();
                const id = doc.id;

                container.innerHTML += `
                    <div class="job-card">
                        <h3>${job.title}</h3>
                        <p>Location: ${job.location}</p>
                        <p>Salary: ₹${job.salary}</p>
                        <button onclick="applyJob('${id}', '${job.title}')">Apply</button>
                    </div>
                `;
            });
        });
}


// ================= APPLY JOB =================

function applyJob(jobId, title) {
    const student = localStorage.getItem("loggedInStudent");

    db.collection("applications").add({
        jobId: jobId,
        title: title,
        student: student
    }).then(() => alert("Applied Successfully!"));
}


// ================= ADMIN LOGIN =================

function adminLogin() {
    let user = document.getElementById("adminUser").value;
    let pass = document.getElementById("adminPass").value;

    if (user === "admin" && pass === "1234") {
        localStorage.setItem("adminLoggedIn", "true");
        window.location.href = "admin-panel.html";
    } else {
        alert("Invalid Credentials");
    }
}

function checkAdmin() {
    if (localStorage.getItem("adminLoggedIn") !== "true") {
        window.location.href = "admin-login.html";
    } else {
        loadAdminJobs();
        loadAdminApplications();
    }
}

function adminLogout() {
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "index.html";
}


// ================= ADMIN JOB MANAGEMENT =================

function loadAdminJobs() {

    const container = document.getElementById("adminJobList");
    container.innerHTML = "";

    db.collection("jobs").get().then(snapshot => {
        snapshot.forEach(doc => {
            const job = doc.data();
            const id = doc.id;

            container.innerHTML += `
                <div class="job-card">
                    <h3>${job.title}</h3>
                    <p>Status: ${job.status}</p>

                    ${job.status === "Pending" ? `
                        <button onclick="approveJob('${id}')">Approve</button>
                        <button onclick="rejectJob('${id}')">Reject</button>
                    ` : ""}
                </div>
            `;
        });
    });
}

function approveJob(id) {
    db.collection("jobs").doc(id).update({ status: "Approved" })
        .then(() => loadAdminJobs());
}

function rejectJob(id) {
    db.collection("jobs").doc(id).update({ status: "Rejected" })
        .then(() => loadAdminJobs());
}


// ================= ADMIN VIEW APPLICATIONS =================

function loadAdminApplications() {

    const container = document.getElementById("adminApplicationList");
    container.innerHTML = "";

    db.collection("applications").get().then(snapshot => {
        snapshot.forEach(doc => {
            const app = doc.data();

            container.innerHTML += `
                <div class="job-card">
                    <h3>${app.title}</h3>
                    <p>Applied By: ${app.student}</p>
                </div>
            `;
        });
    });
}