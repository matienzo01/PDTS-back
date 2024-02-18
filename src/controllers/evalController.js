const service = require('../services/evalService')

const getNextEval = async (req, res) => {
  const { params: { id_proyecto } } = req 
  const id_evaluador = 1

  try {
    const data = await service.getNextEval(id_proyecto, id_evaluador)
    const { tipo, ...webform } = data
    res.status(200).json({ id_proyecto, type: tipo, webform })
  } catch (_error) {
    const statusCode = _error.status || 500
    res.status(statusCode).json({ error: _error.message})
  }
}

const postEval = async (req, res) => {
  const { respuestas, id_proyecto } = req.body
  const id_evaluador = 1
  try {
    res.status(201).json(await service.postEval(id_proyecto, id_evaluador, respuestas))
  } catch (_error) {
    const statusCode = _error.status || 500
    res.status(statusCode).json({ error: _error.message})
  }
}

const getUserEvaluationAnswers = async (req,res) => {
  const { params: { id_proyecto } } = req
  const id_evaluador = 1
 
  if (isNaN(id_evaluador)) {
    res.status(400).json({ error: "Parameter ':id_evaluador' should be a number"})
    return ;
  }

  if (isNaN(id_proyecto)) {
    res.status(400).json({ error: "Parameter ':id_proyecto' should be a number"})
    return ;
  }

  try {
    res.status(200).json(await service.getUserEvaluationAnswers(id_proyecto,id_evaluador))
  } catch(error) {
    const statusCode = error.status || 500
    res.status(statusCode).json({error: error.message})
  }
  
}

module.exports = {
  getNextEval,
  postEval,
  getUserEvaluationAnswers
}