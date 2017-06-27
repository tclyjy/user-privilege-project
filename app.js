var Koa = require('koa');
var Router = require('koa-router');
var cors = require('kcors');
var routes = require('./routes.js');
var koaBody = require('koa-body')();

var app = new Koa();
var router = new Router();
app.use(cors());

router.post('/user/register', koaBody, routes.userRegister);
router.options('/user/register', koaBody, routes.userRegister);
router.post('/user/login', koaBody, routes.userLogin);
router.get('/checkToken', koaBody, routes.checkToken);

app.use(router.routes())
  .use(router.allowedMethods());

var server = app.listen(3000, function () {
  console.log('Koa is listening to http://localhost:3000');
});