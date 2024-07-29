mc.listen("onServerStarted", () => {                                                                 //服务器启动
    /*
     *  初始化区域
     */
    logger.setFile("./logs/EPLog.log", 4);                        //设置输出日志到文件
    logger.info("[serverStart]", " Server Started");              //宣布插件启动完成
});

/*
 *  监听区域
 */
mc.listen("onJoin", (player) => {                                                                    //玩家加入游戏
    player.sendToast("欢迎！", `欢迎${player.name}加入服务器！`);
    logger.info("[playerJoin]" ,` ${player.name} is joining the server, on ${player.pos.dim}, x:${parseInt(player.pos.x)}, y:${parseInt(player.pos.y)}, z:${parseInt(player.pos.z)}`);
});

mc.listen("onLeft", (player) => {                                                                    //玩家离开游戏
    logger.info("[playerDisconnect]" ,` ${player.name} is leaving the server, on ${player.pos.dim}, x:${parseInt(player.pos.x)}, y:${parseInt(player.pos.y)}, z:${parseInt(player.pos.z)}`);
});

mc.listen("onChat", (player, msg) => {                                                               //玩家发送消息
    logger.info("[playerChat]", ` ${player.name} Send an message -> `, msg);
});

mc.listen("onUseItemOn", (player,item,block,side,pos) => {                                           //玩家使用打火石拦截
    if ( item.type == "minecraft:flint_and_steel") {
        logger.info("[FASAction]", ` ${player.name} is trying to ignite ${block.name}, on ${player.pos.dim}, x:${parseInt(player.pos.x)}, y:${parseInt(player.pos.y)}, z:${parseInt(player.pos.z)}`);
    }
});

mc.listen("onEntityExplode", (source,pos,radius,maxResistance,isDestroy,isFire) => {                 //TNT爆炸拦截
    var allPlayer = mc.getOnlinePlayers();
    var minLength = 0;
    var searchPlayer;
    if ( source.type != "minecraft:wither_skull" && source.type != "minecraft:wither_skull_dangerous" && source.type != "minecraft:fireball") {
        logger.info("[EPAction]", ` ${source.type} exploded, on ${pos.dim}, x:${parseInt(pos.x)}, y:${parseInt(pos.y)}, z:${parseInt(pos.z)}`);
        for(var i = 0; i < allPlayer.length; i++) {
            if ( allPlayer[i].pos.dim != pos.dim) continue;
            var length = allPlayer[i].distanceTo(pos);
            if ( i == 0 ) {
                minLength = length;
                searchPlayer = allPlayer[i];
            } else if ( i != 0 && length < minLength ) {
                minLength = length;
                searchPlayer = allPlayer[i];
            }
        }
        logger.info("[EPAction]", ` The player closest to the explosion was ${searchPlayer.name}, only ${minLength} meters away.`);
    }
});

mc.listen("onRespawnAnchorExplode", (pos,player) => {                                                //重生锚爆炸拦截
    logger.info("[RAEAction]", ` ${player.name} made the Respawn Anchor exploded, on ${player.pos.dim}, x:${parseInt(player.pos.x)}, y:${parseInt(player.pos.y)}, z:${parseInt(player.pos.z)}`);
});

mc.listen("onChangeDim", (player,dimid) => {                                                         //玩家维度变更拦截
    var dimension;
    switch (dimid){
        case 0:
            dimension = "主世界";
            break;
        case 1:
            dimension = "下界";
            break;
        case 2:
            dimension = "末地";
            break;
        default:
            dimension = "未知维度";
            break;
    }
    logger.info("[DCAction]", ` ${player.name} changed his dimension, from ${player.pos.dim} to ${dimension}, before teleporting are x:${parseInt(player.pos.x)}, y:${parseInt(player.pos.y)}, z:${parseInt(player.pos.z)}`);
});

mc.listen("onDestroyBlock", (player,block) => {                                                      //玩家摧毁方块拦截
    logger.info("[DBAction]", ` ${player.name}, ${block.type}, x${block.pos.x}, y${block.pos.y}, z${block.pos.z}`);
});

mc.listen("onOpenContainer", (player,block) => {                                                     //玩家打开容器拦截
    logger.info("[COAction]", ` ${player.name} opened container, ${block.type} on x${block.pos.x}, y${block.pos.y}, z${block.pos.z}`);
});

mc.listen("afterPlaceBlock", (player,block) => {                                                      //玩家放置方块拦截
    logger.info("[PBAction]", ` ${player.name}, ${block.type}, x${block.pos.x}, y${block.pos.y}, z${block.pos.z}`);
});
