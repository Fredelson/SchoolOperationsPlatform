import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";

const ICONS = {
  account_tree: AccountTreeOutlinedIcon,
  admin_panel_settings: AdminPanelSettingsOutlinedIcon,
  apps: AppsOutlinedIcon,
  assignment: AssignmentOutlinedIcon,
  auto_stories: AutoStoriesOutlinedIcon,
  build: BuildOutlinedIcon,
  business: BusinessOutlinedIcon,
  campaign: CampaignOutlinedIcon,
  category: CategoryOutlinedIcon,
  dashboard: DashboardOutlinedIcon,
  devices: DevicesOutlinedIcon,
  dot: FiberManualRecordIcon,
  flag: FlagOutlinedIcon,
  groups: GroupsOutlinedIcon,
  history: HistoryOutlinedIcon,
  inventory: Inventory2OutlinedIcon,
  menu_book: MenuBookOutlinedIcon,
  palette: PaletteOutlinedIcon,
  people: PeopleOutlinedIcon,
  print: PrintOutlinedIcon,
  search: SearchOutlinedIcon,
  shield: ShieldOutlinedIcon,
  upload: UploadOutlinedIcon,
};

export const getSidebarIcon = (iconKey, level = 0) => {
  const IconComponent = ICONS[String(iconKey || "").trim().toLowerCase()];

  if (IconComponent) return <IconComponent />;
  if (level > 0) return <FiberManualRecordIcon />;
  return null;
};
