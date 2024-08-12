
-- //////////////////////////////////////////////////////////////////////////////////////////////////
-- CARGA DE DATOS BUENOS ////////////////////////////////////////////////////////////////////////////
-- //////////////////////////////////////////////////////////////////////////////////////////////////

INSERT INTO admin(email,password) VALUES
    ('admin@mail.com','$2b$10$5vTC7fW7I9FBzYnWySB5.OAv56ifhP0kUqei5Ni7XexVO.GGQgXYq');

INSERT INTO modelos_encuesta(nombre, editable) VALUES
    ('Modelo de encuesta 1', false);

INSERT INTO secciones(nombre) VALUES
	('Sistema de evaluación'),				-- id 1
    ('Instancias e indicadores'),			-- id 2
    ('Evaluadores'),						-- id 3
    ('Software');							-- id 4

INSERT INTO modelos_x_secciones(id_modelo, id_seccion) VALUES 
    (1,1),
    (1,2),
    (1,3),
    (1,4);

INSERT INTO tipo_preguntas (tipo) VALUES  
	('opcion multiple'),	-- id 1
    ('texto'),		  		-- id 2
    ('si/no'),	   			-- id 3
    ('contenedora');			-- id 4

INSERT INTO tipos_instituciones(tipo) VALUES
    ('cyt'),
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

INSERT INTO rubros (nombre) VALUE ('cyt');

-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
-- Dimensiones e indicadores de la instancia de Entidad ///////////////////////////////////////////////////////////////////
-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

INSERT into dimensiones (nombre, id_instancia) VALUES ('Avance cognitivo',1);
INSERT into indicadores(pregunta, id_dimension, determinante, descripcion, fundamentacion)
	VALUES 
    	('¿Hubo producción de conocimiento en el desarrollo del proyecto?', 
         1, true,
         'Podría equipararse a la pregunta ¿Se produjeron innovaciones cognitivas? Refiere a nuevo conocimiento producido en sentido amplio (de conocimiento y de práctica, por ejemplo) que afecta a diferentes áreas y surge de un análisis transdisciplinar de pares extendido.',
        'Debe señalarse el conocimiento producido, la disciplina a la que pertenece y si es relacionado al objeto de desarrollo (Qué) o al proceso de desarrollo  (Cómo). Debe incorporarse y referirse el material probatorio pertinente.'),
        
        ('¿Hubo publicaciones o evidencias formales documentadas de haber producido y compartido conocimiento?', 
        1, false,
        'Refiere a si el conocimiento producido fue compartido con la comunidad en general. Este indicador puede obviarse si el proyecto estuviera bajo un acuerdo de confidencialidad entre las partes.',
        'Deben indicarse las publicaciones o evidencias formales que demuestran que el conocimiento producido fue compartido.');
            
INSERT into dimensiones (nombre, id_instancia) VALUES ('Novedad local',1);
INSERT into indicadores(pregunta, id_dimension, determinante, descripcion, fundamentacion)
	VALUES 
    	('¿Hubo originalidad a nivel local en la solución desarrollada?', 
         2, true,
         'Refiere a si la solución desarrollada produjo innovación a nivel local conforme el estado actual del arte.',
        'Debe señalarse dónde está la originalidad a nivel local en la solución desarrollada. Cuáles son los aspectos innovadores distintivos de la solución, inexistentes hasta el momento a nivel local.');

INSERT into dimensiones (nombre, id_instancia) VALUES ('Relevancia',1);
INSERT into indicadores(pregunta, id_dimension, determinante, descripcion, fundamentacion)
	VALUES 
    	('¿La solución desarrollada es relevante para el adoptante?', 
         3, true,
         'Refiere a si la solución desarrollada fue o será relevante para el adoptante en términos de su expectativa. Es decir, si la solución desarrollada generó o generará una mejora sustantiva en su procesos, productos o indicadores. ',
        'El adoptante debe presentar los fundamentos o evidencias de la mejora producida o potencial a partir de la incorporación de la solución desarrollada.'),
    	
        ('¿La solución desarrollada es relevante para el sector local? ', 
         3, false,
         'Refiere a si la solución desarrollada fue o será relevante para el sector local al que pertenece el adoptante. Es decir, si la solución desarrollada generó o podría generar una mejora sustantiva en los procesos, productos o indicadores del sector local. Para que esto ocurra, es condición que la solución desarrollada sea, al menos, potencialmente adoptable por otros actores, dando escalabilidad a la solución en el sector.',
        'Se deben presentar los fundamentos o evidencias de la mejora producida a partir de la incorporación de la solución desarrollada o expectativas fundadas de otras organizaciones del sector local al que pertenece el adoptante.');

INSERT into dimensiones (nombre, id_instancia) VALUES ('Pertenencia',1);
INSERT into indicadores(pregunta, id_dimension, determinante, descripcion, fundamentacion)
	VALUES 
    	('¿Se logró resolver, efectivamente, un problema de carácter práctico?', 
        4, true,
        'Refiere a si el problema resuelto por el desarrollo tecnológico propuesto es de carácter práctico (no teórico o hipotético).',
        'Debe describirse brevemente el problema resuelto, destacando claramente la dimensión práctica de la solución.'),
        
        ('¿Hubo consistencia entre el problema resuelto y el problema propuesto?',
        4, true,
        'Refiere a si el problema finalmente resuelto es el mismo, tal y como se lo había planteado oportunamente, y que dio lugar al proyecto. ',
        'Debe señalarse si hubo brecha (gap) entre el problema resuelto y el propuesto. En tal caso, debe consignarse si el problema resuelto se amplió (generalizó) o se redujo (especificó) respecto de la expectativa original.');

INSERT into dimensiones (nombre, id_instancia) VALUES ('Demanda',1);
INSERT into indicadores(pregunta, id_dimension, determinante, descripcion, fundamentacion)
	VALUES 
    	('¿Hubo participación comprometida del demandante en el proyecto?', 
        5, true,
        'Refiere a si el demandante (o demandantes) de la solución se involucró efectivamente en el proyecto, aportando lo que había comprometido para su desarrollo.',
        'Debe consignarse brevemente la participación y aportes del demandante en el proyecto.'),
        
        ('¿Hubo participación comprometida del adoptante en el proyecto?',
        5, true,
        'Refiere a si el adoptante (o adoptantes) de la solución se involucró efectivamente en el proyecto, aportando lo que había comprometido para su desarrollo.',
        'Debe consignarse brevemente la participación y aportes del adoptante en el proyecto.');

INSERT into dimensiones (nombre, id_instancia) VALUES ('Impacto esperado',1);
INSERT into indicadores(pregunta, id_dimension, determinante, descripcion, fundamentacion)
	VALUES 
    	('¿La solución desarrollada cuenta con la conformidad del demandante?', 
        6, true,
        'Refiere a si el demandante de la solución prestó conformidad a la misma en base al problema que pretendía resolver. Es un aval del demandante respecto de lo esperado o requerido.',
        'El demandante debe prestar conformidad formal sobre la pertinencia de la solución desarrollada en función del problema que pretendía resolver'),
        
        ('¿Hubo mejora en los indicadores propios del adoptante?', 
        6, false,
        'Refiere a la efectividad de la solución en términos de mejora de los indicadores del adoptante. Es decir, si, efectivamente, la solución impactó en los indicadores propios del adoptante que se pretendían mejorar.',
        'El adoptante debe presentar los fundamentos o evidencias del impacto de la solución desarrollada, en base a indicadores pre y post implementación de la misma.'),
        
        ('¿El proceso de desarrollo de la solución contribuyó a la calificación de recursos humanos en la temática?',
        6, false,
        'Refiere a si el proceso de desarrollo de la solución contribuyó a la formación o calificación de profesionales o personal en general en alguno de los actores involucrados (ad intra de las Unidades Ejecutoras u otro de los actores involucrados). La formación y calificación de recursos humanos es inherente a las actividades de ciencia y tecnología y uno de sus efectos o impactos esperados.',
        ' Debe fundamentarse qué personas se formaron o calificaron en la temática específica en el marco del proceso de desarrollo de la solución. ');

-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////
-- Dimensiones e indicadores de la instancia de Proposito /////////////////////////////////////////////////////
-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////

INSERT into dimensiones (nombre, id_instancia) VALUES ('Calidad del Desempeño',2);
INSERT into indicadores(pregunta, id_dimension, determinante, descripcion, fundamentacion)
	VALUES 
    	('Calidad Técnica de la solución desarrollada ', 
        7, false,
        'Califica a los fundamentos científicos y técnicos de la solución, la metodología y métodos, y la existencia de documentación técnica sobre la solución.',
        ' Debe fundamentarse el grado de satisfacción consignado respecto de la calidad de la solución propiamente dicha y de la metodología y métodos aplicados en el desarrollo. También debe consignarse la documentación técnica disponible sobre la solución desarrollada.'),
        
        ('Calidad del proceso de desarrollo del proyecto', 
        7, false,
        'Califica al proceso de desarrollo del proyecto en relación a la planificación establecida, considerando desvíos y aspectos que pudieron afectar al plan previsto.',
        'Debe fundamentarse el grado de satisfacción consignado respecto de la calidad del proceso de desarrollo del proyecto, el cumplimiento de la planificación y metas, los desvíos y aspectos que pudieron afectar el plan previsto, tales como la disponibilidad de los recursos, el compromiso de los financiadores, demandantes, adoptantes y unidades de CyT, etc.'),
        
        ('Calidad de la gestión del proyecto',
        7, false,
        'Califica la dirección del proyecto, la administración de los recursos y la gestión de las relaciones entre los actores.',
        'Debe fundamentarse el grado de satisfacción consignado respecto de la calidad de la gestión del proyecto, prestando especial atención a la dirección del proyecto, la administración de los recursos y a la gestión de las relaciones entre los actores del proyecto.');

INSERT into dimensiones (nombre, id_instancia) VALUES ('Alcance del impacto',2);
INSERT into indicadores(pregunta, id_dimension, determinante, descripcion, fundamentacion)
	VALUES 
    	('Impacto efectivo en el sector', 
        8, false,
        'Califica el grado de impacto efectivo que el proyecto y el desarrollo tecnológico tuvieron en el sector de la demanda en términos de los indicadores de efectividad esperados definidos por la demanda.',
        'Debe fundamentarse el grado de satisfacción consignado respecto del impacto efectivo que el proyecto y el desarrollo tecnológico tuvieron en el sector de la demanda. Debe referirse a los indicadores de efectividad esperados definidos oportunamente por la demanda.'),
        
        ('Impacto potencial en el sector', 
        8, false,
        'Califica el grado de impacto potencial que el desarrollo tecnológico podría tener en el sector de la demanda en términos de los indicadores de efectividad esperables definidos por la demanda. Considera la posibilidad de re-aplicación de la tecnología desarrollada o de los conocimientos producidos en otros potenciales adoptantes del mismo sector de la solución.',
        'Debe fundamentarse el grado de satisfacción consignado respecto del impacto potencial que el desarrollo tecnológico podría tener en el sector de la demanda. Puede referirse a los indicadores de efectividad esperados definidos oportunamente por la demanda u otros, considerando la posibilidad de re-aplicación de la tecnología desarrollada o de los conocimientos producidos en otros potenciales adoptantes del mismo sector de la solución.'),
        
        ('Impacto potencial en otros sectores',
        8, false,
        'Califica el grado de impacto potencial que el desarrollo tecnológico podría tener en otros sectores diferentes al de la demanda. Considera la posibilidad de re-aplicación de la tecnología desarrollada o de los conocimientos producidos en otros potenciales adoptantes de otros sectores.',
        'Debe fundamentarse el grado de satisfacción consignado respecto del impacto potencial que el desarrollo tecnológico podría tener en otros sectores diferentes al de la demanda. Puede referirse a los indicadores de efectividad esperados definidos oportunamente por la demanda u otros, considerando la posibilidad de re-aplicación de la tecnología desarrollada o de los conocimientos producidos en otros potenciales adoptantes de otros sectores diferentes al de la solución.'),
        
        ('Impacto en C&T',
        8, false,
        'Califica el grado de impacto que el desarrollo tecnológico tuvo o podría tener en las disciplinas y grupos de Ciencia y Tecnología vinculados a la temática, tanto a nivel nacional como internacional. Considera la posibilidad de apropiación y explotación de los conocimientos producidos en el ámbito del proyecto para producir nuevos conocimientos, tanto en el grupo ejecutor como en otros grupos y disciplinas.',
        'Debe fundamentarse el grado de satisfacción consignado respecto del impacto que el desarrollo tecnológico tuvo o podría tener en las disciplinas y grupos de Ciencia y Tecnología vinculados a la temática, considerando tanto el nivel nacional como internacional. Debe considerarse la posibilidad de apropiación y explotación de los conocimientos producidos en el ámbito del proyecto para producir nuevos conocimientos, tanto en el grupo ejecutor como en otros grupos y disciplinas.');
        
INSERT into dimensiones (nombre, id_instancia) VALUES ('Contribucion al desarrollo',2);
INSERT into indicadores(pregunta, id_dimension, determinante, descripcion, fundamentacion)
	VALUES 
    	('Contribución a la política institucional de las unidades ejecutoras', 
        9, false,
        'Califica la contribución del proyecto y sus efectos a las metas y objetivos estratégicos de las unidades ejecutoras, en el marco de sus respectivas políticas institucionales.',
        'Debe fundamentarse el grado de satisfacción consignado respecto de la contribución del proyecto a las metas y objetivos estratégicos de las unidades ejecutoras, en el marco de sus respectivas políticas institucionales.'),
        
        ('Contribución al desarrollo de redes locales / micro ecosistemas de innovación local',
        9, false,
        'Califica la contribución del proyecto y sus efectos al desarrollo o fortalecimiento de redes locales o micro ecosistemas de innovación local, generando las vinculaciones, sinergias y co-producción de conocimiento necesarias al efecto.',
        'Debe fundamentarse el grado de satisfacción consignado respecto de la contribución del proyecto y sus efectos al desarrollo o fortalecimiento de redes locales o micro ecosistemas de innovación local, considerando las vinculaciones y sinergias generadas y la co-producción de conocimiento que las determinan.');

INSERT into dimensiones (nombre, id_instancia) VALUES ('Valoración Socio-Ético-Política',2);
INSERT into indicadores(pregunta, id_dimension, determinante, descripcion, fundamentacion)
	VALUES 
    	('Compromiso ético', 
        10, false,
        'Califica el grado de satisfacción de principios éticos en cuanto a los fines y métodos de la I+D.',
        ' Debe fundamentarse el grado de satisfacción consignado respecto de los principios éticos en cuanto a los fines y métodos de la I+D en general y de la problemática abordada en particular.'),
        
        ('Compromiso ambiental', 
        10, false,
        'Califica el grado de satisfacción de principios de cuidado y preservación del ambiente, tanto en sus fines como en el proceso de desarrollo tecnológico y el impacto ambiental de sus efectos.',
        'Debe fundamentarse el grado de satisfacción consignado respecto de los principios de cuidado y preservación del ambiente, tanto en sus fines como en el proceso de desarrollo tecnológico y el impacto ambiental de sus efectos.'),
        
        ('Compromiso con las demandas sociales',
        10, false,
        'Califica el grado de satisfacción del proyecto respecto de metas u objetivos políticos definidos en el marco de las demandas sociales nacionales o globales. Los ODS y las urgencias sociales del país son referencias globales y locales a considerar.',
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
    
    ('no agrega valor'),
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

INSERT INTO admins_cyt(nombre,apellido,email,password,dni) VALUES
    -- admin1
    ('Juan','Administrador','admin1@mail.com','$2b$10$5vTC7fW7I9FBzYnWySB5.OAv56ifhP0kUqei5Ni7XexVO.GGQgXYq',1234),
    -- admin2
    ('Jorge','Administrador','admin2@mail.com','$2b$10$5vTC7fW7I9FBzYnWySB5.OAv56ifhP0kUqei5Ni7XexVO.GGQgXYq',1234);

INSERT INTO instituciones(nombre,id_rubro,pais,provincia,localidad,telefono_institucional,mail_institucional, esCyT, id_tipo) VALUES
    ('Universidad XYZ',1, 'Argentina', 'Buenos Aires', 'Ciudad A', '555-1111', 'info@universidadxyz.com', 1, 1),
    ('UTN', 1, 'Argentina', 'Buenos Aires', 'Ciudad B', '132456798', 'info@utn.com', 1, 1);

INSERT INTO instituciones_cyt(id,nombre_referente,apellido_referente,cargo_referente,telefono_referente,mail_referente) VALUES
    (1,'referente xyz','apellido xyz','decano','2234567894','decano@mail.com'),
    (2,'referente utn','apellido utn','jefe de mantenimiento','2234567894','mantenimiento@mail.com');  

INSERT INTO instituciones_x_admins(id_institucion, id_admin) VALUES 
    (1,1),
    (2,2);

INSERT INTO evaluadores (email, password, nombre, apellido, dni, celular, especialidad, institucion_origen, pais_residencia, provincia_residencia, localidad_residencia) 
VALUES 
('evaluador1@example.com', '$2b$10$5vTC7fW7I9FBzYnWySB5.OAv56ifhP0kUqei5Ni7XexVO.GGQgXYq', 'Juan', 'Pérez', 123456789, '555-1234', 'Informática', 'Universidad XYZ', 'Argentina', 'Buenos Aires', 'Ciudad A'),
('evaluador2@example.com', '$2b$10$5vTC7fW7I9FBzYnWySB5.OAv56ifhP0kUqei5Ni7XexVO.GGQgXYq', 'María', 'González', 987654321, '555-5678', 'Biología', 'Universidad XYZ', 'México', 'Ciudad B', 'Estado C'),
('evaluador3@example.com', '$2b$10$5vTC7fW7I9FBzYnWySB5.OAv56ifhP0kUqei5Ni7XexVO.GGQgXYq', 'Luis', 'Rodríguez', 555666777, '555-9876', 'Química', 'UTN', 'España', 'Madrid', 'Ciudad D'),
('evaluador4@example.com', '$2b$10$5vTC7fW7I9FBzYnWySB5.OAv56ifhP0kUqei5Ni7XexVO.GGQgXYq', 'Ana', 'Martínez', 444333222, '555-6543', 'Matemáticas', 'UTN', 'Colombia', 'Bogotá', 'Ciudad E'),
('evaluador5@example.com', '$2b$10$5vTC7fW7I9FBzYnWySB5.OAv56ifhP0kUqei5Ni7XexVO.GGQgXYq', 'Carlos', 'López', 111222333, '555-8765', 'Física', 'Hospital General', 'Chile', 'Santiago', 'Ciudad F');

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
    relevancia,
    pertinencia,
    demanda,
    fecha_carga,
    obligatoriedad_proposito,
    obligatoriedad_opinion,
    id_modelo_encuesta
) VALUES (
    'Proyecto 1',
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
    1, -- true para obligatoriedad_encuesta
    1 -- modelo de encuesta
),
(
    'Proyecto 2',
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
    1, -- true para obligatoriedad_encuesta
    1 -- modelo de encuesta
),
(
    'Proyecto 3',
    1, -- Reemplaza con el ID correcto de estado_eval
    1, -- Reemplaza con el ID correcto de evaluadores (director)
    1, -- Reemplaza con el ID correcto de instituciones
    '2024-03-15',
    '2025-03-15',
    'Geología',
    'Tierra',
    'Estudio sobre el impacto del cambio climático',
    'Generación de informes científicos y propuestas de conservación',
    'Resumen detallado del proyecto de investigación',
    'Propuesta innovadora para abordar la conservación',
    'Alto',
    'Muy pertinente',
    'Alta',
    NOW(), 
    1, -- true para obligatoriedad_proposito
    1, -- true para obligatoriedad_encuesta
    1 -- modelo de encuesta
);

INSERT INTO evaluadores_x_proyectos(id_proyecto,id_evaluador,rol,fecha_inicio_eval) VALUES
	(1,1,'director',NOW()),
    (1,2,'evaluador',NOW()),
	(2,3,'director',NOW()),
    (2,1,'evaluador',NOW()),
    (3,1,'director',NOW()),
    (3,2,'evaluador',NOW());


INSERT INTO respuestas_evaluacion (id_proyecto, id_evaluador, id_indicador, respuesta, justificacion, calificacion) VALUES
    -- proyecto 2 evaluador 1
    (2,1,1, 'No cumple', 'Soy una justificacion', 0),
    (2,1,2, 'No cumple', 'Soy una justificacion', 0),
    (2,1,3, 'cumple parcial', 'Soy una justificacion', 0.5),
    (2,1,4, 'cumple parcial', 'Soy una justificacion', 0.5),
    (2,1,5, 'cumple parcial', 'Soy una justificacion', 0.5),
    (2,1,6, 'cumple parcial', 'Soy una justificacion', 0.5),
    (2,1,7, 'cumple parcial', 'Soy una justificacion', 0.5),
    (2,1,8, 'cumple parcial', 'Soy una justificacion', 0.5),
    (2,1,9, 'cumple parcial', 'Soy una justificacion', 0.5),
    (2,1,10, 'cumple parcial', 'Soy una justificacion', 0.5),
    (2,1,11, 'cumple parcial', 'Soy una justificacion', 0.5),
    (2,1,12, 'cumple parcial', 'Soy una justificacion', 0.5),
    (2,1,13, 'Alto', 'Soy una justificacion', 3),
    (2,1,14, 'Alto', 'Soy una justificacion', 3),
    (2,1,15, 'Alto', 'Soy una justificacion', 3),
    (2,1,16, 'Alto', 'Soy una justificacion', 3),
    (2,1,17, 'Alto', 'Soy una justificacion', 3),
    (2,1,18, 'Alto', 'Soy una justificacion', 3),
    (2,1,19, 'Alto', 'Soy una justificacion', 3),
    (2,1,20, 'Alto', 'Soy una justificacion', 3),
    (2,1,21, 'Alto', 'Soy una justificacion', 3),
    (2,1,22, 'Alto', 'Soy una justificacion', 3),
    (2,1,23, 'Alto', 'Soy una justificacion', 3),
    (2,1,24, 'Alto', 'Soy una justificacion', 3),
    
    -- proyecto 3 evaluador 1
    (3,1,1, 'Cumple', 'Soy una justificacion', 1),
    (3,1,2, 'Cumple', 'Soy una justificacion', 1),
    (3,1,3, 'Cumple', 'Soy una justificacion', 1),
    (3,1,4, 'Cumple', 'Soy una justificacion', 1),
    (3,1,5, 'Cumple', 'Soy una justificacion', 1),
    (3,1,6, 'Cumple', 'Soy una justificacion', 1),
    (3,1,7, 'Cumple', 'Soy una justificacion', 1),
    (3,1,8, 'Cumple', 'Soy una justificacion', 1),
    (3,1,9, 'Cumple', 'Soy una justificacion', 1),
    (3,1,10, 'Cumple', 'Soy una justificacion', 1),
    (3,1,11, 'Cumple', 'Soy una justificacion', 1),
    (3,1,12, 'Cumple', 'Soy una justificacion', 1),
    (3,1,13, 'Alto', 'Soy una justificacion', 3),
    (3,1,14, 'Alto', 'Soy una justificacion', 3),
    (3,1,15, 'Alto', 'Soy una justificacion', 3),
    (3,1,16, 'Alto', 'Soy una justificacion', 3),
    (3,1,17, 'Alto', 'Soy una justificacion', 3),
    (3,1,18, 'Alto', 'Soy una justificacion', 3),
    (3,1,19, 'Alto', 'Soy una justificacion', 3),
    (3,1,20, 'Alto', 'Soy una justificacion', 3),
    (3,1,21, 'Alto', 'Soy una justificacion', 3),
    (3,1,22, 'Alto', 'Soy una justificacion', 3),
    (3,1,23, 'Alto', 'Soy una justificacion', 3),
    (3,1,24, 'Alto', 'Soy una justificacion', 3),
    
    -- proyecto 3 evaluador 2
    (3,2,1, 'Cumple', 'Soy una justificacion', 1),
    (3,2,2, 'Cumple', 'Soy una justificacion', 1),
    (3,2,3, 'Cumple', 'Soy una justificacion', 1),
    (3,2,4, 'Cumple', 'Soy una justificacion', 1),
    (3,2,5, 'Cumple', 'Soy una justificacion', 1),
    (3,2,6, 'Cumple', 'Soy una justificacion', 1),
    (3,2,7, 'Cumple', 'Soy una justificacion', 1),
    (3,2,8, 'Cumple', 'Soy una justificacion', 1),
    (3,2,9, 'Cumple', 'Soy una justificacion', 1),
    (3,2,10, 'Cumple', 'Soy una justificacion', 1),
    (3,2,11, 'Cumple', 'Soy una justificacion', 1),
    (3,2,12, 'Cumple', 'Soy una justificacion', 1),
    (3,2,13, 'Alto', 'Soy una justificacion', 3),
    (3,2,14, 'Alto', 'Soy una justificacion', 3),
    (3,2,15, 'Alto', 'Soy una justificacion', 3),
    (3,2,16, 'Alto', 'Soy una justificacion', 3),
    (3,2,17, 'Alto', 'Soy una justificacion', 3),
    (3,2,18, 'Alto', 'Soy una justificacion', 3),
    (3,2,19, 'Alto', 'Soy una justificacion', 3),
    (3,2,20, 'Alto', 'Soy una justificacion', 3),
    (3,2,21, 'Alto', 'Soy una justificacion', 3),
    (3,2,22, 'Alto', 'Soy una justificacion', 3),
    (3,2,23, 'Alto', 'Soy una justificacion', 3),
    (3,2,24, 'Alto', 'Soy una justificacion', 3);

INSERT INTO respuestas_encuesta(id_pregunta, id_evaluador, id_proyecto, respuesta) VALUES
    -- proyecto 3 evaluador 1
    (1,1,3,'nada util'),
    (2,1,3,'nada pertinente'),
    (3,1,3,'agrega valor'),
    (4,1,3,'no agrega valor'),
    (5,1,3,'si'),
    (6,1,3,null),
    (7,1,3,'si'),
    (8,1,3,'si'),
    (9,1,3,null),
    (10,1,3,'facil de usar'),
    (11,1,3,'Puede que agregaria un indicador en la instancia de entidad'),
    (12,1,3,'muy pertinente'),
    (13,1,3,'muy pertinente'),
    (14,1,3,'muy pertinente'),
    (15,1,3,'muy pertinente'),
    (16,1,3,'muy pertinente'),
    (17,1,3,'Puede que agregaria un indicador en la instancia de proposito'),
    (18,1,3,'pertinente'),
    (19,1,3,'pertinente'),
    (20,1,3,'pertinente'),
    (21,1,3,'pertinente'),
    (22,1,3,'pertinente'),
    (23,1,3,'pertinente'),
    (24,1,3,'pertinente'),
    (25,1,3,'pertinente'),
    (26,1,3,'pertinente'),
    (27,1,3,'pertinente'),
    (28,1,3,'pertinente'),
    (29,1,3,'pertinente'),
    (30,1,3,'pertinente'),
    (31,1,3,'pertinente'),
    (32,1,3,'pertinente'),
    (33,1,3,'pertinente'),
    (34,1,3,'pertinente'),
    (35,1,3,'pertinente'),
    (36,1,3,'pertinente'),
    (37,1,3,'pertinente'),
    (38,1,3,'pertinente'),
    (39,1,3,'pertinente'),
    (40,1,3,'pertinente'),
    (41,1,3,'pertinente'),
    
    -- proyecto 3 evaluador 2
    (1,2,3,'nada util'),
    (2,2,3,'nada pertinente'),
    (3,2,3,'agrega valor'),
    (4,2,3,'no agrega valor'),
    (5,2,3,'si'),
    (6,2,3,null),
    (7,2,3,'si'),
    (8,2,3,'si'),
    (9,2,3,null),
    (10,2,3,'facil de usar'),
    (11,2,3,'Puede que agregaria un indicador en la instancia de entidad'),
    (12,2,3,'muy pertinente'),
    (13,2,3,'muy pertinente'),
    (14,2,3,'muy pertinente'),
    (15,2,3,'muy pertinente'),
    (16,2,3,'muy pertinente'),
    (17,2,3,'Puede que agregaria un indicador en la instancia de proposito'),
    (18,2,3,'pertinente'),
    (19,2,3,'pertinente'),
    (20,2,3,'pertinente'),
    (21,2,3,'pertinente'),
    (22,2,3,'pertinente'),
    (23,2,3,'pertinente'),
    (24,2,3,'pertinente'),
    (25,2,3,'pertinente'),
    (26,2,3,'pertinente'),
    (27,2,3,'pertinente'),
    (28,2,3,'pertinente'),
    (29,2,3,'pertinente'),
    (30,2,3,'pertinente'),
    (31,2,3,'pertinente'),
    (32,2,3,'pertinente'),
    (33,2,3,'pertinente'),
    (34,2,3,'pertinente'),
    (35,2,3,'pertinente'),
    (36,2,3,'pertinente'),
    (37,2,3,'pertinente'),
    (38,2,3,'pertinente'),
    (39,2,3,'pertinente'),
    (40,2,3,'pertinente'),
    (41,2,3,'pertinente');

UPDATE evaluadores_x_proyectos SET fecha_fin_eval = NOW() WHERE id_proyecto = 2 AND id_evaluador = 1;
UPDATE proyectos SET id_estado_eval = 3 WHERE id = 2 ;

UPDATE evaluadores_x_proyectos SET fecha_fin_eval = NOW() WHERE id_proyecto = 3 AND id_evaluador = 1;
UPDATE evaluadores_x_proyectos SET fecha_fin_op = NOW() WHERE id_proyecto = 3 AND id_evaluador = 1;
UPDATE evaluadores_x_proyectos SET fecha_fin_eval = NOW() WHERE id_proyecto = 3 AND id_evaluador = 2;
UPDATE evaluadores_x_proyectos SET fecha_fin_op = NOW() WHERE id_proyecto = 3 AND id_evaluador = 2;
UPDATE proyectos SET id_estado_eval = 4 WHERE id = 3 ;

insert INTO participacion_instituciones(id_proyecto,id_institucion,rol) VALUES
    (1,1,'Ejecutora'),
    (1,1,'Promotora'),
    (1,1,'Demandante'),
    (1,1,'Financiadora'),
    (1,1,'Adoptante')

