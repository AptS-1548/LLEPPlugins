var nekoList;

mc.listen("onServerStarted", () => {                              //插件启动时事件
    /*
     *  初始化区域
     */


    logger.setFile("./logs/EPMeow.log", 4);                        //设置输出日志到文件
    nekoList = JSON.parse(new File("./config/EPMeow.json", file.ReadMode).readAllSync());

    const asAnotherPlayer = mc.newCommand("speak", "An simple command that speak as another player. Made by AptS:1547, https://esaps.net/", PermType.GameMasters);

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


    const youAreNeko = mc.newCommand("neko", "Let us become cat! Made by AptS:1547, https://esaps.net/", PermType.GameMasters);

    //绑定一级命令为必须参数
    youAreNeko.mandatory("whichPlayer", ParamType.Player);

    youAreNeko.setEnum("listNeko", ["list"]);
    youAreNeko.setEnum("setNeko", ["set"]);
    youAreNeko.setEnum("cancelNeko", ["cancel"]);

    youAreNeko.mandatory("action", ParamType.Enum, "listNeko", 1);
    youAreNeko.mandatory("action", ParamType.Enum, "setNeko", 1);
    youAreNeko.mandatory("action", ParamType.Enum, "cancelNeko", 1);

    youAreNeko.mandatory("nekoPlayer", ParamType.Player);
    youAreNeko.mandatory("nekoName", ParamType.String);
    //设置命令的语法
    youAreNeko.overload(["listNeko"]);
    youAreNeko.overload(["setNeko", "nekoPlayer"]);
    youAreNeko.overload(["cancelNeko", "nekoName"]);

    youAreNeko.setCallback((_cmd, _ori, out, res) => {     //回调函数
        switch (res.action) {
            case "list":
                if ( nekoList.length == 0 ) return out.success("There are no neko...Meow~");
                var nekoListStr = "list of Neko: \n";
                for (var i = 0; i < nekoList.length; i++) {    //遍历查询
                    nekoListStr += `${nekoList[i]}, `;
                }
                nekoListStr.slice(0, -2);
                return out.success(nekoListStr);
            
            case "set":
                if ( res.nekoPlayer.length > 1 ) return out.error("Illegal player selection. You chose multiple players.");    //判断是否选择了多个玩家
                if ( res.nekoPlayer[0] == null ) return out.error("Player not exist.");
                if ( nekoList.indexOf(res.nekoPlayer[0].name) != -1 ) return out.success("已经是可爱的猫娘了喵~");
                nekoList[nekoList.length] = res.nekoPlayer[0].name;
                new File("./config/EPMeow.json", file.WriteMode).writeSync(JSON.stringify(nekoList));
                logger.info(`成功将${res.nekoPlayer[0].name}设置成猫娘了喵~`);
                return out.success(`成功将${res.nekoPlayer[0].name}设置成猫娘了喵~`);
            
            case "cancel":
                if ( nekoList.indexOf(res.nekoName) == -1 ) return out.success("她还不是猫娘呢呜呜呜...");
                nekoList.splice(nekoList.indexOf(res.nekoName), 1);
                new File("./config/EPMeow.json", file.WriteMode).writeSync(JSON.stringify(nekoList));
                logger.info(`成功将${res.nekoName}设置成人类了了呜呜呜...`);
                return out.success(`成功将${res.nekoName}设置成人类了了呜呜呜...`);

        }
    }); 
    youAreNeko.setup();

    logger.info(" Plugin Successfully Loaded");              //宣布插件启动完成
});

mc.listen("onChat", (player,msg) => {
    if ( nekoList.indexOf(player.name) != -1 ) {
        mc.broadcast(`<${player.name}> ${msg}喵~`, 1)
        return false;
    }
});