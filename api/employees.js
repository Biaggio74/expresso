const express = require('express');
const employeesRouter = express.Router();
const timesheetRouter = require('./timesheets.js')
//const sqlite3 = require('sqlite3');
//const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite3');
const db = require('./../migration.js');

employeesRouter.param('id', (req, res, next, id) => {
  db.get(`SELECT * FROM Employee WHERE id = ${id}`, (error, employee) => {
    if (error) {
      next(error);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.status(404).send();
    }
  })
})

employeesRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Employee WHERE is_current_employee = 1`, (error, employees) => {
    if (error){
      res.status(500).send('Internal server error');
    } else if (employees) {
      res.status(200).send({employees: employees});
    } else {
      res.status(404).send();
    }
  });
});

employeesRouter.get('/:id', (req, res, next) => {
  res.status(200).send({employee: req.employee});
});

employeesRouter.post('/', (req, res, next) => {
  if (!req.body.employee.name || !req.body.employee.position || !req.body.employee.wage){
    res.status(400).send('Invalid employee');
  }
  const sql = `INSERT INTO Employee (name, position, wage)
  VALUES ($name, $position, $wage)`;
  const data = {
    $name: req.body.employee.name,
    $position: req.body.employee.position,
    $wage: req.body.employee.wage
  };
  db.run(sql, data, function(error) {
    if (error){
      res.status(500).send();
    } else  {
      db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err,employee) => {
        if (err){
          res.status(500).send();
        } else {
          res.status(201).send({employee: employee})
        }
      })
    }
  });
});

employeesRouter.put('/:id', (req, res, next) => {
  if (!req.body.employee.name || !req.body.employee.position || !req.body.employee.wage){
    res.status(400).send('Invalid employee');
  }
  const sql = `UPDATE Employee
  SET
    name = $name,
    position = $position,
    wage = $wage
  WHERE id = ${req.params.id}`;
  const data = {
    $name: req.body.employee.name,
    $position: req.body.employee.position,
    $wage: req.body.employee.wage
  };
  db.run(sql, data, (error) => {
    if (error){
      res.status(500).send();
    } else {
      db.get(`SELECT * FROM Employee WHERE id = ${req.employee.id}`,(err,row) => {

        res.status(200).send({employee: row});

      });
    }
  }); //END of db.run
});

employeesRouter.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  const sql = `UPDATE Employee
    SET is_current_employee = 0
    WHERE Employee.id = ${id} `;
  db.run(sql, (err) => {
    if (err){
      res.status(500).send();
    } else {
      db.get(`SELECT * FROM Employee WHERE id = ${req.employee.id}`, (err, employee) => {
        if (err){
          res.status(500).send();
        } else {
          res.status(200).send({employee: employee});
        }
      })
    }
  })
})

employeesRouter.use('/:id/timesheets', timesheetRouter);

module.exports = employeesRouter;
