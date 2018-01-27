const express = require('express');
const app = express();
const db = require('./../migration.js');
const menuRouter = express.Router({mergeParams: true});
const menuitemsRouter = require('./menuitems.js')

menuRouter.param('menuId', (req, res, next, id) => {
  db.get(`SELECT * FROM Menu WHERE id = ${id}`, (error, menu) => {
    if (error) {
      res.sendStatus(500);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menuRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Menu`, (error, menus) => {
    if (error) {
      res.sendStatus(500);
    } else {
      res.status(200).send({menus: menus});
    }
  });
});

menuRouter.get('/:menuId', (req, res, next) => {
  res.status(200).send({menu: req.menu})
})

menuRouter.post('/', (req, res, next) => {
  if (!req.body.menu.title || !req.body){
    res.sendStatus(400);
  }
  const sql = `INSERT INTO Menu (title) VALUES ($title)`;
  const data = {
    $title: req.body.menu.title
  };
  db.run(sql, data, function(error) {
    if (error) {
      res.sendStatus(500);
    } else {
      db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, menu) => {
        if (menu) {
          res.status(201).send({menu: menu});
        }
      })
    }
  });
});

menuRouter.put('/:menuId', (req, res, next) => {
  if (!req.body.menu.title || !req.menu.id){
    res.sendStatus(400)
  }
  const id = req.menu.id
  const sql = `UPDATE Menu SET title = $title WHERE id = ${id}`;
  const data = {
    $title: req.body.menu.title
  };
  db.run(sql, data, (error, menu) => {
    if (error) {
      res.sendStatus(500);
    } else {
      db.get(`SELECT * FROM Menu WHERE id = ${id}`, (err, menu) => {
        if (menu) {
          res.status(200).send({menu: menu});
        } else {
          res.sendStatus(404);
        }
      })
    }
  });
});

const countingMiddlWare = (req, res, next) => {
  let itemCounts;
  db.get(`SELECT COUNT(*) FROM menuItem WHERE menu_id = $id `, {$id: req.params.id }, (err,res) => {
    if (err) {
      next(err);
    } else {
      itemCounts = res['COUNT(*)'];
      req.body.count = itemCounts;
      next();
    }
  })
};

menuRouter.delete('/:menuId', countingMiddlWare, (req, res, next) => {
  const id = req.menu.id;
  const sql = `DELETE FROM Menu WHERE id = ${id}`;
  if (req.body.count === 0) {
    db.run(sql, (error) => {
      if (error) {
        res.sendStatus(500)
      } else {
        res.status(204).send();
      }
    })
  } else {
    res.sendStatus(400);
  }
})

menuRouter.use('/:menuId/menu-items', menuitemsRouter)

module.exports = menuRouter;
