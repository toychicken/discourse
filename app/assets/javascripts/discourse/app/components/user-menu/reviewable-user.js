import UserMenuReviewableItem from "discourse/components/user-menu/reviewable-item";
import I18n from "I18n";

export default class UserMenuReviewableUser extends UserMenuReviewableItem {
  get description() {
    const username = this.args.reviewable.username;
    console.log(this.args.reviewable);
    return I18n.t("user_menu.reviewable.suspicious_user", { username });
  }

  get icon() {
    return "user";
  }
}
