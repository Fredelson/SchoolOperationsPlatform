import { Alert, Stack } from "@mui/material";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import { useParams } from "react-router-dom";

import { AppBreadcrumbs, AppPageHeader, AppSection } from "@ui";

function formatModuleKey(value = "") {
  return decodeURIComponent(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ModuleLandingPage() {
  const { moduleKey } = useParams();
  const moduleName = formatModuleKey(moduleKey);

  return (
    <>
      <AppBreadcrumbs
        items={[
          { label: "Dashboard", path: "/super-admin/dashboard" },
          { label: "Modules", path: "/super-admin/modules" },
          { label: moduleName },
        ]}
      />

      <AppPageHeader
        title={moduleName}
        subtitle="This module is registered and connected to Super Admin navigation."
        icon={<AppsOutlinedIcon />}
      />

      <AppSection title="Module navigation">
        <Stack spacing={2} alignItems="flex-start">
          <Alert severity="info">
            This module does not have a dedicated menu route yet. Configure its menus in the workspace settings to replace this landing page.
          </Alert>
        </Stack>
      </AppSection>
    </>
  );
}
