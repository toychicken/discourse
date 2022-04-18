import selectKit from "discourse/tests/helpers/select-kit-helper";
import componentTest, {
  setupRenderingTest,
} from "discourse/tests/helpers/component-test";
import {
  discourseModule,
  exists,
  queryAll,
} from "discourse/tests/helpers/qunit-helpers";
import hbs from "htmlbars-inline-precompile";
import I18n from "I18n";

discourseModule("Unit | Lib | select-kit/future-date-input", function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set("subject", selectKit());
  });

  hooks.afterEach(function () {
    if (this.clock) {
      this.clock.restore();
    }
  });

  componentTest("rendering and expanding", {
    template: hbs`
        {{future-date-input
          options=(hash
            none="time_shortcut.select_timeframe"
          )
        }}
      `,

    async test(assert) {
      assert.ok(exists(".future-date-input-selector"), "Selector is rendered");

      assert.ok(
        this.subject.header().label() ===
          I18n.t("time_shortcut.select_timeframe"),
        "Default text is rendered"
      );

      await this.subject.expand();

      assert.ok(
        exists(".select-kit-collection"),
        "List of options is rendered"
      );
    },
  });

  componentTest("shows 'Custom date and time' by default", {
    template: hbs`{{future-date-input}}`,

    async test(assert) {
      await this.subject.expand();
      const options = getOptions();
      const customDateAndTime = I18n.t("time_shortcut.custom");

      assert.ok(options.includes(customDateAndTime));
    },
  });

  componentTest("doesn't show 'Custom date and time' if disabled", {
    template: hbs`
        {{future-date-input
          includeDateTime=false
        }}
      `,

    async test(assert) {
      await this.subject.expand();
      const options = getOptions();
      const customDateAndTime = I18n.t("time_shortcut.custom");

      assert.notOk(options.includes(customDateAndTime));
    },
  });

  function getOptions() {
    return Array.from(
      queryAll(`.select-kit-collection .select-kit-row`).map(
        (_, span) => span.dataset.name
      )
    );
  }
});
