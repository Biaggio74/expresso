const express = require('express');
const apiRouter = express.Router();

const employeesRouter = require('./employees.js');
const menuRouter = require('./menus.js');

apiRouter.use('/employees', employeesRouter);
apiRouter.use('/menus', menuRouter);


module.exports = apiRouter;
