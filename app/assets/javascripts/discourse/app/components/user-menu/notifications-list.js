import GlimmerComponent from "discourse/components/glimmer";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";

const _baseComponentForType = {
  granted_badge: "user-menu/granted-badge-notification-item",
  liked: "user-menu/liked-notification-item",
  liked_consolidated: "user-menu/liked-consolidated-notification-item",
};

let _customComponentForType = {};
let ComponentForType = _baseComponentForType;

export function registerCustomComponentForType(notificationType, component) {
  _customComponentForType[notificationType] = component;
  ComponentForType = Object.extend(
    {},
    _baseComponentForType,
    _customComponentForType
  );
}

export function resetComponentForType() {
  _customComponentForType = {};
  ComponentForType = _baseComponentForType;
}

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
      .then((data) => {
        this.items = data.content.map((notification) => {
          const name = this.site.notificationLookup[
            notification.notification_type
          ];
          if (ComponentForType[name]) {
            return {
              ...notification,
              component: ComponentForType[name],
            };
          } else {
            return notification;
          }
        });
        return this.items;
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
