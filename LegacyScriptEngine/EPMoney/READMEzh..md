# EPMoney Plugin

提供一个很小的金钱插件给Linux LLBDS使用，因为在我使用的过程中发现Linux下LegacyMoney插件会出现问题  
**注意：本插件不支持hook**  

## Usage:

| 命令                                 | 描述                | 执行权限   |
| ------------------------------------ | ------------------ | ---------- |
| /epmoney query                       | 我的银行里面有多少钱 | Everyone   |
| /epmoney pay \<Player\> \<Money\>    | 给指定玩家转账       | Everyone   |
| /epmoney set \<Player\> \<Money\>    | 设置指定玩家的金钱   | Operator   |
| /epmoney add \<Player\> \<Money\>    | 添加金钱给指定玩家   | Operator   |
| /epmoney reduce \<Player\> \<Money\> | 给指定玩家罚款       | Operator   |
