var EPteleportRequest = {};
var EPteleportfrom = {};

mc.listen("onServerStarted", () => {                              //插件启动时事件
    /*
     *  初始化区域
     */


    logger.setFile("./logs/EPTpa.log", 4);                        //设置输出日志到文件

    const EPTpa_tpa = mc.newCommand("tpa", "Teleport, without operator permission. Made by AptS:1547, https://esaps.net/", PermType.Any);
    EPTpa_tpa.mandatory("whichPlayer", ParamType.Player);
    //设置命令的语法
    EPTpa_tpa.overload(["whichPlayer"]);

    EPTpa_tpa.setCallback((_cmd, _ori, out, res) => {     //回调函数
        if ( _ori.player == null ) return out.error("This command can only be executed by player.");                  //判断是否为玩家执行
        if ( res.whichPlayer.length > 1 ) return out.error("Illegal player selection. You chose multiple players.");
        if ( res.whichPlayer[0] == null ) return out.error("Player not exist.");

        if (res.whichPlayer[0].name == _ori.player.name) return out.error("你无法传送到自己身边！");
        if (EPteleportRequest[_ori.player.name] != null) return out.error("你已经有传送请求了哦！");

        var dest_player_name = res.whichPlayer[0].name;
        var now_date = new Date;

        EPteleportRequest[_ori.player.name] = {teleport_dest: dest_player_name, end_time: now_date.getTime() + 60000};
        if (EPteleportfrom[dest_player_name] == null ) {
            EPteleportfrom[dest_player_name] = new Array();
            EPteleportfrom[dest_player_name].push(_ori.player.name);
        } else {
            EPteleportfrom[dest_player_name].push(_ori.player.name);
        }
    
        mc.getPlayer(dest_player_name).tell(`§b${_ori.player.name}§d 已向你发出传送请求！\n§r§§§d输入§6 /tpaaccept§d 以接受请求！`);
        return _ori.player.tell(`§d你已向玩家 §b${dest_player_name} §d发送传送请求！`);
    }); 
    EPTpa_tpa.setup();

    const EPTpa_tpaaccept = mc.newCommand("tpaaccept", "Accept teleport, without operator permission. Made by AptS:1547, https://esaps.net/", PermType.Any);
    EPTpa_tpaaccept.optional("whichPlayer", ParamType.Player);
    //设置命令的语法
    EPTpa_tpaaccept.overload(["whichPlayer"]);

    EPTpa_tpaaccept.setCallback((_cmd, _ori, out, res) => {     //回调函数
        if ( _ori.player == null ) return out.error("This command can only be executed by player.");                  //判断是否为玩家执行
        
        var EPteleportfrom_data = EPteleportfrom[_ori.player.name];
        if (EPteleportfrom_data == null) return out.error("你没有收到过任何传送请求！");
        if ( res.whichPlayer == null ) { //检测只有一个传送请求
            if ( EPteleportfrom_data.length == 1 ) {   //bug under
                var teleporter_name = EPteleportfrom_data[0];
                _ori.player.tell(`§d你接受了玩家§b ${teleporter_name}§d 的传送请求!`);
                mc.getPlayer(teleporter_name).tell(`§d正在传送至 §r§§§b${_ori.player.name}`);
                mc.runcmdEx(`tp "${teleporter_name}" "${_ori.player.name}"`);
                mc.runcmd(`playsound "portal.travel" "${teleporter_name}"`);
                EPteleportfrom_data.splice(0, 1);
                EPteleportfrom[_ori.player.name] = EPteleportfrom_data;
                delete EPteleportRequest[teleporter_name];
            } else if (EPteleportfrom_data.length == 0) {
                return out.error("你没有收到过任何传送请求！");
            } else {
                var player_list = "§d当前存在多个传送请求！\n分别来自：§r§§§b";
                for (var i = 0; i < EPteleportfrom_data.length; i++) {
                    player_list += `${EPteleportfrom_data[i]}, `;
                }
                player_list.slice(0,-2);
                return mc.getPlayer(_ori.player.name).tell(player_list);
            }
        } else {
            if ( res.whichPlayer.length > 1 ) return out.error("Illegal player selection. You chose multiple players.");
            if (res.banner[0] == null) return out.error("Player not exist.");
            var teleporter_name = res.whichPlayer[0].name;
            if (EPteleportfrom_data.indexOf(teleporter_name) == -1) return out.error("此玩家还没有向你发送传送请求！");
            _ori.player.tell(`§d你接受了玩家§b ${teleporter_name}§d 的传送请求!`);
            mc.getPlayer().tell(`§d正在传送至 §r§§§b${_ori.player.name}`);
            mc.runcmdEx(`/tp "${teleporter_name}" "${_ori.player.name}"`);
            mc.runcmd(`playsound "portal.travel" "${teleporter_name}"`);
            EPteleportfrom_data.splice(EPteleportfrom_data.indexOf(teleporter_name), 1);
            EPteleportfrom[_ori.player.name] = EPteleportfrom_data;
            delete EPteleportRequest[teleporter_name];
        }
    }); 
    EPTpa_tpaaccept.setup();

    logger.info(" Plugin Successfully Loaded");              //宣布插件启动完成
});


var tickTime = 0;
mc.listen("onTick", () => {
    if (tickTime >= 20) {
        tickTime = 0;
        var now_time = new Date;
        for (let player_name in EPteleportRequest) {
            if ( EPteleportRequest[player_name].end_time <= now_time.getTime() ) {
                var teleport_target = EPteleportRequest[player_name].teleport_dest;
                mc.getPlayer(player_name).tell(`§c若经过§6 60§c 秒后仍未有任何操作，你向玩家 §b${teleport_target} §c发送的传送请求将会超时失效！`);

                EPteleportfrom[teleport_target].splice(EPteleportfrom[teleport_target].indexOf(player_name),1);
                delete EPteleportRequest[player_name];
            }
        }
    }
    tickTime++;
});

