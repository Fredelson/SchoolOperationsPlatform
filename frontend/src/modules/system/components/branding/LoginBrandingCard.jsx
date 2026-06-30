// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Login Branding Card
// ============================================

import { Box, Card, CardContent, Divider, TextField, Typography } from "@mui/material";

export default function LoginBrandingCard({ form, updateBrandingField, inputGrid }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={900}>
          Login Branding
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={inputGrid}>
          {[
            ["loginTitle", "Login Title"],
            ["loginSubtitle", "Login Subtitle"],
            ["footerText", "Footer Text"],
            ["supportEmail", "Support Email"],
            ["supportPhone", "Support Phone"],
          ].map(([field, label]) => (
            <TextField
              key={field}
              label={label}
              value={form.branding[field] || ""}
              onChange={(e) => updateBrandingField(field, e.target.value)}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
