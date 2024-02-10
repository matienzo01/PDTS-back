const express = require('express');
const database = require('./database/database.js')
const routerDimensions = require('./routes/dimensionRoutes.js')
const routerEval = require('./routes/evalRoutes.js')
const routerInst = require('./routes/institutionRoutes.js')
const routerIndicators = require('./routes/indicatorRoutes.js')
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json())
app.use(cors())
app.use('/api/dimensiones', routerDimensions)
app.use('/api/evaluacion', routerEval)
app.use('/api/instituciones', routerInst)
app.use('/api/indicadores',routerIndicators)

app.listen(PORT, () => {
  database.connect_BD()
  console.log('funciona el server')
})
