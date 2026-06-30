// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Sidebar Helpers
// ============================================
//
// Purpose:
// Shared helper functions for recursive sidebar navigation.
// Keeps sidebar rendering logic clean and reusable.
// ============================================

export const getSidebarItemKey = (item) => item?.path || item?.label;

export const hasActiveChild = (item, pathname) => {
  if (!item?.children?.length) return false;

  return item.children.some((child) => {
    const childPath = child.path;

    const isDirectMatch =
      childPath &&
      (pathname === childPath || pathname.startsWith(`${childPath}/`));

    return isDirectMatch || hasActiveChild(child, pathname);
  });
};

export const isSidebarItemActive = (item, pathname) => {
  const itemPath = item?.path;

  const isDirectMatch =
    itemPath && (pathname === itemPath || pathname.startsWith(`${itemPath}/`));

  return Boolean(isDirectMatch || hasActiveChild(item, pathname));
};

export const buildInitialOpenMenus = (sections = [], pathname = "") => {
  const openState = {};

  const scanItem = (item) => {
    const key = getSidebarItemKey(item);

    if (item?.children?.length && hasActiveChild(item, pathname)) {
      openState[key] = true;
    }

    item?.children?.forEach(scanItem);
  };

  sections.forEach((section) => {
    section.items?.forEach(scanItem);
  });

  return openState;
};
