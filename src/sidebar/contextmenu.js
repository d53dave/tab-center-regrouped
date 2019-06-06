/* global browser, confirm, location */

import SideTab from "./tab.js";
import getContextualIdentityItems from "./contextualidentities.js";

const IS_PRIVILEGED_PAGE_URL = /^(about|chrome|data|file|javascript):*/;

export default class ContextMenu {
  constructor(tablist) {
    this._tablist = tablist;
    let count;

    browser.menus.onClicked.addListener((info, tab) => {
      if (!tab || !this._tablist.checkWindow(tab.windowId)) {
        return;
      }
      switch (info.menuItemId) {
        case "contextMenuReloadTab":
          browser.tabs.reload(tab.id);
          break;
        case "contextMenuMuteTab":
          browser.tabs.update(tab.id, { muted: !tab.mutedInfo.muted });
          break;
        case "contextMenuPinTab":
          browser.tabs.update(tab.id, { pinned: !tab.pinned });
          break;
        case "contextMenuDuplicateTab":
          browser.tabs.duplicate(tab.id);
          break;
        case "contextMenuUnloadTab":
          browser.tabs.discard(tab.id);
          break;
        case "contextMenuMoveTabToStart":
          console.log(tab);
          this._tablist.moveTabToStart(tab);
          break;
        case "contextMenuMoveTabToEnd":
          console.log(tab);
          this._tablist.moveTabToEnd(tab);
          break;
        case "contextMenuMoveTabToNewWindow":
          browser.windows.create({ tabId: tab.id });
          break;
        case "contextMenuCloseTabsBefore":
          count = this._tablist.closeTabsBeforeCount(tab.index);
          if (
            !this._tablist._warnBeforeClosing ||
            count < 4 ||
            confirm(browser.i18n.getMessage("closeTabsBeforeWarning", count))
          ) {
            this._tablist.closeTabsBefore(tab.index);
          }
          break;
        case "contextMenuCloseTabsAfter":
          count = this._tablist.closeTabsAfterCount(tab.index);
          if (
            !this._tablist._warnBeforeClosing ||
            count < 4 ||
            confirm(browser.i18n.getMessage("closeTabsAfterWarning", count))
          ) {
            this._tablist.closeTabsAfter(tab.index);
          }
          break;
        case "contextMenuCloseOtherTabs":
          count = this._tablist.closeAllTabsExceptCount(tab.id);
          if (
            !this._tablist._warnBeforeClosing ||
            count < 4 ||
            confirm(browser.i18n.getMessage("closeAllTabsExceptWarning", count))
          ) {
            this._tablist.closeAllTabsExcept(tab.id);
          }
          break;
        case "contextMenuUndoCloseTab":
          this._tablist.undoCloseTab();
          break;
        case "contextMenuCloseTab":
          browser.tabs.remove(tab.id);
          break;
      }

      if (info.menuItemId.startsWith("contextMenuOpenInContextualTab_")) {
        const newTab = {
          cookieStoreId: info.menuItemId.split("contextMenuOpenInContextualTab_")[1],
        };
        if (tab.url !== "about:newtab") {
          newTab["url"] = tab.url;
        }
        browser.tabs.create(newTab);
      }
    });
  }

  open(e) {
    if (!SideTab.isTabEvent(e, false)) {
      e.preventDefault();
      return;
    }
    browser.menus.removeAll();

    const tabId = SideTab.tabIdForEvent(e);
    const tab = this._tablist.getTabById(tabId);

    const items = [
      {
        id: "contextMenuReloadTab",
        title: browser.i18n.getMessage("contextMenuReloadTab"),
      },
      {
        id: "contextMenuMuteTab",
        title: browser.i18n.getMessage(tab.muted ? "contextMenuUnmuteTab" : "contextMenuMuteTab"),
      },
      {
        type: "separator",
      },
      {
        id: "contextMenuPinTab",
        title: browser.i18n.getMessage(tab.pinned ? "contextMenuUnpinTab" : "contextMenuPinTab"),
      },
      {
        id: "contextMenuDuplicateTab",
        title: browser.i18n.getMessage("contextMenuDuplicateTab"),
      },
      {
        id: "contextMenuUnloadTab",
        title: browser.i18n.getMessage("contextMenuUnloadTab"),
        enabled:
          !tab.active &&
          !tab.discarded &&
          !tab.url.startsWith("about:") &&
          !tab.url.startsWith("chrome:"),
      },
      {
        type: "separator",
      },
      /*
       * We don’t have “Add to bookmarks” because it requires us to code the dialog.
       * Also, it’s not very useful since you can bookmark the active tab easily anyway.
       */ {
        id: "contextMenuOpenInContextualTab",
        title: browser.i18n.getMessage("contextMenuOpenInContextualTab"),
        enabled:
          !IS_PRIVILEGED_PAGE_URL.test(tab.url) ||
          tab.url === "about:newtab" ||
          tab.url === "about:blank",
        visible:
          browser.contextualIdentities !== undefined &&
          !document.body.classList.contains("incognito"),
      },
      {
        id: "contextMenuMoveTab",
        title: browser.i18n.getMessage("contextMenuMoveTab"),
      },
      {
        parentId: "contextMenuMoveTab",
        id: "contextMenuMoveTabToStart",
        title: browser.i18n.getMessage("contextMenuMoveTabToStart"),
        enabled: this._tablist.hasTabsBefore(tab),
      },
      {
        parentId: "contextMenuMoveTab",
        id: "contextMenuMoveTabToEnd",
        title: browser.i18n.getMessage("contextMenuMoveTabToEnd"),
        enabled: this._tablist.hasTabsAfter(tab),
      },
      {
        parentId: "contextMenuMoveTab",
        id: "contextMenuMoveTabToNewWindow",
        title: browser.i18n.getMessage("contextMenuMoveTabToNewWindow"),
        enabled: this._tablist.tabCount() > 1,
      },
      {
        type: "separator",
      },
      {
        id: "contextMenuCloseTabs",
        title: browser.i18n.getMessage("contextMenuCloseTabs"),
        visible: !this._tablist.isFilterActive(),
        enabled: this._tablist.tabCount() > 1 && !tab.pinned,
      },
      {
        parentId: "contextMenuCloseTabs",
        id: "contextMenuCloseTabsBefore",
        title: browser.i18n.getMessage("contextMenuCloseTabsBefore"),
        enabled: this._tablist.hasTabsBefore(tab),
      },
      {
        parentId: "contextMenuCloseTabs",
        id: "contextMenuCloseTabsAfter",
        title: browser.i18n.getMessage("contextMenuCloseTabsAfter"),
        enabled: this._tablist.hasTabsAfter(tab),
      },
      {
        parentId: "contextMenuCloseTabs",
        id: "contextMenuCloseOtherTabs",
        title: browser.i18n.getMessage("contextMenuCloseOtherTabs"),
      },
      {
        id: "contextMenuUndoCloseTab",
        title: browser.i18n.getMessage("contextMenuUndoCloseTab"),
        enabled: this._tablist.hasRecentlyClosedTabs,
      },
      {
        id: "contextMenuCloseTab",
        title: browser.i18n.getMessage("contextMenuCloseTab"),
      },
    ];

    items.forEach(item => {
      browser.menus.create({
        ...item,
        contexts: ["tab"],
        viewTypes: ["sidebar"],
        documentUrlPatterns: [`moz-extension://${location.host}/*`],
      });
    });

    const identityItems = getContextualIdentityItems();
    if (identityItems !== null) {
      identityItems.forEach(identityItem => {
        identityItem["id"] = `contextMenuOpenInContextualTab_${identityItem["id"]}`;
        browser.menus.create({
          parentId: "contextMenuOpenInContextualTab",
          contexts: ["tab"],
          ...identityItem,
        });
      });
    }

    // overrideContext can only be called in `tab` or `bookmark` context
    // so we need to pass a tabId to open a native context menu
    browser.menus.overrideContext({
      context: "tab",
      tabId: tabId,
    });
  }
}
