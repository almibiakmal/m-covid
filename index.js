
const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, ".env")});
const app = express();
const port = process.env.PORT;

const routers = require('./src/routers');   //import all routers

//Middelware
app.use(express.urlencoded());
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'public')));
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'src/views'));

//Make group endpoint
app.use('/dashboard', routers.dashboard);
app.use('/pasien', routers.pasien);
app.use('/report', routers.report);

//root endpoint
app.get('/', (req, res, next) => res.redirect('/dashboard'));

//Start server
app.listen(port, () => console.log(`Server running in port ${port}`));