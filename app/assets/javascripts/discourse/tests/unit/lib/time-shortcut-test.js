import { module, test } from "qunit";
import { fakeTime } from "discourse/tests/helpers/qunit-helpers";
import buildTimeframes from "discourse/lib/timeframes-builder";

module(
  "Unit | Lib | time-shortcut | hideDynamicTimeShortcuts",
  function (hooks) {
    hooks.afterEach(function () {
      if (this.clock) {
        this.clock.restore();
      }
    });

    test("hides 'Later Today' at the end of the day", function (assert) {
      const timezone = moment.tz.guess();
      this.clock = fakeTime("2100-04-19 18:00:00", timezone, true); // Monday evening
      const timeframes = buildTimeframes(timezone).mapBy("id");

      assert.notOk(timeframes.includes("later_today"));
      assert.ok(timeframes.includes("later_this_week"));
    });

    test("hides 'Later This Week' starting from Thursday", function (assert) {
      const timezone = moment.tz.guess();
      this.clock = fakeTime("2100-04-22 18:00:00", timezone, true); // Thursday evening
      const timeframes = buildTimeframes(timezone).mapBy("id");

      assert.notOk(timeframes.includes("later_this_week"));
    });

    test("hides 'This Weekend' on Fridays, Saturdays and Sundays", function (assert) {
      const timezone = moment.tz.guess();
      this.clock = fakeTime("2100-04-23 18:00:00", timezone, true); // Friday

      assert.ok(
        !buildTimeframes(timezone, { includeWeekend: true })
          .mapBy("id")
          .includes("this_weekend")
      );
    });
  }
);
