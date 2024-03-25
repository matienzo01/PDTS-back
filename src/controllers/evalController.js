const service = require('../services/evalService')
const pdfService = require('../services/pdfService')

const generatePDF = async (req, res) => {
  const { params: { id_proyecto } } = req
  const { id_usuario } = req.body
  try {
    const pdfBuffer = await pdfService.generatePDF(id_proyecto, id_usuario);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
    res.send(pdfBuffer); 
  } catch (error) {
    const statusCode = error.status || 500
    res.status(statusCode).json({ error: error.message })
  }
};

function validateNumberParameter(res, id_proyecto, id_usuario) { 
  if (isNaN(id_proyecto)) {
    return res.status(400).json({ error: `Parameter id_proyecto should be a number` });
  }
  if (isNaN(id_usuario)) {
    return res.status(400).json({ error: `Parameter id_usuario should be a number` });
  }
}

const getEntidad = async(req, res) => {
  const { params: { id_proyecto } } = req
  const { id_usuario, rol } = req.body

  validateNumberParameter(res, id_proyecto, id_usuario)

  try {
    res.status(200).json(await service.getEntidad(id_proyecto, id_usuario, rol))
  } catch(error) {
    const statusCode = error.status || 500
    res.status(statusCode).json({ error: error.message })
  }
}

const getProposito = async(req, res) => {
  const { params: { id_proyecto } } = req
  const { id_usuario, rol } = req.body

  validateNumberParameter(res, id_proyecto, id_usuario)

  try {
    res.status(200).json(await service.getProposito(id_proyecto, id_usuario, rol))
  } catch(error) {
    const statusCode = error.status || 500
    res.status(statusCode).json({ message: error.message })
  }
  
}

const postEntidad = async(req, res) => {
  const { params: { id_proyecto } } = req
  const { id_usuario, respuestas, rol } = req.body

  validateNumberParameter(res, id_proyecto, id_usuario)

  try {
    await service.postEntidad(id_proyecto, id_usuario, respuestas)
    res.status(200).json({ message: 'respuestas de la instancia de Entidad guardadas exitosamente'})
  } catch(error) {
    const statusCode = error.status || 500
    res.status(statusCode).json({ error: error.message })
  }
  
}

const postProposito = async(req, res) => {
  const { params: { id_proyecto } } = req
  const { id_usuario, respuestas } = req.body

  validateNumberParameter(res, id_proyecto, id_usuario)

  try {
    await service.postProposito(id_proyecto, id_usuario, respuestas)
    res.status(200).json({ message: 'respuestas de la instancia de Proposito guardadas exitosamente'})
  } catch(error) {
    const statusCode = error.status || 500
    res.status(statusCode).json({ error: error.message })
  }
  
}

const finalizarEvaluacion = async(req, res) => {
  const { params: { id_proyecto } } = req
  const { id_usuario } = req.body

  validateNumberParameter(res, id_proyecto, id_usuario)

  try {
    res.status(200).json(await service.finalizarEvaluacion(id_proyecto, id_usuario))
  } catch(error) {
    const statusCode = error.status || 500
    res.status(statusCode).json({ error: error.message })
  }
}

module.exports = {
  generatePDF,

  getEntidad,
  getProposito,
  postEntidad,
  postProposito,
  finalizarEvaluacion
}