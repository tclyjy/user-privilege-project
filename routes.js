const crypto = require('crypto');
const url = require('url');
const db = require('./db/model.js');
const Role = require('./role.js');
const Token = require('./token.js');
const Privileges = require('./privilege.js');
const co = require('co');
const mongoose = require('mongoose');

exports.userRegister = function (ctx, next) {

  return co(function* () {
    // 获取post请求传递过来的数据
    let body = ctx.request.body;
    // 将userName，passWord进行md5加密
    let userName = crypto.createHash('md5').update(body.userName).digest('hex');
    let passWord = crypto.createHash('md5').update(body.userPwd).digest('hex');

    // 数据库查找是否用户名重合
    let result = yield db.find('userInfo', {
      'userName': userName
    })

    if (result.length > 0) {
      let response = {
        'code': '0',
        'msg': '用户名已存在'
      }
      ctx.body = response;
    } else {
      let result = yield db.insert('userInfo', {
        'userName': userName,
        'userPwd': passWord,
        registerTime: Date()
      })

      // 默认绑定普通用户角色
      yield Role.setUserRole(result.insertedId, 'consumer');

      let response = {
        'code': '1',
        'msg': '注册成功',
        'role': 'consumer'
      }
      ctx.body = response;
    }
  })
}

exports.userLogin = function (ctx, next) {
  return co(function* () {
    let body = ctx.request.body;

    let userName = body.userName;
    let passWord = body.userPwd;
    let result = yield db.find('userInfo', {
      'userName': userName
    });
    if (result.length == 1) {
      if (result[0].userPwd === passWord) {
        yield db.update('userInfo', {
          'userName': userName
        }, {
          'loginTime': Date()
        })
        let tokenResult = yield Token.getToken(result[0]._id);
        let code = yield Token.checkToken(tokenResult);
        let privileges = yield Privileges.findPrivileges(code.roleId, code.userId);
        let response = {
          'code': '1',
          'msg': '验证成功',
          'role': code.role,
          'privileges': privileges,
          'token': tokenResult,
          'tokenExp': code.exp
        };
        ctx.body = response;
      };
    } else {
      var response = {
        'code': '0',
        'msg': '您输入的用户名、密码有误'
      };
      ctx.body = response;
    };
  });
};
exports.userLogout = function (ctx, next) {
  return co(function* () {
    console.log('getToken' + ctx.request.header.authorization);
    yield db.insert('logoutToken', {
      'createdAt': new Date(),
      'token': ctx.request.header.authorization
    })
    var a = yield db.expire('logoutToken', 60)
    console.log(a);

    ctx.body = '成功';
  });
}
exports.checkToken = function (ctx, next) {
  return co(function* () {
    let data = url.parse(ctx.request.url, true).query;
    let code = yield Token.checkToken(data.token);
    if (code.code === '0') {
      let response = {
        'code': '0',
        'msg': 'token已过期'
      };
      ctx.body = response;
    } else {
      let privileges = yield Privileges.findPrivileges(code.roleId, code.userId);
      let response = {
        'code': '1',
        'msg': '验证成功',
        'role': code.role,
        'privileges': privileges
      };
      ctx.body = response;
      return
    };
  });
};

exports.getPrivilege = function (ctx, next) {
  return co(function* () {

    let data = url.parse(ctx.request.url, true).query;

    let response = yield checkToken(data.token);

    if (response === '0') {
      let response = {
        'code': '0',
        'msg': 'token已过期'
      };
      ctx.body = response;
    } else if (response === '2') {
      let response = {
        'code': '3',
        'msg': '该账户不具备该功能权限'
      };
      ctx.body = response;
    } else {
      let privileges = yield Privileges.getPrivileges();
      let response = {
        'code': '1',
        'msg': '验证成功',
        'privileges': privileges
      };
      ctx.body = response;
    };
  });
};

exports.getUserList = function (ctx, next) {
  return co(function* () {
    let code = yield Token.checkToken(ctx.request.header.authorization);
    console.log(code);
    let result = yield db.find('userForPrivilege', {
      'userId': code.userId
    })
    let privilege = result.privileges

    if (code.role === 'superAdmin' || code.role === 'admin' || privilege.indexOf(ObjectId('5951fba066b349068ecc23fd')) >= 0) {
      let result = yield db.find('userInfo', {})
      for (let i = 0; i < result.length; i++) {
        let userObjectId = mongoose.Types.ObjectId(result[i]._id);
        delete result[0].userName
        delete result[0].userPwd
        let userForRole = yield db.find('userForRole', {
          'userId': userObjectId
        })
        let role = yield db.find('role', {
          _id: userForRole[0].roleId
        })
        result[i].role = role[0].name
      }
      ctx.body = result;
    }
  })
}


/* 封装的方法 */
function contains(arr, name) {
  var i = arr.length;
  while (i--) {
    if (arr[i].name === name) {
      return true;
    }
  }
  return false;
}

function checkToken(token) {
  return co(function* () {
    let code = yield Token.checkToken(token);
    if (code.code === '0') {
      let response = '0';
      return response;
    } else {
      // 获取权限
      let privileges = yield Privileges.findPrivileges(code.roleId, code.userId).then(function (privileges) {

        if (contains(privileges, 'USER_CONTROL_READ')) {
          let response = '1';
          return response;
        } else {
          let response = '2';
          return response;
        }
      });
    }
  })
}