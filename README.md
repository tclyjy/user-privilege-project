# 用户权限管理解决方案

> 平台：node.js  数据库：mongodb
> 框架：koa

## Run App

``` bash
# install dependencies
node app.js
```
## 权限表关系
用户表 —— 角色表  ———— 用户角色关联表  
角色表 —— 权限表  ———— 角色权限关联表  
用户表 —— 权限表  ———— 用户特权关联表