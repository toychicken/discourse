import I18n from "I18n";
import UserMenuItemsList from "discourse/components/user-menu/items-list";
import { Promise } from "rsvp";

export default class UserMenuReviewablesList extends UserMenuItemsList {
  get showAllHref() {
    return false; // TODO we need a show all button
  }

  get showAllTitle() {
    // TODO add title
    // return I18n.t("user_menu.view_all_notifications");
  }

  get showDismiss() {
    return false;
  }

  fetchItems() {
    return Promise.resolve([]);
  }
}
