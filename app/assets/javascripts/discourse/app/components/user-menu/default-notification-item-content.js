import GlimmerComponent from "discourse/components/glimmer";
import { formatUsername } from "discourse/lib/utilities";

export default class UserMenuDefaultNotificationItemContent extends GlimmerComponent {
  get data() {
    return this.args.notification.data;
  }

  get username() {
    return formatUsername(this.data.display_username);
  }

  get fancyTitle() {
    return this.args.notification.fancy_title;
  }

  get topicTitle() {
    return this.data.topic_title;
  }

  get topicId() {
    return this.args.notification.topic_id;
  }

  get groupName() {
    return this.data.group_name;
  }
}
