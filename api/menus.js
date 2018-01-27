const express = require('express');
const app = express();
const db = require('./../migration.js');
const menuRouter = express.Router({mergeParams: true});

menuRouter.param('id', (req, res, next, id) => {
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

menuRouter.get('/:id', (req, res, next) => {
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

menuRouter.put('/:id', (req, res, next) => {
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

const goldMedalNumber = country => {
    return `SELECT COUNT(*)
    AS count
    FROM GoldMedal
    WHERE country = '${country}';`;
};

menuRouter.delete('/:id', (req, res, next) => {
  const id = req.menu.id;
  const sql = `DELETE FROM Menu WHERE id = ${id}`;
  const countingItems = () => {
    db.get(`SELECT COUNT(*) FROM MenuItem WHERE menu_id = $id `, {$id: req.menu.id } ,(err,res) => {
      if (err){
        return 500;
      } else {
        return res;
      }
    });
  }
  console.log(countingItems());
  if ( countingItems() === 0 ) {
    db.run(sql, (error, menu) => {
      if (error){
        res.sendStatus(500);
      } else {
        res.status(204).send('Menu has been deleted');
      }
    })
  } else {
    res.sendStatus(400)
  }

})








module.exports = menuRouter;
