var EPMoneyDB;

mc.listen("onServerStarted", () => {                              //插件启动时事件
    /*
     *  初始化区域
     */


    logger.setFile("./logs/EPMeow.log", 4);                        //设置输出日志到文件
    EPMoneyDB = new KVDatabase("./plugins/EPMoney/EPMoney.kvdb");

    const asAnotherPlayer = mc.newCommand("epmoney", "An alternative plugin to LegacyMoney for Linux LLBDS. Made by AptS:1547, https://esaps.net/", PermType.GameMasters);

    //绑定一级命令为必须参数
    asAnotherPlayer.mandatory("whichPlayer", ParamType.Player);
    asAnotherPlayer.mandatory("message", ParamType.String);
    //设置命令的语法
    asAnotherPlayer.overload(["whichPlayer", "message"]);

    asAnotherPlayer.setCallback((_cmd, _ori, out, res) => {     //回调函数
        if ( res.whichPlayer.length > 1 ) return out.error("Illegal player selection. You chose multiple players.");
        if ( res.whichPlayer[0] == null ) return out.error("Player not exist.");
        mc.broadcast(`<${res.whichPlayer[0].name}> ${res.message}`, 1);
    }); 
    asAnotherPlayer.setup( res.whichPlayer[0].name);

    logger.info(" Plugin Successfully Loaded");              //宣布插件启动完成
});
