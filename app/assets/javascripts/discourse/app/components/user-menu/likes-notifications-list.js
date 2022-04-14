import UserMenuItemsList from "discourse/components/user-menu/items-list";

export default class UserMenuLikesNotificationsList extends UserMenuItemsList {
  get filterByType() {
    return "liked";
  }
}
