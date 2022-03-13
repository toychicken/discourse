import GlimmerComponent from "discourse/components/glimmer";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";

export default class UserMenuNotificationsList extends GlimmerComponent {
  @tracked loading = false;
  @tracked items = [];

  constructor() {
    super(...arguments);
    this.fetchNotifications();
  }

  fetchNotifications() {
    this.loading = true;
    this.store
      .findStale(
        "notification",
        {
          recent: true,
          silent: this.currentUser.enforcedSecondFactor,
          limit: 30,
        },
        { cacheKey: "recent-notifications" }
      )
      .refresh()
      .then((c) => {
        this.items = c.content;
        return c;
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
