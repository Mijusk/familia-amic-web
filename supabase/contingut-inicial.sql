-- Contenido inicial: noticias y guías de recursos migradas de la web antigua (www.familiaamic.cat)
-- para la primera carga de la web nueva.
--
-- Cómo usarlo: ejecutar una sola vez en el editor SQL de Supabase, después de aplicar las migraciones.
-- Se puede volver a ejecutar sin riesgo: cada fila usa "on conflict (slug) do nothing", así que
-- no duplica nada ni sobrescribe lo que ya se haya editado desde el panel.
--
-- Notas:
--   - Los textos se publican en el idioma en que estaban escritos (sin traducir).
--   - No se incluyen imágenes (image_url null): los enlaces de la web antigua caducan.
--   - No aparecen nombres de personas particulares (socios, familias, monitores, talleristas...).

begin;

-- ---------------------------------------------------------------------------
-- Recursos (guías prácticas)
-- ---------------------------------------------------------------------------

insert into public.resources (slug, lang, category, title, summary, body, external_url, position, status) values

-- Temes legals ---------------------------------------------------------------

('certificat-discapacitat', 'ca', 'legals',
 $t$Certificat de reconeixement de discapacitat$t$,
 $t$El certificat que reconeix el grau de discapacitat i que dona accés a ajudes fiscals, bonificacions i descomptes.$t$,
 $t$El certificat de reconeixement del grau de discapacitat és el document de partida per a moltes altres ajudes. Es tramita a la Generalitat de Catalunya, tant per a un primer reconeixement com per a una revisió del grau.

## Què permet obtenir

- Ajudes fiscals (IRPF, Impost de Societats).
- Bonificació de l'impost de vehicles (IVTM): totalment gratuït si el vehicle pertany a la persona amb discapacitat.
- Avantatges al servei de transport públic.
- Descomptes en alguns establiments.
- Bonificacions en museus, monuments, parcs d'atraccions i aquàrium.

## Com es demana

El tràmit es fa a la web de la Generalitat: [Reconeixement o revisió del grau de discapacitat](https://web.gencat.cat/es/tramits/tramits-temes/Reconeixement-o-revisio-del-grau-de-la-discapacitat).

Qualsevol dubte, escriu-nos a familiaamic@gmail.com.$t$,
 'https://web.gencat.cat/es/tramits/tramits-temes/Reconeixement-o-revisio-del-grau-de-la-discapacitat',
 10, 'publicada'),

('llei-dependencia', 'ca', 'legals',
 $t$Llei de dependència$t$,
 $t$Un cop reconegut el grau de dependència, s'atorguen ajudes econòmiques i d'assistència a la persona.$t$,
 $t$Un cop tramitada la dependència, i segons el grau que es reconegui, s'atorguen diferents ajudes:

- Econòmiques.
- D'assistència a la persona amb discapacitat.

Qualsevol dubte, escriu-nos a familiaamic@gmail.com i t'orientarem.$t$,
 null, 20, 'publicada'),

('deduccio-irpf-discapacitat', 'ca', 'legals',
 $t$Deducció a l'IRPF per descendents o ascendents amb discapacitat$t$,
 $t$Deducció de 1.200 € anuals per cada fill amb discapacitat a càrrec, que es pot aplicar a la declaració de la renda o cobrar per avançat cada mes.$t$,
 $t$Els contribuents que tinguin descendents amb discapacitat a càrrec, amb dret a aplicar el mínim per descendents, tenen dret a una deducció a l'Impost sobre la Renda de les Persones Físiques. Hi ha una deducció semblant per ascendents amb discapacitat a càrrec i per família nombrosa.

## Com es demana

Hi ha dues maneres de sol·licitar-la:

- **A la declaració de la renda** (maig–juny): es poden desgravar 1.200 € per fill amb discapacitat a càrrec, emplenant la casella corresponent.
- **Cobrament anticipat**: es cobren els 1.200 € anuals a raó de 100 € cada mes. Cal presentar el model 143 a l'Agència Tributària.

Tràmit del model 143: https://www.agenciatributaria.gob.es/AEAT.sede/procedimientoini/G613.shtml

Qualsevol dubte, contacta amb nosaltres: familiaamic@gmail.com$t$,
 'https://www.agenciatributaria.gob.es/AEAT.sede/procedimientoini/G613.shtml',
 30, 'publicada'),

('prestacio-seguretat-social', 'ca', 'legals',
 $t$Prestació de la Seguretat Social per fill a càrrec amb discapacitat$t$,
 $t$Prestació econòmica per a pares amb fills a càrrec amb discapacitat, sense tenir en compte els ingressos familiars.$t$,
 $t$La Seguretat Social concedeix una prestació econòmica per als pares amb fills a càrrec amb discapacitat, sense considerar els ingressos familiars.

L'import anual és de 1.000 €, que es cobren en dos pagaments: 500 € al juliol i 500 € al gener.

Trobaràs tota la informació i les quanties vigents a la web de la [Seguretat Social](https://www.seg-social.es).

Qualsevol dubte, escriu-nos a familiaamic@gmail.com.$t$,
 'https://www.seg-social.es/Internet_1/Trabajadores/PrestacionesPension10935/Prestacionesfamilia10967/Prestacioneconomica27924/Cuantias/index.htm',
 40, 'publicada'),

('patrimoni-protegit', 'ca', 'legals',
 $t$Patrimoni protegit$t$,
 $t$Una via per garantir la seguretat econòmica futura d'una persona amb una discapacitat superior al 33%, amb avantatges fiscals per a les aportacions familiars.$t$,
 $t$La constitució d'un patrimoni protegit en benefici d'una persona amb una discapacitat superior al 33% és una bona via per garantir-ne la seguretat econòmica en el futur.

La normativa fomenta les aportacions de les famílies amb reduccions fiscals per constituir patrimonis protegits de familiars amb discapacitat i per fer-hi aportacions.

## Com es constitueix

La Llei 41/2003 regula els patrimonis protegits de les persones amb discapacitat, que s'han de constituir en document públic, és a dir, davant notari.

## Més informació

Pots consultar la informació de l'[Agència Tributària sobre patrimonis protegits](https://www.agenciatributaria.es/AEAT.internet/Inicio/_Segmentos_/Ciudadanos/Discapacitados/Patrimonios_protegidos_de_personas_con_discapacidad_.shtml).

Si tens dubtes, l'associació et pot posar en contacte amb especialistes legals en patrimonis protegits: familiaamic@gmail.com.$t$,
 'https://www.agenciatributaria.es/AEAT.internet/Inicio/_Segmentos_/Ciudadanos/Discapacitados/Patrimonios_protegidos_de_personas_con_discapacidad_.shtml',
 50, 'publicada'),

('targeta-rosa', 'ca', 'legals',
 $t$Targeta Rosa$t$,
 $t$Targeta de l'Ajuntament de Barcelona que dona descomptes i avantatges en establiments i entitats de l'àrea metropolitana.$t$,
 $t$Amb la Targeta Rosa tindràs descomptes i avantatges en un gran nombre d'establiments i entitats de l'àrea metropolitana.

## Qui la pot demanar

- Persones empadronades a Barcelona.
- Amb un grau de discapacitat igual o superior al 33%.

## Tipus de targeta

Segons els ingressos, la targeta pot ser:

- **G**: gratuïta.
- **R**: reduïda.

## Com es demana

Tota la informació és a la web de l'Ajuntament: [Com aconseguir la Targeta Rosa](https://ajuntament.barcelona.cat/targetarosa/es/como-conseguir-la-tarjeta-rosa).

Qualsevol dubte, escriu-nos a familiaamic@gmail.com.$t$,
 'https://ajuntament.barcelona.cat/targetarosa/es/como-conseguir-la-tarjeta-rosa',
 60, 'publicada'),

('targeta-estacionament', 'ca', 'legals',
 $t$Targeta d'estacionament per a persones amb mobilitat reduïda$t$,
 $t$Enllaç al tràmit de l'Ajuntament de Barcelona per sol·licitar la targeta d'estacionament per a persones amb mobilitat reduïda.$t$,
 $t$La targeta d'estacionament per a persones amb mobilitat reduïda es tramita a l'ajuntament.

Pots fer el tràmit al [portal de tràmits de l'Ajuntament de Barcelona](https://w30.bcn.cat/APPS/portaltramits/portal/channel/default.html?&stpid=19970000225&style=ciudadano&language=es).

Qualsevol dubte, escriu-nos a familiaamic@gmail.com.$t$,
 'https://w30.bcn.cat/APPS/portaltramits/portal/channel/default.html?&stpid=19970000225&style=ciudadano&language=es',
 70, 'publicada'),

('targeta-sanitaria-cuidam', 'ca', 'legals',
 $t$Targeta sanitària CUIDA'M$t$,
 $t$La targeta sanitària individual CUIDA'M es tramita al CAP.$t$,
 $t$Tramita la targeta sanitària CUIDA'M al teu CAP.

Trobaràs més informació a la web del [CatSalut](https://catsalut.gencat.cat/es/proveidors-professionals/tsi-cuidam/).

Qualsevol dubte, escriu-nos a familiaamic@gmail.com.$t$,
 'https://catsalut.gencat.cat/es/proveidors-professionals/tsi-cuidam/',
 80, 'publicada'),

('targeta-cuidadora', 'ca', 'legals',
 $t$Targeta cuidadora$t$,
 $t$Targeta gratuïta de l'Ajuntament de Barcelona per a les persones que tenen cura d'altres de manera intensiva, amb 14 mesures i serveis gratuïts.$t$,
 $t$Des del 29 de setembre de 2022, totes les persones (cuidadores, familiars o professionals) que tenen cura d'altres persones de manera intensiva poden sol·licitar la Targeta cuidadora.

La targeta és gratuïta i facilita 14 mesures i serveis gratuïts.

## Com es demana

- Per internet: barcelona.cat/ciutatcuidadora
- Presencialment a l'Espai Barcelona Cuida (c. Viladomat, 127).
- Presencialment a qualsevol Vila Veïna.

## Més informació

[Arriba la Targeta cuidadora, una eina per a persones que cuiden](https://ajuntament.barcelona.cat/accessible/ca/noticia/arriba-la-targeta-cuidadora-una-eina-per-a-persones-que-cuiden_1205371)$t$,
 'https://ajuntament.barcelona.cat/accessible/ca/noticia/arriba-la-targeta-cuidadora-una-eina-per-a-persones-que-cuiden_1205371',
 90, 'publicada'),

('targeta-daurada-renfe', 'ca', 'legals',
 $t$Targeta Daurada de Renfe$t$,
 $t$Targeta de Renfe que dona descomptes sobre el preu de la tarifa general dels bitllets de tren.$t$,
 $t$La Targeta Daurada de Renfe ofereix descomptes sobre el preu de la tarifa general o base dels bitllets.

## On es tramita

- A les taquilles de les estacions i a l'Oficina de Vendes de Ceuta.
- A les agències de viatges presencials.
- També la poden emetre algunes entitats financeres, excepte la modalitat «amb acompanyant».

Consulta les condicions i els descomptes vigents a la web de [Renfe](https://www.renfe.com/es/es/viajar/prepara-tu-viaje/descuentos/mayores-de-60).$t$,
 'https://www.renfe.com/es/es/viajar/prepara-tu-viaje/descuentos/mayores-de-60',
 100, 'publicada'),

('exempcio-impost-co2', 'ca', 'legals',
 $t$Exempció de l'impost sobre emissions de CO2 per a vehicles adaptats$t$,
 $t$Els vehicles adaptats per a la conducció de persones amb mobilitat reduïda estan exempts de l'impost, però cal presentar una al·legació.$t$,
 $t$Els vehicles adaptats per a la conducció de persones amb mobilitat reduïda (PMR) queden exempts del pagament de l'impost sobre emissions de CO2. Perquè l'exempció s'apliqui, però, cal presentar una al·legació dins del termini (a la informació original, abans del 4 de juny).

MIFAS explica pas a pas com fer-ho: [Exempció de l'impost sobre emissions de CO2 als vehicles adaptats](https://www.mifas.cat/ca/noticies/exempcio-de-l-impost-sobre-emissions-de-co2-als-vehicles-adaptats-per-a-la-conduccio-de-persones-pmr/).$t$,
 'https://www.mifas.cat/ca/noticies/exempcio-de-l-impost-sobre-emissions-de-co2-als-vehicles-adaptats-per-a-la-conduccio-de-persones-pmr/',
 110, 'publicada'),

('ajudes-pua', 'ca', 'legals',
 $t$Ajudes PUA per a l'autonomia personal$t$,
 $t$Prestació de la Generalitat per contribuir a les despeses de productes i actuacions que promouen l'autonomia personal de les persones amb discapacitat.$t$,
 $t$La PUA és una prestació social de caràcter econòmic, de dret de concurrència, d'atenció social a les persones amb discapacitat.

## Què és

Té per objecte contribuir a les despeses ocasionades per l'adquisició de productes i actuacions destinades a promoure l'autonomia personal de les persones amb discapacitat física, psíquica o sensorial, amb mesures compensatòries per millorar-ne la qualitat de vida i fomentar-ne la integració social.

## Convocatòries

La convocatòria es publica al DOGC. La darrera que vam difondre corresponia als anys 2021, 2022 i 2023, amb un termini de sol·licitud del 31 de març de 2023 (9 h) al 15 de maig de 2023 (14 h). Consulta sempre la convocatòria vigent a la web de la Generalitat.

## Més informació

[Prestació d'atenció social a les persones amb discapacitat (PUA)](https://web.gencat.cat/es/tramits/tramits-temes/Prestacio-datencio-social-a-les-persones-amb-discapacitat-PUA)$t$,
 'https://web.gencat.cat/es/tramits/tramits-temes/Prestacio-datencio-social-a-les-persones-amb-discapacitat-PUA',
 120, 'publicada'),

-- Educació -------------------------------------------------------------------

('escollir-escola', 'es', 'educacio',
 $t$Cómo elegir colegio$t$,
 $t$Siete criterios que aconseja la asociación para elegir colegio para un hijo o hija con discapacidad intelectual.$t$,
 $t$## El derecho a una educación inclusiva

La Convención internacional sobre los derechos de las personas con discapacidad dice en su artículo 24 (Educación): «Los Estados Partes reconocen el derecho de las personas con discapacidad a la educación. Con miras a hacer efectivo este derecho sin discriminación y sobre la base de la igualdad de oportunidades, los Estados Partes asegurarán un sistema de educación inclusivo a todos los niveles así como la enseñanza a lo largo de la vida».

## Siete criterios para elegir

Cuando los padres tenemos que elegir colegio se nos plantean muchísimas dudas: nos informamos y asistimos a jornadas de puertas abiertas. Para nuestro hijo o hija con distintas capacidades debemos seguir el mismo procedimiento, centrándonos en estos siete criterios que aconsejamos desde la asociación:

- **Que sea un colegio inclusivo**: que quieran a nuestro hijo o hija y le den la bienvenida, no que tan solo le permitan estar.
- **El mismo colegio que sus hermanos.**
- **Proximidad al domicilio familiar.**
- **Valores compartidos**: es necesario que esté en línea con los valores de la familia.
- **Pensar a largo plazo**: los alumnos con discapacidad intelectual, por lo general, tienen dificultades para adaptarse a los cambios, por eso es preferible tener en cuenta toda la etapa escolar.
- **Un centro más pequeño**: las personas con discapacidad intelectual suelen tener dificultades para orientarse en el espacio y en el tiempo, por eso les beneficia una escuela de menor dimensión.
- **Implicación de los padres**: escogeremos el colegio que nos permita implicarnos. Los padres intentaremos colaborar de forma positiva con el colegio, porque somos quienes mejor conocemos a nuestro hijo o hija.

Si tienes dudas, escríbenos a familiaamic@gmail.com.$t$,
 null, 10, 'publicada'),

('serveis-educatius', 'ca', 'educacio',
 $t$Serveis educatius: EAP, CEEPSIR, llenguatge i DAPSI$t$,
 $t$Què fan els principals serveis de suport a l'alumnat amb necessitats educatives: l'EAP, els centres CEEPSIR, els serveis de llenguatge i el DAPSI.$t$,
 $t$## EAP (Equip d'Assessorament i Orientació Psicopedagògica)

L'EAP dona suport al professorat i als centres educatius, identificant i avaluant les necessitats específiques de suport educatiu de l'alumnat des de l'etapa infantil fins a secundària. També dona suport a les famílies.

- Les famílies decideixen l'escolarització: l'orientació és cap a l'escola ordinària, tret que els pares prefereixin un centre d'educació especial.
- L'equip vetlla perquè l'alumnat amb dictamen disposi dels recursos adequats (psicopedagogia, logopèdia, mestres de suport) i progressi en el centre.
- Per demanar el suport d'un CEEPSIR, els pares han de marcar «RECURSOS INTENSIUS» a la pàgina 2 del dictamen.

Més informació: https://xtec.cat/crp-sabadell/serveiseducatius.html

## CEEPSIR

Amb l'aprovació del decret d'escola inclusiva, nombrosos centres d'educació especial es transformen en centres que atenen els alumnes amb necessitats específiques de suport educatiu a les escoles ordinàries.

Quan vam redactar aquesta guia hi havia 8 centres:

- Barcelona: Aspasim, Sant Joan de la Creu, El Niu, Vilajoana i El Pont del Dragó.
- Vic: L'Estel.
- Manresa: Moragas.
- Baix Llobregat: Balmes.

Al Vallès Occidental no n'hi havia cap.

## Llenguatge

- **CREDA**: atén alumnes amb greus trastorns d'audició, llenguatge i comunicació, i determina l'accés a la logopèdia.
- **CRIL**: servei de llenguatge que depèn del CAP; cal la derivació del metge de capçalera.
- **Mètode Tomatis**: tracta mitjançant una escolta repetitiva i seleccionada segons l'estudi individualitzat de cada persona, per estimular la percepció i millorar el llenguatge.
- **Música**: l'estimulació musical en la discapacitat intel·lectual ajuda a millorar la comunicació.

## DAPSI

El Centre per al diagnòstic, l'atenció precoç i el suport a la infància ofereix serveis de prevenció, detecció, diagnòstic i abordatge terapèutic dels trastorns del desenvolupament dels infants de 0 a 6 anys: fisioteràpia, logopèdia, medicina, psicologia i treball social.$t$,
 null, 20, 'publicada'),

('ajudes-mec', 'ca', 'educacio',
 $t$Ajudes del Ministeri d'Educació (NESE i estudis postobligatoris)$t$,
 $t$Ajudes anuals per a alumnes amb necessitat específica de suport educatiu i beques generals per a estudis postobligatoris.$t$,
 $t$## Ajudes per a alumnes amb necessitat específica de suport educatiu

Cada any el Ministeri d'Educació ofereix ajudes per a alumnes amb necessitat específica de suport educatiu (NESE).

Dins dels límits de renda, cobreixen aquests conceptes:

- Ensenyament.
- Menjador escolar.
- Transport.
- Llibres i material didàctic.
- Residència escolar.
- Reeducació pedagògica.
- Reeducació del llenguatge.

Si se superen els límits de renda però la família és nombrosa o monoparental, es poden demanar:

- Menjador escolar.
- Transport.

**Termini habitual**: del 15 d'agost a finals de setembre.

Més informació: [Ajuts per a alumnes amb necessitat específica de suport educatiu](https://web.gencat.cat/ca/tramits/tramits-temes/358-ajuts-ministerio-NEE)

## Beques per a estudis postobligatoris

El Ministeri publica cada any la convocatòria de beques generals per a estudis postobligatoris, universitaris i no universitaris, al BOE. Per exemple, la convocatòria publicada el 12 de març de 2022: https://www.boe.es/boe/dias/2022/03/12/pdfs/BOE-B-2022-7804.pdf

Cada inici de curs ajudem les famílies a tramitar aquestes ajudes. Escriu-nos a familiaamic@gmail.com.$t$,
 'https://web.gencat.cat/ca/tramits/tramits-temes/358-ajuts-ministerio-NEE',
 30, 'publicada'),

('decret-escola-inclusiva', 'ca', 'educacio',
 $t$Decret 150/2017 d'escola inclusiva$t$,
 $t$El decret que regula l'atenció educativa a l'alumnat en el marc d'un sistema educatiu inclusiu a Catalunya.$t$,
 $t$Moltes associacions de tota Catalunya portem temps bastint ponts per aconseguir una educació inclusiva de qualitat.

L'objectiu de l'associació és col·laborar amb el Departament d'Educació i altres entitats per millorar i ajudar els professionals i les famílies, amb la mirada posada en tot l'alumnat. Per això vam mantenir diverses reunions amb el Departament d'Educació per proposar millores a l'esborrany del nou decret inclusiu, perquè millorés la qualitat a l'escola de tots els alumnes i especialment dels que presenten necessitats educatives.

La Direcció General d'Educació Infantil i Primària i la Subdirecció General d'Ordenació i Atenció a la Diversitat hi van treballar des de l'any 2014, fins que es va aprovar el decret.

## El decret

**Decret 150/2017, de 17 d'octubre, de l'atenció educativa a l'alumnat en el marc d'un sistema educatiu inclusiu.**

El decret desenvolupa la Llei 12/2009, del 10 de juliol, d'educació, i dona continuïtat a les actuacions del Departament d'Educació basades en els principis d'inclusió, normalització, escola per a tothom, sectorització de serveis i atenció personalitzada.

Pots llegir-ne el text complet al [DOGC](https://dogc.gencat.cat/ca/pdogc_canals_interns/pdogc_resultats_fitxa/?action=fitxa&mode=single&documentId=799722&language=ca_ES).$t$,
 'https://dogc.gencat.cat/ca/pdogc_canals_interns/pdogc_resultats_fitxa/?action=fitxa&mode=single&documentId=799722&language=ca_ES',
 40, 'publicada'),

('preinscripcio-postobligatoris', 'ca', 'educacio',
 $t$Preinscripció a estudis postobligatoris$t$,
 $t$On consultar les dates oficials de preinscripció a batxillerat, formació professional i altres estudis postobligatoris.$t$,
 $t$Les dates oficials de preinscripció a estudis postobligatoris es publiquen cada curs al portal de preinscripció de la Generalitat.

Consulta-les a https://preinscripcio.gencat.cat/ca/inici

Si necessiteu orientació, escriu-nos a familiaamic@gmail.com.$t$,
 'https://preinscripcio.gencat.cat/ca/inici',
 50, 'publicada'),

('educacio-inclusiva-enllacos', 'ca', 'educacio',
 $t$Educació inclusiva: enllaços útils$t$,
 $t$Materials, estudis i publicacions per conèixer i fer avançar l'escola inclusiva.$t$,
 $t$«La educación es el arma más poderosa que puedes usar para cambiar el mundo» (Nelson Mandela).

## Webteca Inclusiva de Down Catalunya

Banc de recursos amb materials educatius per atendre la diversitat de l'alumnat i l'aprenentatge en qualsevol context educatiu: https://www.webtecainclusiva.cat/

## De l'escola inclusiva al sistema inclusiu

Publicació del Departament d'Educació adreçada a tota la comunitat educativa. [Infografia (PDF)](https://educacio.gencat.cat/web/.content/home/departament/publicacions/infografies/escola-inclusiva-sistema-inclusiu.pdf)

## Taula de Participació per un Sistema Educatiu Inclusiu

La primera sessió plenària de la Taula de Participació per un Sistema Educatiu Inclusiu (TAPSEI) es va reunir a Mataró, amb representants de famílies, entitats, administracions públiques, alumnat, docents i experts universitaris. [Article al Diari de l'Educació](https://diarieducacio.cat/educacio-activa-la-taula-de-participacio-per-fer-avancar-lescola-inclusiva/)

## Compartir aula amb companys amb discapacitat

Reacció d'experts a l'estudi que diu que els estudiants sense discapacitat obtenen els mateixos resultats quan tenen companys amb discapacitat: https://sciencemediacentre.es/reaccion-al-estudio-que-dice-que-los-estudiantes-sin-discapacidad-obtienen-los-mismos-resultados$t$,
 null, 60, 'publicada'),

('publicacions-recomanades', 'ca', 'educacio',
 $t$Publicacions recomanades$t$,
 $t$Llibres, articles i guies que recomanem sobre discapacitat intel·lectual, germans, TEA i inclusió.$t$,
 $t$Una selecció de lectures que us recomanem, per a famílies, germans i professionals.

## Llibres i articles

- «¿Qué le pasa a tu hermano?», d'Àngels Ponce i Miguel Gallardo.
- «Bet y el TEA», d'Anna Gusó i Joana Bruna.
- «1 fill inesperat i 1 sofà», de Gemma Vilanova.
- «La comprensión actual de la discapacidad intelectual», de Jesús Flórez.
- «El beso de Jesús: las enseñanzas de las personas con síndrome de Down».
- «Estigma i discapacitat».
- Guia digital sobre el TEA.

## Vídeo

«El llegat», entrevista a Efrèn Carbonell de la Fundació Institut Social Partners: https://www.youtube.com/watch?v=gglbMGHfcTI

Si voleu algun d'aquests documents, escriviu-nos a familiaamic@gmail.com.$t$,
 null, 70, 'publicada'),

-- Salut ----------------------------------------------------------------------

('farmacia-gratuita-menors', 'ca', 'salut',
 $t$Farmàcia gratuïta per a menors amb un 33% o més de discapacitat$t$,
 $t$Els menors d'edat amb una discapacitat igual o superior al 33% no paguen els medicaments. Es tramita a la Seguretat Social.$t$,
 $t$Els menors d'edat amb una discapacitat igual o superior al 33% tenen dret a farmàcia gratuïta: no han de pagar els seus productes farmacèutics.

## Com es demana

- Presencialment, en un Centre d'Atenció i Informació de la Seguretat Social (CAISS), amb cita prèvia demanada a www.seg-social.es.
- Completament per internet, a la [seu electrònica de la Seguretat Social](https://sede.seg-social.gob.es/wps/portal/sede/sede/Ciudadanos/cita+previa+para+pensiones+y+otras+prestaciones/13cita+previa+para+pensiones+y+otras+prestaciones).

## Documentació

Del sol·licitant o del menor amb discapacitat:

- DNI; en cas de persones estrangeres, NIE, passaport o document d'identitat vigent al país d'origen.
- Certificat de reconeixement del grau de discapacitat del menor, igual o superior al 33%.

Del progenitor, tutor, acollidor o guardador del menor:

- Progenitor: llibre de família o certificat de naixement.
- Tutor, acollidor o guardador: document emès per l'autoritat competent que acrediti la condició de tutelat o acollit legalment.

Qualsevol dubte, escriu-nos a familiaamic@gmail.com.$t$,
 'https://sede.seg-social.gob.es/wps/portal/sede/sede/Ciudadanos/cita+previa+para+pensiones+y+otras+prestaciones/13cita+previa+para+pensiones+y+otras+prestaciones',
 10, 'publicada'),

('estudis-clinics-imim', 'ca', 'salut',
 $t$Estudis clínics sobre la síndrome de Down a l'IMIM$t$,
 $t$L'Institut Hospital del Mar d'Investigacions Mèdiques (IMIM) fa estudis clínics amb persones amb síndrome de Down, fruit d'un conveni amb Down Catalunya.$t$,
 $t$## Conveni entre Down Catalunya i l'IMIM

L'abril de 2021, Down Catalunya va signar un conveni de col·laboració amb l'Institut Hospital del Mar d'Investigacions Mèdiques (IMIM) per establir un marc estable de relació institucional i promoure projectes d'atenció i promoció de la salut, a través de l'assistència sanitària, la recerca científica i la innovació.

La investigació és clau per millorar la salut i la qualitat de vida de les persones amb síndrome de Down. Avançar en medicina depèn en gran mesura dels assajos clínics, que ens orienten sobre com abordar els trastorns que poden tenir associats algunes persones amb síndrome de Down. Fins ara, els assajos clínics són l'única manera de valorar l'efectivitat dels nous tractaments.

## Estudi EEG-DS

Estudia algunes característiques de l'activitat neural. Hi participen 24 persones amb un neurodesenvolupament normotípic i 24 persones amb síndrome de Down, totes d'entre 18 i 35 anys.

- Una visita inicial (d'1 a 4 hores) a la Unitat de Recerca Clínica de l'IMIM, amb entrevista clínica, extracció de sang i un electroencefalograma (EEG).
- Si es compleixen els criteris, una segona visita amb tres electroencefalogrames: un en repòs i dos fent tasques cognitives amb ordinador o tauleta.
- No hi ha cap tractament, intervenció terapèutica ni visita de seguiment, i s'ofereix una compensació per les molèsties.

## Estudi ICOD

Projecte finançat per la Unió Europea per desenvolupar clínicament un nou compost (l'AEF0217) que podria ajudar les persones amb síndrome de Down a millorar el rendiment cognitiu. Els estudis previs en 68 persones amb desenvolupament normotípic van mostrar que la molècula és molt segura i ben tolerada; ara es vol confirmar també en persones amb síndrome de Down. Es buscaven participants d'entre 18 i 35 anys.

## Estudi GO-DS21

Analitza els patrons de comorbiditat en la síndrome de Down per entendre com es desenvolupen les afeccions associades a la trisomia 21, i com factors com l'estil de vida, la salut mental o la resposta a l'estrès expliquen les diferències entre persones. S'hi podien apuntar persones amb trisomia 21 completa d'entre 12 i 45 anys.

- Una visita d'un matí: dades demogràfiques, història clínica, avaluació física, una petita avaluació neuropsicològica i qüestionaris per al pare, la mare o el tutor legal.
- Una analítica de sang (cal venir en dejú) i una mostra de cabell per analitzar el cortisol.
- Un petit grup de participants pot fer una segona visita amb mostres de sang, cabell i saliva, dades d'activitat física amb una polsera i un qüestionari sobre el son.

## Com participar

Consulta els estudis oberts a la web de l'IMIM: [EEG-DS, estudi d'activitat neural en adults amb síndrome de Down](https://www.imim.cat/estudis-clinics/11/eegds-estudi-dactivitat-neural-en-adults-amb-sindrome-de-down). Si tens dubtes, escriu-nos a familiaamic@gmail.com.$t$,
 'https://www.imim.cat/estudis-clinics/11/eegds-estudi-dactivitat-neural-en-adults-amb-sindrome-de-down',
 20, 'publicada'),

('downmedia-alert', 'ca', 'salut',
 $t$DownMedia Alert: actualitat científica sobre la síndrome de Down$t$,
 $t$Recull mensual de la Fundació Iberoamericana Down21 amb articles recents de la literatura internacional sobre la síndrome de Down.$t$,
 $t$DownMediaAlert és una secció de la web de la Fundació Iberoamericana Down21 on cada mes es publica una selecció d'articles apareguts recentment a la literatura internacional sobre temes diversos relacionats amb la síndrome de Down: salut, educació, vida adulta, famílies i recerca.

## Números recents

- [Març 2025 (núm. 78)](https://www.down21.org/downmediaalert/4374-downmediaalert-marzo-2025-n-78.html): resums de la 4a Conferència Internacional de la Trisomy 21 Research Society, l'experiència dels pares en el diagnòstic i la presència d'estudiants amb discapacitat intel·lectual a les universitats.
- [Febrer 2025 (núm. 77)](https://www.down21.org/downmediaalert/4365-downmediaalert-febrero-2025-n-77.html): l'empatia en infants amb discapacitat intel·lectual, la síndrome de Down «mosaic» i l'Alzheimer, i les funcions executives en adults.
- [Gener 2025 (núm. 76)](https://www.down21.org/downmediaalert/4350-downmediaalert-enero-2025-n-76.html): la resiliència de les mares i la teràpia per a problemes d'alimentació i deglució.
- [Desembre 2024 (núm. 75)](https://www.down21.org/downmediaalert/4341-downmediaalert-diciembre-2024-n-75.html): nutrició, benestar mental en adults i guies clíniques per a adults.
- [Novembre 2024 (núm. 74)](https://www.down21.org/downmediaalert/4334-downmediaalert-noviembre-2024-n-74.html): les emocions dels germans, les matemàtiques en família i la qualitat de vida.
- [Octubre 2024 (núm. 73)](https://www.down21.org/downmediaalert/4326-downmediaalert-octubre-2024-n-73.html): Alzheimer, el pas a la vida adulta, l'autisme en adults i l'exercici físic.
- [Setembre 2024 (núm. 72)](https://www.down21.org/downmediaalert/4317-downmediaalert-septiembre-2024-n-72.html): intervenció dels pares en problemes conductuals i emocionals, i el diagnòstic prenatal o postnatal.
- [Agost 2024 (núm. 71)](https://www.down21.org/downmediaalert/4307-downmediaalert-agosto-2024-n-71.html): hàbits alimentaris i activitat física en infants i adolescents.

## Programes de salut

La Downciclopedia recull les indicacions de tots els programes de salut, des del naixement i al llarg de la vida de les persones amb síndrome de Down: https://www.downciclopedia.org/$t$,
 null, 30, 'publicada')

on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Noticias
-- ---------------------------------------------------------------------------

insert into public.news (slug, lang, title, summary, body, image_url, activity_id, published_on, status) values

('sopar-joves-autogestors-juny-2024', 'ca',
 $t$Sopar de joves i projecte d'autogestors: parlem de la sequera$t$,
 $t$Al sopar de joves de juny vam treballar el projecte d'autogestors i vam compartir idees per combatre la sequera.$t$,
 $t$El 7 de juny vam fer el sopar de joves, on aprofitem per dur a terme el projecte d'autogestors.

Aquesta vegada vam parlar de la sequera: cadascú va dir el que pensa i, sobretot, ens vam centrar a compartir maneres de combatre aquest gran problema.

Tenim moltes ganes de compartir les nostres opinions amb persones d'altres entitats!$t$,
 null, null, '2024-06-07', 'publicada'),

('comencen-casals-lli-2024', 'ca',
 $t$Comencen els casals d'estiu LLI$t$,
 $t$El 25 de juny va començar el casal d'estiu LLI: quatre setmanes de tallers, natació i excursions, fins al 19 de juliol.$t$,
 $t$El dimarts 25 de juny va començar el casal d'estiu LLI, que dura quatre setmanes, fins al 19 de juliol.

Cada dia, de 9 a 14 h, fem diferents activitats: comencem amb coneixement en valors i una mica de deures, i després fem tallers (cada dia una activitat diferent) per acabar amb classe de natació.

A més, un dia a la setmana marxem d'excursió: a la platja, a un museu...$t$,
 null, null, '2024-06-25', 'publicada'),

('vela-mataro-2024', 'ca',
 $t$Un dia de vela amb Vela Mataró$t$,
 $t$Vam aprendre les nocions bàsiques per navegar amb vela, ens vam banyar al mar i vam acabar amb un pícnic.$t$,
 $t$El dijous 5 de setembre vam gaudir d'un dia increïble amb Vela Mataró.

Ens van ensenyar les nocions bàsiques per poder navegar amb vela. Durant el trajecte ens vam banyar al mar i, per acabar, vam fer un pícnic tots junts.$t$,
 null, null, '2024-09-05', 'publicada'),

('sopar-solidari-2024', 'ca',
 $t$Sopar solidari 2024$t$,
 $t$Com cada any, vam començar el curs amb el sopar solidari de FamiliaAMIC: música, ball i el lliurament dels certificats de voluntariat.$t$,
 $t$El 14 de setembre, com cada any per donar el tret de sortida al curs escolar, vam celebrar el sopar solidari de FamiliaAMIC. Una nit màgica en què els socis i sòcies ens retrobem després de l'estiu.

El que fa especial aquesta associació són les famílies que la formen, i per això aquesta nit és sempre tan esperada.

Des del principi, la música no para de sonar i, després de gaudir de tots els menjars, comença el ball: una estona divertidíssima on cadascú pot ser qui és i on riure i ballar són els protagonistes.

Per acabar, com cada any, vam repartir els certificats de voluntariat als nostres estimats i imprescindibles voluntaris.$t$,
 null, null, '2024-09-14', 'publicada'),

('musica-expressio-corporal-gimnastica-2024', 'ca',
 $t$Tornen la música, l'expressió corporal i la gimnàstica artística$t$,
 $t$Comencen les activitats setmanals de música i expressió corporal (dimarts) i de gimnàstica artística (dimecres).$t$,
 $t$El dimarts 17 de setembre va començar l'activitat de música i expressió corporal, una darrere l'altra. Tots els joves que hi participen van gaudir d'aquestes dues dinàmiques, en què les cançons i els instruments es complementen amb el treball corporal.

Us hi voleu apuntar? És cada dimarts, de 17.00 a 18.30 h.

Aquella mateixa setmana també vam començar amb molta energia el curs de gimnàstica artística, cada dimecres de 19.30 a 20.45 h, amb la col·laboració del Club Muntanyenc, a la sala del centre Angeleta Ferrer.$t$,
 null, null, '2024-09-17', 'publicada'),

('teatre-fem-un-museu-2024', 'ca',
 $t$Teatre «Fem un museu»: cuidar, cuidar-nos$t$,
 $t$Joves de FamiliaAMIC i d'altres entitats de la ciutat preparen una obra de teatre sobre el tema «Cuidar, cuidar-nos».$t$,
 $t$Hem començat amb molta il·lusió el programa «Fem un museu», cada dilluns de 17.30 a 19.00 h al celler modernista de Sant Cugat, obra de César Martinell, deixeble de Gaudí.

Joves de FamiliaAMIC, juntament amb joves d'altres entitats de la ciutat, estem preparant una gran obra de teatre dirigida per una professional amb una àmplia experiència en arts escèniques.

Les sessions giren entorn de l'eslògan del Manifest 15, «Cuidar, cuidar-nos». Treballarem les coses que ens ajuden a estar bé, a cuidar-nos i a estimar-nos. El nostre objectiu: descobrir què és el que ens fa feliços!$t$,
 null, null, '2024-09-01', 'publicada'),

('portaventura-down-catalunya-2024', 'ca',
 $t$PortAventura amb totes les entitats de Down Catalunya$t$,
 $t$Un dia d'atraccions i espectacles de Halloween per celebrar els 20 anys de Down Catalunya.$t$,
 $t$El dissabte 5 d'octubre vam passar un dia molt divertit a PortAventura, gaudint de les atraccions i dels espectacles de Halloween.

Totes les entitats, unides per aconseguir drets i inclusió per a totes les persones amb capacitats diferents, ens vam reunir per celebrar un dia increïble: Down Catalunya, de la qual formem part, feia 20 anys com a coordinadora de les entitats.$t$,
 null, null, '2024-10-05', 'publicada'),

('mosaic-de-les-cures-2024', 'ca',
 $t$«Fem un museu – Patrimoni viu»: el Mosaic de les cures$t$,
 $t$Joves de FamiliaAMIC van representar el Mosaic de les cures al celler modernista de Sant Cugat del Vallès.$t$,
 $t$El divendres 11 d'octubre alguns joves de FamiliaAMIC van representar el Mosaic de les cures al celler modernista de Sant Cugat del Vallès.

És una iniciativa per posar en valor el patrimoni històric, cultural i humà de la ciutat. Els joves van participar al mosaic mostrant com, de qui i de què tenim cura.$t$,
 null, null, '2024-10-11', 'publicada'),

('trobada-families-down-catalunya-2024', 'ca',
 $t$Trobada de famílies de Down Catalunya$t$,
 $t$Un cap de setmana amb xerrades i formacions per a les famílies i activitats per a adults, joves i infants.$t$,
 $t$El 26 i 27 d'octubre vam participar en la trobada de famílies organitzada per totes les entitats de Down Catalunya.

Les famílies van assistir a xerrades i formacions. Mentrestant, adults, joves i infants van veure una pel·lícula al cinema, van visitar museus i una granja, van gaudir d'un sopar de gala i molt més.$t$,
 null, null, '2024-10-26', 'publicada'),

('trobada-autogestors-catalunya-2024', 'ca',
 $t$Trobada d'autogestors de Catalunya a Sabadell$t$,
 $t$Un cap de setmana a l'Hotel Verdi de Sabadell per empoderar els joves i fomentar-ne l'autonomia.$t$,
 $t$El 30 de novembre i l'1 de desembre vam participar amb gran entusiasme en la trobada d'autogestors de Catalunya, a l'Hotel Verdi de Sabadell.

Va ser una oportunitat per empoderar els joves i fomentar la seva autonomia. Hi va haver activitats sobre la sequera, pernoctació, àpats i sortides, tot en un ambient de companyonia i aprenentatge.

Un cap de setmana fantàstic per a tots els participants!$t$,
 null, null, '2024-11-30', 'publicada'),

('presentacio-sociedades-inclusivas', 'ca',
 $t$Presentació del llibre «Sociedades inclusivas»$t$,
 $t$La Sala Clavé de la Unió va acollir la presentació del llibre d'Òscar Martínez i Efrèn Carbonell sobre la inclusió social.$t$,
 $t$El dimarts 3 de desembre, la Sala Clavé de la Unió va acollir la presentació del llibre «Sociedades inclusivas», escrit per Òscar Martínez i Efrèn Carbonell.

Va ser una trobada molt enriquidora, en què els assistents van poder reflexionar sobre la inclusió social i el paper que hi tenen les comunitats.

Un acte que ens va inspirar a continuar treballant per una societat més inclusiva i equitativa.$t$,
 null, null, '2024-12-03', 'publicada'),

('padel-galetes-nadal-2024', 'ca',
 $t$Pàdel inclusiu i taller de galetes de Nadal$t$,
 $t$Un dissabte de desembre ple d'activitats: pàdel inclusiu al matí i taller de galetes nadalenques solidàries a la tarda.$t$,
 $t$El dissabte 21 de desembre va ser un dia ple d'activitats per a tothom.

Al matí vam començar amb pàdel inclusiu al complex esportiu Jaume Tubau, de 9.30 a 11.00 h: esport per a tothom, independentment de les capacitats.

A la tarda, a les 17 h, vam fer un taller de galetes nadalenques solidàries a l'entitat, al carrer Lli, 7, guiat per una tallerista. Els participants van crear galetes delicioses i molt creatives, en un ambient de solidaritat i diversió.$t$,
 null, null, '2024-12-21', 'publicada'),

('taller-sabons-2025', 'ca',
 $t$Taller de sabons$t$,
 $t$Vam experimentar amb colors, formes, textures i aromes per crear sabons únics.$t$,
 $t$El dissabte 11 de gener vam gaudir d'un taller de sabons molt especial, on vam experimentar amb diferents colors i formes. Una tallerista ens va guiar en tot el procés creatiu.

Persones amb capacitats diferents van participar activament, explorant textures i aromes per crear sabons únics i personalitzats. Va ser una experiència enriquidora que va fomentar la creativitat i la col·laboració entre tots els assistents.$t$,
 null, null, '2025-01-11', 'publicada'),

('excursio-cavall-collserola-2025', 'ca',
 $t$Excursió a cavall per Collserola$t$,
 $t$Una excursió inclusiva a cavall pels camins del Parc Natural de Collserola.$t$,
 $t$El 18 de gener, un grup de persones amb capacitats diferents va gaudir d'una excursió a cavall pels paisatges del Parc Natural de Collserola.

L'activitat, pensada per fomentar la inclusió i el contacte amb la natura, va demostrar que no hi ha límits quan es tracta de gaudir del medi natural.

Amb l'acompanyament d'instructors especialitzats i cavalls entrenats per a aquest tipus d'activitat, els participants van connectar amb aquests animals i van explorar els camins del bosc en un ambient segur i de complicitat. Una activitat que promou el benestar físic i emocional, el treball en equip i la superació personal.$t$,
 null, null, '2025-01-18', 'publicada'),

('facilitats-titol-eso-2025', 'ca',
 $t$Facilitats per obtenir el títol de l'ESO per a persones amb discapacitat$t$,
 $t$Després d'una reunió, ens han comunicat el compromís d'oferir facilitats perquè les persones amb discapacitat puguin obtenir el títol de l'ESO.$t$,
 $t$Després d'una reunió, se'ns ha comunicat el compromís d'oferir facilitats perquè les persones amb discapacitat puguin obtenir el títol d'Educació Secundària Obligatòria (ESO).

Aquesta iniciativa vol garantir la igualtat d'oportunitats educatives i permetre a les persones amb discapacitat continuar la seva formació acadèmica i professional.

Conscients de la importància de l'educació com a eina de desenvolupament personal i professional, s'han plantejat mesures que afavoreixin l'accés i l'adaptació dels processos d'avaluació per a les persones que requereixin suport específic, recollides en les orientacions per a la prova d'obtenció del graduat en ESO.

No deixis passar aquesta oportunitat i anima't a continuar avançant en la teva formació! Si vols més informació, escriu-nos a familiaamic@gmail.com.$t$,
 null, null, '2025-01-01', 'publicada')

on conflict (slug) do nothing;

commit;
