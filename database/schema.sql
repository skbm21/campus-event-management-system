/* =====================================================================
   Online Campus Event Management System - schema.sql
   Target: SQL Server 2019+
   Note: no GO separators and no CREATE DATABASE, so it runs as a single
   batch in online tools such as dbfiddle or SQLize Online.
   ===================================================================== */

/* ---------- Drop in dependency order (safe re-run) ---------- */
IF OBJECT_ID(N'dbo.Registrations', N'U') IS NOT NULL DROP TABLE dbo.Registrations;
IF OBJECT_ID(N'dbo.Events',        N'U') IS NOT NULL DROP TABLE dbo.Events;
IF OBJECT_ID(N'dbo.Venues',        N'U') IS NOT NULL DROP TABLE dbo.Venues;
IF OBJECT_ID(N'dbo.Users',         N'U') IS NOT NULL DROP TABLE dbo.Users;
IF OBJECT_ID(N'dbo.Roles',         N'U') IS NOT NULL DROP TABLE dbo.Roles;

/* ---------- Roles ---------- */
CREATE TABLE dbo.Roles (
    RoleId    INT IDENTITY(1,1) NOT NULL,
    RoleName  NVARCHAR(30)      NOT NULL,
    CONSTRAINT PK_Roles          PRIMARY KEY CLUSTERED (RoleId),
    CONSTRAINT UQ_Roles_RoleName UNIQUE (RoleName),
    CONSTRAINT CK_Roles_RoleName CHECK (RoleName IN (N'Student', N'Admin'))
);

/* ---------- Users ---------- */
CREATE TABLE dbo.Users (
    UserId     INT IDENTITY(1,1) NOT NULL,
    RoleId     INT               NOT NULL,
    Email      NVARCHAR(254)     NOT NULL,
    FullName   NVARCHAR(150)     NOT NULL,
    IsActive   BIT               NOT NULL CONSTRAINT DF_Users_IsActive  DEFAULT (1),
    CreatedAt  DATETIME2(0)      NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (UserId),
    CONSTRAINT UQ_Users_Email UNIQUE (Email),
    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId)
        REFERENCES dbo.Roles (RoleId)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT CK_Users_Email_Domain CHECK (Email LIKE N'_%@univ.edu.ph'),
    CONSTRAINT CK_Users_Email_NoSpaces CHECK (Email NOT LIKE N'% %'),
    CONSTRAINT CK_Users_FullName_NotBlank CHECK (LEN(LTRIM(RTRIM(FullName))) > 0)
);

/* ---------- Venues ---------- */
CREATE TABLE dbo.Venues (
    VenueId    INT IDENTITY(1,1) NOT NULL,
    VenueName  NVARCHAR(100)     NOT NULL,
    Location   NVARCHAR(200)     NULL,
    CONSTRAINT PK_Venues PRIMARY KEY CLUSTERED (VenueId),
    CONSTRAINT UQ_Venues_VenueName UNIQUE (VenueName),
    CONSTRAINT CK_Venues_VenueName_NotBlank CHECK (LEN(LTRIM(RTRIM(VenueName))) > 0)
);

/* ---------- Events ---------- */
CREATE TABLE dbo.Events (
    EventId          INT IDENTITY(1,1) NOT NULL,
    VenueId          INT               NOT NULL,
    CreatedByUserId  INT               NOT NULL,
    Title            NVARCHAR(200)     NOT NULL,
    Description      NVARCHAR(2000)    NULL,
    StartDate        DATETIME2(0)      NOT NULL,
    EndDate          DATETIME2(0)      NOT NULL,
    Capacity         INT               NOT NULL,
    Status           NVARCHAR(20)      NOT NULL CONSTRAINT DF_Events_Status    DEFAULT (N'Scheduled'),
    CreatedAt        DATETIME2(0)      NOT NULL CONSTRAINT DF_Events_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_Events PRIMARY KEY CLUSTERED (EventId),
    CONSTRAINT FK_Events_Venues FOREIGN KEY (VenueId)
        REFERENCES dbo.Venues (VenueId)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT FK_Events_Users_CreatedBy FOREIGN KEY (CreatedByUserId)
        REFERENCES dbo.Users (UserId)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT CK_Events_Capacity CHECK (Capacity > 0),
    CONSTRAINT CK_Events_Dates    CHECK (EndDate > StartDate),
    CONSTRAINT CK_Events_Status   CHECK (Status IN (N'Scheduled', N'Cancelled', N'Completed')),
    CONSTRAINT CK_Events_Title_NotBlank CHECK (LEN(LTRIM(RTRIM(Title))) > 0)
);

/* ---------- Registrations ---------- */
CREATE TABLE dbo.Registrations (
    RegistrationId  INT IDENTITY(1,1) NOT NULL,
    UserId          INT               NOT NULL,
    EventId         INT               NOT NULL,
    RegisteredAt    DATETIME2(0)      NOT NULL CONSTRAINT DF_Registrations_RegisteredAt DEFAULT (SYSUTCDATETIME()),
    Status          NVARCHAR(20)      NOT NULL CONSTRAINT DF_Registrations_Status       DEFAULT (N'Registered'),
    CONSTRAINT PK_Registrations PRIMARY KEY CLUSTERED (RegistrationId),
    CONSTRAINT UQ_Registrations_User_Event UNIQUE (UserId, EventId),
    CONSTRAINT FK_Registrations_Users FOREIGN KEY (UserId)
        REFERENCES dbo.Users (UserId)
        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT FK_Registrations_Events FOREIGN KEY (EventId)
        REFERENCES dbo.Events (EventId)
        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT CK_Registrations_Status CHECK (Status IN (N'Registered', N'Cancelled'))
);

/* ---------- Non-clustered indexes on ALL foreign key columns ---------- */
CREATE NONCLUSTERED INDEX IX_Users_RoleId
    ON dbo.Users (RoleId);

CREATE NONCLUSTERED INDEX IX_Events_VenueId
    ON dbo.Events (VenueId);

CREATE NONCLUSTERED INDEX IX_Events_CreatedByUserId
    ON dbo.Events (CreatedByUserId);

CREATE NONCLUSTERED INDEX IX_Registrations_UserId
    ON dbo.Registrations (UserId);

CREATE NONCLUSTERED INDEX IX_Registrations_EventId
    ON dbo.Registrations (EventId);

/* ---------- Seed reference data ---------- */
INSERT INTO dbo.Roles (RoleName) VALUES (N'Student'), (N'Admin');
