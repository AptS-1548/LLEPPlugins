# EPBanlist Plugin

给基岩版服务器添加上了Ban命令，从Java版本移植  

## Usage:

| 命令                                    | 描述                                   | 执行权限    |
| --------------------------------------- | ------------------------------------- | ---------- |
| /ban \<Player\> \[reason\]              | 将某位在线玩家打入黑名单                | Operator   |
| /ban-ip \<Player\|IP\> \[reason\]       | 将某位在线玩家的IP或者指定的IP打入黑名单 | Operator   |
| /pardon \<String\>                      | 将指定的玩家移出黑名单                  | Operator   |
| /pardon-ip \<IP Address\>               | 将指定IP移出黑名单黑名                  | Operator |   
| /report \<Player\> \[reason\]           | 允许玩家举报恶劣玩家\(非Java版命令\)     | Everyone   |
| /report-ban list                        | 看看你的玩家举报了谁\(非Java版命令\)     | Operator   |
| /report-ban \<accept\|deny\> \<String\> | 受理或者打回举报\(非Java命令\)          | Operator   |
