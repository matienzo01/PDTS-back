const PDFDocument = require('pdfkit');
const projectService = require('./projectService')
const evalService = require('./evalService')

const generatePDF = async(id_proyecto) => {
    return new Promise(async(resolve, reject) => {
      if ( await projectService.verifyState(id_proyecto, 'Evaluado') ) {
        const { entidad, proposito } = await evalService.getEvaluationScores(id_proyecto)
        const { proyecto } = await projectService.getOneProject(id_proyecto)
        const doc = new PDFDocument();
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        doc
          .fontSize(24)
          .text('Resultados de evaluacion PDTS', { align: 'center' })
          .moveDown();

        doc
          .fontSize(28)
          .text(proyecto.titulo, { align: 'center' })
          .moveDown();

        if (entidad.determinantes >= 4 ) {
          doc
            .fontSize(14)
            .text('El proyecto cumple con ser un PDTS', { align: 'justify' })
            .moveDown();
        } else {
          doc
            .fontSize(14)
            .text('El proyecto NO cumple con ser un PDTS', { align: 'justify' })
            .moveDown();
        }

        doc
          .fontSize(14)
          .text(`Calificacion Instancia Entidad: ${entidad.determinantes+entidad.noDeterminantes}`, { align: 'left' })
          .moveDown()
          .text(`Calificacion Instancia Proposito: ${proposito.score}`, { align: 'left' })
          .moveDown();

        doc.end();
      } else {
        const _error = new Error('the project was not finished being evaluated')
        _error.status = 404
        reject(_error)
      }
      
    });
  };

module.exports = {
    generatePDF
};