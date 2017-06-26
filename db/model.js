var MongoClient = require('mongodb').MongoClient,
  co = require('co');
test = require('assert');


/**
 * 插入
 */
exports.insert = function (collection, option) {
  return co(function* () {
    var db = yield MongoClient.connect('mongodb://111.230.129.242:27017/user');

    var adminDb = db.admin();

    var result = yield adminDb.authenticate('root', 'yjy920605');
    test.ok(result);

    var Collection = db.collection(collection);
    var docs = yield Collection.insertOne(option);
    db.close();
    return yield Promise.resolve(docs);
  });
}
/**
 * 查找
 */
exports.find = function (collection, option) {
  return co(function* () {
    var db = yield MongoClient.connect('mongodb://111.230.129.242:27017/user');

    var adminDb = db.admin();

    var result = yield adminDb.authenticate('root', 'yjy920605');
    test.ok(result);

    var Collection = db.collection(collection);

    var docs = yield Collection.find(option).toArray();

    db.close();

    return yield Promise.resolve(docs);
  });
}
/**
 * 更新
 */
exports.update = function (collection, option, set) {
  return co(function* () {
    var db = yield MongoClient.connect('mongodb://111.230.129.242:27017/user');

    var adminDb = db.admin();

    var result = yield adminDb.authenticate('root', 'yjy920605');
    test.ok(result);

    var Collection = db.collection(collection);

    var docs = yield Collection.updateMany(option, {
      $set: set
    });

    db.close();

    return yield Promise.resolve(docs);
  });
}