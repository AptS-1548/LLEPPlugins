function writeLog(text) {
    File.writeLine("./logs/EPLog.log", text);
}

mc.listen("onServerStarted", () => {                                                                 //服务器启动
    /*
     *  初始化区域
     */
    logger.info("Logger Started.");
    writeLog(JSON.stringify({
        event: "SESAction",
        timestamp: new Date().getTime()
    }));              //宣布插件启动完成
});

/*
 *  监听区域
 */
mc.listen("onJoin", (player) => {                                                                    //玩家加入游戏
    writeLog(JSON.stringify({
        event: "playerJoin",
        player: player.name,
        position: {
            dim: player.pos.dimid,
            x: parseInt(player.pos.x),
            y: parseInt(player.pos.y),
            z: parseInt(player.pos.z)
        },
        timestamp: new Date().getTime()
    }));
    player.sendToast("欢迎！", `欢迎回家，${player.name}！`);
});

mc.listen("onLeft", (player) => {                                                                    //玩家离开游戏
    writeLog(JSON.stringify({
        event: "playerDisconnect",
        player: player.name,
        position: {
            dim: player.pos.dimid,
            x: parseInt(player.pos.x),
            y: parseInt(player.pos.y),
            z: parseInt(player.pos.z)
        },
        timestamp: new Date().getTime()
    }));
});

mc.listen("onChat", (player, msg) => {                                                               //玩家发送消息
    writeLog(JSON.stringify({
        event: "playerChat",
        player: player.name,
        message: msg,
        timestamp: new Date().getTime()
    }));
});

mc.listen("onUseItemOn", (player, item, block, side, pos) => {                                           //玩家使用打火石拦截
    if (item.type == "minecraft:flint_and_steel") {
        writeLog(JSON.stringify({
            event: "FASAction",
            player: player.name,
            block: block.name,
            position: {
                dim: player.pos.dimid,
                x: parseInt(player.pos.x),
                y: parseInt(player.pos.y),
                z: parseInt(player.pos.z)
            },
            timestamp: new Date().getTime()
        }));
    }
});

mc.listen("onEntityExplode", (source, pos, radius, maxResistance, isDestroy, isFire) => {                 //TNT爆炸拦截
    var allPlayer = mc.getOnlinePlayers();
    var minLength = 0;
    var searchPlayer;
    if (source.type != "minecraft:wither_skull" && source.type != "minecraft:wither_skull_dangerous" && source.type != "minecraft:fireball") {
        for (var i = 0; i < allPlayer.length; i++) {
            if (allPlayer[i].pos.dimid != pos.dimid) continue;
            var length = allPlayer[i].distanceTo(pos);
            if (i == 0) {
                minLength = length;
                searchPlayer = allPlayer[i];
            } else if (i != 0 && length < minLength) {
                minLength = length;
                searchPlayer = allPlayer[i];
            }
        }
        writeLog(JSON.stringify({
            event: "EPAction",
            source: source.type,
            position: {
                dim: pos.dimid,
                x: parseInt(pos.x),
                y: parseInt(pos.y),
                z: parseInt(pos.z)
            },
            timestamp: new Date().getTime(),
            who: searchPlayer.name,
            distance: minLength
        }));
    }
});

mc.listen("onRespawnAnchorExplode", (pos, player) => {                                                //重生锚爆炸拦截
    writeLog(JSON.stringify({
        event: "RAEAction",
        player: player.name,
        position: {
            dim: player.pos.dimid,
            x: parseInt(player.pos.x),
            y: parseInt(player.pos.y),
            z: parseInt(player.pos.z)
        },
        timestamp: new Date().getTime()
    }));
});

mc.listen("onChangeDim", (player, dimid) => {                                                         //玩家维度变更拦截
    writeLog(JSON.stringify({
        event: "DCAction",
        player: player.name,
        to: dimid,
        position: {
            dim: player.pos.dimid,
            x: parseInt(player.pos.x),
            y: parseInt(player.pos.y),
            z: parseInt(player.pos.z)
        },
        timestamp: new Date().getTime()
    }));
});

mc.listen("onDestroyBlock", (player, block) => {                                                      //玩家摧毁方块拦截
    writeLog(JSON.stringify({
        event: "DBAction",
        player: player.name,
        block: block.type,
        position: {
            dim: block.pos.dimid,
            x: parseInt(block.pos.x),
            y: parseInt(block.pos.y),
            z: parseInt(block.pos.z)
        },
        timestamp: new Date().getTime()
    }));
});

mc.listen("onOpenContainer", (player, block) => {                                                     //玩家打开容器拦截
    writeLog(JSON.stringify({
        event: "COAction",
        player: player.name,
        block: block.type,
        position: {
            dim: block.pos.dimid,
            x: parseInt(block.pos.x),
            y: parseInt(block.pos.y),
            z: parseInt(block.pos.z)
        },
        timestamp: new Date().getTime()
    }));
});

mc.listen("afterPlaceBlock", (player, block) => {                                                      //玩家放置方块拦截
    writeLog(JSON.stringify({
        event: "PBAction",
        player: player.name,
        block: block.type,
        position: {
            dim: block.pos.dimid,
            x: parseInt(block.pos.x),
            y: parseInt(block.pos.y),
            z: parseInt(block.pos.z)
        },
        timestamp: new Date().getTime()
    }));
});

mc.listen("onTakeItem", (player, entity, item) => {
    writeLog(JSON.stringify({
        event: "TIAction",
        player: player.name,
        item: item.type,
        position: {
            dim: parseInt(entity.blockPos.dimid),
            x: parseInt(entity.blockPos.x),
            y: parseInt(entity.blockPos.y),
            z: parseInt(entity.blockPos.z)
        },
        timestamp: new Date().getTime()
    }));
});