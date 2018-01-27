const express = require('express');
const app = express();
const db = require('./../migration.js');
const timesheetRouter = express.Router({mergeParams: true});

timesheetRouter.param('timesheetId', (req, res, next, id) => {
  db.get(`SELECT * FROM Timesheet WHERE id = ${id}`, (error, result) => {
    if (error) {
      next(error);
    } else if (result) {
      req.timesheet = result;
      next();
    } else {
      res.status(404).send();
    }
  })
});

timesheetRouter.get('/', (req, res, next) => {
  const employeeId = req.params.id;
  db.all(`SELECT * FROM Timesheet WHERE Timesheet.employee_id = ${employeeId}`, (error, timesheets) => {
    if (error){
      res.status(500).send();
    } else {
      res.status(200).send({timesheets: timesheets});
    }
  });
});

timesheetRouter.post('/', (req, res, next) => {
  if (!req.body.timesheet.hours || !req.body.timesheet.rate || !req.body.timesheet.date) {
    res.status(400).send();
  }
  const employeeId = req.params.id;
  const sql = `INSERT INTO Timesheet (hours, rate, date, employee_id)
    VALUES ($hours, $rate, $date, $employee_id)`;
  const data = {
    $hours: req.body.timesheet.hours,
    $rate: req.body.timesheet.rate,
    $date: req.body.timesheet.date,
    $employee_id: employeeId
  };
  db.run(sql, data, function(error) {
    if (error) {
      res.status(500).send();
    } else {
      db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (err,timesheet) => {
        if (err) {
          res.status(500).send();
        } else {
          res.status(201).send({timesheet: timesheet});
        }
      })
    }
  })
});

timesheetRouter.put('/:timesheetId', (req, res, next) => {
  if (!req.body.timesheet.hours || !req.body.timesheet.rate || !req.body.timesheet.date) {
    res.status(400).send();
  }
  const sql = `UPDATE Timesheet
    SET
      hours = $hours,
      rate = $rate,
      date = $date
    WHERE id = $timesheetId `;
  const data = {
    $hours: req.body.timesheet.hours,
    $rate: req.body.timesheet.rate,
    $date: req.body.timesheet.date,
    $timesheetId: req.timesheet.id
  };
  db.run(sql, data, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE id = ${req.timesheet.id}`, (err, timesheet) => {
        res.status(200).send({timesheet: timesheet})
      })
    }
  })
});

timesheetRouter.delete('/:timesheetId', (req, res, next) => {
  const id = req.timesheet.id;
  const sql = `DELETE FROM Timesheet WHERE id = ${id}`;
  db.run(sql, (error) => {
    if (error) {
      res.sendStatus(500);
    } else {
      res.status(204).send('Timesheet has been deleted!');
    }
  })
})









module.exports = timesheetRouter;
