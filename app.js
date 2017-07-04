const https = require('https');
const fs = require('fs');
var Koa = require('koa');
var Router = require('koa-router');
var cors = require('kcors');
var routes = require('./routes.js');
var koaBody = require('koa-body')();
var enforceHttps = require('koa-sslify');

var app = new Koa();
var router = new Router();
app.use(enforceHttps());
app.use(cors());

const options = {
  key: fs.readFileSync('./ssl/2_www.yuanjiayi.wang.key'),
  cert: fs.readFileSync('./ssl/1_www.yuanjiayi.wang_bundle.crt')
};

router.post('/user/register', koaBody, routes.userRegister);
router.options('/user/register', koaBody, routes.userRegister);
router.post('/user/login', koaBody, routes.userLogin);
router.get('/user/logout', koaBody, routes.userLogout)
router.get('/checkToken', koaBody, routes.checkToken);
router.get('/getPrivilege', koaBody, routes.getPrivilege);
router.get('/getUserList', koaBody, routes.getUserList);

app.use(router.routes())
  .use(router.allowedMethods());


// http.createServer(app.callback()).listen(80);
https.createServer(options, app.callback()).listen(3000);

// var server = app.listen(3000, function () {
//   console.log('Koa is listening to http://localhost:3000');
// });