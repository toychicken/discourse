import GlimmerComponent from "discourse/components/glimmer";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";

const DefaultTabId = "all-notifications";
const DefaultPanelComponent = "user-menu/notifications-list";

export default class UserMenu extends GlimmerComponent {
  @tracked currentTabId = DefaultTabId;
  @tracked currentPanelComponent = DefaultPanelComponent;

  get topTabs() {
    return this._coreTopTabs;
  }

  get _coreTopTabs() {
    return [
      {
        id: DefaultTabId,
        icon: "bell",
        panelComponent: DefaultPanelComponent,
      },
      {
        id: "replies",
        icon: "reply",
        panelComponent: ""
      },
      {
        id: "mentions",
        icon: "at",
        panelComponent: ""
      },
      {
        id: "likes",
        icon: "heart",
        panelComponent: ""
      },
    ];
  }

  @action
  changeTab(tab) {
    if (this.currentTabId !== tab.id) {
      this.currentTabId = tab.id;
    }
  }
}
