
<p align="center">
  <img src="./img.png" alt="WorkNest Banner" width="100%">
</p>

# WorkNest 🎯

## Basic Details

### Team Name:
CodeCrafters

### Team Members
- Fathimathul Fidha K - college of engineering vadakara
- Gaadha M - college of engineering vadakara

### Hosted Project Link
https://work-nest-alpha.vercel.app/

### Project Description
WorkNest is a web-based platform designed to help college students find part-time, skill-based, and one-day job opportunities in a simple and secure manner. The system connects students with local employers who post job listings based on required skills, availability, and location.

### The Problem Statement
Many college students face difficulty in finding reliable part-time and short-term job opportunities without physically searching or depending on informal contacts. There is no centralized and verified platform specifically designed for campus-level, skill-based, and one-day job opportunities.

As a result, students miss flexible earning opportunities, and employers struggle to reach suitable student candidates efficiently and securely.

### The Solution

---
WorkNest provides a centralized web-based platform that connects college students with verified part-time and one-day job opportunities. The system allows employers to post job listings, students to create profiles and apply for jobs, and administrators to verify postings to ensure authenticity and trust
## Technical Details

### Technologies/Components Used

**For Software:**

- Languages used: JavaScript
- Frameworks used: React, Node.js, Express.js
- Libraries used: Axios, Mongoose, JWT, bcrypt
- Tools used: VS Code, Git, D

**For Hardware:**
- Not applicable (Software-based project)

---

## Features

- 🔐 Secure User Authentication & Authorization (JWT based)
- 📁 Create, Update, Delete Projects
- 👥 Assign Tasks to Team Members
- ⚡ Real-time Data Updates
- 📊 Project Status Tracking
- 📱 Fully Responsive Design

---

## Implementation

### For Software:

#### Installation
```bash
git clone https://github.com/FathimathulFidha-k/WorkNest.git
cd WorkNest
npm install
````

#### Run

```bash
npm start
```

Application runs at:

```
http://localhost:3000
```

### For Hardware:

Not applicable.

---

## Project Documentation

### For Software:

#### Screenshots (Add at least 3)

![Home Page](docs/home.png)
*Landing page showing project overview and navigation*
<img width="1817" height="851" alt="Screenshot 2026-02-28 090532" src="https://github.com/user-attachments/assets/a6a014a6-283f-4701-a225-2199b81ed3e7" />

![Dashboard](docs/dashboard.png)
*User dashboard displaying all projects and task progress*
<img width="1802" height="797" alt="Screenshot 2026-02-28 090808" src="https://github.com/user-attachments/assets/271cc692-7323-437b-ada2-a7e4f417045b" />

![Project Management](docs/project-management.png)
*Project creation and task assignment interface*
<img width="1839" height="833" alt="Screenshot 2026-02-28 091147" src="https://github.com/user-attachments/assets/0ad9d6fc-dbc0-4d8a-a384-fdc503c69827" />

---

#### Diagrams

**System Architecture:**
                +-----------------------+
                |        Users          |
                |-----------------------|
                |  Student              |
                |  Employer (Post Job)  |
                |  Admin                |
                +-----------+-----------+
                            |
                            ▼
                +-----------------------+
                |   Presentation Layer  |
                |-----------------------|
                |  HTML                 |
                |  CSS                  |
                |  JavaScript (UI)      |
                +-----------+-----------+
                            |
                            ▼
                +-----------------------+
                |  Application Layer    |
                |-----------------------|
                |  Login Validation     |
                |  Job Posting Logic    |
                |  Apply Job Logic      |
                |  Admin Verification   |
                +-----------+-----------+
                            |
                            ▼
                +-----------------------+
                |      Data Layer       |
                |-----------------------|
                | Firebase Firestore DB |
                |  - Students           |
                |  - Jobs               |
                |  - Applications       |
                +-----------------------+
![Architecture Diagram](docs/architecture.png)
*Frontend (React) communicates with Express backend via REST APIs. Backend connects to MongoDB database. Authentication handled using JWT.*

**Application Workflow:**
Student → Login → View Approved Jobs → Apply
⬇
Employer → Post Job → Pending Status
⬇
Admin → Approve → Job Visible to Students
⬇
Admin → View Applications

*User registers → Logs in → Creates project → Assigns tasks → Updates progress → Real-time sync with database.*

---

## Additional Documentation

### For Web Projects with Backend:

#### API Documentation

**Base URL:**
`http://localhost:5000/api`

---

### Endpoints

#### GET /api/projects

* **Description:** Fetch all projects
* **Response:**

```json
{
  "status": "success",
  "data": []
}
```

---

#### POST /api/projects

* **Description:** Create new project
* **Request Body:**

```json
{
  "title": "Website Development",
  "description": "Build company portfolio",
  "status": "In Progress"
}
```

* **Response:**

```json
{
  "status": "success",
  "message": "Project created successfully"
}
```

---

#### GET /api/projects/:id

* **Description:** Fetch single project by ID

---

#### PUT /api/projects/:id

* **Description:** Update project details

---

#### DELETE /api/projects/:id

* **Description:** Delete a project

---

## Project Demo

### Video

https://drive.google.com/file/d/1krIbrSzMLAi5yzLzK3d8StIoCTqVrYlc/view?usp=drivesdk

*The demo video showcases authentication flow, project creation, task assignment, and real-time updates.*

### Additional Demos

* Live Deployment: [https://your-live-link.com](https://your-live-link.com)
* GitHub Repository: [https://github.com/FathimathulFidha-k/WorkNest](https://github.com/FathimathulFidha-k/WorkNest)

---

## AI Tools Used (Optional - Transparency)

**Tool Used:** ChatGPT, GitHub Copilot

**Purpose:**

* API structure planning
* Debugging backend issues
* Optimizing database queries
* Improving documentation formatting

**Percentage of AI-generated code:** ~20%

**Human Contributions:**

* Complete system architecture design
* Business logic implementation
* Database schema design
* Frontend UI/UX structure
* Integration and testing

---

## Team Contributions

* **Fathimathul Fidha K:** Frontend development, UI design, API integration, Documentation
* **Gaadha M:** Backend development, Database design, Authentication system

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Tell me what level you want — normal, hackathon, or placement-ready 😌
```
