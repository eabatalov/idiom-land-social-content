// === START THE GAME ===
QuestGame.bootstrap({
    game : { 
        className : 'InteractiveComicsGame',
        name : 'Interactive Comics game',
        params : []
    },

    persistentStorage : {
        className : 'HTML5PersistentStorage',
        params : ['"IntCom"']
    },

    levelLoader : { 
        className : 'QuestLevelLoader',
        params : ["new QuestScriptLoader(new AjaxTextFileLoader(''))"]
    },

    textFileLoader : {
        className : 'AjaxTextFileLoader',
        params : ['']
    }
});
