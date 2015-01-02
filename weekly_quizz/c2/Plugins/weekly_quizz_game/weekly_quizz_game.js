/**
 * c2-plugin-weekly-quizz-game - 
 *
 * no description
 *
 * Compiled: 2015-01-02
 *
 */
function assert(assertion, msg) {
    if (!assertion)
        throw "assertion failure: " + (msg || "");
}

function collectionObjectDelete(ix, obj) {
    obj.delete();
};

function collectionListOfObjectsDelete(ix, list) {
    jQuery.each(list, collectionObjectDelete);
};

function JSONSafeParse(data) {
    try {
        return JSON.parse(data);
    } catch(err) {
        return null;
    }   
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function SEEventHandler(thiz, callback, ev) {
    this.thiz = thiz;
    this.callback = callback;
    this.ev = ev;
}

SEEventHandler.prototype.delete = function() {
    if (!this.ev)
        return; //protect from double deletion
    this.ev.deleteEH(this);
    delete this.thiz;
    delete this.callback;
    delete this.ev;
};

function SEEvent() {
    this.subscribers = [];
}

SEEvent.prototype.delete = function() {
    for (var i = 0; i < this.subscribers.length; i++) {
        //event handler will delete itself from our subscribers list
        var evHandler = this.subscribers[i];
        evHandler.delete();
    };
    delete this.subscribers;
};

SEEvent.prototype.subscribe = function(thiz, callback) {
    var eh = new SEEventHandler(thiz, callback, this);
    this.subscribers.push(eh);
    return eh;
};

SEEvent.prototype.publish = function() {
    var args = Array.prototype.slice.call(arguments);
    for (var i = 0; i < this.subscribers.length; i++) {
        this.subscribers[i].callback.apply(this.subscribers[i].thiz, args);
    }
};

SEEvent.prototype.deleteEH = function(delEH) {
    for (var i = 0; i < this.subscribers.length; i++) {
        var eh = this.subscribers[i];
        if (eh === delEH) {
            this.subscribers.splice(i, 1);
            return;
        }
    }   
};

//Uses objects reference equality
function ObjectMap() {
    this.map = [];
};

ObjectMap.prototype.put = function(obj, value) {
    for (var i = 0; i < this.map.length; ++i) {
        var listObjEntry = this.map[i];
        if (listObjEntry.key === obj) {
            listObjEntry.value = value;
            return;
        }
    }
    this.map.push({ key : obj, value : value });
};

ObjectMap.prototype.get = function(obj) {
    for (var i = 0; i < this.map.length; ++i) {
        var listObjEntry = this.map[i];
        if (listObjEntry.key === obj)
            return listObjEntry.value;
    }
    return null;
};

ObjectMap.prototype.remove = function(obj) {
    for (var i = 0; i < this.map.length; ++i) {
        var listObjEntry = this.map[i];
        if (listObjEntry.key === obj) {
            this.map.splice(i, 1);
            return listObjEntry.value;
        }
    }
    return null;
};

ObjectMap.prototype.contains = function(obj) {
    for (var i = 0; i < this.map.length; ++i) {
        var listObjEntry = this.map[i];
        if (listObjEntry.key === obj) {
            return true;
        }
    }
    return false;
};

/* callback: function(obj, value) */
ObjectMap.prototype.each = function(callback, thiz) {
    for (var i = 0; i < this.map.length; ++i) {
        var listObjEntry = this.map[i];
        if (thiz)
            obj.call(thiz, listObjEntry.key, listObjEntry.value);
        else
            callback(listObjEntry.key, listObjEntry.value);
    }
};

function CommandQueue() {
    this._pendingCommands = [];
    this._commandPendingEvent = new SEEvent(/* Command object */);
}

CommandQueue.prototype.delete = function() {
    delete this._pendingCommands;
    this._commandPendingEvent.delete();
    delete this._commandPendingEvent;
};

//returns event handler object with delete method
CommandQueue.prototype.onCommandPending = function(thiz, callback) {
    return this._commandPendingEvent.subscribe(thiz, callback);
};

CommandQueue.prototype.getPendingCommand = function() {
    assert(this._pendingCommands.length > 0, "CommandQueue: command is pending");
    return this._pendingCommands[0];
};

CommandQueue.prototype.enqueueCommand = function(command) {
    this._pendingCommands.push(command);
    if (this._pendingCommands.length === 1) {
        this._commandPendingEvent.publish(this.getPendingCommand());
    }
};

CommandQueue.prototype.completePendingCommand = function() {
    this._pendingCommands.shift();
    if (this._pendingCommands.length > 0) {
        this._commandPendingEvent.publish(this.getPendingCommand());
    }
};

function ITextFileLoader() {

}

/*
 * Loads text file from platform specific storage.
 * @filePath: text file path
 * @callback: function(string) to call on finish
 * returns: nothing
 */
ITextFileLoader.prototype.load = function(filePath, callback) {
    throw "Interface method not implemented";
};

function AjaxTextFileLoader(baseUrl) {
    this.baseUrl = baseUrl ? baseUrl + '/' : '';
}

AjaxTextFileLoader.prototype = new ITextFileLoader();
AjaxTextFileLoader.prototype.constructor = AjaxTextFileLoader;

AjaxTextFileLoader.prototype.load = function(filePath, callback) {
    var fileUrl = this.baseUrl + filePath;
    console.log("Loading text file by URL: " + fileUrl);

    jQuery.get(fileUrl, function(data) {
        console.log("Text file " + filePath + " load was performed");
        if (callback)
            callback(data);
    }, "text");
};

function TestDialogScript(name, sections, polyProps) {
    this._name = name;
    this._sections = sections;
    this._polyProps = polyProps;
}

TestDialogScript.prototype.getName = function() {
    return this._name;
};

TestDialogScript.prototype.getSections = function() {
    return this._sections;
};

TestDialogScript.prototype.getPolyProp = function(propName) {
    var value = this._polyProps && this._polyProps[propName];
    return value ? value : "";
};

TestDialogScript.prototype.save = function() {
    var sections = jQuery.map(this._sections,
        function(section) {
            return section.save();
        }
    );
    var savedData = {
        "name" : this._name,
        "sections" : sections,
        "polyProps" : this._polyProps
    };
    return savedData;
};

TestDialogScript.load = function(savedData) {
    var name = savedData["name"];
    var sections = jQuery.map(savedData["sections"],
        function(sectionSaved) {
            return TestDialogSection.load(sectionSaved);
        }
    );
    var polyProps = savedData["polyProps"];
    return new TestDialogScript(name, sections, polyProps);
};

function TestDialogScriptLoader(textFileLoader) {
    this.textFileLoader = textFileLoader;
}

TestDialogScriptLoader.prototype.load = function(scriptName, callback) {
    var scriptFileName = scriptName + "_test_dialog.json";
    this.textFileLoader.load(scriptFileName, function(testDialogScriptText) {
        var testDialogScriptSaved = JSON.parse(testDialogScriptText);
        var testDialogScript = TestDialogScript.load(testDialogScriptSaved);

        callback(testDialogScript);
    });
};

function TestDialogQuestion(text, rightAnswer, polyProps) {
    this._text = text;
    this._rightAnswer = rightAnswer;
    this._polyProps = polyProps;
}

TestDialogQuestion.prototype.getText = function() {
    return this._text;
};

TestDialogQuestion.prototype.getRightAnswer = function() {
    return this._rightAnswer;
};

TestDialogQuestion.prototype.getPolyProp = function(propName) {
    var value = this._polyProps && this._polyProps[propName];
    return value ? value : "";
};

TestDialogQuestion.prototype.save = function() {
    /*
     * Human written files contain list of strings as text.
     * Lists allow to make good human readable formating in json files.
     */
    var savedData = {
        "text" : [this._text],
        "rightAnswer" : this._rightAnswer,
        "polyProps" : this._polyProps
    };
    return savedData;
};

TestDialogQuestion.load = function(savedData) {
    var text = savedData["text"].join("");
    var rightAnswer = savedData["rightAnswer"];
    var polyProps = savedData["polyProps"];
    return new TestDialogQuestion(text, rightAnswer, polyProps);
};

function TestDialogSection(questions, polyProps) {
    this._questions = questions;
    this._polyProps = polyProps;
}

TestDialogSection.prototype.getQuestions = function() {
    return this._questions;
};

TestDialogSection.prototype.getPolyProp = function(propName) {
    var value = this._polyProps && this._polyProps[propName];
    return value ? value : "";
};

TestDialogSection.prototype.save = function() {
    var questionsSaved = jQuery.map(this.questions,
        function(question) {
            return question.save();
         }
    );

    var savedData = {
        "questions" : questionsSaved,
        "polyProps" : this._polyProps
    };
    return savedData;
};

TestDialogSection.load = function(savedData) {
    var polyProps = savedData["polyProps"];
    var questions = jQuery.map(savedData["questions"],
        function(questionSaved) {
            return TestDialogQuestion.load(questionSaved);    
        }
    );
    return new TestDialogSection(questions, polyProps);
};

function TestDialogRuntime(script, isDebugMode) {
    if (!script)
        return; //inherit
    this._script = script;
    this._questions = [];
    this._currentQuestionToAskIx = -1;
    this._stats = {
        answersCount : 0,
        rightAnswersCount : 0
    };
    isDebugMode = isDebugMode ||
        this._script.getPolyProp("debugMode");
    this._computeDialog(isDebugMode);
}

TestDialogRuntime.Question = function(question, section) {
    this._question = question;
    this._section = section;
};

TestDialogRuntime.Question.prototype.getTDQuestion = function() {
    return this._question;
};

TestDialogRuntime.Question.prototype.getTDSection = function() {
    return this._section;
};

/*
 * returns current question or null.
 * if null - dialog is finished.
 */
TestDialogRuntime.prototype.getCurrentQuestion = function() {
    return this._isCurrenQuestionAvaliable() ?
        this._questions[this._currentQuestionToAskIx].getTDQuestion() :
        null;
};

TestDialogRuntime.prototype.getCurrentQuestionSection = function() {
    return this._isCurrenQuestionAvaliable() ?
        this._questions[this._currentQuestionToAskIx].getTDSection() :
        null;
};

TestDialogRuntime.prototype.getAnswersCount = function() {
    return this._stats.answersCount;
};

TestDialogRuntime.prototype.getRightAnswersCount = function() {
    return this._stats.rightAnswersCount;
};

TestDialogRuntime.prototype.getQuestionsCount = function() {
    return this._questions.length;
};

/*
 * Returns true if the answers is right,
 * false otherwise.
 */
TestDialogRuntime.prototype.answerCurrentQuestion = function(answer) {
    if (!this._isCurrenQuestionAvaliable())
        return false;

    //Update idiom status of current level
    var rightAnswer = this.getCurrentQuestion().getRightAnswer();
    var isAnswerRight = rightAnswer === answer;
    //stats
    this._stats.rightAnswersCount = isAnswerRight ?
        this._stats.rightAnswersCount + 1 :
        this._stats.rightAnswersCount;
    this._stats.answersCount++;
    return isAnswerRight;
};

TestDialogRuntime.prototype.nextQuestion = function() {
    this._currentQuestionToAskIx++;
};

TestDialogRuntime.prototype._computeDialog = function(isDebugMode) {
    var sections = this._script.getSections();
    for (var sectIx = 0; sectIx < sections.length; ++ sectIx) {
        var section = sections[sectIx];
        var sectQuestions  = section.getQuestions();
        if (isDebugMode) {
            var sectQuestionIx = 0;
            for (;sectQuestionIx < sectQuestions.length; ++sectQuestionIx) {
                var sectQuestion = sectQuestions[sectQuestionIx];
                this._questions.push(
                    new TestDialogRuntime.Question(sectQuestion, section)
                );
            }
        } else {
            var randSectQuestionIx = getRandomInt(0, sectQuestions.length - 1);
            var randSectQuestion = sectQuestions[randSectQuestionIx];
            this._questions.push(
                new TestDialogRuntime.Question(randSectQuestion, section)
            );
        }
    }
};

TestDialogRuntime.prototype._isCurrenQuestionAvaliable = function() {
    return (this._currentQuestionToAskIx >= 0) &&
        (this._currentQuestionToAskIx < this._questions.length);
};

function TestDialogScriptRepository(textFileLoader) {
    this._loader = new TestDialogScriptLoader(textFileLoader);
    this._scripts = {};
    this._pendingRequestCount = 0;
    this._allPendingRequestsCompletionWaiters = [];
}

TestDialogScriptRepository.prototype.addDialogScript = function(dialogName) {
    this._pendingRequestCount++;
    this._loader.load(dialogName, this._onScriptLoaded.bind(this));
};

TestDialogScriptRepository.prototype.getDialogScript = function(scriptName) {
    return this._scripts[scriptName];
};

TestDialogScriptRepository.prototype.waitAllPendingRequests = function(callback) {
    this._allPendingRequestsCompletionWaiters.push(callback);
    this._wakeWaiters();
};

TestDialogScriptRepository.prototype._onScriptLoaded = function(script) {
    this._scripts[script.getName()] = script;
    this._pendingRequestCount--;
    this._wakeWaiters();
};

TestDialogScriptRepository.prototype._wakeWaiters = function() {
    if (this._pendingRequestCount > 0)
        return;
    for (var i = 0; i < this._allPendingRequestsCompletionWaiters.length; ++i) {
        var waitHandler = this._allPendingRequestsCompletionWaiters[i];
        waitHandler();
    }
    this._allPendingRequestsCompletionWaiters = [];
}

function TestDialogRuntimeController(testDialogRuntime) {
    this._runtime = testDialogRuntime;
    this.events = {
        onQuestionAnswered : new SEEvent(/*bool isAnswered right */),
        onQuestionIsAvaliable : new SEEvent(),
        onTestCompleted : new SEEvent()
    };
}

TestDialogRuntimeController.prototype.getCurrentQuestionText = function() {
    return this._runtime.getCurrentQuestion().getText();
};

TestDialogRuntimeController.prototype
    .getCurrentQuestionPolyProp = function(propName) {
    return this._runtime.getCurrentQuestionSituation().getPolyProp(propName);
};

TestDialogRuntimeController.prototype
    .getCurrentQuestionSectionPolyProp = function(propName) {
    return this._runtime.getCurrentQuestionSection().getPolyProp(propName)
};

TestDialogRuntimeController.prototype.getQuestionsCount = function() {
    return this._runtime.getQuestionsCount();
};

TestDialogRuntimeController.prototype.getRightAnswersCount = function() {
    return this._runtime.getRightAnswersCount();
};

TestDialogRuntimeController.prototype.getAnswersCount = function() {
    return this._runtime.getAnswersCount();
};

TestDialogRuntimeController.prototype.answerCurrentQuestion = function(answer) {
    var boolAnswer = false;
    switch (answer) {
        case "TRUE":
            boolAnswer = true;
        break;
        case "FALSE":
            boolAnswer = false;
        break;
        default:
            throw new Error("Invalid answer value: " + answer);
    };
    this.events.onQuestionAnswered.publish(
        this._runtime.answerCurrentQuestion(boolAnswer)
    );
};

TestDialogRuntimeController.prototype.waitNextQuestion = function() {
    this._runtime.nextQuestion();
    if (this._runtime.getCurrentQuestion() === null) {
        this.events.onTestCompleted.publish();
    } else {
        this.events.onQuestionIsAvaliable.publish();
    }
};

function IPersistentStorage() {

}

/*
 * returns string from persistent storage by key
 * returns "" if key doesn't exist
 */
IPersistentStorage.prototype.get = function(key) {
    throw "Interface method not implemented";
};

/*
 * puts string to persistent storage
 * returns true on success
 * returns false on fail
 */
IPersistentStorage.prototype.put = function(key, value) {
    throw "Interface method not implemented";
};

function HTML5PersistentStorage(storageId) {
    this._storageId = storageId;
}

HTML5PersistentStorage.prototype = new IPersistentStorage();
HTML5PersistentStorage.prototype.constructor = HTML5PersistentStorage;

HTML5PersistentStorage.prototype.get = function(key) {
    assert(typeof key === "string");

    try {
        var storage = this._getStorage();
        if (storage[key] === undefined)
           throw Error("No such key");
        return storage[key];
    } catch(e) {
        /* see put() comments */
        return "";
    }
};

HTML5PersistentStorage.prototype.put = function(key, value) {
    assert(typeof key === "string");
    assert(typeof value === "string");
    try {
        var storage = this._getStorage();
        storage[key] = value;
        this._updateStorage(storage);
        return true;
    } catch(e) {
        //Workaround iOS bug while browsing in "private" mode
        //http://stackoverflow.com/questions/21159301/quotaexceedederror-dom-exception-22-an-attempt-was-made-to-add-something-to-st
        //https://github.com/Modernizr/Modernizr/blob/master/feature-detects/storage/localstorage.js
        console.error("Write of key ", key, " with value ", e, " has failed");
        return false;
    }
};

//throws
HTML5PersistentStorage.prototype._getStorage = function() {
    var storage = window.localStorage.getItem(this._storageId);
    return storage == null ? {} : JSON.parse(storage);
};

//throws
HTML5PersistentStorage.prototype._updateStorage = function(storage) {
    window.localStorage.setItem(this._storageId, JSON.stringify(storage));
};

function WeeklyQuizzRuntime(script, isDebugMode) {
    TestDialogRuntime.call(this, script, isDebugMode);
}

WeeklyQuizzRuntime.prototype = new TestDialogRuntime(null);

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
