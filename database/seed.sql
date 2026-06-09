USE PhotocopyManagementDB;
GO

INSERT INTO Departments (DepartmentName)
VALUES
('FS'),
('Primary'),
('Secondary'),
('Sixth Form'),
('Inclusion'),
('IT'),
('Administration');
GO

INSERT INTO Subjects (SubjectName)
VALUES
('English'),
('Math'),
('Science'),
('Arabic'),
('Islamic'),
('Humanities'),
('ICT'),
('General');
GO

INSERT INTO Purposes (PurposeName)
VALUES
('Classwork'),
('Homework'),
('Assessment'),
('Mock Exam'),
('Final Exam'),
('Display Board'),
('Administrative'),
('Other');
GO

INSERT INTO Users
(
    EmployeeId,
    FullName,
    SchoolEmail,
    DepartmentId,
    Subject,
    Role,
    PasswordHash,
    MustChangePassword
)
VALUES
(
    'SA0001',
    'System Super Admin',
    'superadmin1@arabunityschool.ae',
    (SELECT DepartmentId FROM Departments WHERE DepartmentName = 'IT'),
    'General',
    'SuperAdmin',
    'TEMP_HASH',
    1
),
(
    'SA0002',
    'Backup Super Admin',
    'superadmin2@arabunityschool.ae',
    (SELECT DepartmentId FROM Departments WHERE DepartmentName = 'IT'),
    'General',
    'SuperAdmin',
    'TEMP_HASH',
    1
),
(
    'A1001',
    'System Administrator',
    'admin@arabunityschool.ae',
    (SELECT DepartmentId FROM Departments WHERE DepartmentName = 'Administration'),
    'General',
    'Admin',
    'TEMP_HASH',
    1
),
(
    'P1001',
    'Printing Administrator',
    'printing@arabunityschool.ae',
    (SELECT DepartmentId FROM Departments WHERE DepartmentName = 'Administration'),
    'General',
    'PrintingAdmin',
    'TEMP_HASH',
    1
),
(
    'H1001',
    'Primary HOD',
    'hod.primary@arabunityschool.ae',
    (SELECT DepartmentId FROM Departments WHERE DepartmentName = 'Primary'),
    'English',
    'HOD',
    'TEMP_HASH',
    1
),
(
    'S1001',
    'Primary HOS',
    'hos.primary@arabunityschool.ae',
    (SELECT DepartmentId FROM Departments WHERE DepartmentName = 'Primary'),
    'General',
    'HOS',
    'TEMP_HASH',
    1
),
(
    'T1001',
    'Teacher Demo',
    'teacher@arabunityschool.ae',
    (SELECT DepartmentId FROM Departments WHERE DepartmentName = 'Primary'),
    'English',
    'Teacher',
    'TEMP_HASH',
    1
);
GO

INSERT INTO InventoryItems
(ItemName, Category, CurrentStock, MinimumStock, Unit)
VALUES
('A4 Paper', 'Paper', 70, 10, 'Box'),
('A3 Paper', 'Paper', 10, 5, 'Box'),
('Black Toner', 'Toner', 5, 2, 'Piece'),
('Staple Holder SH-10', 'Riso Supplies', 5, 2, 'Box'),
('Brown Envelope', 'Stationery', 2000, 500, 'Piece'),
('White Label FSLA1-100', 'Stationery', 4, 2, 'Bundle');
GO