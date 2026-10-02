# SUBMISSION

## Team Roster

| Member   |         Name       |           Assigned Role          |        Responsibilities        |
|----------|--------------------|----------------------------------|--------------------------------|
| Member 1 | Masinsin, Shann    | Systems Architect & Prompt Lead  | Task 1, Task 5                 |
| Member 2 | Rodrigo. Fruch     | Frontend Engineer                | Task 2                         |
| Member 3 | Lara, Sean         | Database & Backend Engineer      | Task 3, Task 4                 |

---

## Task 1: Requirements Analysis & Prompt Architecture

### Prompt (RCTC)
```
ROLE
You are a Lead Systems Architect with 15 years of experience designing
lightweight web applications for universities. You mentor junior teams
on building realistic, time-boxed prototypes.

CONTEXT
A team of 3 fourth-year BSIT students has 3 hours total to build a working
prototype of an Online Campus Event Management System. Students can view
upcoming campus events and register for an event. Administrators can view
the list of registered attendees for each event. The team has beginner-level
experience with generative AI tools. The backend language is C#/.NET, the
database is SQL Server, and the frontend is plain HTML/CSS/JavaScript.
The team divides work as: frontend, database, and backend/testing.

TASK
Produce an overall system design that includes:
1. A short list of functional and non-functional requirements
2. A high-level architecture (layers/components and how they interact)
3. The main entities and their relationships (Users, Events, Registrations)
4. A list of REST API endpoints with HTTP methods
5. A folder structure for the repository (/frontend, /backend, /database)
6. A suggested split of work across 3 team members, with time estimates

CONSTRAINTS
- Keep the design achievable within 3 hours by a team of 3 beginners.
- Do NOT use third-party state management libraries such as Redux.
- Do NOT propose microservices, message queues, or cloud infrastructure.
- Do NOT use frontend frameworks that require a build step.
- Use parameterized queries for all database access (no string concatenation).
- Output in Markdown with clear headings, and keep it under 800 words.
```

### AI Output
```
Online Campus Event Management System: Prototype Design
1. Requirements

Functional

Students can log in (by email, no passwords in this prototype), view upcoming events, and register for one.
Students can't register twice for the same event or exceed capacity.
Admins can view the attendee list for each event.

Non-functional

Buildable in 3 hours by 3 beginners, with minimal setup and no build step.
All SQL uses parameterized queries.
Basic input validation and clear error messages (JSON with proper status codes).
Runs locally. Fine for about 100 users, with no scaling concerns.

Out of scope: passwords, JWT, email notifications, event editing, cancellations (stretch goals only).

2. Architecture
Browser (HTML/CSS/vanilla JS, fetch API)
        │  JSON over HTTP
ASP.NET Core Minimal API  (Endpoints → Services → Data access)
        │  ADO.NET / Microsoft.Data.SqlClient (parameterized)
SQL Server
Frontend: static pages. State lives in plain JS variables plus sessionStorage for the logged-in user.
Backend: one ASP.NET Core project with three simple layers: Endpoints (routes), Services (rules like capacity checks), and Data (SQL). It also serves /frontend as static files, which avoids CORS issues.
Auth shortcut: login returns the user's ID and role. The frontend sends an X-User-Id header, and the admin endpoint checks that the user's role is Admin. This is not secure and is for demo only. Say so in your presentation.
3. Entities
Entity	Key fields
Users	UserId (PK), FullName, Email (unique), Role (Student/Admin)
Events	EventId (PK), Title, Description, Location, EventDate, Capacity
Registrations	RegistrationId (PK), UserId (FK), EventId (FK), RegisteredAt

Relationships:

One User has many Registrations.
One Event has many Registrations.
Users and Events are many-to-many, resolved through Registrations.
Add a UNIQUE (UserId, EventId) constraint to block duplicate registrations.
4. REST API
Method	Endpoint	Purpose	Access
POST	/api/login	Look up user by email	Public
GET	/api/events	List upcoming events (with seats left)	Any user
GET	/api/events/{id}	Event details	Any user
POST	/api/events/{id}/register	Register current user	Student
GET	/api/users/me/registrations	My registered events	Student
GET	/api/admin/events/{id}/attendees	Attendee list	Admin

Status codes: 200/201 success, 400 bad input, 403 not admin, 404 not found, 409 duplicate or full.

Stretch: POST /api/events (create event) and DELETE /api/events/{id}/register (cancel).

5. Repository Structure
campus-events/
├── README.md
├── frontend/
│   ├── index.html          # login
│   ├── events.html         # event list + register
│   ├── admin.html          # attendee viewer
│   ├── css/styles.css
│   └── js/
│       ├── api.js          # all fetch calls in one place
│       ├── events.js
│       └── admin.js
├── backend/
│   ├── CampusEvents.Api.csproj
│   ├── Program.cs          # routes + static file hosting
│   ├── Models/
│   ├── Services/
│   ├── Data/               # SQL access with SqlParameter
│   └── appsettings.json    # connection string
└── database/
    ├── 01_schema.sql
    └── 02_seed.sql         # 2 admins, 5 students, 6 events
6. Work Split (3 hours)

Everyone, 0:00–0:20: Agree on the API contract (section 4) and example JSON responses. Set up the Git repo and branches.
This step prevents most integration problems later.

Member A: Frontend

Time	Task
0:20–1:00	Login page, shared api.js, and the events list rendered from mock JSON
1:00–1:50	Register button, "my registrations," and error messages
1:50–2:20	Admin attendee page and basic CSS

Member B: Database

Time	Task
0:20–0:50	Schema with PKs, FKs, and the unique constraint
0:50–1:20	Seed data (including a full event and a past event)
1:20–2:00	Write and test the SQL queries: upcoming events with seats left, insert registration, attendees by event
2:00–2:20	Help the backend wire up the connection string and fix query bugs

Member C: Backend and Testing

Time	Task
0:20–1:00	Project setup, SQL connection, and the login and events endpoints
1:00–1:50	Register endpoint (duplicate and capacity checks), registrations list, and admin endpoint
1:50–2:20	Test every endpoint in Postman or curl, including error cases

Everyone, 2:20–3:00: Integrate the real API into the frontend, run an end-to-end test
(login, register, then check as admin), fix bugs, and write a short README with run steps.

Tips for AI Tool Use
Give the AI one small task at a time (for example, "write a parameterized method to insert a registration"). Don't ask for the whole app.
Read and run everything it generates before committing.
Always include the section 4 contract in your prompts so frontend and backend code agree.

Biggest risk: integration at the end. Mitigate it by having the frontend use mock data early and merging a working backend by the 1:50 mark.
```

### Manual Grounding Evaluation
```
The AI-generated architecture is largely realistic for a 3-hour prototype: it uses a simple three-layer design (static HTML/CSS/JS frontend, ASP.NET
Core Minimal API, SQL Server) with only three entities and six endpoints, and it sensibly puts passwords, JWT, and email notifications out of scope.
However, the time estimates are optimistic for beginners, because setting up an ASP.NET Core project, connecting it to SQL Server, and building the
capacity and duplicate-registration logic in about 40 minutes leaves little room for debugging. The plan also left out the other exam deliverables
(unit tests, the ERD, and documentation), so we scoped the work down: the frontend became a single page (index.html, script.js, styles.css in
/frontend) instead of the proposed multi-page layout with css/ and js/ subfolders, and the backend was limited to a single service class. These
changes let the team finish all five tasks within 180 minutes while keeping the entities and fields consistent with the AI's design.
```


## Task 2: AI-Assisted Frontend

### Prompt
```
You are a Senior Frontend Engineer who specializes in accessible web interfaces. I'm building a prototype for an Online Campus Event Management
System. Students can view upcoming campus events and register for one. This is a 3-hour class prototype, so keep it simple. Create a single-page
Event Catalog & Registration Form in the /frontend folder using plain HTML, CSS, and a little vanilla JavaScript. Files: index.html, styles.css,
script.js.

The page must include:
1. An event catalog showing 4-6 sample events as cards. Each card has an image, title, date, venue, seats remaining, and a "Register" button.
2. A registration form with: Full Name, Student Email, Student ID, and an Event dropdown.
3. Basic client-side validation. The email must end with @univ.edu.ph. Show friendly error messages.
4. A success message after submitting. No backend is needed yet.

Use DLSU theme colors

- Use Semantic HTML5 tags (<header>, <nav>, <main>, <section>, <article>, <footer>). Do not use generic <div> wrappers where a semantic tag fits.
- Accessibility (WCAG POUR): every input has a visible <label> linked with for/id AND an aria-label; every image has meaningful alt text; color
contrast is at least 4.5:1; the page is fully keyboard navigable with visible focus styles; error messages use aria-live="polite".
- The layout must be responsive (mobile-first).
- Do NOT use any frameworks or libraries (no React, Bootstrap, or jQuery). Do NOT load external CDNs.
- Use placeholder images from local files or inline SVG, not hotlinked images.
- Add short comments explaining the accessibility choices.

```
### AI Output 
```

```
---

## Task 3: Database Design & ERD

### Prompt
[Member 3 pastes the prompt used]

### ERD (Mermaid.js)
```mermaid
[Member 3 pastes the Mermaid code here]
```

The SQL script is at `/database/schema.sql`.

---

## Task 4: Testing, Security & Refactoring

### Unit Tests
[Prompt used, plus where the test files are]

### Vulnerability Diagnosis
[Prompt used and the AI's diagnosis of the SQL injection and resource leak]

### Refactored Code
The fixed code is at `/backend/RegistrationService.cs`.

---

## Setup Instructions

1. Clone the repository: `git clone [repo URL]`
2. Frontend: open `/frontend/index.html` in a browser
3. Database: run `/database/schema.sql` in SQL Server
4. Backend: [how to open or run `/backend/RegistrationService.cs`]

---

## AI Disclosure Statement

We used the following AI tools: [e.g., Claude for Tasks 1 and 4, v0 for Task 2].
We verified outputs by [e.g., reading all generated code, testing the page in a browser, running the SQL script, checking against the exam requirements].

---

## Group Verification Log

| Task # | Identified AI Flaw / Limitation | Manual Correction Applied | Member Responsible |
|--------|--------------------------------|---------------------------|--------------------|
| Task 1 | [flaw you found] | [what you changed] | Member 1 |
| Task 2 | | | Member 2 |
| Task 3 | | | Member 3 |
