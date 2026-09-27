import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import BarChartIcon from "@mui/icons-material/BarChart";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";

import usePageTitle from "@platform/hooks/usePageTitle";
import { AppButton, AppCard, AppPageHeader } from "@platform/ui";

const actions = [
  {
    title: "Dashboard",
    description: "View printing request totals, status, and usage trends.",
    action: "dashboard",
    icon: DashboardIcon,
  },
  {
    title: "Create Print Request",
    description: "Submit documents and details for a new printing request.",
    action: "create-request",
    icon: AddCircleIcon,
  },
  {
    title: "My Requests",
    description: "Track request status, approvals, and completed work.",
    action: "my-requests",
    icon: DescriptionIcon,
  },
  {
    title: "Attachments",
    description: "View and manage files attached to your print requests.",
    action: "attachments",
    icon: AttachFileIcon,
  },
  {
    title: "Reports",
    description: "View summaries and reports for your printing requests.",
    action: "reports",
    icon: BarChartIcon,
  },
];

export default function TeacherPrintManagement() {
  usePageTitle("Teacher Print Management");
  const navigate = useNavigate();

  return (
    <Box>
      <AppPageHeader
        title="Teacher Print Management"
        subtitle="Create, track, and manage your printing requests."
      />

      <AppCard>
        <Grid container spacing={2}>
          {actions.map(({ title, description, action, icon: Icon }) => (
            <Grid item xs={12} md={4} key={action}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Stack spacing={2} alignItems="flex-start">
                    <Icon color="primary" fontSize="large" />
                    <Box>
                      <Typography variant="h6" fontWeight={800}>
                        {title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {description}
                      </Typography>
                    </Box>
                    <AppButton onClick={() => navigate(`/teacher/${action}`)}>
                      Open
                    </AppButton>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </AppCard>
    </Box>
  );
}
