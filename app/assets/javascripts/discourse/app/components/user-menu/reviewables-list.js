import UserMenuItemsList from "discourse/components/user-menu/items-list";
import I18n from "I18n";
import { ajax } from "discourse/lib/ajax";

const DefaultComponent = "user-menu/reviewable-item";
function defaultItemComponents() {
  return {
    ReviewableFlaggedPost: "user-menu/reviewable-flagged-post",
    ReviewableQueuedPost: "user-menu/reviewable-queued-post",
    ReviewableUser: "user-menu/reviewable-user",
  };
}

let _itemComponents = defaultItemComponents();

export default class UserMenuReviewablesList extends UserMenuItemsList {
  fetchItems() {
    return ajax("/review/lightweight-list").then((data) => {
      return data.reviewables.map((item) => {
        const type = item.type;
        delete item.type;
        item.component = _itemComponents[type] || DefaultComponent;
        return item;
      });
    });
  }
}
