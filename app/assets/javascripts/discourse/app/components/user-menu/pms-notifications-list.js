import UserMenuItemsList from "discourse/components/user-menu/items-list";

export default class UserMenuPmsNotificationsList extends UserMenuItemsList {
  get filterByType() {
    return "private_message";
  }
}
