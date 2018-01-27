const express = require('express');
const menuitemsRouter = express.Router({mergeParams: true});
const app = express();
const db = require('./../migration.js')

menuitemsRouter.param('menuItemId', (req, res, next, id) => {
  db.get(`SELECT * FROM MenuItem WHERE id = ${id}`, (error, menuitem) => {
    if (error){
      next(error);
    } else if (menuitem) {
      req.menuitem = menuitem;
      next();
    } else {
      res.sendStatus(404);
    }
  })
})


menuitemsRouter.get('/', (req, res, next) => {
  const menuId = req.params.id;
  if (req.menu) {
    db.all(`SELECT * FROM MenuItem WHERE MenuItem.menu_id = ${menuId}`, (error, menuitems) => {
      if (error) {
        next(error);
      } else if (menuitems){
        res.status(200).send({menuItems: menuitems})
      } else {
        next(error);
      }
    })
  } else {
    res.sendStatus(404)
  }
});

menuitemsRouter.get('/:menuItemId', (req, res, next) => {
  res.status(200).send({menuItem: req.menuitem})
})

menuitemsRouter.post('/', (req, res, next) => {
  console.log(req.menu.id)
  if (!req.body.menuItem.name || !req.body.menuItem.description || !req.body.menuItem.inventory || !req.body.menuItem.price || !req.body.menuItem.menu_id) {
    res.sendStatus(400);
  }
  const sql = `INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES
  ($name, $description, $inventory, $price, $menu_id)`;
  const data = {
    $name: req.body.menuItem.name,
    $description: req.body.menuItem.description,
    $inventory: req.body.menuItem.inventory,
    $price: req.body.menuItem.price,
    $menu_id: req.body.menuItem.menuId
  };
  db.run(sql, data, function(error) {
    if (error){
      res.sendStatus(500);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE menuItem.id = ${this.lastID}`, (err, newitem) => {
        if (err){
          res.sendStatus(500);
        } else if (newitem){
          res.send(201).send({menuItem: newitem})
        } else {
          res.sendStatus(404);
        }
      })
    }
  })
})









module.exports = menuitemsRouter;
