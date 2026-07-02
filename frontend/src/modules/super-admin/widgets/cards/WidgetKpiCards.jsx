// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Widget KPI Cards
// ============================================

import WidgetsIcon from "@mui/icons-material/Widgets";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LockIcon from "@mui/icons-material/Lock";
import FlagIcon from "@mui/icons-material/Flag";

import AppStatCards from "@platform/ui/AppStatCards";

export default function WidgetKpiCards({ statistics = {} }) {
  const cards = [
    {
      label: "Total Widgets",
      value: statistics.TotalWidgets || 0,
      icon: <WidgetsIcon />,
    },
    {
      label: "Visible Widgets",
      value: statistics.VisibleWidgets || 0,
      icon: <VisibilityIcon />,
    },
    {
      label: "Permission Protected",
      value: statistics.PermissionProtectedWidgets || 0,
      icon: <LockIcon />,
    },
    {
      label: "Feature Controlled",
      value: statistics.FeatureControlledWidgets || 0,
      icon: <FlagIcon />,
    },
  ];

  return <AppStatCards cards={cards} />;
}