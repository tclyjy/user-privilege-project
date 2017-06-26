const crypto = require('crypto');
const url = require('url');
const db = require('./db/model.js');
const Role = require('./role.js');
const Token = require('./token.js');

exports.userRegister = function (ctx, next) {
  return new Promise(function (resolve, reject) { // 这行非常关键，文档没有，异步数据必须创建Promise否则 ctx.body无法挂载

    // 获取post请求传递过来的数据
    let body = ctx.request.body;

    // 将userName，passWord进行md5加密
    let userName = crypto.createHash('md5').update(body.userName).digest('hex');
    let passWord = crypto.createHash('md5').update(body.userPwd).digest('hex');

    // 数据库查找是否用户名重合
    db.find('userInfo', {
      'userName': userName
    }).then(function (result) {
      if (result.length > 0) {
        var response = {
          'code': '0',
          'msg': '用户名已存在'
        }
        ctx.body = response;
        resolve(next());
      } else {
        db.insert('userInfo', {
          'userName': userName,
          'userPwd': passWord,
          registerTime: Date()
        }).then(function (result) {

          // 默认绑定普通用户角色
          Role.setUserRole(result.insertedId, 'consumer').then(function () {
            var response = {
              'code': '1',
              'msg': '注册成功',
              'role': 'consumer'
            }
            ctx.body = response;
            resolve(next());
          })
        })
      }
    })
  })
}

exports.userLogin = function (ctx, next) {
  return new Promise(function (resolve, reject) {
    let body = ctx.request.body;
    console.log(ctx.request.header.authorization);
    let userName = body.userName;
    let passWord = body.userPwd;
    db.find('userInfo', {
      'userName': userName
    }).then(function (result) {
      if (result.length == 1) {
        console.log(result[0].loginTime);
        if (result[0].userPwd === passWord) {
          db.update('userInfo', {
            'userName': userName
          }, {
            'loginTime': Date()
          }).then(function () {
            // 获取Token
            Token.getToken(result[0]._id, userName).then(function (result) {

              // 获取该用户角色
              Token.checkToken(result).then(function (code) {
                console.log(code);
                let response = {
                  'code': '1',
                  'msg': '验证成功',
                  'role': code.role,
                  'token': result
                }
                ctx.body = response;
                resolve(next());
              })
            })
          })
        } else {
          var response = {
            'code': '0',
            'msg': '您输入的用户名、密码有误'
          }
          ctx.body = response;
          resolve(next());
        }
      } else {
        var response = {
          'code': '0',
          'msg': '您输入的用户名、密码有误'
        }
        ctx.body = response;
        resolve(next());
      }
    })
  })
}

exports.testToken = function (ctx, next) {
  var data = url.parse(ctx.request.url, true).query;

  Token.checkToken(data.token).then(function (code) {
    console.log(code);

    if (code.code === '0') {
      let response = {
        'code': '0',
        'msg': 'token已过期'
      }
      ctx.body = response;
    } else {
      let response = {
        'code': '1',
        'msg': '验证成功',
        'data': code
      }
      ctx.body = response;
    }
  })
}