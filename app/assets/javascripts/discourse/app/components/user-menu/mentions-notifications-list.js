import UserMenuItemsList from "discourse/components/user-menu/items-list";

export default class UserMenuMentionsNotificationsList extends UserMenuItemsList {
  get filterByType() {
    return "mentioned";
  }
}
