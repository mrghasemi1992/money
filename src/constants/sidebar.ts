/** Saved on this device when the desktop sidebar is collapsed to an icon rail. */
export const SIDEBAR_STORAGE_KEY = "money-sidebar";
export const SIDEBAR_COLLAPSED = "collapsed";

/** Set on <html> while the sidebar is collapsed, so CSS draws the rail before React hydrates. */
export const SIDEBAR_ATTRIBUTE = "data-sidebar";

/**
 * Runs in <head> before the first paint, like THEME_SCRIPT, so a collapsed sidebar never
 * flashes open on load. Mirrors setSidebarCollapsed() in utils/sidebar.ts without imports.
 */
export const SIDEBAR_SCRIPT = `(function(){try{if(localStorage.getItem(${JSON.stringify(SIDEBAR_STORAGE_KEY)})===${JSON.stringify(SIDEBAR_COLLAPSED)})document.documentElement.setAttribute(${JSON.stringify(SIDEBAR_ATTRIBUTE)},${JSON.stringify(SIDEBAR_COLLAPSED)})}catch(e){}})()`;
