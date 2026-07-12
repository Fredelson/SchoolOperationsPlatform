// ============================================
// ARAB UNITY SCHOOL
// Reusable Profile Page
// Works for Teacher, HOD, HOS, Printing Admin, SuperAdmin
// ============================================

import { Box, Card, CardContent, Typography, Avatar, Divider } from "@mui/material";

import BadgeIcon from "@mui/icons-material/Badge";
import EmailIcon from "@mui/icons-material/Email";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";


import { useAuth } from "../../../context/AuthContext";

const AUS_GREEN = "#2E6F37";
const AUS_NAVY = "#29233D";

export default function Profile() {
  const { user } = useAuth();

  const fullName = user?.fullName || user?.FullName || "Unknown User";
  const employeeId = user?.employeeId || user?.EmployeeId || "N/A";
  const email = user?.schoolEmail || user?.SchoolEmail || user?.email || "N/A";
  const role = user?.displayRole || user?.role || user?.Role || "Guest";
  const department = user?.departmentName || user?.DepartmentName || "N/A";
  const subject = user?.subjectName || user?.SubjectName || user?.subject || "N/A";

  const initials = fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Typography
          sx={{
            fontSize: 30,
            fontWeight: 900,
            color: AUS_NAVY,
            mb: 3,
          }}
        >
          My Profile
        </Typography>

        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 4,
              bgcolor: AUS_GREEN,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Avatar
              sx={{
                width: 90,
                height: 90,
                bgcolor: AUS_NAVY,
                fontSize: 34,
                fontWeight: 900,
              }}
            >
              {initials}
            </Avatar>

            <Box>
              <Typography sx={{ fontSize: 28, fontWeight: 900 }}>
                {fullName}
              </Typography>

              <Typography sx={{ fontSize: 16, opacity: 0.9 }}>
                {role}
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <ProfileRow icon={<BadgeIcon />} label="Employee ID" value={employeeId} />
            <ProfileRow icon={<EmailIcon />} label="School Email" value={email} />
            <ProfileRow icon={<WorkIcon />} label="Role" value={role} />
            <ProfileRow icon={<SchoolIcon />} label="Department" value={department} />
            <ProfileRow icon={<SchoolIcon />} label="Subject" value={subject} />
            <ProfileRow icon={<VerifiedUserIcon />} label="Account Status" value="Active" />
          </CardContent>
        </Card>
      </Box>
    </>
  );
}

function ProfileRow({ icon, label, value }) {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          py: 2,
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: "rgba(46,111,55,0.08)",
            color: AUS_GREEN,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            {label}
          </Typography>

          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
            {value}
          </Typography>
        </Box>
      </Box>

      <Divider />
    </>
  );
}
