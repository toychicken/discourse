import UserMenuItemsList from "discourse/components/user-menu/items-list";

export default class UserMenuRepliesNotificationsList extends UserMenuItemsList {
  get filterByType() {
    return "replied";
  }
}
