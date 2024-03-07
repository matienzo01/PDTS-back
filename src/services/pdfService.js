const PDFDocument = require('pdfkit');
const htmlToPdf = require('html-pdf');
const projectService = require('./projectService')
const evalService = require('./evalService')

const generatePDF = async(id_proyecto) => {
    return new Promise(async(resolve, reject) => {
      const { entidad, proposito } = await evalService.getEvaluationScores(id_proyecto)
      const { proyecto } = await projectService.getOneProject(id_proyecto)
      
      if ( await projectService.verifyState(id_proyecto, 'Evaluado') ) {
        const doc = new PDFDocument();
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        doc
          .font('./src/fonts/arialbd.ttf')
          .fontSize(24)
          .text('Resultados de evaluacion PDTS', { align: 'center' })
          .moveDown()
          .text(proyecto.titulo, { align: 'center' })
          .moveDown();

        doc
          .fontSize(18)
          .text('Entidad')
          .font('./src/fonts/arial.ttf')
          .fontSize(12);

        let tot_determinantes = 0
        let tot_no_determinantes = 0
        let tot_proposito = 0
        for(let key in entidad) {
          tot_determinantes += entidad[key].determinantes
          tot_no_determinantes += entidad[key].noDeterminantes
          doc
            .text(`${key}: ${entidad[key].determinantes + entidad[key].noDeterminantes}`, { align: 'justify' })
            .moveDown();
        }

        doc
          .font('./src/fonts/arialbd.ttf')
          .fontSize(18)
          .text('Propóstito')
          .font('./src/fonts/arial.ttf')
          .fontSize(12);

        for(let key in proposito) {
          tot_proposito += proposito[key].score
          doc
            .text(`${key}: ${proposito[key].score}`, { align: 'justify' })
            .moveDown();
        }


        tot_determinantes >= 4 
          ? doc.text('El proyecto cumple con ser un PDTS', { align: 'justify' })
          : doc.text('El proyecto NO cumple con ser un PDTS', { align: 'justify' });

        doc
          .moveDown()
          .text(`Calificacion Instancia Entidad:`, { align: 'left' })
          .text(`     Indicadores determinantes: ${tot_determinantes}`, { align: 'left' })
          .text(`     Indicadores no determinantes: ${tot_no_determinantes}`, { align: 'left' })
          .moveDown()
          .text(`Calificacion Instancia Proposito: ${tot_proposito}`, { align: 'left' });

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


/*
const htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Informe de Evaluación de Proyecto</title>
            <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
              }
              h1 {
                  color: #333;
                  text-align: center;
              }
              h2 {
                  color: #555;
              }
              .section {
                  margin-bottom: 20px;
              }
              .instance {
                  margin-left: 20px;
              }
            </style>
          </head>
          <body>
            <h1>Resultados de evaluacion PDTS</h1>
            <h1>${proyecto.titulo}</h1>
            <div class="section">
              <h2>Instancia de Entidad</h2>
              <div class="instance">
                <p><strong>Nombre:</strong> Instancia de Entidad 1</p>
                <p><strong>Descripción:</strong> Esta es una descripción de la instancia de entidad.</p>
                <p><strong>Resultados:</strong> Los resultados de la evaluación de la instancia de entidad.</p>
                <!-- Agrega más detalles relevantes si es necesario -->
              </div>
            </div>
          </body>
        </html>
      `;

      htmlToPdf.create(htmlContent).toBuffer((err, buffer) => {
        if (err) {
            reject(err);
        } else {
            resolve(buffer);
        }
      });
*/