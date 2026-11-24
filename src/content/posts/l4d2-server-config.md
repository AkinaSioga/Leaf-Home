---
title: L4D2 正式服配置
description: 16 人合作｜100 Tick｜多特
publishedAt: 2026-11-24
category: 技术
tags:
  - L4D2
draft: false
---

## 云主机与进服

| 项目 | 配置 |
|---|---|
| DNS | Cloudflare A ，DNS only（灰云） |
| 云主机 | 腾讯云广州轻量应用服务器，Ubuntu 24.04 x86_64，2c4g， 60G  |
| 带宽套餐 | 5 Mbps，500 GB/月 |
| 联机 | UDP 27015，无进服密码，允许公网直连，从公开服务器搜索隐藏（`-nomaster`） |
| 服务 | `l4d2.service`，以 `l4d2` 用户运行，开机启动，`Restart=always` |
| 安装位置 | SteamCMD 在 `/var/lib/l4d2/steamcmd`，Valve Linux 专服 App ID `222860`，游戏目录 `/var/lib/l4d2/server/left4dead2` |

### 引擎和服务器设置

| 项目 | 值和位置 |
|---|---|
| 引擎 Tick | systemd 启动参数 `-tickrate 100` |
| 普通感染者等 NextBot 更新 | `addons/sourcemod/configs/l4d2_tickrate_enabler.cfg` 设为 0.05 秒。正式日志记录从每 10 Tick 调至每 5 Tick 更新一次 |
| 客户端文件一致性 | `sv_consistency "0"` |
| 公网进服 | `sv_lan "0"`、`sv_allow_lobby_connect_only "0"`、`sv_gametypes "coop"`。启动参数含 `-nohltv` |

另注：100t后刷尸潮小僵尸会一卡一卡的，目前是通过NextBot插件解决。

### 16 人合作与 Bot

L4DToolZ 2.4.3 提供连接槽位和 Tick 解锁，`bots.smx` 1.11.8 负责生还者队伍扩容、进队和 Bot 接管。开局以四名生还者为基础，真人不足时由 Bot 补位。第五名起可自动加入生还者，或输入 `!join`。原版 Bot 战斗 AI 保留。

| 位置 | 设置 | 含义 |
|---|---|---|
| systemd 启动参数 | `+sv_setmax 31` | 引擎槽位预算，包含 Bot 和特感所需槽位 |
| `cfg/server.cfg` | `sv_maxplayers "16"` | 真人连接上限 |
| `cfg/sourcemod/bots.cfg` | `bots_join_limit "16"` | 多人插件的生还者真人上限 |
| 同上 | `bots_limit "4"` | 开局 Bot 数量 |
| 同上 | `bots_join_flags "3"` | 支持自动加入和 `!join` |
| 同上 | `bots_join_respawn "1"` | 加入时没有存活 Bot 可接管，允许插件按加入规则复活 |
| 同上 | `bots_give_type "1"` | 启用多人插件的固定槽位发装 |
| 同上 | `bots_give_time "1"` | 多人插件创建 Bot 或复活玩家时发装 |
| 同上 | `bots_give_slot0 "4"`、`bots_give_slot1 "4096"`、`bots_give_slot3 "1"` | MAC-10、小刀和 1 个医疗包 |
| 同上 | `bots_give_slot2 "0"`、`bots_give_slot4 "0"` | 投掷物、药丸和针剂不发放 |

发装触发时插件会先清空现有装备。接管已有 Bot 时，玩家继承该 Bot 当时的装备。

## 多特刷新规则

**`specialspawner.smx` 1.3.7** 随地图默认加载。常用参数在 `cfg/sourcemod/specialspawner.cfg`。

| 参数 | 值 | 含义 |
|---|---|---|
| `ss_first_time` | `5.0` | 首个生还者离开安全区后 5 秒尝试刷第一波 |
| `ss_time_min` / `ss_time_max` | `25.0` / `30.0` | 后续每轮刷新计时的上下限，单位为秒 |
| `ss_time_mode` | `1` | 存活特感越少越接近 25 秒，场上越满越接近 30 秒 |
| `ss_base_size` / `ss_base_limit` | `4` / `4` | 生还者队伍 4 人及以下时，每轮目标数与同时在场上限 |
| `ss_extra_size` / `ss_extra_limit` | `1` / `1` | 生还者队伍超过 4 人后，每多一人，每轮目标数与在场上限各加 1 |
| `ss_spawn_size` / `ss_si_limit` | `4` / `15` | 配置文件初值，队伍变化时由插件重新计算 |
| `ss_tankstatus_action` | `1` | 坦克在场期间按另一组特感类型上限和权重刷怪 |

## 当前玩法和插件开关

| 功能 | 正式服设置 |
|---|---|
| 回血 | `l4d2_health_rewards.smx`。六种普通特感普通击杀或爆头均配置 **+2 HP**，给队友打包配置 **+10 HP** |
| 安全门 | `l4d_doorlock.smx`，倒计时最短和最长均为 **20 秒** |
| 角色、闲置与自杀 | 普通玩家可用 `!csm` 选角色、`!afk` 闲置、`!kill` 自杀，AFK 返回角色的延迟为 **0 秒** |
| 女巫和坦克刀伤 | 女巫动态增血关闭，基础血量按原版 1000 HP。坦克和女巫的固定刀伤覆盖均为 `-1.0`，由游戏结算。坦克动态血量功能保留 |
| 投票和自动切换 | `!vt` 是通用投票，`!vmap` 或 `!maps` 投票换战役。终章救援开始弹出选图菜单，玩家选图后才发起投票，也可用 `!mapnext` 预选下一战役 |
| 鱼猫猫命中反馈 | 服务端 `hitsound_branches.smx`，菜单 `!snd`。自定义音效和命中贴图依赖玩家本机的对应 VPK |
| 生还者辅助 | 保留取消受伤晃屏、夜视仪、最后一次倒地前的濒死发光，以及换章恢复处理 |

## 默认加载的 SourceMod 插件（144 项）

目录已核对。表中的插件有的提供依赖接口，也有仅管理员、特定玩法或特定场景才用到的功能。药针插件文件保留，`l4d_powerups_plugin_on "0"` 关闭额外增益。路程播报及固定近战伤害覆盖也由上述配置关闭。

### 多人、接管与队伍

| 插件 | 作用 |
|---|---|
| `bots.smx` | 16 人合作的加入与接管逻辑、补齐生还者 Bot、发放 MAC-10／小刀／医疗包，以及 `!join`、`!afk`、`!teams`、`!tkbot`。 |
| `survivor_chat_select.smx` | 选择生还者角色，支持 `!csm` 和一代、二代角色共存。 |
| `l4d_survivor_identity_fix.smx` | 修复五名以上生还者的角色身份对应问题。 |
| `l4d2_away_player.smx` | 管理进入闲置和返回角色的延迟。返回角色配置为 0 秒。 |
| `survivor_afk_fix.smx` | 修复闲置后 Bot 接管、重新控制生还者的问题。 |
| `l4d2_kick_afk_player.smx` | 处理长时间闲置挂机。 |
| `l4d2_kick_survivor.smx` | 让管理员用 `!kb` 踢出电脑生还者。 |
| `l4d2_observer_mode.smx` | 闲置时支持双击右键换自由视角。 |
| `l4d2_SpecPrevFreePerspective.smx` | 给闲置状态补自由视角切换。 |
| `l4d2_spec_stays_spec.smx` | 对抗模式旁观者跨图保留旁观状态。 |
| `l4d2_player_team.smx` | 提示玩家切换队伍。 |
| `reservedslots.smx` | SourceMod 保留槽位控制，效果取决于保留槽位配置。 |

### 投票、地图与战役流程

| 插件 | 作用 |
|---|---|
| `l4d2_menu_vote.smx` | `!vt` 通用投票菜单，提供难度、重开章节和踢人等项目。 |
| `l4d2_map_vote.smx` | `!vmap` / `!maps`，列举战役并发起换图投票。 |
| `map_changer.smx` | 维护下一张战役及预选投票，关联 `!mapnext` 和救援阶段的投票提示。 |
| `l4d2_nativevote.smx` | 给其他插件提供原生投票界面接口。 |
| `l4d2_callvote.smx` | 限制游戏自带的投票入口。 |
| `l4d2_change_mode.smx` | 管理员菜单切换游戏模式。 |
| `l4d2_z_difficulty.smx` | 管理员菜单更改游戏全局难度。 |
| `l4d2_custom_difficulty.smx` | 让玩家通过菜单选择个人难度。 |
| `l4d2_simulation.smx` | 按玩家模拟不同难度，也提供管理入口。 |
| `l4d2_pause_game.smx` | 管理员暂停或恢复游戏。 |
| `L4d2_restart_the_chapter.smx` | 管理员手动重开当前章节。 |
| `L4D2_coop_round_restart_delay.smx` | 控制合作团灭后的回合重开等待时间。 |
| `l4d_skip_intro.smx` | 跳过受支持官方战役的开场演出。 |
| `l4d2_finale_stage_fix.smx` | 处理终章卡阶段，并提供救援阶段控制。 |
| `L4D_Elevator_Teleport.smx` | 处理电梯、机关一类流程里落在外面的生还者。 |
| `l4d_doorlock.smx` | 安全门倒数和开门控制，目前最短和最长都设为 20 秒。 |
| `l4d2_saferoomdoor.smx` | 开关安全门时显示提示，也可限制操作次数。 |
| `safearea_teleport.smx` | 处理长时间未进入终点安全屋的玩家，按配置传送或处死。 |
| `l4d2_survivor_transition.smx` | 按换章前的存活、倒地、挂边和死亡状态整理血量或复活。当前已启用。 |
| `denia_map_status.smx` | 记录地图和过关时的人数，供地图播报读取。 |

### 特感、坦克和女巫

| 插件 | 作用 |
|---|---|
| `specialspawner.smx` | 多特刷新，当前服务器配置间隔为 25–30 秒，有场上数量上限。 |
| `l4d2_director_commonlimit_block.smx` | 防止导演脚本把普通感染者上限抬到 z_common_limit 以上。 |
| `l4d2_tickrate_enabler.smx` | 设置服务器网络更新相关参数及 NextBot 更新间隔，当前 100 Tick、50 毫秒。 |
| `l4d2_tank_announce.smx` | 坦克出场提示和按人数增加血量。女巫动态增血当前已关。 |
| `l4d2_antimelee.smx` | 支持覆盖近战对坦克、女巫的伤害。两项当前都是 -1，交给游戏结算。 |
| `l4d2_tank_damage.smx` | 控制坦克受燃烧时的伤害或免疫规则。 |
| `l4d2_tank_random_name.smx` | 为坦克选用自定义名字。 |
| `l4d2_tank_ranking.smx` | 展示玩家对单个坦克的伤害排行。 |
| `l4d2_witch_ranking.smx` | 展示对单个女巫的伤害排行。 |
| `l4d2_GetWitchNumber.smx` | 给女巫编号，供显示、选择和其他插件使用。 |
| `end_safedoor_witch.smx` | 根据配置，在终点安全门附近刷女巫。 |
| `l4d2_remove_witch.smx` | 管理员菜单移除指定女巫。 |
| `l4d2_remove_zombie.smx` | 管理员开启旅游模式或清理感染者。 |
| `l4d2_infected_hp.smx` | 显示特感、坦克或女巫的血量，提供坦克死亡提示。 |
| `l4d_sweep_fist_patch.smx` | 让战役坦克的挥拳支持一次击中多名生还者。 |
| `l4d2_create_panic.smx` | 提示哪位生还者触发了警报车。 |

### 发枪、装备与药品

| 插件 | 作用 |
|---|---|
| `rygive.smx` | 管理员娱乐与发物品菜单，可手动给武器、处理复活等。Denia 的 F2 绑定对应 `sm_rygive`。 |
| `l4d_gun_cabinet.smx` | 在地图放置可取枪的武器柜。 |
| `l4d2drop.smx` | 提供丢弃武器或道具的功能。 |
| `l4d2_melee_spawn_control.smx` | 修改地图可刷出的近战武器种类。 |
| `l4d2_weapon_attributes.smx` | 提供武器伤害、弹夹等属性的配置接口。 |
| `l4d2_ammo_set.smx` | 调整武器后备弹药配置。 |
| `l4d2_ammo_bit_widener.smx` | 修正较大弹药数值在网络传输和显示时的位宽问题。 |
| `l4d2_item_pickup.smx` | 修复拾取新枪时弹匣没填满的情况。 |
| `l4d2_death_drop_tracker.smx` | 生还者死亡时补掉落副武器，并高亮追踪掉落物。 |
| `incap_magnum.smx` | 为倒地状态提供马格南手枪行为。 |
| `l4d2_health_rewards.smx` | 击杀奖励和队友治疗奖励。普通六种特感当前是 2 HP，给队友打包的奖励为 10 HP。 |
| `l4d2_max_health.smx` | 让服务器可配置生还者最大生命值。 |
| `l4d2_more_medical.smx` | 按生还者人数增加医疗物品。 |
| `l4d2_survivor_invincible.smx` | 管理员菜单调整生还者免伤。 |
| `l4d2_survivors_control.smx` | 管理员菜单调整生还者被特感控制的免疫规则。 |

### HUD、声音、提示与外观

| 插件 | 作用 |
|---|---|
| `hitsound_branches.smx` | 鱼猫猫命中反馈功能的服务端部分，!snd 控制音效和图标选项。 |
| `dingshot.smx` | 播放爆头击杀叮声，有独立触发规则。 |
| `l4d2_cs_kill_hud.smx` | 显示类似 CS 的击杀 HUD。 |
| `l4d2_damage_show.smx` | 显示或统计攻击伤害，供玩家观察攻击结果。 |
| `l4d2_emshud_info.smx` | 服务器滚动字样、时间和 HUD 信息。 |
| `l4d2_bullet_impact.smx` | 给玩家的子弹落点特效设置颜色。 |
| `l4d2_PZDmgMsg.smx` | 屏蔽部分游戏自带的提示。 |
| `l4d_coop_markers.smx` | 在合作中播报路程百分比。当前功能开关为 0。 |
| `l4d2_player_status.smx` | 提示生还者死亡、被制服等状态。 |
| `l4d2_player_decal.smx` | 记录并提示喷漆动作。 |
| `谁用喷漆.smx` | 提示喷漆者，与 l4d2_player_decal 的用途有重叠。 |
| `l4d_explosion_announcer.smx` | 提示谁引燃或打爆了汽油桶等物品。 |
| `l4d_throwable_announcer.smx` | 提示谁投掷了燃烧瓶、土制炸弹等道具。 |
| `SpeakingList.smx` | 显示当前正在使用语音的玩家。 |
| `l4d_MusicMapStart.smx` | 地图开场音乐相关功能。 |
| `l4d_nightvision.smx` | 夜视仪功能。 |
| `thirdstrike_glow.smx` | 濒死发光。此前配置为只标记再倒地就死亡的状态。 |
| `punch_angle.smx` | 减少或消除生还者受伤时的屏幕晃动。 |
| `l4d2_sound_manipulation.smx` | 处理倒地次数配置引起的异常心跳音。 |
| `l4d2_wskin_menu.smx` | 提供服务器武器皮肤菜单。 |
| `l4d2_wskin_switch.smx` | 提供快捷切换武器皮肤的能力。 |
| `l4d2_wskin_rng.smx` | 按配置给武器选随机皮肤。 |
| `l4d_christmas_tree.smx` | 生成圣诞树场景道具。 |
| `lerpmonitor.smx` | 显示或监控玩家的插值时间，!lerps 可查看。 |
| `sounds.smx` | SourceMod 的基础声音命令。 |

### 管理、命令与聊天

| 插件 | 作用 |
|---|---|
| `admin-flatfile.smx` | 读取管理员、权限组和权限覆盖配置。 |
| `adminhelp.smx` | 查询可用的 SourceMod 管理命令。 |
| `adminmenu.smx` | 提供 `!admin` 管理菜单及各插件菜单入口。 |
| `antiflood.smx` | 限制频繁发送聊天内容。 |
| `basebans.smx` | 基础封禁、解封命令。 |
| `basechat.smx` | 提供管理员聊天、公告和私聊等命令。 |
| `basecomm.smx` | 静音、禁文字和相关通信管理。 |
| `basecommands.smx` | 通用服务器管理命令。 |
| `basetriggers.smx` | 处理聊天触发的基础服务器信息命令。 |
| `basevotes.smx` | SourceMod 的基础管理员投票命令。 |
| `clientprefs.smx` | 存储玩家个人插件偏好。 |
| `funcommands.smx` | 提供击飞、冻结等管理员娱乐命令。 |
| `funvotes.smx` | 提供部分娱乐类投票命令。 |
| `playercommands.smx` | 提供常用玩家管理命令，如拍打或处死。 |
| `l4d2_admins_simple.smx` | 通过管理员菜单或 `!root` 管理管理员账户。 |
| `l4d2_block_cmds.smx` | 限制指定命令，按配置拦截或处理违规调用。 |
| `l4d2_change_name.smx` | 游戏名称管理和名称修改控制。 |
| `l4d2_change_prevent.smx` | 拦截不允许的改名行为。 |
| `l4d2_say_command.smx` | 提示玩家输入了无效指令。 |
| `l4d2_player_suicide.smx` | 提供玩家自杀命令。 |
| `l4d2_abbw_msgrs.smx` | 另一套自杀功能，生还者与感染者均可使用。 |

### 修复与依赖

| 插件 | 作用 |
|---|---|
| `Charger_Collision_patch.smx` | 修复重复角色之间的牛撞碰撞问题。 |
| `Defib_Fix.smx` | 修复电击器在额外生还者等场景下的复活判定。 |
| `LMCCore.smx` | 供外观、模型和部分发光插件使用的共享库。 |
| `WeaponHandling.smx` | 为武器处理插件提供攻击、换弹等动作接口。 |
| `Witch_Target_patch.smx` | 修复女巫选择追击目标相关问题。 |
| `command_buffer.smx` | 修复命令和 ConVar 缓冲区过满的问题。 |
| `edictoverflowprevention.smx` | 避免地图实体过多达到引擎上限后崩服。 |
| `l4d2_acid_damage_fix.smx` | 修正口水伤害或覆盖范围异常。 |
| `l4d2_ellis_hunter_bandaid_fix.smx` | 修复 Ellis 遭 Hunter 扑倒时的动画异常。 |
| `l4d2_getup_fixes.smx` | 修复受控后起身、恢复动作的多种问题。 |
| `l4d2_healthbuffer_fix.smx` | 修复临时血量较大时的显示问题。 |
| `l4d2_inputkill_block.smx` | 拦截有问题的实体 Kill 输入。 |
| `l4d2_jockey_hitbox_fix.smx` | 修复 Jockey 的命中箱。 |
| `l4d2_ladder_patch.smx` | 修复梯子相关的专用服务器崩溃。 |
| `l4d2_parseline_fix.smx` | 修复 CFG 中文注释引起的解析和控制台刷屏。 |
| `l4d2_source_keyvalues.smx` | 为其他插件提供原生 KeyValues 操作接口。 |
| `l4d2_spit_spread_patch.smx` | 修复 Spitter 酸液扩散相关行为。 |
| `l4d2_transition_info_fix.smx` | 修复换章时的玩家状态传递问题。 |
| `l4d2_vocalizebasedmodel.smx` | 让角色语音匹配实际使用的模型。 |
| `l4d2_weapon_drop_glow_fix.smx` | 修复武器掉落后的高亮状态。 |
| `l4d2_witch_damage_fix.smx` | 修复高血量生还者被女巫攻击时的伤害异常。 |
| `l4d_death_weapon_respawn_fix.smx` | 修复死亡后武器重置或重生相关的问题。 |
| `l4d_fix_common_shove.smx` | 修复推不开蹲下、摔倒或刚落地的普通感染者。 |
| `l4d_fix_deathfall_cam.smx` | 修复高处摔死时的视角。 |
| `l4d_reload_fix.smx` | 修复修改最大弹匣后换弹动作异常。 |
| `l4d_revive_reload_interrupt.smx` | 修复救人和换弹互相打断时的动作异常。 |
| `l4d_tongue_float_fix.smx` | 修复 Smoker 舌头拉人时浮空异常。 |
| `lagpreventor.smx` | 针对某些三方图的异常出包或卡延迟问题提供处理。 |
| `left4dhooks.smx` | 给其他 L4D2 插件提供引擎钩子和游戏原生函数。 |
| `lfd_both_fixSG552.smx` | 修正 SG552 在不同 Tick 下的开火行为。 |
| `sourcescramble_manager.smx` | 管理 SourceScramble 的引擎内存补丁配置。 |
| `transition_restore_fix.smx` | 修复换章后恢复装备、状态时的错误。 |
| `witch_prevent_target_loss.smx` | 修复女巫追击中丢失有效目标的问题。 |

## 引擎扩展和运行依赖

| 组件 | 用途 |
|---|---|
| Metamod:Source 1.12.0-dev+1219、SourceMod 1.12.0.7220、SourcePawn JIT | 加载扩展和运行 SourceMod 插件 |
| L4DToolZ 2.4.3 | 连接槽位与引擎 Tick 解锁 |
| Stripper | 按配置调整地图实体 |
| Actions、BinHooks、CollisionHook、DHooks、SDKHooks、SDKTools、BinTools | 提供引擎函数、AI、实体及碰撞接口 |
| SourceScramble | 管理由插件应用的引擎运行时补丁 |
| ClientPrefs、SQLite、Regex、TopMenus | 玩家偏好、存储、文本匹配和菜单接口 |
| Updater、Webternet | 更新支持和 HTTP 接口 |
