function WeeklyQuizzRuntime(script, isDebugMode) {
    TestDialogRuntime.call(this, script, isDebugMode);
}

WeeklyQuizzRuntime.prototype = new TestDialogRuntime(null);
