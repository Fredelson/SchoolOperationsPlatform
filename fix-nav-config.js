const fs = require('fs');
const f = 'frontend/src/modules/super-admin/enterprise/pages/EnterpriseDataManager.jsx';
let c = fs.readFileSync(f, 'utf8');
const oldConst = `const CONFIG = {
  navigation: {
    title: "Navigation Manager", endpoint: "/navigation-manager", id: "menuId",
    fields: ["menuKey", "menuName", "moduleId", "parentMenuId", "route", "icon", "permissionId", "featureFlagId", "visibilityStatusId", "menuGroupId", "sortOrder", "isPinned", "isCollapsible"],
    required: ["menuKey", "menuName", "moduleId", "visibilityStatusId"],
    columns: ["menuName", "menuKey", "moduleName", "parentMenuName", "route", "groupName", "visibilityStatusName"],
  },
  roles:`;
const newConst = `const CONFIG = {
  roles:`;
c = c.replace(oldConst, newConst);
fs.writeFileSync(f, c);
console.log('Removed navigation config');
