// ============================================
// ARAB UNITY SCHOOL
// Subject Analytics Cards
// For HOD department/subject overview
// ============================================

// MUI components
import { Box, Card, CardContent, Typography } from "@mui/material";

// Temporary subject analytics data
const subjectAnalytics = [
  {
    subject: "English",
    teachers: 12,
    pending: 6,
    approved: 42,
    rejected: 2,
  },
  {
    subject: "Math",
    teachers: 10,
    pending: 4,
    approved: 35,
    rejected: 1,
  },
  {
    subject: "Science",
    teachers: 8,
    pending: 3,
    approved: 28,
    rejected: 1,
  },
];

export default function SubjectAnalyticsCards() {
  return (
    <Box
      sx={{
        mt: 4,
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(3, 1fr)",
        },
        gap: 3,
      }}
    >
      {subjectAnalytics.map((item) => (
        <Card
          key={item.subject}
          sx={{
            borderRadius: 4,
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          <CardContent>
            {/* Subject title */}
            <Typography variant="h6" fontWeight={700}>
              {item.subject}
            </Typography>

            {/* Teacher count */}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Teachers: {item.teachers}
            </Typography>

            {/* Request statistics */}
            <Box sx={{ mt: 2, display: "grid", gap: 1 }}>
              <Typography variant="body2">
                Pending Requests: <strong>{item.pending}</strong>
              </Typography>

              <Typography variant="body2">
                Approved This Month: <strong>{item.approved}</strong>
              </Typography>

              <Typography variant="body2">
                Rejected This Month: <strong>{item.rejected}</strong>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
