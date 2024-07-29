mc.listen("onServerStarted", () => {                              //插件启动时事件
    /*
     *  初始化区域
     */

    logger.setFile("./logs/EPMeow.js", 4);                        //设置输出日志到文件

    const asAnotherPlayer = mc.newCommand("speak", "An simple command that speak as another player. Made by AptS:1547, https://esaps.net/", PermType.GameMasters);

    //绑定一级命令为必须参数
    asAnotherPlayer.mandatory("whichPlayer", ParamType.Player);
    asAnotherPlayer.mandatory("message", ParamType.String);
    //设置命令的语法
    asAnotherPlayer.overload(["whichPlayer", "message"]);

    asAnotherPlayer.setCallback((_cmd, _ori, out, res) => {     //回调函数
        if ( res.whichPlayer.length > 1 ) return out.error("Illegal player selection. You chose multiple players.");
        if ( res.whichPlayer[0] == null ) return out.error("Player not exist.");
        mc.broadcast(`<${res.whichPlayer[0].name}> ${res.message}`, 1)
    }); 
    asAnotherPlayer.setup();
    logger.info("[serverStart]", " Server Started");              //宣布插件启动完成
});

mc.listen("onChat", (player,msg) => {
    if ( player.name == "AptS 1547") {
        mc.broadcast(`<${player.name}> ${msg}喵~`, 1)
        return false;
    }
});