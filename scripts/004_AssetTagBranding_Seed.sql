SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID('dbo.AssetTagBranding','U') IS NULL
BEGIN
  THROW 52000,'dbo.AssetTagBranding is missing. Run 002_Final_Migration.sql first.',1;
END;

DECLARE @RoundedAssetTagDefaults nvarchar(max)=N'{"schoolTagline":"BEST VALUE BRITISH EDUCATION","departmentLabel":"IT DEPARTMENT","propertyLabel":"PROPERTY OF","establishedYear":"1975","websiteQrInstruction":"SCAN FOR SCHOOL WEBSITE","assetQrInstruction":"SCAN FOR ASSET INFORMATION","colors":{"outerRing":"#061B3D","innerRing":"#006B3C","accent":"#E6A000","background":"#FFFFFF","mainText":"#061B3D","secondaryText":"#006B3C","border":"#061B3D","barcode":"#000000","qrForeground":"#000000","qrBackground":"#FFFFFF","propertyText":"#006B3C","assetCode":"#000000","departmentText":"#061B3D"},"visibility":{"showWebsite":true,"showAddress":true,"showEstablishedYear":true,"showPropertyLabel":true,"showSocialIcons":false,"showSchoolLogo":true,"showSchoolTagline":true,"showWebsiteQr":true,"showAssetQr":true,"showBarcode":true},"print":{"templateKey":"FULL_A4","pageSize":"A4","orientation":"portrait","labelDiameter":190,"marginTop":12,"marginBottom":12,"marginLeft":10,"marginRight":10,"horizontalOffset":0,"verticalOffset":0,"printScale":1,"rows":1,"columns":1,"gapHorizontal":0,"gapVertical":0}}';
DECLARE @RectangularAssetTagDefaults nvarchar(max)=N'{"contentLabel":"IT ASSET","propertyLabel":"PROPERTY OF","visibility":{"showQrCode":true,"showBarcode":true,"showLogo":true,"showBorder":true},"colors":{"border":"#000000","mainText":"#000000","background":"#FFFFFF","accent":"#E6A000","barcode":"#000000","qrForeground":"#000000","qrBackground":"#FFFFFF"},"print":{"templateKey":"RECTANGULAR_A4_GRID","pageSize":"A4","orientation":"portrait","printScale":1}}';

MERGE dbo.AssetTagBranding AS target
USING (
  VALUES
    ('rounded', @RoundedAssetTagDefaults),
    ('rectangular', @RectangularAssetTagDefaults)
) AS source(BrandingType, SettingsJson)
ON target.BrandingType = source.BrandingType
WHEN MATCHED THEN
  UPDATE SET
    IsActive = 1,
    UpdatedAt = COALESCE(target.UpdatedAt, GETDATE())
WHEN NOT MATCHED THEN
  INSERT (BrandingType, SettingsJson, IsActive, CreatedAt, UpdatedAt)
  VALUES (source.BrandingType, source.SettingsJson, 1, GETDATE(), GETDATE());

SELECT BrandingType, IsActive, CreatedAt, UpdatedAt
FROM dbo.AssetTagBranding
WHERE BrandingType IN ('rounded','rectangular')
ORDER BY BrandingType;
