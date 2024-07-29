var FakePlayerList = [];

mc.listen("onServerStarted", () => {                              //插件启动时事件
    /*
     *  初始化区域
     */

    logger.setFile("./logs/EPFakePlayer.log", 4);                        //设置输出日志到文件

    //删除原先的假人
    var allPlayer = mc.getOnlinePlayers()
    for(var i = 0; i < allPlayer.length; i++) {
        if ( allPlayer[i].isSimulatedPlayer() == true ) {
            logger.info(`[onPluginStart] Found Fake Player ${allPlayer[i].name}`)
            allPlayer[i].simulateRespawn();
            if ( allPlayer[i].simulateDisconnect() == true ) {
                logger.info(`[onPluginStart] Successfully remove Fake Player ${allPlayer[i].name}`);
            } else {
                logger.warn(`[onPluginStart] Remove Fake Player ${player.name} occured an error.`);
            }
        }
    }

    /*
    *  命令注册区域
    */

    //注册顶层命令
    const fakePlayerCommand = mc.newCommand("player", "An simple command that allow you create a fake player. Made by AptS:1547, https://esaps.net/", PermType.Any);
    //一级命令允许的内容，枚举类
    fakePlayerCommand.setEnum("createFakePlayer", ["create"]);
    fakePlayerCommand.setEnum("deleteFakePlayer", ["delete"]);
    fakePlayerCommand.setEnum("tpFakePlayer", ["tphere"]);
    //绑定一级命令为必须参数，玩家需要执行的动作
    fakePlayerCommand.mandatory("action", ParamType.Enum, "createFakePlayer", 1);
    fakePlayerCommand.mandatory("action", ParamType.Enum, "deleteFakePlayer", 1);
    fakePlayerCommand.mandatory("action", ParamType.Enum, "tpFakePlayer", 1);
    //设置二级命令为必须函数，假人名字
    fakePlayerCommand.mandatory("fakePlayerName", ParamType.String);
    fakePlayerCommand.mandatory("fakePlayer", ParamType.Player);
    //设置命令的语法
    fakePlayerCommand.overload(["createFakePlayer", "fakePlayerName"]);
    fakePlayerCommand.overload(["deleteFakePlayer", "fakePlayer"]);
    fakePlayerCommand.overload(["tpFakePlayer", "fakePlayer"]);

    fakePlayerCommand.setCallback((_cmd, _ori, out, res) => {     //回调函数
        if ( _ori.player == null ) return out.error("This command can only be executed by player.");                  //判断是否为玩家执行
        switch (res.action) {                                     //不同命令判断
            case "create":                                        //假人添加任务
                if ( mc.getPlayer( "FP_" + res.fakePlayerName) != null ) return out.error("Player already exist.");            //判断玩家是否存在
                if ( mc.spawnSimulatedPlayer("FP_" + res.fakePlayerName, _ori.blockPos) == null ) {                           //创建假人
                    return out.error("Failed to create fake player!");
                }
                FakePlayerList["FP_" + res.fakePlayerName] = _ori.player.name;
                logger.info(`${_ori.player.name} create Fake Player FP_${res.fakePlayerName}`);
                return out.success(`Successfully create Fake Player FP_${res.fakePlayerName}`);                         //返回成功消息

            case "delete":                                        //假人删除任务
                if ( res.fakePlayer.length > 1 ) return out.error("Illegal player selection. You chose multiple players.");    //判断是否选择了多个玩家
                if ( res.fakePlayer[0] == null ) return out.error("Player not exist.")
                if ( res.fakePlayer[0].isSimulatedPlayer() == false ) return out.error("Are you sure you want to delete a REAL Player?");

                var playerName = res.fakePlayer[0].name;
                if ( FakePlayerList[playerName] != _ori.player.name) return out.error("You don't have the permission to delete this Fake Player.");

                if ( res.fakePlayer[0].simulateDisconnect() == false && delete FakePlayerList[playerName] ) return logger.warn(`[fakePlayerDelete] Delete Fake Player ${playerName} occured an error.`);
                logger.info(`[fakePlayerDelete] Successfully delete Fake Player ${playerName}.`);
                return out.success(`Successfully delete Fake Player ${playerName}.`);

            case "tphere":                                        //假人传送任务
                if ( res.fakePlayer.length > 1 ) return out.error("Illegal player selection. You chose multiple players.");    //判断是否选择了多个玩家
                if ( res.fakePlayer[0] == null ) return out.error("Player not exist.")
                if ( res.fakePlayer[0].isSimulatedPlayer() == false ) return out.error("Are you sure you want to teleport a REAL Player?");
                if ( FakePlayerList[res.fakePlayer[0].name] != _ori.player.name) return out.error("You don't have the permission to teleport this Fake Player.");
                res.fakePlayer[0].teleport(_ori.player.blockPos);
                return out.success(`Teleporting...`)
        }
    }); 
    fakePlayerCommand.setup();
    logger.info("Plugin Successfully Loaded");                    //宣布插件启动完成
});

mc.listen("onPlayerDie", (player,source) => {                     //模拟玩家死亡时重生并断开连接
    if ( player.isSimulatedPlayer() == true ) {

        player.simulateRespawn();
        var playerName = player.name;
        var realOwnerName = FakePlayerList[playerName];
        if ( player.simulateDisconnect() == false && delete FakePlayerList[playerName] ) return logger.warn(`[fakePlayerDie] Remove Fake Player ${playerName} occured an error.`);

        var realOwner = mc.getPlayer(realOwnerName);
        if ( source == null ) {
            logger.info(`[fakePlayerDie] Successfully remove Fake Player ${playerName} by the World`);
            return realOwner.tell(`Your Fake Player ${playerName} was killed by the World`, 5);
        }
        logger.info(`[fakePlayerDie] Successfully remove Fake Player ${playerName} by ${source.name}`);
        return realOwner.tell(`Your Fake Player ${playerName} was killed by ${source.name}`, 5);
    } 
});
