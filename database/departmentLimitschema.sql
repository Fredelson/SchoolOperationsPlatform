-- ============================================
-- Department Monthly Print Limits
-- Printing Admin assigns limits per department
-- ============================================

CREATE TABLE DepartmentPrintLimits (
    DepartmentLimitId INT IDENTITY(1,1) PRIMARY KEY,
    DepartmentId INT NOT NULL,
    MonthNumber INT NOT NULL,
    YearNumber INT NOT NULL,
    SheetLimit INT NOT NULL,
    CreatedBy INT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,

    CONSTRAINT FK_DepartmentPrintLimits_Departments
        FOREIGN KEY (DepartmentId) REFERENCES Departments(DepartmentId),

    CONSTRAINT FK_DepartmentPrintLimits_CreatedBy
        FOREIGN KEY (CreatedBy) REFERENCES Users(UserId),

    CONSTRAINT UQ_DepartmentPrintLimits
        UNIQUE (DepartmentId, MonthNumber, YearNumber)
);
GO


-- ============================================
-- Subject / HOD Monthly Print Limits
-- HOS distributes department limit to HOD subjects
-- ============================================

CREATE TABLE SubjectPrintLimits (
    SubjectLimitId INT IDENTITY(1,1) PRIMARY KEY,
    DepartmentLimitId INT NOT NULL,
    DepartmentId INT NOT NULL,
    SubjectId INT NOT NULL,
    HodUserId INT NULL,
    MonthNumber INT NOT NULL,
    YearNumber INT NOT NULL,
    SheetLimit INT NOT NULL,
    CreatedBy INT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,

    CONSTRAINT FK_SubjectPrintLimits_DepartmentLimits
        FOREIGN KEY (DepartmentLimitId) REFERENCES DepartmentPrintLimits(DepartmentLimitId),

    CONSTRAINT FK_SubjectPrintLimits_Departments
        FOREIGN KEY (DepartmentId) REFERENCES Departments(DepartmentId),

    CONSTRAINT FK_SubjectPrintLimits_Subjects
        FOREIGN KEY (SubjectId) REFERENCES Subjects(SubjectId),

    CONSTRAINT FK_SubjectPrintLimits_HOD
        FOREIGN KEY (HodUserId) REFERENCES Users(UserId),

    CONSTRAINT FK_SubjectPrintLimits_CreatedBy
        FOREIGN KEY (CreatedBy) REFERENCES Users(UserId),

    CONSTRAINT UQ_SubjectPrintLimits
        UNIQUE (DepartmentId, SubjectId, MonthNumber, YearNumber)
);
GO

-- ============================================
-- Monthly department usage from requests
-- Counts sheets from approved / printing / completed requests
-- ============================================

CREATE VIEW vw_DepartmentMonthlyUsage AS
SELECT
    DepartmentId,
    MONTH(SubmittedAt) AS MonthNumber,
    YEAR(SubmittedAt) AS YearNumber,
    SUM(TotalSheets) AS UsedSheets
FROM PhotocopyRequests
WHERE Status IN (
    'Approved by HOD',
    'Approved by HOS',
    'Printing',
    'Completed'
)
GROUP BY
    DepartmentId,
    MONTH(SubmittedAt),
    YEAR(SubmittedAt);
GO


-- ============================================
-- Monthly subject usage from requests
-- Counts sheets from approved / printing / completed requests
-- ============================================

CREATE VIEW vw_SubjectMonthlyUsage AS
SELECT
    DepartmentId,
    SubjectId,
    MONTH(SubmittedAt) AS MonthNumber,
    YEAR(SubmittedAt) AS YearNumber,
    SUM(TotalSheets) AS UsedSheets
FROM PhotocopyRequests
WHERE Status IN (
    'Approved by HOD',
    'Approved by HOS',
    'Printing',
    'Completed'
)
GROUP BY
    DepartmentId,
    SubjectId,
    MONTH(SubmittedAt),
    YEAR(SubmittedAt);
GO

CREATE TABLE PaperInventory (
    InventoryId INT IDENTITY(1,1) PRIMARY KEY,
    PaperType VARCHAR(10), -- A4 / A3
    CurrentStock INT NOT NULL,
    LastUpdated DATETIME DEFAULT GETDATE()
);