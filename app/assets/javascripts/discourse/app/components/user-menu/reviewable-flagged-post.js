import UserMenuReviewableItem from "discourse/components/user-menu/reviewable-item";
import I18n from "I18n";

export default class UserMenuReviewableFlaggedPost extends UserMenuReviewableItem {
  get description() {
    const title = this.args.reviewable.topic_title;
    const postNumber = this.args.reviewable.post_number;
    if (title && postNumber) {
      return I18n.t("user_menu.reviewable.post_number_with_topic_title", {
        post_number: postNumber,
        title,
      });
    } else {
      return I18n.t("user_menu.reviewable.delete_post");
    }
  }
}
