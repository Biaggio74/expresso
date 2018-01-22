const express = require('express');
const app = express();
const db = require('./../migration.js');
const timesheetRouter = express.Router({mergeParams: true});

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
  if (!req.body.timesheet.hours || !req.body.timesheet.rate || !req.body.timesheet.date || !req.params.id) {
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
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`, (err,timesheet) => {
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
  const timesheetId = req.params.timesheetId;
  const sql = `UPDATE Timesheet
    SET
      hours = $hours,
      rate = $rate,
      date = $date
    WHERE Timesheet.id = ${timesheetId} `;
  const data = {
    $hours: req.body.timesheet.hours,
    $rate: req.body.timesheet.rate,
    $date: req.body.timesheet.date
  };
  db.run(sql, data, (error) => {
    if (error) {
      res.status(500).send();
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${timesheetId}`, (err, newSheet) => {
        if (err) {
          res.status(500).send();
        } else if (newSheet && newSheet.id){
          res.status(200).send({timesheet: newSheet});
        } else {
          res.status(404).send();
        }
      })
    }
  })
});








module.exports = timesheetRouter;
