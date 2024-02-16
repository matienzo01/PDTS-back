const service = require('../services/evalService')

const getNextEval = async (req, res) => {
  const { id_proyecto } = req.query
  const id_evaluador = 1

  try {
    const data = await service.getNextEval(id_proyecto, id_evaluador)
    const { tipo, ...webform } = data
    res.status(200).json({ id_proyecto, type: tipo, webform })
  } catch (error) {
    console.error('Error al obtener la evaluacion', error)
    res.status(500).json({ error: `Error al obtener la evaluacion del evaluador con id: ${id_evaluador} para el proyecto con id: ${id_proyecto}` })
  }
}

const postEval = async (req, res) => {
  const { respuestas, id_proyecto } = req.body
  const id_evaluador = 1
  try {
    res.status(200).json(await service.postEval(id_proyecto, id_evaluador, respuestas))
  } catch (error) {
    console.error('Error al insertar las respuetas', error)
    res.status(500).json({ error: `Error ` })
  }
}

module.exports = {
  getNextEval,
  postEval
}