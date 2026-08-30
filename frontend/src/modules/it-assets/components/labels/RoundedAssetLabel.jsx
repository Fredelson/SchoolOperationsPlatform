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

  const colors = {
    ...(branding?.defaults?.colors || {}),
    ...(settings.colors || {}),
  };
  const visibility = settings.visibility || {};
  const getColor = (key, fallbackKey) =>
    colors[key] || (fallbackKey ? colors[fallbackKey] : undefined);

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
  const templateUrl = buildFileUrl(
    settings.template?.filePath || settings.templatePath || ""
  );
  const assetDetailsUrl = buildAssetDetailsUrl(assetId);

  const hasBarcode = Boolean(assetCode);
  const hasAssetQr = Boolean(assetDetailsUrl);
  const hasWebsiteQr = Boolean(website);
  const topArcTextLength =
    schoolName.length <= 6 ? 22 : Math.min(61, Math.max(48, schoolName.length * 2.85));
  const websiteArcTextLength = Math.min(
    46,
    Math.max(34, String(settings.websiteQrInstruction || "").length * 1.65)
  );
  const assetArcTextLength = Math.min(
    46,
    Math.max(34, String(settings.assetQrInstruction || "").length * 1.65)
  );

  const bottomText = [
    visibility.showWebsite && website,
    visibility.showAddress && address,
  ]
    .filter(Boolean)
    .join("   ");
  const labelStyle = {
    "--round-outer": colors.outerRing,
    "--round-inner": colors.innerRing,
    "--round-accent": colors.accent,
    "--round-bg": colors.background,
    "--round-paper": getColor("qrBackground", "background"),
    "--round-on-outer": getColor("background", "qrBackground"),
    "--round-main": colors.mainText,
    "--round-secondary": colors.secondaryText,
    "--round-border": colors.border,
    "--round-barcode": colors.barcode,
    "--round-qr-fg": colors.qrForeground,
    "--round-qr-bg": colors.qrBackground,
    "--round-property": colors.propertyText,
    "--round-asset-code": colors.assetCode,
    "--round-department": colors.departmentText,
  };

  if (templateUrl) {
    return (
      <div
        className={`rounded-asset-label rounded-asset-label--template ${className}`.trim()}
        style={labelStyle}
      >
        <img
          className="rounded-asset-label__template-image"
          src={templateUrl}
          alt=""
          aria-hidden="true"
          draggable={false}
        />

        <div className="rounded-asset-label__template-overlay">
          {visibility.showSchoolLogo && (
            <div className="rounded-asset-label__template-logo">
              {logoUrl ? (
                <img src={logoUrl} alt={`${schoolName} logo`} />
              ) : (
                <span>{schoolCode}</span>
              )}
            </div>
          )}

          <section className="rounded-asset-label__template-qr-card rounded-asset-label__template-qr-card--website">
            {visibility.showWebsiteQr && hasWebsiteQr ? (
              <>
                <div className="rounded-asset-label__template-qr-code">
                  <QRCodeSVG
                    value={website}
                    bgColor={getColor("qrBackground", "background")}
                    fgColor={getColor("qrForeground", "barcode")}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                {visibility.showWebsite && (
                  <AutoFitText
                    className="rounded-asset-label__template-qr-caption"
                    max="1.25cqw"
                    min="0.68cqw"
                    lines={1}
                  >
                    {website.replace(/^https?:\/\//i, "").replace(/\/+$/, "")}
                  </AutoFitText>
                )}
              </>
            ) : showWarnings ? (
              <span className="rounded-asset-label__warning">Website QR unavailable</span>
            ) : null}
          </section>

          <div className="rounded-asset-label__template-barcode">
            {visibility.showBarcode && hasBarcode ? (
              <AssetBarcode
                value={assetCode}
                width={1}
                height={86}
                displayValue={false}
                margin={0}
                lineColor={getColor("barcode", "assetCode")}
                background={getColor("background", "qrBackground")}
              />
            ) : showWarnings ? (
              <span className="rounded-asset-label__warning">Barcode unavailable</span>
            ) : null}
          </div>

          <section className="rounded-asset-label__template-qr-card rounded-asset-label__template-qr-card--asset">
            {visibility.showAssetQr && hasAssetQr ? (
              <div className="rounded-asset-label__template-qr-code">
                <AssetQrCode
                  assetId={assetId}
                  value={assetDetailsUrl}
                  size={132}
                  level="M"
                  includeMargin={false}
                  fgColor={getColor("qrForeground", "barcode")}
                  bgColor={getColor("qrBackground", "background")}
                />
              </div>
            ) : showWarnings ? (
              <span className="rounded-asset-label__warning">Asset QR unavailable</span>
            ) : null}
          </section>

          <AutoFitText
            className="rounded-asset-label__template-asset-code"
            max="6.4cqw"
            min="0.65cqw"
            lines={1}
          >
            {assetCode || (showWarnings ? "ASSET CODE REQUIRED" : "")}
          </AutoFitText>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-asset-label ${className}`.trim()}
      style={labelStyle}
    >
      <svg className="rounded-asset-label__arcs" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <path id={`${arcId}-top`} d="M 18 24 A 42 42 0 0 1 82 24" />
          <path id={`${arcId}-left`} d="M 10.6 74.5 A 45 45 0 0 1 22.5 18.5" />
          <path id={`${arcId}-right`} d="M 77.5 18.5 A 45 45 0 0 1 89.4 74.5" />
          <path id={`${arcId}-bottom`} d="M 84 78.5 A 44 44 0 0 1 16 78.5" />
        </defs>

        <text
          className="rounded-asset-label__arc-text rounded-asset-label__arc-text--top"
          textLength={topArcTextLength}
          lengthAdjust="spacingAndGlyphs"
        >
          <textPath href={`#${arcId}-top`} startOffset="50%" textAnchor="middle">
            {schoolName}
          </textPath>
        </text>

        <text
          className="rounded-asset-label__arc-text rounded-asset-label__arc-text--side"
          textLength={websiteArcTextLength}
          lengthAdjust="spacingAndGlyphs"
        >
          <textPath href={`#${arcId}-left`} startOffset="50%" textAnchor="middle">
            {settings.websiteQrInstruction}
          </textPath>
        </text>

        <text
          className="rounded-asset-label__arc-text rounded-asset-label__arc-text--side"
          textLength={assetArcTextLength}
          lengthAdjust="spacingAndGlyphs"
        >
          <textPath href={`#${arcId}-right`} startOffset="50%" textAnchor="middle">
            {settings.assetQrInstruction}
          </textPath>
        </text>

        {bottomText && (
          <text className="rounded-asset-label__arc-text rounded-asset-label__arc-text--bottom" textLength="58" lengthAdjust="spacingAndGlyphs">
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
      <span className="rounded-asset-label__arc-dot rounded-asset-label__arc-dot--top-left" />
      <span className="rounded-asset-label__arc-dot rounded-asset-label__arc-dot--top-right" />
      <span className="rounded-asset-label__arc-dot rounded-asset-label__arc-dot--bottom-left" />
      <span className="rounded-asset-label__arc-dot rounded-asset-label__arc-dot--bottom-right" />

      {visibility.showEstablishedYear && settings.establishedYear && (
        <div className="rounded-asset-label__established-badge">
          <span />
          <AutoFitText
            as="strong"
            className="rounded-asset-label__established-text"
            max="1.85cqw"
            min="0.95cqw"
            lines={1}
          >
            {`EST. ${settings.establishedYear}`}
          </AutoFitText>
          <span />
        </div>
      )}

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
            max="7.35cqw"
            min="2.55cqw"
            lines={2}
          >
            {schoolName}
          </AutoFitText>

          <div className="rounded-asset-label__asset-heading">
            <span />
            <AutoFitText className="rounded-asset-label__asset-heading-text" max="2.3cqw" min="0.95cqw" lines={1}>
              IT ASSET
            </AutoFitText>
            <span />
          </div>

          {visibility.showSchoolTagline && (
            <div className="rounded-asset-label__tagline-row rounded-asset-label__tagline-row--compact">
              <span />
              <AutoFitText
                className="rounded-asset-label__tagline"
                max="2.3cqw"
                min="0.95cqw"
                lines={2}
              >
                {toUpper(settings.schoolTagline)}
              </AutoFitText>
              <span />
            </div>
          )}
        </header>

        <main className="rounded-asset-label__main">
          <section className="rounded-asset-label__qr-panel rounded-asset-label__qr-panel--website">
            {visibility.showWebsiteQr && hasWebsiteQr ? (
              <>
                <div className="rounded-asset-label__qr-box">
                  <QRCodeSVG
                    value={website}
                    bgColor={getColor("qrBackground", "background")}
                    fgColor={getColor("qrForeground", "barcode")}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                {visibility.showWebsite && (
                  <AutoFitText className="rounded-asset-label__qr-caption" max="1.35cqw" min="0.72cqw" lines={1}>
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
              <AutoFitText className="rounded-asset-label__department" max="2.8cqw" min="1.05cqw" lines={2}>
                {toUpper(settings.departmentLabel)}
              </AutoFitText>
              <span />
            </div>

            <AutoFitText className="rounded-asset-label__asset-tag-label" max="1.45cqw" min="0.7cqw" lines={1}>
              ASSET TAG
            </AutoFitText>

            <div className="rounded-asset-label__barcode">
              {visibility.showBarcode && hasBarcode ? (
                <AssetBarcode
                  value={assetCode}
                  width={1}
                  height={86}
                  displayValue={false}
                  margin={0}
                  lineColor={getColor("barcode", "assetCode")}
                  background={getColor("background", "qrBackground")}
                />
              ) : showWarnings ? (
                <span className="rounded-asset-label__warning">Barcode unavailable</span>
              ) : null}
            </div>
          </section>

          <section className="rounded-asset-label__qr-panel rounded-asset-label__qr-panel--asset">
            {visibility.showAssetQr && hasAssetQr ? (
              <div className="rounded-asset-label__qr-box">
                <AssetQrCode
                  assetId={assetId}
                  value={assetDetailsUrl}
                  size={132}
                  level="M"
                  includeMargin={false}
                  fgColor={getColor("qrForeground", "barcode")}
                  bgColor={getColor("qrBackground", "background")}
                />
              </div>
            ) : showWarnings ? (
              <span className="rounded-asset-label__warning">Asset QR unavailable</span>
            ) : null}
          </section>
        </main>

        <AutoFitText className="rounded-asset-label__asset-code" max="7.2cqw" min="0.65cqw" lines={1}>
          {assetCode || (showWarnings ? "ASSET CODE REQUIRED" : "")}
        </AutoFitText>

        {visibility.showPropertyLabel && (
          <footer className="rounded-asset-label__property">
            <div className="rounded-asset-label__property-rule">
              <span />
              <AutoFitText className="rounded-asset-label__property-label" max="1.65cqw" min="0.82cqw" lines={1}>
                {toUpper(settings.propertyLabel)}
              </AutoFitText>
              <span />
            </div>
            <AutoFitText className="rounded-asset-label__property-school" max="3.15cqw" min="1.2cqw" lines={2}>
              {schoolName}
            </AutoFitText>
          </footer>
        )}
      </div>
    </div>
  );
}
