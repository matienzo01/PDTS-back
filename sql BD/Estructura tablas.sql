drop database pdts;
CREATE DATABASE pdts;
use pdts;

CREATE TABLE admin (
	email VARCHAR(255) NOT NULL PRIMARY KEY,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE evaluadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
	nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    dni int, -- no lo usamos como clave primaria, pero nos va a ser de utilidad para verificar si un
    		 -- evaluador existe en el sistema cuando una institucion quisiera vincularlo a un proyecto
    celular  VARCHAR(255) NOT NULL,
    especialidad  VARCHAR(255) NOT NULL,
    institucion_origen  VARCHAR(255) NOT NULL,
    pais_residencia VARCHAR(255) NOT NULL,
    provincia_residencia VARCHAR(255) NOT NULL,
    localidad_residencia VARCHAR(255) NOT NULL
);

CREATE TABLE admins_CyT (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE roles_institcuciones(
	id INT AUTO_INCREMENT PRIMARY KEY,
    rol varchar(255)
);

CREATE TABLE tipos_instituciones(
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo varchar(255)
);

CREATE TABLE instituciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_admin INT,
    id_tipo INT,
    nombre VARCHAR(255) NOT NULL,
    pais VARCHAR(255) NOT NULL,
    provincia VARCHAR(255) NOT NULL,
    localidad VARCHAR(255) NOT NULL,
    telefono_institucional VARCHAR(255) NOT NULL,
    mail_institucional VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_admin) REFERENCES admins_CyT(id),
    FOREIGN KEY (id_tipo) REFERENCES tipos_instituciones(id)
);

CREATE TABLE instituciones_participantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL
);

CREATE TABLE instituciones_x_inst_participantes(
    id_institucion INT,
    id_inst_participante INT,
    PRIMARY KEY (id_institucion,id_inst_participante),
    FOREIGN KEY (id_institucion) REFERENCES instituciones(id),
    FOREIGN KEY (id_inst_participante) REFERENCES instituciones_participantes(id)
);

CREATE TABLE estado_eval(
  	id INT AUTO_INCREMENT PRIMARY KEY,
    nombre varchar(255)
);

CREATE TABLE proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    id_estado_eval int,
    id_director INT,
    id_institucion INT,
    FechaInicio DATE,
    FechaFin DATE,
    area_conocim varchar(255),
    subarea_conocim varchar(255),
    problema_a_resolver text,
    producto_a_generar text,
    resumen text,
    novedad_u_originalidad text,
    grado_relevancia text,
    grado_pertinencia text, 
    grado_demanda text,
    fecha_carga date,
    obligatoriedad_proposito boolean DEFAULT true,
    obligatoriedad_opinion boolean DEFAULT true,
    FOREIGN KEY (id_estado_eval) REFERENCES estado_eval(id),
    FOREIGN KEY (id_director) REFERENCES evaluadores(id),
    FOREIGN KEY (id_institucion) REFERENCES instituciones(id)
);

CREATE TABLE participación_instituciones(
    id_proyecto INT,
    id_rol INT,
    id_inst_participante INT,
    PRIMARY KEY (id_inst_participante,id_rol,id_proyecto),
    FOREIGN KEY (id_inst_participante) REFERENCES instituciones_participantes(id),
    FOREIGN KEY (id_rol) REFERENCES roles_institcuciones(id),
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id)
);

-- no estoy seguro que esta tabla necesariamente exista, podria usarse la de usuarios, pero no se si es que los participantes realmente
-- son usuarios del sistema. Asi que provisoriamente lo dejo asi
CREATE TABLE participantes(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre varchar(255),
    apellido varchar(255)
);

CREATE TABLE participantes_x_proyectos(
	id_proyecto INT,
    id_participante INT,
    id_institucion INT, -- no necesariamente sea el mismo id que el del proyecto supongo
    funcion varchar(255),
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id),
    FOREIGN KEY (id_participante) REFERENCES participantes(id),
    FOREIGN KEY (id_institucion) REFERENCES instituciones(id)
);

CREATE TABLE evaluadores_x_instituciones (
    id_institucion INT,
    id_evaluador INT,
    PRIMARY KEY(id_institucion, id_evaluador),
    FOREIGN KEY (id_institucion) REFERENCES instituciones(id),
    FOREIGN KEY (id_evaluador) REFERENCES evaluadores(id)
);

CREATE TABLE evaluadores_x_proyectos (
    id_proyecto INT,
    id_evaluador INT,
    fecha_inicio_eval date,
    fecha_fin_eval date DEFAULT null,
    -- se podria poner un atributo de estado, pero si la fecha de fin de evaluacion está en nulo, se podria decir que todavia esta pendiente de evaluar
    PRIMARY KEY (id_proyecto, id_evaluador),
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id),
    FOREIGN KEY (id_evaluador) REFERENCES evaluadores(id)
);

CREATE TABLE instancias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255)
);

CREATE TABLE dimensiones (
	id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
    id_instancia INT,
    FOREIGN KEY (id_instancia) REFERENCES instancias(id)
);

CREATE TABLE indicadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pregunta TEXT not null,
    fundamentacion TEXT,
    id_dimension INT,
    determinante boolean,
    fecha_elim date DEFAULT null,
    FOREIGN KEY (id_dimension) REFERENCES dimensiones(id)
);

CREATE TABLE respuestas_evaluacion (
    id_indicador INT,
    id_evaluador INT,
    id_proyecto INT,
    respuesta varchar(255), 
    calificacion DECIMAL(5,2), -- este atributo o el de arriba podrian no estar. Con uno solo de los dos alcanza
    PRIMARY KEY (id_indicador, id_evaluador, id_proyecto),
    FOREIGN KEY (id_indicador) REFERENCES indicadores(id),
    FOREIGN KEY (id_evaluador) REFERENCES evaluadores(id),
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id)
);

-- no me agradaN mucho las siguientes tablas que hice, habria que revisarlas
CREATE TABLE secciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre varchar(255)
);

CREATE TABLE tipo_preguntas (
	id INT AUTO_INCREMENT PRIMARY KEY,
    tipo varchar(255)
);
    
CREATE TABLE preguntas_seccion (
	id INT AUTO_INCREMENT PRIMARY KEY,
    pregunta text,
    id_seccion INT,      -- podriamos settearlo en null en los casos de las subpreguntas, para poder identificarlas
    id_tipo_pregunta INT,
    FOREIGN KEY (id_seccion) REFERENCES secciones(id),
    FOREIGN KEY (id_tipo_pregunta) REFERENCES tipo_preguntas(id)
);

create TABLE relacion_subpregunta(
	id_pregunta_padre int,
    id_subpregunta int,
    PRIMARY KEY (id_pregunta_padre, id_subpregunta),
    FOREIGN KEY (id_pregunta_padre) REFERENCES preguntas_seccion(id),
    FOREIGN KEY (id_subpregunta) REFERENCES preguntas_seccion(id)
);

CREATE TABLE opciones(
	id INT AUTO_INCREMENT PRIMARY KEY,
    valor varchar(255)
);

CREATE TABLE opciones_x_preguntas (
	id_opcion INT,
    id_preguntas_seccion INT,
    PRIMARY KEY (id_opcion, id_preguntas_seccion),
    FOREIGN KEY (id_opcion) REFERENCES opciones(id),
    FOREIGN KEY (id_preguntas_seccion) REFERENCES preguntas_seccion(id)
);

CREATE TABLE respuestas_encuesta (
    id_pregunta INT,
    id_evaluador INT,
    id_proyecto INT,
    respuesta varchar(255), 
    fecha_respuesta date,
    PRIMARY KEY (id_pregunta, id_evaluador, id_proyecto),
    FOREIGN KEY (id_pregunta) REFERENCES preguntas_seccion(id),
    FOREIGN KEY (id_evaluador) REFERENCES evaluadores(id),
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id)
);

