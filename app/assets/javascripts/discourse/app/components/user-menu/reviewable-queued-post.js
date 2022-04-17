import UserMenuReviewableItem from "discourse/components/user-menu/reviewable-item";
import I18n from "I18n";

export default class UserMenuReviewableQueuedPost extends UserMenuReviewableItem {
  get actor() {
    return I18n.t("user_menu.reviewable.queue");
  }

  get description() {
    const title = this.args.reviewable.topic_title;
    if (this.args.reviewable.is_new_topic) {
      return title;
    } else {
      return I18n.t("user_menu.reviewable.new_post_in_topic", { title });
    }
  }

  get icon() {
    return "layer-group";
  }
}
