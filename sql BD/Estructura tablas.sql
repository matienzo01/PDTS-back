drop database pdts;
CREATE DATABASE pdts;
use pdts;

CREATE TABLE admin ( -- administrador general del sistema
	email VARCHAR(255) NOT NULL PRIMARY KEY,
    password VARCHAR(255)
);

CREATE TABLE evaluadores ( -- tabla de evaluadores/directores
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255),
    password VARCHAR(255),
	nombre VARCHAR(255),
    apellido VARCHAR(255),
    dni int, 
    celular  VARCHAR(255),
    especialidad  VARCHAR(255),
    institucion_origen VARCHAR(255),
    pais_residencia VARCHAR(255),
    provincia_residencia VARCHAR(255),
    localidad_residencia VARCHAR(255)  
);

CREATE TABLE admins_CyT ( -- tabla de administradores de instituciones cyt
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
    apellido VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255),
    dni int
);

CREATE TABLE rubros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre varchar(255)
);

CREATE TABLE tipos_instituciones( 
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo varchar(255)
);

CREATE TABLE instituciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
    id_rubro int,
    id_tipo INT,
    pais VARCHAR(255),
    provincia VARCHAR(255),
    localidad VARCHAR(255),
    telefono_institucional VARCHAR(255),
    mail_institucional VARCHAR(255),
    esCyT tinyint(1) NOT NULL,
    FOREIGN key (id_rubro) REFERENCES rubros(id),
    FOREIGN KEY (id_tipo) REFERENCES tipos_instituciones(id)
);

CREATE TABLE instituciones_cyt (
    id INT PRIMARY KEY,
    id_admin INT,
    nombre_referente VARCHAR(255),
    apellido_referente VARCHAR(255),
    cargo_referente VARCHAR(255),
    telefono_referente VARCHAR(255),
    mail_referente VARCHAR(255),
    FOREIGN KEY (id) REFERENCES instituciones(id),
    FOREIGN KEY (id_admin) REFERENCES admins_CyT(id)
);

CREATE TABLE estado_eval( 
  	id INT AUTO_INCREMENT PRIMARY KEY,
    nombre varchar(255)
);

CREATE TABLE modelos_encuesta ( 
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre varchar(255)
);

CREATE TABLE secciones ( -- son las secciones de las encuestas de opinion
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre varchar(255)
);

CREATE TABLE modelos_x_secciones (
    id_seccion INT,
    id_modelo INT,
    PRIMARY KEY(id_modelo, id_seccion),
    FOREIGN KEY (id_seccion) REFERENCES secciones(id),
    FOREIGN KEY (id_modelo) REFERENCES modelos_encuesta(id)
);

CREATE TABLE proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255),
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
    id_modelo_encuesta INT,
    FOREIGN KEY (id_modelo_encuesta) REFERENCES modelos_encuesta(id),
    FOREIGN KEY (id_estado_eval) REFERENCES estado_eval(id),
    FOREIGN KEY (id_director) REFERENCES evaluadores(id),
    FOREIGN KEY (id_institucion) REFERENCES instituciones_cyt(id)
);

CREATE TABLE participacion_instituciones( 
    id_proyecto INT,
    id_institucion INT,
    rol varchar(255), 
    PRIMARY KEY (id_institucion,id_proyecto,rol),
    FOREIGN KEY (id_institucion) REFERENCES instituciones(id),
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id)
);

CREATE TABLE participantes( 
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_institucion INT, 
    nombre varchar(255),
    apellido varchar(255),
    FOREIGN KEY (id_institucion) REFERENCES instituciones(id)
);

CREATE TABLE participantes_x_proyectos(
	id_proyecto INT,
    id_participante INT,
    funcion varchar(255), 
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id),
    FOREIGN KEY (id_participante) REFERENCES participantes(id)
);

CREATE TABLE evaluadores_x_instituciones (
    id_institucion INT,
    id_evaluador INT,
    PRIMARY KEY(id_institucion, id_evaluador),
    FOREIGN KEY (id_institucion) REFERENCES instituciones_cyt(id),
    FOREIGN KEY (id_evaluador) REFERENCES evaluadores(id)
);

CREATE TABLE evaluadores_x_proyectos (
    id_proyecto INT,
    id_evaluador INT,
    rol varchar(255),
    fecha_inicio_eval date,
    fecha_fin_eval date DEFAULT null,
    fecha_fin_op date DEFAULT null,
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
    descripcion text, 
    fundamentacion TEXT,
    id_dimension INT,
    determinante boolean,
    fecha_elim date DEFAULT null,
    FOREIGN KEY (id_dimension) REFERENCES dimensiones(id)
);

CREATE TABLE opciones_evaluacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    opcion varchar(255),
    peso DECIMAL(5,2),
    id_instancia INT,
    FOREIGN KEY (id_instancia) REFERENCES instancias(id)
);

CREATE TABLE respuestas_evaluacion (
    id_indicador INT,
    id_evaluador INT,
    id_proyecto INT,
    justificacion text,
    respuesta varchar(255), 
    calificacion DECIMAL(5,2), -- este atributo o el de arriba podrian no estar. Con uno solo de los dos alcanza
    PRIMARY KEY (id_indicador, id_evaluador, id_proyecto),
    FOREIGN KEY (id_indicador) REFERENCES indicadores(id),
    FOREIGN KEY (id_evaluador) REFERENCES evaluadores(id),
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id)
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
    PRIMARY KEY (id_pregunta, id_evaluador, id_proyecto),
    FOREIGN KEY (id_pregunta) REFERENCES preguntas_seccion(id),
    FOREIGN KEY (id_evaluador) REFERENCES evaluadores(id),
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id)
);

