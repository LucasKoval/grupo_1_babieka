//----------* GLOBAL REQUIRE'S *----------//
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const express = require('express');
const session = require('express-session');
const logger = require('morgan');
const path = require('path');
const methodOverride =  require('method-override')

//----------* MIDDLEWARES REQUIRE *----------//
const setLocals = require('./middlewares/setLocals');
const setAutoLog = require('./middlewares/setAutoLog');

//----------* EXPRESS() *----------//
const app = express();

//----------* MIDDLEWARES *----------//
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(express.json());
app.use(session({
  secret: 'Babieka',
  resave: true,
  saveUninitialized: true
}));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(setAutoLog);
app.use(setLocals);

//----------* VIEW ENGINE SETUP *----------//
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//----------* ROUTES REQUIRE *----------//
const mainRouter = require('./routes/main');
const usersRouter = require('./routes/users');
const productRouter = require('./routes/products');

//----------* ROUTES USE() *----------//
app.use('/', mainRouter);                //-> Home y rutas globales
app.use('/usuario', usersRouter);        //-> Rutas de Usuarios
app.use('/producto', productRouter);     //-> Rutas de Productos


//----------* CATCH 404 *----------//
app.use((req, res, next) => next(createError(404)));

//----------* ERROR HANDLER *----------//
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.path = req.path;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//----------* EXPORTS APP *----------//
module.exports = app;