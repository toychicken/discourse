import UserMenuItemsList from "discourse/components/user-menu/items-list";

export default class UserMenuBadgesNotificationsList extends UserMenuItemsList {
  get filterByType() {
    return "granted_badge";
  }
}
