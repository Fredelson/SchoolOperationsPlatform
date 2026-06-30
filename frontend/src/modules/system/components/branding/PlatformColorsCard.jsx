// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Platform Colors Card
// ============================================

import { Box, Card, CardContent, Divider, Typography } from "@mui/material";

import ColorPickerField from "./ColorPickerField";

export default function PlatformColorsCard({ form, updateBrandingField, inputGrid }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={900}>
          Platform Colors
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={inputGrid}>
          {[
            ["primaryColor", "Primary Color"],
            ["secondaryColor", "Secondary Color"],
            ["accentColor", "Accent Color"],
            ["loginCardColor", "Login Card Color"],
          ].map(([field, label]) => (
            <ColorPickerField
              key={field}
              label={label}
              value={form.branding[field]}
              onChange={(value) => updateBrandingField(field, value)}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
