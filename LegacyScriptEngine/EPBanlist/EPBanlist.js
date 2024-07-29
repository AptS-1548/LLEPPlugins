function getFormatDateNow() {
    var date = new Date;
    return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()} +0000`;
}

function isValidIP(ip) {
    var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    return reg.test(ip);
}

mc.listen("onServerStarted", () => {                              //插件启动时事件
    /*
     *  初始化区域
     */

    logger.setFile("./logs/EPBanlist.log", 4);                        //设置输出日志到文件

    //TODO：命令report、repban

    /*
    *  命令注册区域
    */

    //注册顶层命令
    const EPBanlist_ban = mc.newCommand("ban", "Ban Command that transplant from Java Edition. Made by AptS:1547, https://esaps.net/", PermType.GameMasters);
    //一级命令，玩家档案
    EPBanlist_ban.mandatory("banner", ParamType.Player);
    //二级命令，原因
    EPBanlist_ban.optional("reason", ParamType.Message)
    //设置命令的语法
    EPBanlist_ban.overload(["banner", "reason"]);

    EPBanlist_ban.setCallback((_cmd, _ori, out, res) => {     //回调函数
        if (res.banner.length > 1) return out.error("Illegal player selection. You chose multiple players.");    //判断是否选择了多个玩家
        if (res.banner[0] == null) return out.error("Player not exist.");   //判断选择玩家是否为空

        var banner_name = res.banner[0].name;

        var banned_players = JSON.parse(new File("./banned-players.json", file.ReadMode).readAllSync());  //读取封禁列表
        var banned_players_length = banned_players.length;

        for (var i = 0; i < banned_players_length; i++) {    //遍历查询
            if (res.banner[0].xuid == banned_players[i].xuid) return out.error("这个傻逼早就被封禁了");
        }

        if (res.reason == null) { var now_banning_reason = "Banned by an operator."; } else { var now_banning_reason = res.reason; }

        //进入封禁流程
        var now_banning_player = { xuid: res.banner[0].xuid, name: banner_name, created: getFormatDateNow(), source: "Server", expires: "forever", reason: now_banning_reason };

        banned_players[banned_players_length] = now_banning_player;
        new File("./banned-players.json", file.WriteMode).writeSync(JSON.stringify(banned_players));

        logger.info(`Banned ${banner_name}: ${now_banning_reason}`);
        res.banner[0].kick(`你已被封禁：${now_banning_reason}`);
        return out.success(`Banned ${banner_name}: ${now_banning_reason}`);
    });
    EPBanlist_ban.setup();


    //注册顶层命令
    const EPBanlist_pardon = mc.newCommand("pardon", "Pardon Command that transplant from Java Edition. Made by AptS:1547, https://esaps.net/", PermType.GameMasters);
    //一级命令，玩家档案
    EPBanlist_pardon.mandatory("banner_name", ParamType.String);
    //设置命令的语法
    EPBanlist_pardon.overload(["banner_name"]);

    EPBanlist_pardon.setCallback((_cmd, _ori, out, res) => {     //回调函数
        var banned_players = JSON.parse(new File("./banned-players.json", file.ReadMode).readAllSync());  //读取封禁列表
        if (banned_players.length == 0) return out.error("Nothing changed. The player isn't banned");
        for (var i = 0; i < banned_players.length; i++) {    //遍历查询
            if (res.banner_name == banned_players[i].name) {
                banned_players.splice(i, 1);
                new File("./banned-players.json", file.WriteMode).writeSync(JSON.stringify(banned_players));

                logger.info(`Unbanned ${res.banner_name}`);
                return out.success(`Unbanned ${res.banner_name}`);
            }
        }
        return out.error("Nothing changed. The player isn't banned");
    });
    EPBanlist_pardon.setup();


    //注册顶层命令
    const EPBanlist_ban_ip = mc.newCommand("ban-ip", "Ban-ip Command that transplant from Java Edition. Made by AptS:1547, https://esaps.net/", PermType.GameMasters);
    //一级命令，玩家档案
    EPBanlist_ban_ip.mandatory("banner_ip", ParamType.String);
    //二级命令，原因
    EPBanlist_ban_ip.optional("reason", ParamType.Message)
    //设置命令的语法
    EPBanlist_ban_ip.overload(["banner_ip", "reason"]);

    EPBanlist_ban_ip.setCallback((_cmd, _ori, out, res) => {     //回调函数

        if (isValidIP(res.banner_ip)) {
            var need_banner_ip = res.banner_ip;
        } else if (mc.getPlayer(res.banner_ip) != null) {
            var need_banner_ip = mc.getPlayer(res.banner_ip).getDevice().ip.split(":")[0];
        } else {
            return out.error("Invalid IP address or player not exist.")
        }

        var banned_ips = JSON.parse(new File("./banned-ips.json", file.ReadMode).readAllSync());  //读取封禁列表
        var banned_ips_length = banned_ips.length;

        for (var i = 0; i < banned_ips_length; i++) {    //遍历查询
            if (need_banner_ip == banned_ips[i].ip) return out.error("这个IP早就被封禁了");
        }

        if (res.reason == null) { var now_banning_reason = "Banned by an operator."; } else { var now_banning_reason = res.reason; }

        //进入封禁流程
        var now_banning_ip = { ip: need_banner_ip, created: getFormatDateNow(), source: "Server", expires: "forever", reason: now_banning_reason };

        banned_ips[banned_ips_length] = now_banning_ip;
        new File("./banned-ips.json", file.WriteMode).writeSync(JSON.stringify(banned_ips));

        var all_player_array = mc.getOnlinePlayers();
        var kick_player_num = 0;

        for (var i = 0; i < all_player_array.length; i++) {
            if (all_player_array[i].getDevice().ip.split(":")[0] == need_banner_ip) {
                all_player_array[i].kick(`你的ip已被封禁：${now_banning_reason}`);
                kick_player_num++;
            }
        }

        logger.info(`Banned IP ${need_banner_ip}: ${now_banning_reason} Kick ${kick_player_num} players.`);
        return out.success(`Banned IP ${need_banner_ip}: ${now_banning_reason} Kick ${kick_player_num} players.`);
    });
    EPBanlist_ban_ip.setup();


    const EPBanlist_pardon_ip = mc.newCommand("pardon-ip", "Pardon-ip Command that transplant from Java Edition. Made by AptS:1547, https://esaps.net/", PermType.GameMasters);
    //一级命令，玩家档案
    EPBanlist_pardon_ip.mandatory("banner_ip", ParamType.String);
    //设置命令的语法
    EPBanlist_pardon_ip.overload(["banner_ip"]);

    EPBanlist_pardon_ip.setCallback((_cmd, _ori, out, res) => {     //回调函数
        var banned_ips = JSON.parse(new File("./banned-ips.json", file.ReadMode).readAllSync());  //读取封禁列表
        if (banned_ips.length == 0) return out.error("Nothing changed. The IP isn't banned");
        for (var i = 0; i < banned_ips.length; i++) {    //遍历查询
            if (res.banner_ip == banned_ips[i].ip) {
                banned_ips.splice(i, 1);
                new File("./banned-ips.json", file.WriteMode).writeSync(JSON.stringify(banned_ips));

                logger.info(`Unbanned IP ${res.banner_ip}`);
                return out.success(`Unbanned IP ${res.banner_ip}`);
            }
        }
        return out.error("Nothing changed. The IP isn't banned");
    });
    EPBanlist_pardon_ip.setup();


    const EPBanlist_banlist = mc.newCommand("banlist", "Banlist Command that transplant from Java Edition. Made by AptS:1547, https://esaps.net/", PermType.GameMasters);
    //一级命令，玩家档案
    EPBanlist_banlist.setEnum("search_ips", ["ips"]);
    EPBanlist_banlist.setEnum("search_players", ["players"]);
    EPBanlist_banlist.mandatory("category", ParamType.Enum, "search_ips", 1);
    EPBanlist_banlist.mandatory("category", ParamType.Enum, "search_players", 1);
    //设置命令的语法
    EPBanlist_banlist.overload(["search_ips"]);
    EPBanlist_banlist.overload(["search_players"]);

    EPBanlist_banlist.setCallback((_cmd, _ori, out, res) => {     //回调函数
        switch (res.category) {
            case "ips":
                var banned_ips = JSON.parse(new File("./banned-ips.json", file.ReadMode).readAllSync());  //读取封禁列表
                if (banned_ips.length == 0) return out.error("There are no IP under ban.");
                for (var i = 0; i < banned_ips.length; i++) {    //遍历查询
                    out.success(`Banned IP ${banned_ips[i].ip}: ${banned_ips[i].reason}`)
                }
                break;

            case "players":
                var banned_players = JSON.parse(new File("./banned-players.json", file.ReadMode).readAllSync());  //读取封禁列表
                if (banned_players.length == 0) return out.error("There are no player under ban.");
                for (var i = 0; i < banned_players.length; i++) {    //遍历查询
                    out.success(`Banned ${banned_players[i].name}: ${banned_players[i].reason}`)
                }
                break;
        }
    });
    EPBanlist_banlist.setup();


    const EPBanlist_report = mc.newCommand("report", "Report Command that give player a permission to fuck others. Made by AptS:1547, https://esaps.net/", PermType.Any);
    //一级命令，玩家档案
    EPBanlist_report.mandatory("banner", ParamType.Player);
    //二级命令，原因
    EPBanlist_report.optional("reason", ParamType.Message)
    //设置命令的语法
    EPBanlist_report.overload(["banner", "reason"]);

    EPBanlist_report.setCallback((_cmd, _ori, out, res) => {     //回调函数
        if ( _ori.player == null ) return out.error("This command can only be executed by player.");
        if ( res.banner.length > 1 ) return out.error("Illegal player selection. You chose multiple players.");    //判断是否选择了多个玩家
        if ( res.banner[0] == null ) return out.error("Player not exist.");   //判断选择玩家是否为空

        var report_name = res.banner[0].name;

        var report_players = JSON.parse(new File("./config/EPBanlist_reportqueue.json", file.ReadMode).readAllSync());  //读取封禁列表
        var report_players_length = report_players.length;

        for (var i = 0; i < report_players_length; i++) {    //遍历查询
            if (res.banner[0].xuid == report_players[i].report_xuid) return out.error("此玩家已有封禁请求");
        }

        if (res.reason == null) { var now_report_reason = "null"; } else { var now_report_reason = res.reason; }

        //进入封禁流程
        var now_report_player = { report_xuid: res.banner[0].xuid, report_name: report_name, created: getFormatDateNow(), reason: now_report_reason, from_xuid: _ori.player.xuid, from_name: _ori.player.name };

        report_players[report_players_length] = now_report_player;
        new File("./config/EPBanlist_reportqueue.json", file.WriteMode).writeSync(JSON.stringify(report_players));

        logger.info(`${_ori.player.name} reported ${report_name}: ${now_report_reason}`);
        return out.success(`Reported ${report_name} success: ${now_report_reason}`);
    });
    EPBanlist_report.setup();

    //注册顶层命令
    const EPBanlist_report_ban = mc.newCommand("report-ban", "Report-ban Command that allow you to handle reports. Made by AptS:1547, https://esaps.net/", PermType.GameMasters);
    //枚举类
    EPBanlist_report_ban.setEnum("list_queue", ["list"]);
    EPBanlist_report_ban.setEnum("acccept_report", ["accept"]);
    EPBanlist_report_ban.setEnum("deny_report", ["deny"]);
    //绑定一级命令为必须参数，玩家需要执行的动作
    EPBanlist_report_ban.mandatory("action", ParamType.Enum, "list_queue", 1);
    EPBanlist_report_ban.mandatory("action", ParamType.Enum, "acccept_report", 1);
    EPBanlist_report_ban.mandatory("action", ParamType.Enum, "deny_report", 1);
    //设置二级命令为必须函数，被举报人名字
    EPBanlist_report_ban.mandatory("report_player", ParamType.String);
    //设置命令的语法
    EPBanlist_report_ban.overload(["list_queue"]);
    EPBanlist_report_ban.overload(["acccept_report", "report_player"]);
    EPBanlist_report_ban.overload(["deny_report", "report_player"]);

    EPBanlist_report_ban.setCallback((_cmd, _ori, out, res) => {     //回调函数                 //判断是否为玩家执行
        var report_players = JSON.parse(new File("./config/EPBanlist_reportqueue.json", file.ReadMode).readAllSync());  //读取封禁列表
        if (report_players.length == 0) return out.error("There are no reports.");
        switch (res.action) {                                     //不同命令判断
            case "list":                                        //查看举报队列
                var report_list = "list of reports: ";
                for (var i = 0; i < report_players.length; i++) {    //遍历查询
                    report_list += `\n${report_players[i].report_name} from ${report_players[i].from_name}: ${report_players[i].reason}`
                }
                return out.success(report_list);

            case "accept":                                      //受理举报
                for (var i = 0; i < report_players.length; i++) {    //遍历查询
                    if ( report_players[i].report_name == res.report_player ) {
                        var banned_players = JSON.parse(new File("./banned-players.json", file.ReadMode).readAllSync());  //读取封禁列表
                        
                        for (var j = 0; j < banned_players.length; j++) {    //遍历查询
                            if (res.report_player == banned_players[i].name) {
                                report_players.splice(i, 1);
                                new File("./config/EPBanlist_reportqueue.json", file.WriteMode).writeSync(JSON.stringify(report_players));
                                return out.error("这个傻逼早就被封禁了");
                            };
                        }

                        var now_banning_player = { xuid: report_players[i].report_xuid, name: report_players[i].report_name, created: getFormatDateNow(), source: "Server", expires: "forever", reason: "请咨询管理员" };
                
                        banned_players[banned_players.length] = now_banning_player;
                        new File("./banned-players.json", file.WriteMode).writeSync(JSON.stringify(banned_players));
                        report_players.splice(i, 1);
                        new File("./config/EPBanlist_reportqueue.json", file.WriteMode).writeSync(JSON.stringify(report_players));

                        logger.info(`Banned ${res.report_player}: 请咨询管理员`);
                        if ( mc.getPlayer(res.report_player) != null ) mc.getPlayer(res.report_player).kick("你已被封禁：请咨询管理员");
                        return out.success(`Banned ${res.report_player}: 请咨询管理员`);
                    }
                }

            case "deny":                                        //拒绝举报
                for (var i = 0; i < report_players.length; i++) {    //遍历查询
                    if ( report_players[i].report_name == res.report_player) {
                        report_players.splice(i, 1);
                        new File("./config/EPBanlist_reportqueue.json", file.WriteMode).writeSync(JSON.stringify(report_players));
    
                        logger.info(`Delete report queue: ${res.report_player}`);
                        return out.success(`Delete report queue: ${res.report_player}`);
                    }
                }
        }
    }); 
    EPBanlist_report_ban.setup();

    logger.info("Plugin Successfully Loaded");                    //宣布插件启动完成
});

mc.listen("onPreJoin", (player) => {                              //检查是否在黑名单
    var banned_players = JSON.parse(new File("./banned-players.json", file.ReadMode).readAllSync());  //读取封禁列表

    for (var i = 0; i < banned_players.length; i++) {    //遍历查询
        if (player.xuid == banned_players[i].xuid) player.kick(`你已被封禁：${banned_players[i].reason}`);
    }

    var banned_ips = JSON.parse(new File("./banned-ips.json", file.ReadMode).readAllSync());  //读取封禁列表
    for (var i = 0; i < banned_ips.length; i++) {
        if (player.getDevice().ip.split(":")[0] == banned_ips[i].ip) player.kick(`你的ip已被封禁：${banned_ips[i].reason}`);
    }
});
