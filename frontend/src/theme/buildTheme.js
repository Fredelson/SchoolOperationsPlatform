// ============================================
// ARAB UNITY SCHOOL
// Dynamic Platform Theme Builder
// ============================================

import { createTheme } from "@mui/material/styles";

import { buildPalette } from "./palette";
import { typography } from "./typography";
import { shape } from "./shape";

import { buttonOverrides } from "./components/button";
import { cardOverrides } from "./components/card";
import { textFieldOverrides } from "./components/textField";

export function buildTheme(brandingData) {
  const branding = brandingData?.branding || {};

  return createTheme({
    palette: buildPalette(branding),
    typography,
    shape,
    components: {
      ...buttonOverrides,
      ...cardOverrides,
      ...textFieldOverrides,
    },
  });
}
