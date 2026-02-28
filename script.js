// ---------------- STUDENT & FIREBASE INTEGRATION ----------------

// Firebase config (project provided)
const firebaseConfig = {
    apiKey: "AIzaSyBLAmdPShLmSdy0vmBpiPh4OGKymD_QpGA",
    authDomain: "worknest-8da58.firebaseapp.com",
    projectId: "worknest-8da58",
    // corrected storage bucket (was incorrectly set to .firebasestorage.app)
    storageBucket: "worknest-8da58.appspot.com",
    messagingSenderId: "673928983491",
    appId: "1:673928983491:web:ddcd8252f16e9dfb850376",
    measurementId: "G-93R6G0VJJ0"
};

let firebaseReady = false;
let fbApp = null;
let fbAuth = null;
let fbDB = null;

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

async function initFirebase() {
    if (window.firebase && firebase.apps && firebase.apps.length) {
        fbApp = firebase.app();
        fbAuth = firebase.auth();
        fbDB = firebase.firestore();
        firebaseReady = true;
        console.log('Firebase already initialized');
        return;
    }

    try {
        await loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
        await loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js');
        await loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js');

        fbApp = firebase.initializeApp(firebaseConfig);
        fbAuth = firebase.auth();
        fbDB = firebase.firestore();
        firebaseReady = true;
        console.log('Firebase initialized');
    } catch (err) {
        console.error('Firebase init failed', err);
        firebaseReady = false;
    }
}

initFirebase();

function usernameToEmail(username) {
    if (!username) return '';
    return username.includes('@') ? username : `${username}@worknest.local`;
}

// ---------------- STUDENT AUTH ----------------
async function loginStudent() {
    const username = document.getElementById('username') ? document.getElementById('username').value : '';
    const password = document.getElementById('password') ? document.getElementById('password').value : '';

    if (!username || !password) {
        alert('Please enter login details');
        return;
    }

    const email = usernameToEmail(username);

    if (firebaseReady) {
        try {
            const cred = await fbAuth.signInWithEmailAndPassword(email, password);
            const user = cred.user;
            localStorage.setItem('loggedInStudent', user.email || user.uid || username);
            alert('Login Successful!');
            window.location.href = 'dashboard.html';
            return;
        } catch (err) {
            // If user not found, auto-create (sign-up)
            if (err.code === 'auth/user-not-found') {
                try {
                    const cu = await fbAuth.createUserWithEmailAndPassword(email, password);
                    const created = cu.user;
                    localStorage.setItem('loggedInStudent', created.email || created.uid || username);
                    alert('Account created and logged in');
                    window.location.href = 'dashboard.html';
                    return;
                } catch (cErr) {
                    console.error('Create user failed', cErr);
                    alert('Authentication error: ' + cErr.message);
                    return;
                }
            }
            console.error('Sign in failed', err);
            alert('Authentication error: ' + err.message);
            return;
        }
    }

    // fallback to localStorage behavior
    localStorage.setItem('loggedInStudent', username);
    alert('Login Successful! (offline)');
    window.location.href = 'dashboard.html';
}

function checkLogin() {
    if (!localStorage.getItem('loggedInStudent')) {
        alert('Please login first!');
        window.location.href = 'login.html';
    }
}

function logout() {
    if (firebaseReady && fbAuth.currentUser) {
        fbAuth.signOut().catch(err => console.warn('Sign out error', err));
    }
    localStorage.removeItem('loggedInStudent');
    window.location.href = 'index.html';
}

// ---------------- REGISTER STUDENT PROFILE ----------------

function registerStudent() {
    let selectedSkill = document.getElementById('skills') ? document.getElementById('skills').value : '';

    let student = {
        name: document.getElementById('name') ? document.getElementById('name').value : '',
        skills: selectedSkill === 'General' ? '' : selectedSkill,
        isGeneral: selectedSkill === 'General',
        date: document.getElementById('date') ? document.getElementById('date').value : '',
        location: document.getElementById('location') ? document.getElementById('location').value : ''
    };

    // save locally
    localStorage.setItem('student', JSON.stringify(student));

    // save to Firestore (if available) using current user's uid or email as key
    if (firebaseReady) {
        const current = fbAuth.currentUser;
        const key = current ? (current.uid || current.email) : (localStorage.getItem('loggedInStudent') || student.name);
        try {
            fbDB.collection('students').doc(String(key)).set(student, { merge: true });
            console.log('Student profile saved to Firestore for', key);
        } catch (err) {
            console.error('Failed to save student to Firestore', err);
        }
    }

    alert('Profile Saved Successfully!');
}

// ---------------- POST JOB ----------------

function postJob() {
    const job = {
        title: document.getElementById('title') ? document.getElementById('title').value : '',
        skill: document.getElementById('skill') ? document.getElementById('skill').value : '',
        date: document.getElementById('date') ? document.getElementById('date').value : '',
        location: document.getElementById('location') ? document.getElementById('location').value : '',
        salary: document.getElementById('salary') ? document.getElementById('salary').value : '',
        type: document.getElementById('jobType') ? document.getElementById('jobType').value : '',
        status: 'Pending',
        createdAt: new Date().toISOString()
    };

    if (firebaseReady) {
        fbDB.collection('jobs').add(job).then(() => {
            alert('Job Posted Successfully!');
        }).catch(err => {
            console.error('Failed to post job to Firestore', err);
            // fallback to localStorage
            const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
            jobs.push(job);
            localStorage.setItem('jobs', JSON.stringify(jobs));
            alert('Job Posted locally (Firestore error)');
        });
        return;
    }

    // fallback
    let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    jobs.push(job);
    localStorage.setItem('jobs', JSON.stringify(jobs));
    alert('Job Posted Successfully!');
}

// Disable skill field for General job
function toggleSkill() {
    let typeEl = document.getElementById('jobType');
    if (!typeEl) return;
    let type = typeEl.value;
    let skillField = document.getElementById('skill');
    if (!skillField) return;

    if (type === 'General') {
        skillField.value = '';
        skillField.disabled = true;
    } else {
        skillField.disabled = false;
    }
}

// ---------------- LOAD JOBS (STUDENT SIDE) ----------------

function loadJobs() {
    const jobList = document.getElementById('jobList');
    if (!jobList) return;
    jobList.innerHTML = '';

    const renderJob = (job, id) => {
        let match = 0;
        const student = JSON.parse(localStorage.getItem('student')) || null;

        if (student) {
            if (job.type === 'General') {
                if (student.date === job.date) match += 50;
                if (student.location === job.location) match += 50;
            } else {
                if (!student.isGeneral && student.skills === job.skill) match += 50;
                if (student.date === job.date) match += 30;
                if (student.location === job.location) match += 20;
            }
        }

        // if id provided (Firestore) pass id and title; otherwise pass title only
        const applyAction = id ? `applyJob('${id}', '${job.title.replace(/'/g, "\\'")}')` : `applyJob('${job.title.replace(/'/g, "\\'")}')`;

        jobList.innerHTML += `
                        <div class="job-card">
                                <h3>${job.title}</h3>
                                <p><b>Type:</b> ${job.type}</p>
                                <p><b>Location:</b> ${job.location}</p>
                                <p><b>Salary:</b> ₹${job.salary}</p>
                                <p><b>Match:</b> ${match}%</p>
                                <button onclick="${applyAction}">Apply</button>
                        </div>
                `;
    };

    if (firebaseReady) {
        fbDB.collection('jobs').where('status', '==', 'Approved').get().then(snapshot => {
            snapshot.forEach(doc => renderJob(doc.data(), doc.id));
        }).catch(err => console.error('Failed to fetch jobs from Firestore', err));
        return;
    }

    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    jobs.forEach(job => {
        if (job.status !== 'Approved') return;
        renderJob(job, null);
    });
}

// ---------------- APPLY JOB ----------------

function applyJob(idOrTitle, titleOpt) {
    const student = localStorage.getItem('loggedInStudent') || (fbAuth && fbAuth.currentUser && (fbAuth.currentUser.email || fbAuth.currentUser.uid)) || 'unknown';

    // If titleOpt is present, first arg is jobId (Firestore)
    if (firebaseReady && titleOpt) {
        fbDB.collection('applications').add({ jobId: idOrTitle, title: titleOpt, student }).then(() => {
            alert('Applied Successfully!');
        }).catch(err => {
            console.error('Failed to add application to Firestore', err);
            // fallback to localStorage
            const applications = JSON.parse(localStorage.getItem('applications')) || [];
            applications.push({ title: titleOpt, student });
            localStorage.setItem('applications', JSON.stringify(applications));
            alert('Applied locally (Firestore error)');
        });
        return;
    }

    // If only one argument, treat it as title (localStorage fallback)
    const title = titleOpt || idOrTitle;
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    applications.push({ title, student });
    localStorage.setItem('applications', JSON.stringify(applications));
    alert('Applied Successfully!');
}

// ---------------- LOAD STUDENT APPLICATIONS ----------------

function loadApplications() {
    const list = document.getElementById('applicationList');
    if (!list) return;
    list.innerHTML = '';

    const currentUser = localStorage.getItem('loggedInStudent');

    if (firebaseReady) {
        fbDB.collection('applications').get().then(snapshot => {
            snapshot.forEach(doc => {
                const app = doc.data();
                if (app.student === currentUser) {
                    list.innerHTML += `
                                <div class="job-card">
                                        <h3>${app.title}</h3>
                                        <p>Status: Applied</p>
                                </div>
                        `;
                }
            });
        }).catch(err => console.error('Failed to load applications from Firestore', err));
        return;
    }

    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    applications.forEach(app => {
        if (app.student === currentUser) {
            list.innerHTML += `
                                <div class="job-card">
                                        <h3>${app.title}</h3>
                                        <p>Status: Applied</p>
                                </div>
                        `;
        }
    });
}

// ---------------- ADMIN LOGIN ----------------

function adminLogin() {

    let user = document.getElementById("adminUser").value;
    let pass = document.getElementById("adminPass").value;

    if (user === "admin" && pass === "1234") {
        localStorage.setItem("adminLoggedIn", "true");
        alert("Admin Login Successful");
        window.location.href = "admin-panel.html";
    } else {
        alert("Invalid Admin Credentials");
    }
}

function checkAdmin() {
    if (localStorage.getItem("adminLoggedIn") !== "true") {
        alert("Admin login required");
        window.location.href = "admin-login.html";
    } else {
        loadAdminJobs();
        loadAdminApplications();
        loadStats();
    }
}

function adminLogout() {
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "index.html";
}

// ---------------- ADMIN JOB MANAGEMENT ----------------

function loadAdminJobs() {

    const container = document.getElementById('adminJobList');
    if (!container) return;
    container.innerHTML = '';

    if (firebaseReady) {
        fbDB.collection('jobs').get().then(snapshot => {
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
                        <p><b>Type:</b> ${job.type}</p>
                        <p><b>Location:</b> ${job.location}</p>
                        <p>Status: <span class="status ${job.status}">${job.status}</span></p>

                        ${job.status === 'Pending' ? `
                            <button onclick="verifyJob('${id}')">Verify</button>
                            <button onclick="rejectJob('${id}')" style="background:red;">Reject</button>
                        ` : ''}
                    </div>
                `;
            });
        }).catch(err => {
            console.error('Failed to load admin jobs from Firestore', err);
            // fallback to localStorage below
            const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
            if (jobs.length === 0) {
                container.innerHTML = '<p>No jobs posted yet.</p>';
                return;
            }
            jobs.forEach((job, index) => {
                container.innerHTML += `
                    <div class="job-card">
                        <h3>${job.title}</h3>
                        <p><b>Type:</b> ${job.type}</p>
                        <p><b>Location:</b> ${job.location}</p>
                        <p><b>Status:</b> ${job.status}</p>

                        ${job.status === 'Pending' ? `
                            <button onclick="verifyJob(${index})">Verify</button>
                            <button onclick="rejectJob(${index})" style="background:red;">Reject</button>
                        ` : ''}
                    </div>
                `;
            });
        });
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
                <p><b>Type:</b> ${job.type}</p>
                <p><b>Location:</b> ${job.location}</p>
                <p><b>Status:</b> ${job.status}</p>

                ${job.status === 'Pending' ? `
                    <button onclick="verifyJob(${index})">Verify</button>
                    <button onclick="rejectJob(${index})" style="background:red;">Reject</button>
                ` : ''}
            </div>
        `;
    });
}

function verifyJob(index) {

    // if index is a string (Firestore doc id) and Firebase is ready, update Firestore
    if (typeof index === 'string' && firebaseReady) {
        fbDB.collection('jobs').doc(index).update({ status: 'Approved' }).then(() => {
            alert('Job Approved!');
            loadAdminJobs();
        }).catch(err => console.error('Failed to approve job in Firestore', err));
        return;
    }

    // fallback: index is numeric (localStorage)
    let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    if (jobs[index]) {
        jobs[index].status = 'Approved';
        localStorage.setItem('jobs', JSON.stringify(jobs));
    }
    alert('Job Approved!');
    loadAdminJobs();
}

function rejectJob(index) {

    if (typeof index === 'string' && firebaseReady) {
        fbDB.collection('jobs').doc(index).update({ status: 'Rejected' }).then(() => {
            alert('Job Rejected!');
            loadAdminJobs();
        }).catch(err => console.error('Failed to reject job in Firestore', err));
        return;
    }

    let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    if (jobs[index]) {
        jobs[index].status = 'Rejected';
        localStorage.setItem('jobs', JSON.stringify(jobs));
    }

    alert('Job Rejected!');
    loadAdminJobs();
}

// ---------------- ADMIN VIEW APPLICATIONS ----------------

function loadAdminApplications() {

    const container = document.getElementById('adminApplicationList');
    if (!container) return;
    container.innerHTML = '';

    if (firebaseReady) {
        fbDB.collection('applications').get().then(snapshot => {
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
        }).catch(err => {
            console.error('Failed to load applications from Firestore', err);
            // fallback
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
        });
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

// ---------------- SIGN UP (explicit) ----------------
async function signupStudent() {
    const username = document.getElementById('username') ? document.getElementById('username').value : '';
    const password = document.getElementById('password') ? document.getElementById('password').value : '';

    if (!username || !password) {
        alert('Please enter username and password to sign up');
        return;
    }

    const email = usernameToEmail(username);

    if (firebaseReady) {
        try {
            const cu = await fbAuth.createUserWithEmailAndPassword(email, password);
            const created = cu.user;
            localStorage.setItem('loggedInStudent', created.email || created.uid || username);
            alert('Sign up successful — you are now logged in');
            window.location.href = 'dashboard.html';
            return;
        } catch (err) {
            console.error('Sign up failed', err);
            alert('Sign up error: ' + err.message);
            return;
        }
    }

    // fallback: localStorage sign-up (development/offline)
    localStorage.setItem('loggedInStudent', username);
    alert('Sign up successful (offline)');
    window.location.href = 'dashboard.html';
}function loadStats() {
    let jobs = JSON.parse(localStorage.getItem("jobs")) || [];

    let total = jobs.length;
    let approved = jobs.filter(j => j.status === "Approved").length;
    let pending = jobs.filter(j => j.status === "Pending").length;

    document.getElementById("stats").innerHTML = `
        <p>Total Jobs: ${total}</p>
        <p>Approved: ${approved}</p>
        <p>Pending: ${pending}</p>
    `;
}