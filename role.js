const db = require('./db/model.js');
const co = require('co');

exports.findUserRole = function (userId) {
  return co(function* () {
    var result = yield db.find('userForRole', {
      'userId': userId
    })
    var role = yield db.find('role', {
      '_id': result[0].roleId
    })
    return yield Promise.resolve(role);
  })
}

exports.setUserRole = function (userId, roleName) {
  return co(function* () {
    var role = yield db.find('role', {
      'name': roleName
    })

    var result = yield db.insert('userForRole', {
      'userId': userId,
      'roleId': role[0]._id
    })

    return yield Promise.resolve(result);
  })
}