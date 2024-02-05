DELIMITER //

CREATE PROCEDURE listar_tipos_instituciones()
BEGIN
	SELECT tipo FROM tipos_instituciones;
END //

CREATE PROCEDURE existe_usuario(
	IN dni_nuevo INT
)
BEGIN
	SELECT COUNT(*) as existe FROM evaluadores where dni = dni_nuevo;
END//

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

DELIMITER ;