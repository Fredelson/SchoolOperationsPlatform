// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Branding Actions
// ============================================

import { AppButton } from "../../../../platform/ui";

export default function BrandingActions({ saving, onSave }) {
  return (
    <AppButton
      size="large"
      onClick={onSave}
      disabled={saving}
      sx={{ alignSelf: "flex-start" }}
    >
      {saving ? "Saving..." : "Save Branding"}
    </AppButton>
  );
}