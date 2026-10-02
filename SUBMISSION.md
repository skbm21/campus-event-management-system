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
### AI Output (Screenshots)
<img width="1522" height="829" alt="image" src="https://github.com/user-attachments/assets/3e3026ba-3fe5-4486-9493-bfe0601ffbd7" />

<img width="1597" height="829" alt="image" src="https://github.com/user-attachments/assets/6f7a55f6-9aee-440d-9eba-b18312a8001e" />

<img width="1674" height="826" alt="image" src="https://github.com/user-attachments/assets/16a3ec42-982e-4c06-8704-1b90416b3096" />

<img width="1526" height="826" alt="image" src="https://github.com/user-attachments/assets/c7096fc1-6dc4-40eb-ae62-cb0959c35bf9" />



---

## Task 3: Database Design & ERD

### Prompt
```
Role: You are a Senior Database Engineer specializing in SQL Server.
Context: We are building an Online Campus Event Management System where
students view upcoming events, register for events, and administrators
view registered attendees.

Task:
1. Design a 3rd Normal Form (3NF) schema with at least these entities:
   Users, Events, Registrations (add others such as Venues or Roles if justified).
2. Output an Entity-Relationship Diagram in Mermaid.js erDiagram syntax.
3. Output a production-grade T-SQL DDL script.


Constraints:
- Use explicit PRIMARY KEY and FOREIGN KEY constraints with ON DELETE rules.
- Include CHECK constraints (e.g., email format/domain @univ.edu.ph,
  capacity > 0, end date after start date, valid role/status values).
- Add a UNIQUE constraint preventing duplicate registrations (same user + event).
- Create NON-CLUSTERED indexes on ALL foreign key columns.
- Do not use stored procedures or triggers. Do not denormalize.
- Output the Mermaid code and the SQL in two separate code blocks.
```

### ERD (Mermaid.js)
```mermaid
erDiagram
    ROLES ||--o{ USERS : "assigned to"
    USERS ||--o{ EVENTS : "creates"
    VENUES ||--o{ EVENTS : "hosts"
    USERS ||--o{ REGISTRATIONS : "makes"
    EVENTS ||--o{ REGISTRATIONS : "receives"


    ROLES {
        int RoleId PK
        nvarchar RoleName UK
    }
    USERS {
        int UserId PK
        int RoleId FK
        nvarchar Email UK
        nvarchar FullName
        bit IsActive
        datetime2 CreatedAt
    }
    VENUES {
        int VenueId PK
        nvarchar VenueName UK
        nvarchar Location
    }
    EVENTS {
        int EventId PK
        int VenueId FK
        int CreatedByUserId FK
        nvarchar Title
        nvarchar Description
        datetime2 StartDate
        datetime2 EndDate
        int Capacity
        nvarchar Status
        datetime2 CreatedAt
    }
    REGISTRATIONS {
        int RegistrationId PK
        int UserId FK
        int EventId FK
        datetime2 RegisteredAt
        nvarchar Status
    }

```

The SQL script is at `/database/schema.sql`.

---

## Task 4: Testing, Security & Refactoring

### Prompt 
```
Unit Test Generation:
Role: You are a QA engineer experienced in xUnit and Moq for C#.
Task: Write unit tests for a SeatAvailabilityService.HasAvailableSeats(eventId)
method that compares an event's capacity with its registration count.
Constraints:
- Use Moq to mock an IEventRepository so no database is touched.
- Cover: seats available, event exactly full, event over capacity.
- Verify the repository is called as expected.

Security & Vulnerability Challenge:
Role: You are a Senior Application Security Engineer reviewing C# code.
Task: Diagnose the following method for SQL injection risks and unmanaged
resource (memory/connection) leaks. List each vulnerability, explain how it
could be exploited or cause harm, and then provide a refactored version.
Constraints:
- Use parameterized queries (SqlParameter).
- Use using statements for SqlConnection, SqlCommand, and SqlDataReader.
- Do not hardcode the connection string.
- Handle the case where no row is returned.
Code:
[// Flawed code: Contains SQL Injection and unmanaged resource leak public string GetUserRegistration(string inputEmail) { string connStr =
"Server=myServerAddress;Database=myDataBase;User Id=myUsername;Password=myPassword;"; SqlConnection conn = new SqlConnection(connStr); conn.Open();
// Connection is not closed or disposed SqlCommand cmd = new SqlCommand("SELECT * FROM Registrations WHERE Email = '" + inputEmail + "'", conn);
return cmd.ExecuteScalar().ToString();]
```



## AI Disclosure Statement

- We used the following AI tools: Claude, Gemini, and Google Antigravity
- We verified outputs by reading all generated code, testing the page in a browser, 
running the SQL script and unit tests, and checking everything against the exam requirements, 
correcting the mistakes listed in our Group Verification Log.

---


## Group Verification Log

| Task # | Identified AI Flaw / Limitation | Manual Correction Applied | Member Responsible |
|--------|---------------------------------|---------------------------|--------------------|
| Task 1 | AI proposed a multi-page frontend and a 3-hour timeline that was too optimistic for beginners | Simplified to a single-page frontend and scoped the backend to one service class                        | Masinsin, Shann     |
| Task 1 | AI used an `X-User-Id` header for auth, which is insecure | Flagged it as a demo-only shortcut and kept it out of our implementation                                                                    | Masinsin, Shann     |
| Task 2 | Missing `aria-label` attributes on some form inputs | Manually added `aria-label` and matching `<label>` elements                                                                                       | Rodrigo, Fructh     |
| Task 2 | Used generic `<div>` wrappers instead of semantic tags | Replaced them with `<header>`, `<main>`, `<section>`, `<article>`, and `<footer>`                                                              | Rodrigo, Fructh     |
| Task 3 | AI did not add non-clustered indexes on foreign key columns | Added `CREATE NONCLUSTERED INDEX` statements for `UserId` and `EventId`                                                                   | Lara, Sean          |
| Task 3 | Missing CHECK constraints (e.g., capacity must be greater than 0) | Added CHECK constraints to `schema.sql`                                                                                             | Lara, Sean          |
| Task 4 | Original code never closed or disposed the DB connection, and the AI's first refactor still used string concatenation | Wrapped connection and command in `using` blocks and switched to `SqlParameter` | Masinsin, Shann   / Lara, Sean |
