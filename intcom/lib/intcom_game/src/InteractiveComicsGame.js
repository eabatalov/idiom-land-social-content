function InteractiveComicsGame(name, gameInitDict) {
    QuestGame.call(this, name, gameInitDict);
};

InteractiveComicsGame.prototype = new QuestGame();
InteractiveComicsGame.prototype.constructor = InteractiveComicsGame;

/*
 * Create totally new game (first game run)
 */
InteractiveComicsGame.newGame = function(name, gameInitDict) {
    gameInitDict["levelRepo"] =
        new LevelRepository(gameInitDict["levelLoader"]);
    return new InteractiveComicsGame(name, gameInitDict);
};

// ==================================================
// Save/Load
InteractiveComicsGame.magic = "1r4u0Di";

InteractiveComicsGame.prototype._save = function() {
    var savedData = {
        ver : 1,
        magic : InteractiveComicsGame.magic,
        name : this.getName()
    };
    return savedData;
};

InteractiveComicsGame.load = function(savedData, gameInitDict) {
    assert(savedData.ver === 1);
    assert(savedData.magic === InteractiveComicsGame.magic);

    gameInitDict["levelRepo"] =
        new LevelRepository(gameInitDict["levelLoader"]);
    var game = new InteractiveComicsGame(savedData.name, gameInitDict);
    return game;
};
