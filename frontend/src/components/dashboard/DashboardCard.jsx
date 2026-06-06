import { Card, CardContent, Typography } from "@mui/material";

export default function DashboardCard({
  title,
  children,
  height = "100%",
}) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        height,
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mb: 2 }}
        >
          {title}
        </Typography>

        {children}
      </CardContent>
    </Card>
  );
}
