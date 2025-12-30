-- Optional seed data for quick manual testing
SET NOCOUNT ON;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.DeviceModel)
BEGIN
  INSERT INTO dbo.DeviceModel (Vendor, ModelName, DeviceType, DefaultThroughputMbps, IsDeprecated)
  VALUES
    (N'Cisco', N'ISR 4331', 'router', 1000.0, 0),
    (N'Cisco', N'Catalyst 2960', 'switch', 1000.0, 0),
    (N'Generic', N'PC', 'pc', 100.0, 0),
    (N'Generic', N'Server', 'server', 1000.0, 0),
    (N'Generic', N'Hub', 'hub', 10.0, 1);
END;
GO
