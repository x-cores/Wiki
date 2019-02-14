# Sql Server 学习 #

---

## **策略管理** ##

类似与 Windows 操作系统的组策略功能，解决了虚拟化管理的需求。

### 组件 ###

1. 管理目标

    想要管理的实体，例如：SQL Server 实例，数据库，表和模式等。

1. 方面

    每个管理目标都有与之相关的多个属性和行为，例如：数据库的属性用来描述如排序规则、默认文件组、是否有快照和最后一次备份日期等。

1. 条件

    指定策略执行的特定条件，指定了管理方面的有效状态集合。例如：“当数据库大小超过 5G 时”，“当模式为 develop 时”等。

1. 策略

    针对预期的行为绑定到一个条件上，建立一个策略。“Against Target”（评估模式）包括：按需、更改时-禁止、更改时-仅记录和按计划。

Tips：

* 示例策略：统一的数据库和表名称、数据库页状态最佳实践、Guest 权限最佳实践、SQL Server 最大并行度最佳实践等
* msdb 库增加了 PolicyAdministratorRole 允许非 sysadmin 创建策略和条件
* SQL LIKE 通配符：%：匹配零个及多个任意字符； _：与任意单字符匹配； []：匹配一个范围； [^]：排除一个范围 ；-：连字符

## **高可用性** ##

### Always On ###

1. 在 sqlAzureIntl00 上安装 AD DS、DNS 并设置 AD 域名为 domain.com

```bash
sqlAzureIntl00 10.0.2.4
sqlAzureIntl01 10.0.2.5
sqlAzureIntl02 10.0.2.6
sqlAzureIntl03 10.0.2.7
```

1. 在 4 服务器上关闭防火墙

1. 在 sqlAzureIntl00 上安装 “File and Storage Services” 和 “iSCSI Target Server”
    * 创建 "New iSCSI Virtual Disk"，名称：sqlAzureIntlStorageDisk00 - sqlAzureIntlStorageDisk03 对应 4 块虚拟磁盘, sqlAzureIntlStorageTarget 对应 4 台服务器，sqlAzureIntl0[0-3].domain.com

1. 在 4 服务器上使用 iSCSI Initiator 连接 sqlAzureIntl00，并打开 Volumes and Devices 使用 Auto Configure 连接四块磁盘

1. 在 sqlAzureIntl00 使用 Computer Management 初始化 4 块虚拟磁盘，并格式化成为 NTFS 分区

1. 在 sqlAzureIntl01 - sqlAzureIntl03 服务器上安装 Failover Clustering

1. 在 sqlAzureIntl01 上执行 Failover Cluster Manager 并 Create Cluster，名称：sqlAzureIntlCluster，完成之后根据向导完成 Validate a Configuration Wizard
    * Error：Cluster resource 'Cluster Name' of type 'Network Name' in clustered role 'Cluster Group' failed.

    ```
    Error：Cluster resource 'Cluster Name' of type 'Network Name' in clustered role 'Cluster Group' failed. The error code was '0xcb' ('The system could not find the environment option that was entered.').
    Solution: Configure DNS and AD DS on sqlAzureIntl00
    ```

