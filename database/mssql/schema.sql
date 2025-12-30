-- MSSQL schema for D1 (Repository) module: Laboratories/Projects
-- Safe to run on empty DB. Re-run requires manual drop.

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Core entity: Lab (Project)
CREATE TABLE dbo.Lab (
  Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Lab PRIMARY KEY DEFAULT NEWID(),
  Name NVARCHAR(120) NOT NULL,
  Description NVARCHAR(400) NULL,
  IsPublic BIT NOT NULL CONSTRAINT DF_Lab_IsPublic DEFAULT (0),
  Status VARCHAR(12) NOT NULL CONSTRAINT DF_Lab_Status DEFAULT ('pending')
    CONSTRAINT CK_Lab_Status CHECK (Status IN ('pending','ready','archived')),

  -- Cross-DB link to Mongo (no FK, application-managed)
  MongoTopologyId VARCHAR(24) NULL,
  OwnerMongoUserId VARCHAR(50) NOT NULL,

  CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Lab_CreatedAt DEFAULT (SYSUTCDATETIME()),
  UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Lab_UpdatedAt DEFAULT (SYSUTCDATETIME())
);
GO

CREATE UNIQUE INDEX UX_Lab_Owner_Name ON dbo.Lab (OwnerMongoUserId, Name);
GO

-- Catalog entity: Device model
CREATE TABLE dbo.DeviceModel (
  Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_DeviceModel PRIMARY KEY,
  Vendor NVARCHAR(60) NOT NULL,
  ModelName NVARCHAR(80) NOT NULL,

  -- Enum via CHECK constraint
  DeviceType VARCHAR(12) NOT NULL
    CONSTRAINT CK_DeviceModel_DeviceType CHECK (DeviceType IN ('router','switch','pc','server','hub')),

  DefaultThroughputMbps FLOAT NOT NULL,
  IsDeprecated BIT NOT NULL CONSTRAINT DF_DeviceModel_IsDeprecated DEFAULT (0),

  CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_DeviceModel_CreatedAt DEFAULT (SYSUTCDATETIME())
);
GO

CREATE UNIQUE INDEX UX_DeviceModel_Unique ON dbo.DeviceModel (Vendor, ModelName, DeviceType);
GO

-- M:N between Lab and DeviceModel with an extra attribute (Quantity)
CREATE TABLE dbo.LabAllowedModel (
  LabId UNIQUEIDENTIFIER NOT NULL,
  DeviceModelId INT NOT NULL,
  Quantity INT NOT NULL CONSTRAINT CK_LabAllowedModel_Quantity CHECK (Quantity > 0),

  CONSTRAINT PK_LabAllowedModel PRIMARY KEY (LabId, DeviceModelId),
  CONSTRAINT FK_LabAllowedModel_Lab FOREIGN KEY (LabId) REFERENCES dbo.Lab (Id) ON DELETE CASCADE,
  CONSTRAINT FK_LabAllowedModel_DeviceModel FOREIGN KEY (DeviceModelId) REFERENCES dbo.DeviceModel (Id)
);
GO

-- Run history (for reporting)
CREATE TABLE dbo.LabRun (
  Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_LabRun PRIMARY KEY,
  LabId UNIQUEIDENTIFIER NOT NULL,
  RanAt DATETIME2(0) NOT NULL CONSTRAINT DF_LabRun_RanAt DEFAULT (SYSUTCDATETIME()),
  Success BIT NOT NULL,
  Score FLOAT NULL,
  DurationSeconds INT NULL CONSTRAINT CK_LabRun_Duration CHECK (DurationSeconds IS NULL OR DurationSeconds >= 0),
  Notes NVARCHAR(250) NULL,

  CONSTRAINT FK_LabRun_Lab FOREIGN KEY (LabId) REFERENCES dbo.Lab (Id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_LabRun_LabId_RanAt ON dbo.LabRun (LabId, RanAt DESC);
GO

-- Import tracking (helps testing + error scenarios)
CREATE TABLE dbo.ImportBatch (
  Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ImportBatch PRIMARY KEY,
  ImportedAt DATETIME2(0) NOT NULL CONSTRAINT DF_ImportBatch_ImportedAt DEFAULT (SYSUTCDATETIME()),
  ImportedByMongoUserId VARCHAR(50) NULL,

  SourceFormat VARCHAR(8) NOT NULL
    CONSTRAINT CK_ImportBatch_SourceFormat CHECK (SourceFormat IN ('json','csv','xml')),

  Target VARCHAR(20) NOT NULL
    CONSTRAINT CK_ImportBatch_Target CHECK (Target IN ('DeviceModel','Lab')),

  Status VARCHAR(12) NOT NULL
    CONSTRAINT CK_ImportBatch_Status CHECK (Status IN ('ok','failed','partial')),

  ErrorMessage NVARCHAR(400) NULL
);
GO

CREATE TABLE dbo.ImportBatchError (
  Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ImportBatchError PRIMARY KEY,
  BatchId BIGINT NOT NULL,
  ItemNumber INT NULL,
  Field NVARCHAR(60) NULL,
  Message NVARCHAR(400) NOT NULL,

  CONSTRAINT FK_ImportBatchError_Batch FOREIGN KEY (BatchId) REFERENCES dbo.ImportBatch (Id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_ImportBatchError_BatchId ON dbo.ImportBatchError (BatchId);
GO

-- Simple trigger to keep UpdatedAt current
CREATE OR ALTER TRIGGER dbo.TR_Lab_SetUpdatedAt
ON dbo.Lab
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.Lab
    SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.Lab l
  INNER JOIN inserted i ON i.Id = l.Id;
END;
GO
