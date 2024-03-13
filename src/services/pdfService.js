const PDFDocument = require('pdfkit');
const htmlToPdf = require('html-pdf');
const projectService = require('./projectService')
const evalService = require('./evalService');
const insttitutionCYTService = require('./institutionCYTService')
const knex = require('knex');

const generatePDF = async(id_proyecto, id_admin) => {
    return new Promise(async(resolve, reject) => {
      try {
        const id = await insttitutionCYTService.getInstIdFromAdmin(id_admin)
        const { proyecto } = await projectService.getOneProject(id_proyecto, id)
        const { entidad, proposito, totD, totND, totP } = await evalService.getEvaluationScores(id_proyecto)
        const x = 72

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
          .text(proyecto.titulo, { align: 'center' })
          .moveDown();

        doc
          .fontSize(18)
          .text('Entidad')
          .fontSize(12);

        let suma_determ = 0
        let suma_no_determ = 0
        let suma_proposito = 0

        doc
          .text('Dimension                                   Ind. determinantes              Ind. no determinantes')
          .font('./src/fonts/arial.ttf')

        for(let key in entidad) {
          suma_determ += entidad[key].determinantes
          suma_no_determ += entidad[key].noDeterminantes

          doc
            .text(`${key}`,x)
            .moveUp()
            .text(`${entidad[key].determinantes}`,275)
            .moveUp()
            .text(`${entidad[key].noDeterminantes}`,440);
        }
        doc
          .font('./src/fonts/arialbd.ttf')
          .text('Total',x)
          .moveUp()
          .text(`${suma_determ}/${totD}`,275)
          .moveUp()
          .text(`${suma_no_determ}/${totND}`,440)
          .text('',x)
          .moveDown()
          .fontSize(18)
          .text('Propóstito')
          .fontSize(12);


        doc
          .text('Dimension                                          Calificación')
          .font('./src/fonts/arial.ttf')

        for(let key in proposito) {
          suma_proposito += proposito[key].score
          doc
            .text(`${key}`,x)
            .moveUp()
            .text(`${proposito[key].score}`,290)
        }

        doc
          .font('./src/fonts/arialbd.ttf')
          .text(`Total`,x)
          .moveUp()
          .text(`${suma_proposito}/${totP}`,290)
          .text('',x)
          .moveDown()
          .font('./src/fonts/arialbi.ttf')
          .fontSize(18)

        suma_determ >= 4 
          ? doc.text('El proyecto cumple con los requerimientos para ser un PDTS.', { align: 'center' })
          : doc.text('El proyecto no cumple con los requerimientos para ser un PDTS.', { align: 'center' });

        doc.end();
      } catch(error) {
        reject(error)
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