import GlimmerComponent from "discourse/components/glimmer";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { formatUsername } from "discourse/lib/utilities";

export default class UserMenuDefaultNotificationItemContent extends GlimmerComponent {
  get username() {
    return formatUsername(this.args.notification.data.display_username);
  }

  get description() {}

  get fancyTitle() {
    return this.args.notification.fancy_title;
  }

  get topicId() {
    return this.args.notification.topic_id;
  }

  get groupName() {
    return this.args.notification.data.group_name;
  }
}
