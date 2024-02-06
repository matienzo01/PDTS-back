const servicio = require('../services/servicio_evaluacion')

const getEvaluacion = async (req, res) => {
  const { id_proyecto } = req.query
  const id_evaluador = 1

  try {
    const evaluacion = await servicio.getEvaluacion(id_proyecto, id_evaluador)
    res.status(200).json({ id_proyecto, ...evaluacion })
  } catch {
    console.error('Error al obtener la evaluacion', error)
    res.status(500).json({ error: `Error al obtener la evaluacion del evaluador con id: ${id_evaluador} para el proyecto con id: ${id_proyecto}` })
  }
}

const postEvaluacion = async (req, res) => {
  const { respuestas, id_proyecto } = req.body
  const id_evaluador = 1
  try {
    res.status(200).json(await servicio.postEvaluacion(id_proyecto, id_evaluador, respuestas))
  } catch {
    console.error('Error al insertar las respuetas', error)
    res.status(500).json({ error: `Error ` })
  }
}

module.exports = {
  getEvaluacion,
  postEvaluacion
}