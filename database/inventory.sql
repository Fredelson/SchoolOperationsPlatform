CREATE TABLE PaperInventory (
    InventoryId INT IDENTITY(1,1) PRIMARY KEY,
    PaperType VARCHAR(10), -- A4 / A3
    CurrentStock INT NOT NULL,
    LastUpdated DATETIME DEFAULT GETDATE()
);