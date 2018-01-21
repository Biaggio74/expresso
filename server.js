const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRouter = require('./api/api.js');

app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 4000;

app.use('/api', apiRouter);


app.listen(PORT, () => {
  console.log('Server listen on port ' + PORT);
});


module.exports = app;
