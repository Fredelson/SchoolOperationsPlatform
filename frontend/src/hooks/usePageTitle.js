// ============================================
// ARAB UNITY SCHOOL
// Page Title Hook
// Updates browser tab title
// ============================================

import { useEffect } from "react";

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = `AUS | ${title}`;
  }, [title]);
}