// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// School Profile Card
// ============================================

import { Box, Card, CardContent, Divider, TextField, Typography } from "@mui/material";

export default function SchoolProfileCard({ form, updateField, inputGrid }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={900}>
          Organization Information
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={inputGrid}>
          {[
            ["schoolName", "School Name"],
            ["website", "Website"],
            ["address", "Address"],
            ["phone", "Phone"],
            ["email", "Email"],
            ["timeZone", "Time Zone"],
            ["currencyCode", "Currency"],
          ].map(([field, label]) => (
            <TextField
              key={field}
              label={label}
              value={form.school[field] || ""}
              onChange={(e) => updateField("school", field, e.target.value)}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}