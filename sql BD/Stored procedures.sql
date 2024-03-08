DELIMITER //

CREATE PROCEDURE obtener_Evaluacion()
BEGIN
    SELECT 
        i.id AS id_indicador,
        i.pregunta,
        i.fundamentacion,
        d.id AS id_dimension,
        d.nombre AS nombre_dimension,
        ins.id AS id_instancia,
        ins.nombre AS nombre_instancia,
        i.determinante
    FROM
        indicadores i
    JOIN
        dimensiones d ON i.id_dimension = d.id
    JOIN
        instancias ins ON d.id_instancia = ins.id
    WHERE
        i.fecha_elim IS NULL;
END //

CREATE PROCEDURE obtener_Opinion()
BEGIN   
    SELECT 
        preguntas_seccion.id AS id_pregunta,
        preguntas_seccion.pregunta AS enunciado_pregunta,
        preguntas_seccion.id_seccion AS id_seccion,
       secciones.nombre AS nombre_seccion,
       preguntas_seccion.id_tipo_pregunta AS id_tipo_pregunta
    FROM 
        preguntas_seccion
    LEFT JOIN 
        secciones ON preguntas_seccion.id_seccion = secciones.id;
END //

create PROCEDURE obtener_instituciones_de_usuario()
BEGIN   
    select distinct id, (concat('[',
    							(select distinct  GROUP_CONCAT(evaluadores_x_instituciones.id_institucion  SEPARATOR ', ') 
    							FROM evaluadores_x_instituciones where evaluadores_x_instituciones.id_evaluador = e.id),
    							']') ) as 'participa_en'
	from evaluadores e join evaluadores_x_instituciones exi on e.id = exi.id_evaluador ;
END;

DELIMITER ;

