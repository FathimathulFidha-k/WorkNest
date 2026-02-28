// ================= FIREBASE CONFIG (from .env via firebase-config.js) =================
// Credentials loaded from firebase-config.js which is generated from .env

// Fallback config (used if firebase-config.js is not found)
const fallbackFirebaseConfig = {
  apiKey: "AIzaSyBLAmdPShLmSdy0vmBpiPh4OGKymD_QpGA",
  authDomain: "worknest-8da58.firebaseapp.com",
  projectId: "worknest-8da58",
  storageBucket: "worknest-8da58.appspot.com",
  messagingSenderId: "673928983491",
  appId: "1:673928983491:web:ddcd8252f16e9dfb850376",
  measurementId: "G-93R6G0VJJ0"
};

// Use config from firebase-config.js if available, otherwise use fallback
const firebaseConfig = (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__) 
  ? window.__FIREBASE_CONFIG__ 
  : fallbackFirebaseConfig;

// Initialize Firebase
if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
    try {
        firebase.initializeApp(firebaseConfig);
        window.__FIREBASE_AUTH__ = firebase.auth();
        window.__FIREBASE_DB__ = firebase.firestore();
        console.log('✓ Firebase initialized successfully');
    } catch (error) {
        console.warn('Firebase initialization warning:', error.message);
    }
} else if (typeof firebase === 'undefined') {
    console.warn('⚠️ Firebase SDK not found. Make sure Firebase SDK scripts are included in your HTML.');
}

// Helper accessors for other functions
function getAuth() { 
    return (typeof window !== 'undefined' && window.__FIREBASE_AUTH__) 
        ? window.__FIREBASE_AUTH__ 
        : null;
}

function getDB() { 
    return (typeof window !== 'undefined' && window.__FIREBASE_DB__) 
        ? window.__FIREBASE_DB__ 
        : null;
}


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
        const userCredential = await getAuth().signInWithEmailAndPassword(email, password);
        localStorage.setItem("loggedInStudent", userCredential.user.email);
        window.location.href = "dashboard.html";
    } catch (error) {
        try {
            const newUser = await getAuth().createUserWithEmailAndPassword(email, password);
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
    const a = getAuth();
    if (a && a.signOut) a.signOut();
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

    const database = getDB();
    if (database) {
        database.collection("students").add(student)
            .then(() => alert("Profile Saved"))
            .catch(err => alert(err.message));
        return;
    }
    alert('Profile saved locally (no Firestore)');
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

    const database = getDB();
    if (database) {
        await database.collection("jobs").add(job);
        alert("Job Posted Successfully!");
        console.log("Job Posted Successfully!");
        return;
    }
    // fallback: localStorage
    let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    jobs.push(job);
    localStorage.setItem('jobs', JSON.stringify(jobs));
    alert('Job Posted locally (no Firestore)');
    console.log('Job posted locally');
}


// ================= LOAD JOBS FOR STUDENT =================

function loadJobs() {
    const container = document.getElementById("jobList");
    container.innerHTML = "";

    const database = getDB();
    if (database) {
        database.collection("jobs").where("status", "==", "Approved")
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
            }).catch(err => console.error('Failed to load jobs from Firestore', err));
        return;
    }

    // fallback: localStorage
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    jobs.forEach(job => {
        if (job.status !== 'Approved') return;
        container.innerHTML += `
                    <div class="job-card">
                        <h3>${job.title}</h3>
                        <p>Location: ${job.location}</p>
                        <p>Salary: ₹${job.salary}</p>
                        <button onclick="applyJob('${job.title}', '${job.title}')">Apply</button>
                    </div>
                `;
    });
}


// ================= APPLY JOB =================

function applyJob(jobId, title) {
    const student = localStorage.getItem("loggedInStudent");

    const database = getDB();
    if (database) {
        database.collection("applications").add({ jobId: jobId, title: title, student: student })
            .then(() => alert("Applied Successfully!"))
            .catch(err => {
                console.error('Failed to apply via Firestore', err);
                const applications = JSON.parse(localStorage.getItem('applications')) || [];
                applications.push({ title: title, student });
                localStorage.setItem('applications', JSON.stringify(applications));
                alert('Applied locally (no Firestore)');
            });
        return;
    }

    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    applications.push({ title: title, student });
    localStorage.setItem('applications', JSON.stringify(applications));
    alert('Applied Successfully! (offline)');
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

    const database = getDB();
    if (database) {
        database.collection("jobs").get().then(snapshot => {
            if (snapshot.empty) {
                container.innerHTML = '<p>No jobs posted yet.</p>';
                return;
            }
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
        }).catch(err => console.error('Failed to load admin jobs from Firestore', err));
        return;
    }

    // fallback: localStorage
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    if (jobs.length === 0) {
        container.innerHTML = '<p>No jobs posted yet.</p>';
        return;
    }
    jobs.forEach((job, index) => {
        container.innerHTML += `
            <div class="job-card">
                <h3>${job.title}</h3>
                <p>Status: ${job.status}</p>

                ${job.status === "Pending" ? `
                    <button onclick="approveJob(${index})">Approve</button>
                    <button onclick="rejectJob(${index})" style="background:red;">Reject</button>
                ` : ""}
            </div>
        `;
    });
}

function approveJob(id) {
    const database = getDB();
    if (database) {
        database.collection('jobs').doc(id).update({ status: 'Approved' }).then(() => loadAdminJobs()).catch(err => console.error('Failed to approve job in Firestore', err));
        return;
    }
    let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    if (jobs[id]) {
        jobs[id].status = 'Approved';
        localStorage.setItem('jobs', JSON.stringify(jobs));
    }
    loadAdminJobs();
}

function rejectJob(id) {
    const database = getDB();
    if (database) {
        database.collection('jobs').doc(id).update({ status: 'Rejected' }).then(() => loadAdminJobs()).catch(err => console.error('Failed to reject job in Firestore', err));
        return;
    }
    let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    if (jobs[id]) {
        jobs[id].status = 'Rejected';
        localStorage.setItem('jobs', JSON.stringify(jobs));
    }
    loadAdminJobs();
}


// ================= ADMIN VIEW APPLICATIONS =================

function loadAdminApplications() {

    const container = document.getElementById("adminApplicationList");
    container.innerHTML = "";

    const database = getDB();
    if (database) {
        database.collection('applications').get().then(snapshot => {
            if (snapshot.empty) {
                container.innerHTML = '<p>No applications yet.</p>';
                return;
            }
            snapshot.forEach(doc => {
                const app = doc.data();

                container.innerHTML += `
                <div class="job-card">
                    <h3>${app.title}</h3>
                    <p>Applied By: ${app.student}</p>
                </div>
            `;
            });
        }).catch(err => console.error('Failed to load applications from Firestore', err));
        return;
    }

    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    if (applications.length === 0) {
        container.innerHTML = '<p>No applications yet.</p>';
        return;
    }
    applications.forEach(app => {
        container.innerHTML += `
            <div class="job-card">
                <h3>${app.title}</h3>
                <p>Applied By: ${app.student}</p>
            </div>
        `;
    });
}