// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Module Manager
// ============================================

import { Box, Stack, Typography } from "@mui/material";

import usePageTitle from "@platform/hooks/usePageTitle";

import { useModuleManager } from "../hooks/useModuleManager";
import ModuleKpiCards from "../cards/ModuleKpiCards";

export default function ModuleManager() {
  usePageTitle("AUS | Module Manager");

  const manager = useModuleManager();

  return (
    <Box>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Module Manager
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Manage platform modules, routes, visibility, and activation status.
          </Typography>
        </Box>

        <ModuleKpiCards kpis={manager.kpis} />
      </Stack>
    </Box>
  );
}