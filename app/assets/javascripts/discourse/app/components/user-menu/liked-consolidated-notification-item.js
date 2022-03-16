import UserMenuDefaultNotificationItem from "discourse/components/user-menu/default-notification-item";
import { userPath } from "discourse/lib/url";

export default class UserMenuLikedConsolidatedNotificationItem extends UserMenuDefaultNotificationItem {
  contentComponent = "user-menu/liked-consolidated-notification-item-content";

  get url() {
    return userPath(
      `${
        this.args.notification.username || this.currentUser.username
      }/notifications/likes-received?acting_username=${this.data.username}`
    );
  }
}
