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

DELIMITER ;