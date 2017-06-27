const db = require('./db/model.js');
const co = require('co');
const _ = require('lodash');
var mongoose = require('mongoose');

exports.findPrivileges = function (roleId, userId) {
  return co(function* () {
    let roleObjectId = mongoose.Types.ObjectId(roleId);
    let userObjectId = mongoose.Types.ObjectId(userId);
    let resultForRole = yield db.find('privilegeForRole', {
      'roleId': roleObjectId
    })
    let privileges = resultForRole[0].privileges

    let resultForUser = yield db.find('userForPrivilege', {
      'userId': userObjectId
    })

    if (resultForUser.length !== 0) {
      privileges = _.concat(privileges, resultForUser[0].privileges)
    }

    let result = yield db.find('privilege', {
      '_id': {
        $in: privileges
      }
    })

    return yield Promise.resolve(result);
  })
}