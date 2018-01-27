const express = require('express');
const menuitemsRouter = express.Router({mergeParams: true});
const app = express();
const db = require('./../migration.js')

menuitemsRouter.param('menuItemId', (req, res, next, id) => {
  db.get(`SELECT * FROM menuItem WHERE id = ${id}`, (error, menuitem) => {
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
  const menuId = req.params.menuId;
  db.all(`SELECT * FROM menuItem WHERE menuItem.menu_id = ${menuId}`, (error, menuitems) => {
    if (error) {
      next(error);
    } else if (menuitems){
      res.status(200).send({menuItems: menuitems})
    } else {
      next(error);
    }
  })
});

menuitemsRouter.post('/', (req, res, next) => {
  console.log(req.params.menuId)
  if (!req.body.menuItem.name || !req.body.menuItem.description || !req.body.menuItem.inventory || !req.body.menuItem.price || !req.params.menuId) {
    res.sendStatus(400);
  }
  const sql = `INSERT INTO menuItem (name, description, inventory, price) VALUES
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
      db.get(`SELECT * FROM menuItem WHERE id = ${this.lastID}`, (err, newitem) => {
        if (err){
          res.sendStatus(500);
        } else {
          res.send(201).send({menuItem: newitem})
        }
      })
    }
  })
})









module.exports = menuitemsRouter;
