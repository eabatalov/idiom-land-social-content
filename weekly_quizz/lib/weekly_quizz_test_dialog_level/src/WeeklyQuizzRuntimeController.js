function WeeklyQuizzRuntimeController(quizzName,
    isDebugMode, onReadyCB) {
    this._isDebugMode = isDebugMode;
    this._onReadyCB = onReadyCB;
    var textFileLoader = new AjaxTextFileLoader();
    var scriptLoader = new TestDialogScriptLoader(textFileLoader);
    scriptLoader.load(quizzName, this.onQuizzScriptLoaded.bind(this));
}

WeeklyQuizzRuntimeController.prototype =
    new TestDialogRuntimeController(null);

WeeklyQuizzRuntimeController.prototype.
    onQuizzScriptLoaded = function(script) {
    var runtime = new WeeklyQuizzRuntime(
        script, this._isDebugMode
    );

    TestDialogRuntimeController.call(this, runtime);
    if (this._onReadyCB) {
        this._onReadyCB(this);
    }
};
