const express = require('express');
const menuitemsRouter = express.Router({mergeParams: true});
const app = express();
const db = require('./../migration.js')

menuitemsRouter.param('menuItemId', (req, res, next, id) => {
  db.get(`SELECT * FROM MenuItem WHERE id = ${id}`, (error, menuitem) => {
    if (error){
      res.sendStatus(500);
    } else if (menuitem) {
      req.menuItem = menuitem;
      next();
    } else {
      res.sendStatus(404);
    }
  })
})


menuitemsRouter.get('/', (req, res, next) => {
  const menuId = req.params.menuId;
  db.all(`SELECT * FROM MenuItem WHERE MenuItem.menu_id = ${menuId}`, (error, menuitems) => {
    if (error) {
      next(error);
    } else if (menuitems){
      res.status(200).send({menuItems: menuitems})
    } else {
      res.sendStatus(404);
    }
  })
});

menuitemsRouter.get('/:menuItemId', (req, res, next) => {
  res.status(200).send({menuItem: req.menuItem})
})

menuitemsRouter.post('/', (req, res, next) => {
  if (!req.body.menuItem.name || !req.body.menuItem.description || !req.body.menuItem.inventory || !req.body.menuItem.price || !req.params.menuId) {
    res.sendStatus(400);
  }
  const sql = `INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES
  ($name, $description, $inventory, $price, $menu_id)`;
  const data = {
    $name: req.body.menuItem.name,
    $description: req.body.menuItem.description,
    $inventory: req.body.menuItem.inventory,
    $price: req.body.menuItem.price,
    $menu_id: req.params.menuId
  };
  db.run(sql, data, function(error) {
    if (error){
      res.sendStatus(500);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, newitem) => {
        if (err){
          res.sendStatus(500);
        } else if (newitem){
          res.status(201).send({menuItem: newitem})
        } else {
          next(err);
        }
      })
    }
  });
});

menuitemsRouter.put('/:menuItemId', (req, res, next) => {
  if (!req.body.menuItem.name || !req.body.menuItem.description || !req.body.menuItem.inventory || !req.body.menuItem.price) {
    res.sendStatus(400);
  }
  const sql = `UPDATE MenuItem
    SET
      name = $name,
      description = $description,
      inventory = $inventory,
      price = $price
    WHERE id = $menuItemId`;
  const data = {
    $name: req.body.menuItem.name,
    $description: req.body.menuItem.description,
    $inventory: req.body.menuItem.inventory,
    $price: req.body.menuItem.price,
    $menuItemId: req.params.menuItemId
  };
  db.run(sql, data, (error, updateItem) => {
    if (error) {
      res.sendStatus(500)
    } else {
      db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`, (err, newItem) => {
        if (err) {
          res.sendStatus(500);
        } else {
          res.status(200).send({menuItem: newItem})
        }
      })
    }
  });
});

menuitemsRouter.delete('/:menuItemId', (req, res, next) => {
  const sql = `DELETE FROM MenuItem WHERE id = ${req.params.menuItemId}`;
  db.run(sql, (error) => {
    if (error){
      res.sendStatus(500);
    } else {
      res.sendStatus(204)
    }
  });
});


module.exports = menuitemsRouter;
