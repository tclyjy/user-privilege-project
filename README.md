# 前后端分离下 用户权限管理及用户信息安全解决方案

## 核心： JsonWebToken 、 RESTful API

## 后端
> 平台：node.js  数据库：mongodb
> 框架：koa

## 前端
> 主框架 vue.js
> Ajax工具 axios
> 状态管理 vuex


## Run App

``` bash
# install dependencies
node app.js
```
## 权限表关系
用户表 —— 角色表  ———— 用户角色关联表  
角色表 —— 权限表  ———— 角色权限关联表  
用户表 —— 权限表  ———— 用户特权关联表