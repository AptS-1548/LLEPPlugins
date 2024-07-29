mc.listen("onServerStarted", () => {                              //插件启动时事件
    /*
     *  初始化区域
     */

    logger.setFile("./logs/EPBDSave.log", 4);                        //设置输出日志到文件

    /*
    *  命令注册区域
    */

    //注册顶层命令
    const Command_SaveAll = mc.newCommand("save-all", "A simple plugin compatible with the java version of the save command. Made by AptS:1547, https://esaps.net/", PermType.GameMasters);

    //一级命令允许的内容，枚举类
    Command_SaveAll.setEnum("SaveArg", ["flush"]);
    //绑定一级命令为必须参数，玩家需要执行的动作
    Command_SaveAll.optional("action", ParamType.Enum, "SaveArg", 1);
    //设置命令的语法
    Command_SaveAll.overload(["SaveArg"]);
    Command_SaveAll.setCallback((_cmd, _ori, out, res) => {
        out.success(mc.runcmdEx("save hold").output);
    });

    Command_SaveAll.setup();

    logger.info("Plugin Successfully Loaded");                    //宣布插件启动完成
});
