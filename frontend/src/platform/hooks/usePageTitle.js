// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Page Title Hook
// ============================================
//
// Purpose:
// Sets browser tab title consistently across
// all platform pages.
// ============================================

import { useEffect } from "react";

import useBranding from "../../modules/system/hooks/useBranding";

export default function usePageTitle(pageTitle) {
  const { branding } = useBranding();

  useEffect(() => {
    const schoolCode =
      branding?.school?.schoolCode ||
      branding?.school?.schoolName ||
      "AUS";

    document.title = pageTitle
      ? `${schoolCode} | ${pageTitle}`
      : `${schoolCode} | Operations Platform`;
  }, [branding, pageTitle]);
}
