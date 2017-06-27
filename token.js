const jwt = require("jsonwebtoken");
const co = require('co');
const Role = require('./role.js');
const Privileges = require('./privilege.js');

exports.getToken = function (userId) {
  return co(function* () {
    // 获得 角色信息
    var role = yield Role.findUserRole(userId);
    // 获得 角色权限信息
    // var privileges = yield Privileges.findPrivileges(role[0]._id, userId);

    let content = {
      userId: userId,
      roleId: role[0]._id,
      role: role[0].name
    } // 要生成token的主题信息

    let secretOrPrivateKey = "zhkj-secret" // 这是加密的key（密钥） 
    let token = jwt.sign(content, secretOrPrivateKey, {
      algorithm: 'HS256', // HS256加密编码
      expiresIn: 60 * 5 //60 * 60 * 24 // 24小时过期
    })

    return yield Promise.resolve(token);
  });
}

exports.checkToken = function (token) {
  return co(function* () {
    let secretOrPrivateKey = "zhkj-secret";

    try {

      var result = jwt.verify(token, secretOrPrivateKey);
      let msg = Object.assign({
        code: '1'
      }, result);

      return yield Promise.resolve(msg);

    } catch (err) {

      let msg = {
        code: '0',
        msg: 'token已过期'
      }

      return yield Promise.resolve(msg);
    }
  });
}