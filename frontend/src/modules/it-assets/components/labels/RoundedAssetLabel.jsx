import { useId } from "react";
import { QRCodeSVG } from "qrcode.react";

import buildFileUrl from "../../../../platform/utils/buildFileUrl";

import AssetBarcode from "../barcode/AssetBarcode";
import AssetQrCode, { buildAssetDetailsUrl } from "./AssetQrCode";
import AutoFitText from "./AutoFitText";

import "./roundedAssetLabel.css";

const valueFrom = (source, keys, fallback = "") => {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== undefined && value !== null && String(value).trim()) {
      return value;
    }
  }

  return fallback;
};

const toUpper = (value) => String(value || "").trim().toUpperCase();

const normalizeUrl = (value) => String(value || "").trim();

export default function RoundedAssetLabel({
  asset,
  branding,
  className = "",
  showWarnings = false,
}) {
  const rawArcId = useId();
  const arcId = rawArcId.replace(/:/g, "");
  const settings = branding?.settings || {};
  const organization = branding?.organization || {};
  const school = organization.school || {};
  const platformBranding = organization.branding || {};

  const colors = settings.colors || {};
  const visibility = settings.visibility || {};

  const assetId = valueFrom(asset, ["AssetId", "assetId", "Id", "id"]);
  const assetCode = toUpper(
    valueFrom(asset, ["AssetTag", "assetTag", "AssetCode", "assetCode"])
  );
  const schoolName = toUpper(
    valueFrom(school, ["schoolName", "SchoolName"], "Arab Unity School")
  );
  const schoolCode = toUpper(
    valueFrom(school, ["schoolCode", "SchoolCode"], "AUS")
  );
  const website = normalizeUrl(valueFrom(school, ["website", "Website"]));
  const address = valueFrom(school, ["address", "Address"], "");
  const logoPath =
    platformBranding.logoPath ||
    platformBranding.smallLogoPath ||
    platformBranding.darkLogoPath ||
    school.logoPath ||
    "";
  const logoUrl = buildFileUrl(logoPath);
  const assetDetailsUrl = buildAssetDetailsUrl(assetId);

  const hasBarcode = Boolean(assetCode);
  const hasAssetQr = Boolean(assetDetailsUrl);
  const hasWebsiteQr = Boolean(website);

  const bottomText = [
    visibility.showWebsite && website,
    visibility.showEstablishedYear && `EST. ${settings.establishedYear}`,
    visibility.showAddress && address,
  ]
    .filter(Boolean)
    .join("   ");

  return (
    <div
      className={`rounded-asset-label ${className}`.trim()}
      style={{
        "--round-outer": colors.outerRing,
        "--round-inner": colors.innerRing,
        "--round-accent": colors.accent,
        "--round-bg": colors.background,
        "--round-main": colors.mainText,
        "--round-secondary": colors.secondaryText,
        "--round-border": colors.border,
        "--round-barcode": colors.barcode,
        "--round-qr-fg": colors.qrForeground,
        "--round-qr-bg": colors.qrBackground,
        "--round-property": colors.propertyText,
        "--round-asset-code": colors.assetCode,
        "--round-department": colors.departmentText,
      }}
    >
      <svg className="rounded-asset-label__arcs" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <path id={`${arcId}-top`} d="M 19 25 A 40 40 0 0 1 81 25" />
          <path id={`${arcId}-left`} d="M 12 75 A 44 44 0 0 1 22 20" />
          <path id={`${arcId}-right`} d="M 78 20 A 44 44 0 0 1 88 75" />
          <path id={`${arcId}-bottom`} d="M 83 78 A 43 43 0 0 1 17 78" />
        </defs>

        <text className="rounded-asset-label__arc-text rounded-asset-label__arc-text--top" textLength="49" lengthAdjust="spacingAndGlyphs">
          <textPath href={`#${arcId}-top`} startOffset="50%" textAnchor="middle">
            {schoolName}
          </textPath>
        </text>

        <text className="rounded-asset-label__arc-text rounded-asset-label__arc-text--side" textLength="42" lengthAdjust="spacingAndGlyphs">
          <textPath href={`#${arcId}-left`} startOffset="50%" textAnchor="middle">
            {settings.websiteQrInstruction}
          </textPath>
        </text>

        <text className="rounded-asset-label__arc-text rounded-asset-label__arc-text--side" textLength="42" lengthAdjust="spacingAndGlyphs">
          <textPath href={`#${arcId}-right`} startOffset="50%" textAnchor="middle">
            {settings.assetQrInstruction}
          </textPath>
        </text>

        {bottomText && (
          <text className="rounded-asset-label__arc-text rounded-asset-label__arc-text--bottom" textLength="52" lengthAdjust="spacingAndGlyphs">
            <textPath href={`#${arcId}-bottom`} startOffset="50%" textAnchor="middle">
              {toUpper(bottomText)}
            </textPath>
          </text>
        )}
      </svg>

      <div className="rounded-asset-label__ring rounded-asset-label__ring--white" />
      <div className="rounded-asset-label__ring rounded-asset-label__ring--green" />
      <div className="rounded-asset-label__accent rounded-asset-label__accent--left" />
      <div className="rounded-asset-label__accent rounded-asset-label__accent--right" />

      <div className="rounded-asset-label__center">
        <header className="rounded-asset-label__brand">
          {visibility.showSchoolLogo && (
            <div className="rounded-asset-label__logo">
              {logoUrl ? (
                <img src={logoUrl} alt={`${schoolName} logo`} />
              ) : (
                <span>{schoolCode}</span>
              )}
            </div>
          )}

          <AutoFitText
            className="rounded-asset-label__school-name"
            max={42}
            min={14}
            lines={2}
          >
            {schoolName}
          </AutoFitText>

          {visibility.showSchoolTagline && (
            <div className="rounded-asset-label__tagline-row">
              <span />
              <AutoFitText
                className="rounded-asset-label__tagline"
                max={15}
                min={7}
                lines={2}
              >
                {toUpper(settings.schoolTagline)}
              </AutoFitText>
              <span />
            </div>
          )}
        </header>

        <main className="rounded-asset-label__main">
          <section className="rounded-asset-label__qr-panel">
            {visibility.showWebsiteQr && hasWebsiteQr ? (
              <>
                <div className="rounded-asset-label__qr-box">
                  <QRCodeSVG
                    value={website}
                    bgColor={colors.qrBackground}
                    fgColor={colors.qrForeground}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                {visibility.showWebsite && (
                  <AutoFitText className="rounded-asset-label__qr-caption" max={11} min={6} lines={2}>
                    {website}
                  </AutoFitText>
                )}
              </>
            ) : showWarnings ? (
              <span className="rounded-asset-label__warning">Website QR unavailable</span>
            ) : null}
          </section>

          <section className="rounded-asset-label__identity">
            <div className="rounded-asset-label__department-row">
              <span />
              <AutoFitText className="rounded-asset-label__department" max={18} min={8} lines={2}>
                {toUpper(settings.departmentLabel)}
              </AutoFitText>
              <span />
            </div>

            <div className="rounded-asset-label__barcode">
              {visibility.showBarcode && hasBarcode ? (
                <AssetBarcode
                  value={assetCode}
                  width={1}
                  height={70}
                  displayValue={false}
                  margin={0}
                  lineColor={colors.barcode}
                  background={colors.background}
                />
              ) : showWarnings ? (
                <span className="rounded-asset-label__warning">Barcode unavailable</span>
              ) : null}
            </div>

            <AutoFitText className="rounded-asset-label__asset-code" max={48} min={15} lines={2}>
              {assetCode || (showWarnings ? "ASSET CODE REQUIRED" : "")}
            </AutoFitText>
          </section>

          <section className="rounded-asset-label__qr-panel">
            {visibility.showAssetQr && hasAssetQr ? (
              <div className="rounded-asset-label__qr-box">
                <AssetQrCode
                  assetId={assetId}
                  value={assetDetailsUrl}
                  size={132}
                  level="M"
                  includeMargin={false}
                  fgColor={colors.qrForeground}
                  bgColor={colors.qrBackground}
                />
              </div>
            ) : showWarnings ? (
              <span className="rounded-asset-label__warning">Asset QR unavailable</span>
            ) : null}
          </section>
        </main>

        {visibility.showPropertyLabel && (
          <footer className="rounded-asset-label__property">
            <div className="rounded-asset-label__property-rule">
              <span />
              <AutoFitText className="rounded-asset-label__property-label" max={16} min={8} lines={1}>
                {toUpper(settings.propertyLabel)}
              </AutoFitText>
              <span />
            </div>
            <AutoFitText className="rounded-asset-label__property-school" max={28} min={11} lines={2}>
              {schoolName}
            </AutoFitText>
          </footer>
        )}
      </div>
    </div>
  );
}
