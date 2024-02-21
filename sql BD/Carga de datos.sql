
-- //////////////////////////////////////////////////////////////////////////////////////////////////
-- CARGA DE DATOS BUENOS ////////////////////////////////////////////////////////////////////////////
-- //////////////////////////////////////////////////////////////////////////////////////////////////

INSERT INTO secciones(nombre) VALUES
	('Sistema de evaluacion'),				-- id 1
    ('Instancias e indicadores'),			-- id 2
    ('Evaluadores'),						-- id 3
    ('Software');							-- id 4

INSERT INTO tipo_preguntas (tipo) VALUES  
	('opcion multiple'),	-- id 1
    ('texto'),		  		-- id 2
    ('si/no'),	   			-- id 3
    ('contenedora');			-- id 4

INSERT INTO tipos_instituciones(tipo) VALUES
	('Organizacion Gubernamental'),
	('Asociación Civil'),
	('Cámara'),
	('Cooperativa'),
	('ONG'),
	('Empresa Pública'),
	('Empresa Privada'),
	('Universidad'),
	('Otros');
    
INSERT into estado_eval(nombre) VALUES 
    ('Sin evaluar'),
    ('En evaluacion por el director'),
    ('En evaluacion por los evaluadores'),
    ('Evaluado');

INSERT INTO instancias (nombre) VALUES ('Entidad'), ('Proposito');

-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
-- Dimensiones e indicadores de la instancia de Entidad ///////////////////////////////////////////////////////////////////
-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

INSERT into dimensiones (nombre, id_instancia) VALUES ('Avance congnitivo',1);
INSERT into indicadores(pregunta, id_dimension, determinante, fundamentacion)
	VALUES 
    	('¿Hubo producción de conocimiento en el desarrollo del proyecto?', 
         1, true,
        'Debe señalarse el conocimiento producido, la disciplina a la que pertenece y si es relacionado al objeto de desarrollo (Qué) o al proceso de desarrollo  (Cómo). Debe incorporarse y referirse el material probatorio pertinente.'),
        
        ('¿Hubo publicaciones o evidencias formales documentadas de haber producido y compartido conocimiento?', 
        1, false,
        'Deben indicarse las publicaciones o evidencias formales que demuestran que el conocimiento producido fue compartido.');
            
INSERT into dimensiones (nombre, id_instancia) VALUES ('Novedad local',1);
INSERT into indicadores(pregunta, id_dimension, determinante, fundamentacion)
	VALUES 
    	('¿Hubo originalidad a nivel local en la solución desarrollada?', 
         2, true,
        'Debe señalarse dónde está la originalidad a nivel local en la solución desarrollada. Cuáles son los aspectos innovadores distintivos de la solución, inexistentes hasta el momento a nivel local.');

INSERT into dimensiones (nombre, id_instancia) VALUES ('Relevancia',1);
INSERT into indicadores(pregunta, id_dimension, determinante, fundamentacion)
	VALUES 
    	('¿La solución desarrollada es relevante para el adoptante?', 
         3, true,
        'El adoptante debe presentar los fundamentos o evidencias de la mejora producida o potencial a partir de la incorporación de la solución desarrollada.'),
    	
        ('¿La solución desarrollada es relevante para el sector local? ', 
         3, false,
        'Se deben presentar los fundamentos o evidencias de la mejora producida a partir de la incorporación de la solución desarrollada o expectativas fundadas de otras organizaciones del sector local al que pertenece el adoptante.');

INSERT into dimensiones (nombre, id_instancia) VALUES ('Pertenencia',1);
INSERT into indicadores(pregunta, id_dimension, determinante, fundamentacion)
	VALUES 
    	('¿Se logró resolver, efectivamente, un problema de carácter práctico?', 
        4, true,
        'Debe describirse brevemente el problema resuelto, destacando claramente la dimensión práctica de la solución.'),
        
        ('¿Hubo consistencia entre el problema resuelto y el problema propuesto?',
        4, true,
        'Debe señalarse si hubo brecha (gap) entre el problema resuelto y el propuesto. En tal caso, debe consignarse si el problema resuelto se amplió (generalizó) o se redujo (especificó) respecto de la expectativa original.');

INSERT into dimensiones (nombre, id_instancia) VALUES ('Demanda',1);
INSERT into indicadores(pregunta, id_dimension, determinante, fundamentacion)
	VALUES 
    	('¿Hubo participación comprometida del demandante en el proyecto?', 
        5, true,
        'Debe consignarse brevemente la participación y aportes del demandante en el proyecto.'),
        
        ('¿Hubo participación comprometida del adoptante en el proyecto?',
        5, true,
        'Debe consignarse brevemente la participación y aportes del adoptante en el proyecto.');

INSERT into dimensiones (nombre, id_instancia) VALUES ('Impacto esperado',1);
INSERT into indicadores(pregunta, id_dimension, determinante, fundamentacion)
	VALUES 
    	('¿La solución desarrollada cuenta con la conformidad del demandante?', 
        6, true,
        'El demandante debe prestar conformidad formal sobre la pertinencia de la solución desarrollada en función del problema que pretendía resolver'),
        
        ('¿Hubo mejora en los indicadores propios del adoptante?', 
        6, false,
        'El adoptante debe presentar los fundamentos o evidencias del impacto de la solución desarrollada, en base a indicadores pre y post implementación de la misma.'),
        
        ('¿El proceso de desarrollo de la solución contribuyó a la calificación de recursos humanos en la temática?',
        6, false,
        ' Debe fundamentarse qué personas se formaron o calificaron en la temática específica en el marco del proceso de desarrollo de la solución. ');

-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////
-- Dimensiones e indicadores de la instancia de Proposito /////////////////////////////////////////////////////
-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////

INSERT into dimensiones (nombre, id_instancia) VALUES ('Calidad del Desempeño',2);
INSERT into indicadores(pregunta, id_dimension, determinante, fundamentacion)
	VALUES 
    	('Calidad Técnica de la solución desarrollada ', 
        7, true,
        ' Debe fundamentarse el grado de satisfacción consignado respecto de la calidad de la solución propiamente dicha y de la metodología y métodos aplicados en el desarrollo. También debe consignarse la documentación técnica disponible sobre la solución desarrollada.'),
        
        ('Calidad del proceso de desarrollo del proyecto', 
        7, true,
        'Debe fundamentarse el grado de satisfacción consignado respecto de la calidad del proceso de desarrollo del proyecto, el cumplimiento de la planificación y metas, los desvíos y aspectos que pudieron afectar el plan previsto, tales como la disponibilidad de los recursos, el compromiso de los financiadores, demandantes, adoptantes y unidades de CyT, etc.'),
        
        ('Calidad de la gestión del proyecto',
        7, true,
        'Debe fundamentarse el grado de satisfacción consignado respecto de la calidad de la gestión del proyecto, prestando especial atención a la dirección del proyecto, la administración de los recursos y a la gestión de las relaciones entre los actores del proyecto.');

INSERT into dimensiones (nombre, id_instancia) VALUES ('Alcance del impacto',2);
INSERT into indicadores(pregunta, id_dimension, determinante, fundamentacion)
	VALUES 
    	('Impacto efectivo en el sector', 
        8, true,
        'Debe fundamentarse el grado de satisfacción consignado respecto del impacto efectivo que el proyecto y el desarrollo tecnológico tuvieron en el sector de la demanda. Debe referirse a los indicadores de efectividad esperados definidos oportunamente por la demanda.'),
        
        ('Impacto potencial en el sector', 
        8, true,
        'Debe fundamentarse el grado de satisfacción consignado respecto del impacto potencial que el desarrollo tecnológico podría tener en el sector de la demanda. Puede referirse a los indicadores de efectividad esperados definidos oportunamente por la demanda u otros, considerando la posibilidad de re-aplicación de la tecnología desarrollada o de los conocimientos producidos en otros potenciales adoptantes del mismo sector de la solución.'),
        
        ('Impacto potencial en otros sectores',
        8, true,
        'Debe fundamentarse el grado de satisfacción consignado respecto del impacto potencial que el desarrollo tecnológico podría tener en otros sectores diferentes al de la demanda. Puede referirse a los indicadores de efectividad esperados definidos oportunamente por la demanda u otros, considerando la posibilidad de re-aplicación de la tecnología desarrollada o de los conocimientos producidos en otros potenciales adoptantes de otros sectores diferentes al de la solución.'),
        
        ('Impacto en C&T',
        8, true,
        'Debe fundamentarse el grado de satisfacción consignado respecto del impacto que el desarrollo tecnológico tuvo o podría tener en las disciplinas y grupos de Ciencia y Tecnología vinculados a la temática, considerando tanto el nivel nacional como internacional. Debe considerarse la posibilidad de apropiación y explotación de los conocimientos producidos en el ámbito del proyecto para producir nuevos conocimientos, tanto en el grupo ejecutor como en otros grupos y disciplinas.');
        
INSERT into dimensiones (nombre, id_instancia) VALUES ('Contribucion al desarrollo',2);
INSERT into indicadores(pregunta, id_dimension, determinante, fundamentacion)
	VALUES 
    	('Contribución a la política institucional de las unidades ejecutoras', 
        9, true,
        'Debe fundamentarse el grado de satisfacción consignado respecto de la contribución del proyecto a las metas y objetivos estratégicos de las unidades ejecutoras, en el marco de sus respectivas políticas institucionales.'),
        
        ('Contribución al desarrollo de redes locales / micro ecosistemas de innovación local',
        9, true,
        'Debe fundamentarse el grado de satisfacción consignado respecto de la contribución del proyecto y sus efectos al desarrollo o fortalecimiento de redes locales o micro ecosistemas de innovación local, considerando las vinculaciones y sinergias generadas y la co-producción de conocimiento que las determinan.');

INSERT into dimensiones (nombre, id_instancia) VALUES ('Valoración Socio-Ético-Política',2);
INSERT into indicadores(pregunta, id_dimension, determinante, fundamentacion)
	VALUES 
    	('Compromiso ético', 
        10, true,
        ' Debe fundamentarse el grado de satisfacción consignado respecto de los principios éticos en cuanto a los fines y métodos de la I+D en general y de la problemática abordada en particular.'),
        
        ('Compromiso ambiental', 
        10, true,
        'Debe fundamentarse el grado de satisfacción consignado respecto de los principios de cuidado y preservación del ambiente, tanto en sus fines como en el proceso de desarrollo tecnológico y el impacto ambiental de sus efectos.'),
        
        ('Compromiso con las demandas sociales',
        10, true,
        'Debe fundamentarse el grado de satisfacción consignado respecto de la contribución del proyecto a metas u objetivos políticos definidos en el marco de las demandas sociales nacionales o globales.');

INSERT INTO opciones_evaluacion (opcion,peso,id_instancia) VALUES
    ('Cumple',1,1),
    ('Cumple parcial',0.5,1),
    ('No cumple',0,1),
    ('Nulo',0,2),
    ('Bajo',1,2),
    ('Medio',2,2),
    ('Alto',3,2),
    ('Muy alto',4,2);

-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////
-- pREGUNTAS DE ENCUESTA //////////////////////////////////////////////////////////////////////////////////////
-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////

INSERT INTO preguntas_seccion(pregunta, id_seccion, id_tipo_pregunta) VALUES
-- PREGUNTAS
	('¿ Considera útil contar con un sistema de evaluación ex post de PDTS de dominio público ?',1,1),
	('Califique la pertinencia de esta propuesta como sistema de evaluación desarrollado ad hoc para esta tipología de proyectos',1,1),
    
	('¿ En qué medida considera que los indicadores no determinantes incluidos en la Instancia de la Entidad agregan valor a la evaluación ?',2,1),
	('¿ En qué medida considera que la Instancia del Propósito agrega valor a la evaluación ?',2,1),
	('¿ Considera que la Instancia del Propósito debería ser obligatoria en la evaluación ex post de PDTS ?',2,3),
	('Califique la pertinencia de cada indicador del sistema de evaluación propuesto',2,4), 
	('¿ Propondría agregar algún indicador en la Instancia de la Entidad ?',2,3),
	('¿ Propondría agregar algún indicador en la Instancia del Propósito ?',2,3),
     
	('Califique la pertinencia de incorporar representantes de estos actores como evaluadores ex post de PDTS',3,4),
     
	('Califique la facilidad de uso del software desarrollado para soportar la evaluación ex post de PDTS',4,1),

-- SUBPREGUNTAS
	('¿Cual?',null,2),
    ('Director del PDTS',null,1),
    ('Representante del demandante',null,1),
    ('Representante del adoptante',null,1),
    ('Representante de la unidad financiadora',null,1),
    ('Experto disciplinar',null,1);

INSERT INTO preguntas_seccion (pregunta, id_seccion, id_tipo_pregunta) VALUES ('¿Cual?',null,2);

-- en este insert meto todos los indicadores como subpregunta
INSERT INTO preguntas_seccion (pregunta, id_seccion, id_tipo_pregunta)
SELECT pregunta, null AS id_seccion, 1 AS id_tipo_pregunta
FROM indicadores;

INSERT INTO relacion_subpregunta(id_pregunta_padre,id_subpregunta) VALUES
	(7,11),
	(8,17),
	(9,12),
	(9,13),
	(9,14),
	(9,15),
	(9,16),
	(6,18),
	(6,19),
	(6,20),
	(6,21),
	(6,22),
	(6,23),
	(6,24),
	(6,25),
	(6,26),
	(6,27),
	(6,28),
	(6,29),
	(6,30),
	(6,31),
	(6,32),
	(6,33),
	(6,34),
	(6,35),
	(6,36),
	(6,37),
	(6,38),
	(6,39),
	(6,40),
	(6,41);

INSERT INTO opciones(valor) VALUES
	('nada util'),
    ('poco util'),
    ('util'),
    ('muy util'),
    
    ('nada pertinente'),
    ('poco pertinente'),
    ('pertinente'),
    ('muy pertinente'),
    
    ('no agregan valor'),
    ('agrega poco valor'),
    ('agrega valor'),
    ('agrega mucho valor'),
    
    ('nada facil de usar'),
    ('poco facil de usar'),
    ('facil de usar'),
    ('muy facil de usar');

INSERT INTO opciones_x_preguntas(id_opcion, id_preguntas_seccion) VALUES
    (1,1), (2,1), (3,1), (4,1),			-- CONSIDERA UTIL CONTAR CON UN SISTEMA DE EVAL...
    
    (5,2), (6,2), (7,2), (8,2),			-- CALIFIQUE LA PERTINENCIA DE ESTA PROPUESTA...
    
    (9,3), (10,3), (11,3), (12,3),		-- EN QUE MEDIDA CONSIDERA QUE LOS INDICADORES NO DETERMINANTES...
    
    (9,4), (10,4), (11,4), (12,4),		-- EN QUE MEDIDA CONSIDERA QUE LA INSTANCIA DE PROPOSITO...
    
    (13,10), (14,10), (15,10), (16,10),	-- CALIFIQUE LA FACILIDAD DE USO DEL SW...
    
    (5,12), (6,12), (7,12), (8,12), 	-- DIRECTOR PDTS
    (5,13), (6,13), (7,13), (8,13), 	-- REPRESENTANTE DEMANDANTE
    (5,14), (6,14), (7,14), (8,14), 	-- REPRESENTANTE ADOPTANTE
    (5,15), (6,15), (7,15), (8,15), 	-- REPRESENTANTE DE LA U. FINANCIADORA
    (5,16), (6,16), (7,16), (8,16), 	-- EXPERTO DISCIPLINAR
    
    -- TODOS LOS INDICADORES
    (5,17), (6,17), (7,17), (8,17),
    (5,18), (6,18), (7,18), (8,18),
    (5,19), (6,19), (7,19), (8,19),
    (5,20), (6,20), (7,20), (8,20),
    (5,21), (6,21), (7,21), (8,21),
    (5,22), (6,22), (7,22), (8,22),
    (5,23), (6,23), (7,23), (8,23),
    (5,24), (6,24), (7,24), (8,24),
    (5,25), (6,25), (7,25), (8,25),
    (5,26), (6,26), (7,26), (8,26),
    (5,27), (6,27), (7,27), (8,27),
    (5,28), (6,28), (7,28), (8,28),
    (5,29), (6,29), (7,29), (8,29),
    (5,30), (6,30), (7,30), (8,30),
    (5,31), (6,31), (7,31), (8,31),
    (5,32), (6,32), (7,32), (8,32),
    (5,33), (6,33), (7,33), (8,33),
    (5,34), (6,34), (7,34), (8,34),
    (5,35), (6,35), (7,35), (8,35),
    (5,36), (6,36), (7,36), (8,36),
    (5,37), (6,37), (7,37), (8,37),
    (5,38), (6,38), (7,38), (8,38),
    (5,39), (6,39), (7,39), (8,39),
    (5,40), (6,40), (7,40), (8,40),
    (5,41), (6,41), (7,41), (8,41);

-- //////////////////////////////////////////////////////////////////////////////////////////////////
-- CARGA DE DATOS DE PRUEBA /////////////////////////////////////////////////////////////////////////
-- //////////////////////////////////////////////////////////////////////////////////////////////////

INSERT INTO admins_cyt(nombre,apellido,email,password) VALUES
    ('Juan','Administrador','admin1@mail.com',''),
    ('Jorge','Administrador','admin2@mail.com','');

INSERT INTO instituciones(nombre,rubro,pais,provincia,localidad,telefono_institucional,mail_institucional) VALUES
    ('Universidad XYZ','RUBRO A', 'Argentina', 'Buenos Aires', 'Ciudad A', '555-1111', 'info@universidadxyz.com'),
    ('UTN', 'RUBRO B', 'Argentina', 'Buenos Aires', 'Ciudad B', '132456798', 'info@utn.com'),
    ('Hospital General', 'Salud', 'Argentina', 'Buenos Aires', 'Ciudad C', '2264588978', 'contacto@hospitalgeneral.ar');

INSERT INTO instituciones_cyt(id,id_admin,id_tipo,nombre_referente,apellido_referente,cargo_referente,telefono_referente,mail_referente) VALUES
    (1,1,1,'referente xyz','apellido xyz','decano','2234567894','decano@mail.com'),
    (2,2,8,'referente utn','apellido utn','jefe de mantenimiento','2234567894','mantenimiento@mail.com');  

INSERT INTO evaluadores (email, password, nombre, apellido, dni, celular, especialidad, institucion_origen, pais_residencia, provincia_residencia, localidad_residencia) 
VALUES 
('evaluador1@example.com', '$2b$10$n.9Kp/c2HVb3NHZPEghhZexbnxUbBkx4HB8DNt.HybXIf0cmdvcRS', 'Juan', 'Pérez', 123456789, '555-1234', 'Informática', 'Universidad XYZ', 'Argentina', 'Buenos Aires', 'Ciudad A'),
('evaluador2@example.com', '$2b$10$TP1hLvKr6UPcl3OAwMNShO7Bn5m1QFVBx0rtGBXOBOZi.2TkH0Qp2', 'María', 'González', 987654321, '555-5678', 'Biología', 'Universidad XYZ', 'México', 'Ciudad B', 'Estado C'),
('evaluador3@example.com', '$2b$10$6Gnwisv9u8o51o8ydvdrSOsTHaGFPRE18Qi13BRgy2Z1C81juHJZq', 'Luis', 'Rodríguez', 555666777, '555-9876', 'Química', 'UTN', 'España', 'Madrid', 'Ciudad D'),
('evaluador4@example.com', '$2b$10$NVwHa5Hr/E9qsQ1Aa8UXSORkEBo5UbTPBBU4PO8ux8aBoavX8bDSG', 'Ana', 'Martínez', 444333222, '555-6543', 'Matemáticas', 'UTN', 'Colombia', 'Bogotá', 'Ciudad E'),
('evaluador5@example.com', '$2b$10$oX5NGdk20/sYU6ckg45J2uM/gootNxP1LV1FnvONK3/3ivinQrox.', 'Carlos', 'López', 111222333, '555-8765', 'Física', 'Hospital General', 'Chile', 'Santiago', 'Ciudad F');

-- contraseñas:
-- 
--  evaluador 1 --> contrasena123
--  evaluador 2 --> password456
--  evaluador 3 --> clave789
--  evaluador 4 --> segura987
--  evaluador 5 --> miclave123

INSERT INTO evaluadores_x_instituciones(id_institucion,id_evaluador) VALUES
    (1,1),
    (1,2),
    (1,3),
    (2,4),
    (2,5);

INSERT INTO proyectos (
    titulo,
    id_estado_eval,
    id_director,
    id_institucion,
    FechaInicio,
    FechaFin,
    area_conocim,
    subarea_conocim,
    problema_a_resolver,
    producto_a_generar,
    resumen,
    novedad_u_originalidad,
    grado_relevancia,
    grado_pertinencia,
    grado_demanda,
    fecha_carga,
    obligatoriedad_proposito,
    obligatoriedad_opinion
) VALUES (
    'Proyecto Ejemplo',
    1, -- Reemplaza con el ID correcto de estado_eval
    1, -- Reemplaza con el ID correcto de evaluadores (director)
    1, -- Reemplaza con el ID correcto de instituciones
    '2024-02-05',
    '2024-12-31',
    'Ciencia de Datos',
    'Análisis de Datos',
    'Descripción del problema a resolver',
    'Descripción del producto a generar',
    'Resumen del proyecto',
    'Novedad u originalidad del proyecto',
    'Alto',
    'Muy pertinente',
    'Alta',
    NOW(),
    1, -- true para obligatoriedad_proposito
    1  -- true para obligatoriedad_opinion
),
(
    'Proyecto de Investigación en Biología Marina',
    1, -- Reemplaza con el ID correcto de estado_eval
    3, -- Reemplaza con el ID correcto de evaluadores (director)
    1, -- Reemplaza con el ID correcto de instituciones
    '2024-03-15',
    '2025-03-15',
    'Biología Marina',
    'Conservación de Especies Marinas',
    'Estudio sobre el impacto del cambio climático en el ecosistema marino',
    'Generación de informes científicos y propuestas de conservación',
    'Resumen detallado del proyecto de investigación',
    'Propuesta innovadora para abordar la conservación marina',
    'Alto',
    'Muy pertinente',
    'Alta',
    NOW(), 
    1, -- true para obligatoriedad_proposito
    1  -- true para obligatoriedad_opinion
);

INSERT INTO evaluadores_x_proyectos(id_proyecto,id_evaluador,rol,fecha_inicio_eval) VALUES
	(1,1,'director',NOW()),
    (1,2,'evaluador',NOW()),
	(2,3,'director',NOW()),
    (2,1,'evaluador',NOW());

UPDATE evaluadores_x_proyectos SET fecha_fin_eval = NOW() WHERE id_proyecto = 2 AND id_evaluador = 1;

insert INTO participación_instituciones(id_proyecto,id_institucion,rol) VALUES
    (1,1,'Ejecutora'),
    (1,1,'Promotora'),
    (1,1,'Demandante'),
    (1,1,'Financiadora'),
    (1,1,'Adoptante')