import GlimmerComponent from "discourse/components/glimmer";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { postUrl } from "discourse/lib/utilities";
import DiscourseURL, { userPath } from "discourse/lib/url";

// TODO handle notification icon aria stuff
export default class UserMenuDefaultNotificationItem extends GlimmerComponent {
  contentComponent = "user-menu/default-notification-item-content";
  get data() {
    return this.args.notification.data;
  }

  get notificationName() {
    const notification = this.args.notification;
    return this.site.notificationLookup[notification.notification_type];
  }

  get className() {
    // TODO handle mod warning message in pm notification item
    const classes = [];
    const notification = this.args.notification;
    if (notification.read) {
      classes.push("read");
    }
    if (this.notificationName) {
      classes.push(this.notificationName.replace(/_/g, "-"));
    }
    return classes.join(" ");
  }

  get url() {
    const notification = this.args.notification;
    const data = this.data;
    const topicId = notification.topic_id;
    if (topicId) {
      return postUrl(notification.slug, topicId, notification.post_number);
    }

    if (data.group_id) {
      return userPath(`${data.username}/messages/group/${data.group_name}`);
    }
  }

  get icon() {
    return `notification.${this.notificationName}`;
  }
}
