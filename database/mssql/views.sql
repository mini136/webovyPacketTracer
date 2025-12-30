SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- View #1: Lab summary (aggregations across 3+ tables)
CREATE OR ALTER VIEW dbo.vw_LabSummary
AS
SELECT
  l.Id AS LabId,
  l.Name,
  l.IsPublic,
  l.Status,
  l.OwnerMongoUserId,
  l.MongoTopologyId,
  l.CreatedAt,

  COUNT(DISTINCT lam.DeviceModelId) AS AllowedModelCount,
  ISNULL(SUM(lam.Quantity), 0) AS AllowedDeviceTotal,

  COUNT(lr.Id) AS RunCount,
  SUM(CASE WHEN lr.Success = 1 THEN 1 ELSE 0 END) AS SuccessfulRuns,
  AVG(CASE WHEN lr.Score IS NULL THEN NULL ELSE lr.Score END) AS AvgScore,
  MAX(lr.RanAt) AS LastRunAt
FROM dbo.Lab l
LEFT JOIN dbo.LabAllowedModel lam ON lam.LabId = l.Id
LEFT JOIN dbo.LabRun lr ON lr.LabId = l.Id
GROUP BY
  l.Id, l.Name, l.IsPublic, l.Status, l.OwnerMongoUserId, l.MongoTopologyId, l.CreatedAt;
GO

-- View #2: Import summary
CREATE OR ALTER VIEW dbo.vw_ImportSummary
AS
SELECT
  b.Id AS BatchId,
  b.ImportedAt,
  b.ImportedByMongoUserId,
  b.SourceFormat,
  b.Target,
  b.Status,
  b.ErrorMessage,
  COUNT(e.Id) AS ErrorCount
FROM dbo.ImportBatch b
LEFT JOIN dbo.ImportBatchError e ON e.BatchId = b.Id
GROUP BY
  b.Id, b.ImportedAt, b.ImportedByMongoUserId, b.SourceFormat, b.Target, b.Status, b.ErrorMessage;
GO
