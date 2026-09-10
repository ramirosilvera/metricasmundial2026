export type Categoria =
  | "pantalon"
  | "bermuda"
  | "short_deportivo"
  | "remera"
  | "buzo"
  | "sweater"
  | "camisa"
  | "calzado"
  | "campera"
  | "accesorio"
  | "saco";

export type Textura =
  | "algodon"
  | "seda"
  | "cuero_liso"
  | "lino"
  | "lana"
  | "pana"
  | "corderoy"
  | "tejido_grueso"
  | "frisado"
  | "denim"
  | "acolchado"
  | "poliester"
  | "viscosa"
  | "impermeable"
  | "tricot"
  // Pedido explícito del usuario, revisado como sastre e ingeniero textil:
  // "los pantalones de vestir que tengo, negro y marrón, que son de oficina
  // y clásicos, son de gabardina... en el catálogo podés distinguir los
  // pantalones de vestir de oficina que son típicamente de gabardina y los
  // formales que son otra tela más suave tipo de traje". Es una distinción
  // real de sastrería, no un matiz: la gabardina es un tejido de sarga
  // MUY empinada (~63°, contra los ~45° del denim), de trama cerrada,
  // mate y firme -- la tela del pantalón de oficina que se usa todos los
  // días, aguanta uso y planchado y no se marca. La lana de traje
  // (tropical/fresco) es la contraria: caída suave, superficie más
  // difusa, es la que se corta junto con el saco. Misma silueta (los dos
  // llevan la raya planchada al frente, ver esPantalonDeVestir en
  // PrendaIcon.tsx), fibra y registro distintos -- por eso una textura
  // propia y no "lana" para las dos, mismo criterio que ya separó
  // impermeable de poliester (0024) y tricot de impermeable (0025).
  | "gabardina";

// "oficina" -- pedido explícito del usuario, revisado como asesor de
// imagen/sastre: "formal y oficina se mezclan... formal es solamente el
// traje (pantalón de vestir, camisa, corbata, cinturón y saco); oficina es
// elegante sport -- pantalón de vestir + camisa o sweater, sin corbata ni
// saco". Distinción real de vestuario de trabajo: "formal" exige la
// prenda que define un traje (el saco -- ver el chequeo nuevo en
// outfitSirveParaEstilo, recommend.ts), "oficina" la excluye a propósito,
// junto con cualquier prenda que requiera cuello (corbata/moño -- ver
// requiere_cuello más abajo).
export type Estilo = "casual" | "formal" | "deportivo" | "urbano" | "clasico" | "oficina";
export type Ocasion = "casual" | "laburo" | "formal";
export type Estacion = "verano" | "invierno" | "entretiempo";

/** Estampado de la prenda -- estrictamente estampado/print (rayas, cuadros),
 *  NO es lo mismo que Textura (que es fibra/tejido: algodón, lino, lana...).
 *  Una camisa de algodón puede ser lisa, a rayas o a cuadros -- son datos
 *  independientes. Pedido explícito del usuario: "camisas ralladas...
 *  inspírate en usos y costumbres, moda". "cuadros" se agrega en la misma
 *  pasada porque ya existía una prenda en el catálogo (camisa-cuadros)
 *  nombrada "a cuadros" sin ningún estampado real dibujado -- el nombre
 *  prometía algo que el ícono/maniquí nunca mostraban. Default "liso" (el
 *  99% del catálogo hasta ahora).
 *
 *  "bloques" -- pedido explícito del usuario con foto real (un buzo
 *  crewneck de entretiempo cortado en 3 bandas horizontales de color
 *  sólido: greige arriba, crema al medio, blanco abajo -- "presta atención
 *  a la combinación de colores"). Es una prenda real DISTINTA de rayas/
 *  cuadros, no una variante: un color-block es la prenda cortada y cosida
 *  en paneles de tela de colores sólidos (paneles grandes, sin repetición
 *  ninguna), mientras que rayas/cuadros son un estampado real (una trama
 *  chica que SÍ se repite, impresa o tejida). Confundirlos en el dibujo
 *  -- ver PatronBloques en PrendaIcon.tsx -- se nota: una rayada fina no
 *  se lee como panel grande de color, se lee como una rayada más. Usa
 *  `color2_*` igual que rayas/cuadros, y además `color3_*` (ver más abajo)
 *  para el tercer panel -- opcional, un color-block de 2 tonos se resuelve
 *  con color2 solo. */
export type Patron = "liso" | "rayas" | "cuadros" | "bloques";

/** Forma del cuello/escote -- solo tiene sentido en categoria="remera" y
 *  categoria="sweater" (el resto la ignora). Ronda de completitud del
 *  catálogo (pedido explícito del usuario: "revisá todas las prendas del
 *  catálogo, decime si está completo o se puede completar aún más"),
 *  revisada como modista y asesor de imagen: dos huecos reales que este
 *  campo resuelve a la vez.
 *
 *  1. "sweater-cuello-alto-negro" ya existía en el catálogo con ESE
 *     nombre, pero no había ningún dato que lo distinguiera de un sweater
 *     cuello redondo/V real -- se dibujaba exactamente igual que
 *     cualquier otro. El nombre prometía un cuello alto (turtleneck) que
 *     el ícono/maniquí nunca mostraban.
 *  2. La chomba/polo (remera con cuello camisero abrochado, dos o tres
 *     botones) no tenía forma de representarse: hasta esta ronda toda
 *     remera del catálogo era, a los ojos del motor de dibujo, un cuello
 *     redondo liso.
 *
 *  "polo" solo tiene sentido real en remera (no existe un "sweater polo"
 *  de uso común); "alto" solo en sweater (un cuello alto de punto fino es
 *  un sweater, no una remera). Nullable en vez de un default único (a
 *  diferencia de patron/calce/corte_calzado) porque el fallback correcto
 *  DIFIERE por categoría: sin dato, una remera sigue leyéndose "redondo"
 *  (el corte real más común) y un sweater sigue leyéndose "v" (el
 *  arquetipo de sweater de oficina que ya cubre casi todo el catálogo) --
 *  un único default global rompería uno de los dos sin que el usuario
 *  cargara nada nuevo. Ver el fallback explícito por categoría en
 *  PrendaIcon.tsx/Maniqui.tsx. */
export type Cuello = "redondo" | "v" | "polo" | "alto";

/** Largo de manga -- solo tiene sentido en categoria="camisa" y
 *  categoria="sweater" (el resto la ignora). Mismo pedido de completitud
 *  del catálogo que Cuello arriba. "corta" en camisa cubre la camisa de
 *  verano/oficina de manga corta, un básico real que faltaba tanto como
 *  el chaleco. "sin_mangas" en sweater es justamente el chaleco/sweater
 *  vest -- una prenda de sastrería real y distinta (se usa sola sobre una
 *  camisa, o bajo un saco en invierno), no una variante menor de "sweater
 *  con mangas cortas" (eso no existe como prenda real). "sin_mangas" no
 *  se ofrece en camisa -- una "camisa sin mangas" no es una prenda real de
 *  este guardarropa. Nullable por el mismo motivo que Cuello: el fallback
 *  correcto (manga larga) es el mismo en las dos categorías, así que en
 *  la práctica se podría haber puesto default 'larga' -- se deja nullable
 *  igual, por consistencia con Cuello y porque son los mismos dos campos
 *  que se agregan en la misma migración. */
export type Manga = "corta" | "larga" | "sin_mangas";

/** Corte/decoración real del calzado -- pedido explícito del usuario:
 *  "dale más detalles a las zapatillas... las deportivas que tienen 3
 *  rayas, o las urbanas tmb... revisa todos los estilos... las costuras,
 *  cortes y decoración más usadas según usos y costumbres". Antes,
 *  "calzado" era una sola silueta genérica de zapatilla con cordones,
 *  distinguida solo por `suela_contraste` -- sin diferencia real entre un
 *  mocasín, un zapato de vestir y una zapatilla deportiva más allá del
 *  color. Revisado como modista/ingeniero textil: cada valor acá es el
 *  arquetipo real más asociado a un registro (Estilo) de la app, cubriendo
 *  los 5 (antes el catálogo solo tenía urbano/formal/deportivo, sin nada
 *  para clasico/casual):
 *  - "zapatilla_urbana" (urbano): la zapatilla de calle de 3 rayas
 *    laterales -- el diseño "lifestyle" de calle real (tipo Samba/
 *    Superstar/Gazelle), la referencia más citada de "zapatilla urbana"
 *    real, no una zapatilla técnica de running.
 *  - "zapatilla_running" (deportivo): silueta técnica -- suela más alta/
 *    gruesa y un panel diagonal de "malla" (mesh), SIN las 3 rayas (esas
 *    son un diseño de calle, no de zapatilla técnica de entrenamiento --
 *    distinción real entre "deportiva de calle" y "deportiva técnica").
 *  - "zapato_vestir" (formal): con cordones + puntera con costura curva y
 *    perforado (broguing/cap-toe), el detalle clásico de un zapato de
 *    vestir/oxford real.
 *  - "mocasin" (clasico): SIN cordones (la ausencia es el dato real más
 *    definitorio) + tira/correa cruzando el empeine (penny loafer).
 *  - "zapatilla_cuero" (oficina): sneaker de cuero minimalista (tipo Common
 *    Projects/Koio) -- pedido explícito del usuario, con foto real de una
 *    prenda propia: "zapatillas de cuero negras y marrones... no son
 *    zapatos, tampoco son mocasines". Revisado como asesor de imagen/
 *    sastre: es un corte real y hoy mayoritario en placares de oficina
 *    "business casual", pero NO es lo mismo que zapato_vestir/mocasin (SÍ
 *    lleva cordones visibles, a diferencia del mocasín, y NO lleva
 *    broguing/costura de vestir, a diferencia del zapato de vestir) ni que
 *    zapatilla_urbana (sin las 3 rayas de calle -- la seña real de este
 *    corte es, al revés, la AUSENCIA casi total de decoración: cuero liso
 *    sin costuras marcadas, como mucho una pestaña de cuero de contraste en
 *    el talón). Por eso cuenta como cuero real (ver prendaDeCuero en
 *    recommend.ts, igual que zapato_vestir/mocasin) y alcanza rango de
 *    oficina/clásico sin techo (ver rangoDeFormalidad) -- pero, a
 *    diferencia de esos dos, queda excluido a propósito del registro
 *    "formal" (ver outfitSirveParaEstilo): un sneaker de cuero, por prolijo
 *    que sea, no se usa con un traje. Tampoco reemplaza al mocasín para
 *    sugerenciaDeCorteCalzado -- son cortes DISTINTOS con registros
 *    parcialmente distintos, así que tener uno no tapa el hueco de no tener
 *    el otro.
 *  - "zapatilla_lona" (casual): puntera de goma de un tono distinto al
 *    cuerpo (blanco/crema, sin importar el color de la lona) + costura
 *    lateral marcada -- el detalle real de una zapatilla de lona tipo
 *    Converse/Vans, suela chata (no la suela alta de la running).
 *  - "botin" (clasico/urbano): la CAÑA por encima del tobillo -- el único
 *    corte de esta lista que cambia la silueta y no solo la decoración, y
 *    por eso el más reconocible de todos. Agregado en la ronda de
 *    completitud del catálogo (pedido explícito del usuario: "revisá todas
 *    las prendas del catálogo, decime si está completo o se puede
 *    completar aún más"), revisado como modista y asesor de imagen: era el
 *    hueco más grande que tenía el catálogo. Los otros cinco cortes son
 *    todos calzado bajo, así que un placard armado con este catálogo NO
 *    tenía con qué vestirse los pies en invierno, en una app que modela
 *    invierno/entretiempo/verano en todo el resto de las categorías. El
 *    botín (chelsea/chukka/borcego de cuero) es el calzado de otoño-
 *    invierno por defecto de un guardarropa real de hombre, y funciona
 *    tanto en registro clásico (con chino o pantalón de pana) como urbano
 *    (con jean). Sin `estacion` cargada, igual que el resto del calzado:
 *    un botín se usa de otoño a primavera, no solo con frío extremo.
 *  Default "zapatilla_urbana": preserva el dibujo de todo el catálogo
 *  anterior (100% zapatillas urbanas hasta esta revisión).
 *  - "sandalia" (casual, verano): sin capellada -- tiras cruzando el
 *    empeine y el talón, dedos al aire. El otro corte (junto con el
 *    botín) que cambia la SILUETA y no solo la decoración, agregado en la
 *    misma ronda de completitud del catálogo: los cinco cortes anteriores
 *    (incluido el botín, que es justo lo opuesto) cubrían frío/entretiempo
 *    pero no el calzado real de un verano de calle -- un guardarropa real
 *    no usa zapatilla cerrada con bermuda en pleno enero. */
export type CorteCalzado = "zapatilla_urbana" | "zapatilla_running" | "zapato_vestir" | "mocasin" | "zapatilla_cuero" | "zapatilla_lona" | "botin" | "sandalia";

/** Calce/silueta real de la prenda -- auditoría de sastrería (Consejo,
 *  ronda de auditoría del motor): tercer eje de un conjunto, después del
 *  color y del registro/formalidad, y el único que el motor no tenía forma
 *  de ver. Volumen arriba pide volumen contenido abajo (y al revés) --
 *  acumular volumen en las dos puntas (una campera oversize + un jogger
 *  holgado + una zapatilla voluminosa) es el error de proporción más común
 *  de un placard urbano real; todo ajustado arriba y abajo, al revés, lee
 *  rígido. No es un choque -- a diferencia del registro o el cuero, es una
 *  cuestión de GRADO, así que el motor solo la usa para degradar
 *  "excelente" a "muy_bueno" con una sugerencia, nunca para bloquear una
 *  combinación (ver chocanEnVolumen en recommend.ts). Solo tiene sentido en
 *  categorías de piernas y torso (pantalon/bermuda/short_deportivo/remera/
 *  buzo/sweater/camisa/campera/saco) -- calzado y accesorio no tienen un
 *  calce real que compita en volumen contra el resto del outfit, así que el
 *  motor las ignora para esta regla en particular (mismo criterio que
 *  con_capucha, que solo aplica a buzo). Default "regular": preserva el
 *  comportamiento de todo el catálogo/placard ya cargado -- nadie pierde
 *  una recomendación por no tener este dato. */
export type Calce = "ajustado" | "regular" | "holgado";

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface Prenda {
  id: string;
  user_id: string;
  categoria: Categoria;
  color_hex: string;
  color_h: number;
  color_s: number;
  color_l: number;
  textura: Textura | null;
  estilo: Estilo | null;
  /** Estilos ADICIONALES en los que esta prenda también funciona, más allá
   *  del `estilo` principal -- pedido explícito del usuario: "algunas
   *  prendas pueden funcionar para más de un estilo" (ej. un sweater
   *  mostaza tan válido para oficina/clásico como para un fin de semana
   *  casual). `estilo` sigue siendo el único que define el registro del
   *  outfit completo (ver registroOutfit en recommend.ts, sin cambios) --
   *  esto solo amplía CONTRA qué otras prendas combina sin choque de
   *  registro. Vacío por defecto: no se inventa versatilidad que el
   *  usuario no cargó. */
  estilos_secundarios: Estilo[];
  ocasion: Ocasion | null;
  estacion: Estacion | null;
  foto_path: string | null;
  /** Detalle real de la prenda (no una regla automática por categoría): la
   *  típica zapatilla con la suela de goma en blanco/crema en vez del color
   *  de la zapatilla en sí. Por defecto false -- una zapatilla o zapato
   *  puede perfectamente ser monocromático de verdad. Solo aplica visualmente
   *  a calzado (Maniqui.tsx la ignora para el resto de las categorías). */
  suela_contraste: boolean;
  /** Detalle real de la prenda, mismo criterio que suela_contraste: una
   *  corbata (hoy la única prenda del catálogo con esto en true) necesita
   *  una camisa con cuello debajo -- combinarla con un buzo, remera o
   *  sweater no es una cuestión de color, es que físicamente no hay dónde
   *  apoyarla. Por defecto false: un cinturón o una bufanda no tienen esta
   *  restricción. */
  requiere_cuello: boolean;
  /** Dónde se usa la prenda en el cuerpo -- solo tiene sentido en
   *  categoria="accesorio" (el resto la ignora). Un cinturón va en la
   *  cintura; una corbata o una bufanda van al cuello, aunque solo la
   *  corbata requiere_cuello para combinar. Sin este dato, PrendaIcon y
   *  Maniqui no tenían forma de saber si dibujar el accesorio como tira de
   *  cintura o como algo que cuelga del cuello -- terminaban dibujando
   *  cinturón, corbata y bufanda con el mismo ícono. Default 'cintura'
   *  preserva el dibujo original (el único que existía antes de esta
   *  columna). */
  // 'cabeza' -- ronda de completitud del catálogo (pedido explícito del
  // usuario: "revisá todas las prendas del catálogo, decime si está
  // completo"), revisada como modista y asesor de imagen: un gorro de
  // lana o una gorra no son ni cuello ni cintura, y hasta esta ronda no
  // tenían dónde dibujarse -- la única prenda de cabeza posible en el
  // catálogo era, literalmente, no tener ninguna.
  posicion_accesorio: "cuello" | "cintura" | "cabeza";
  /** Detalle real de la prenda, solo tiene sentido en categoria="buzo" (el
   *  resto la ignora) -- pedido explícito del usuario, revisado como
   *  modista/ingeniero textil: no todos los buzos son hoodie. Antes de esta
   *  columna, TorsoCuerpo (Maniqui.tsx) le dibujaba capucha a CUALQUIER
   *  buzo sin excepción -- un buzo crewneck real (sin capucha) se mostraba
   *  con una que no tiene. Default true: preserva el dibujo de todos los
   *  buzos ya cargados (el catálogo hasta ahora era 100% hoodie), y solo
   *  las prendas puntuales sin capucha (verificadas contra el placard real)
   *  pasan a false explícitamente. El peso/grosor de la tela (liviano vs.
   *  pesado/frisado) es un dato de TEXTURA (ver Textura arriba, valor
   *  "frisado"), no de estación -- pedido explícito del usuario: "tampoco
   *  los llamaría de invierno o de entretiempo" a diferencia de sweater/
   *  campera, que sí se tagean por estación (ver catalogo.ts). */
  con_capucha: boolean;
  /** Ver Cuello arriba. Solo aplica visualmente a categoria="remera" y
   *  categoria="sweater" (el resto la ignora). Nullable -- ver el porqué
   *  en el comentario largo de Cuello: el fallback correcto (redondo en
   *  remera, v en sweater) difiere por categoría, así que un único
   *  default de columna rompería una de las dos. */
  cuello: Cuello | null;
  /** Ver Manga arriba. Solo aplica visualmente a categoria="camisa" y
   *  categoria="sweater" (el resto la ignora). Nullable por consistencia
   *  con Cuello -- el fallback (manga larga) es el mismo en las dos
   *  categorías. */
  manga: Manga | null;
  /** Estampado real de la prenda (ver Patron arriba) -- default "liso".
   *  Cuando no es "liso", `color2_*` es el segundo color del estampado
   *  (el color de las rayas/los cuadros sobre `color_hex`, que sigue
   *  siendo el color de fondo/base) -- sin él no hay con qué dibujar el
   *  patrón real, solo el nombre. */
  patron: Patron;
  color2_hex: string | null;
  color2_h: number | null;
  color2_s: number | null;
  color2_l: number | null;
  /** Tercer color, solo lo usa "bloques" (ver Patron arriba) -- el tercer
   *  panel de un color-block de 3 tonos. Nullable e independiente de
   *  color2_*: un color-block de 2 tonos deja esto en null y se resuelve
   *  con color2 solo (ver PatronBloques en PrendaIcon.tsx). */
  color3_hex: string | null;
  color3_h: number | null;
  color3_s: number | null;
  color3_l: number | null;
  /** Ver CorteCalzado arriba. Solo aplica visualmente a categoria="calzado"
   *  (el resto la ignora, mismo criterio que con_capucha/suela_contraste). */
  corte_calzado: CorteCalzado;
  /** Ver Calce arriba. A diferencia de corte_calzado/con_capucha (que son
   *  solo dibujo), calce SÍ entra en una regla real del motor
   *  (chocanEnVolumen en recommend.ts) -- no es puramente visual. */
  calce: Calce;
  /** Pedido explícito del usuario: "que se pueda agregar la opción de que
   *  una prenda necesita cambio... todavía es usable pero necesita cambio
   *  en breve. Lo que no es usable directamente no está en mi placard."
   *  Puramente informativo -- a diferencia de suela_contraste/
   *  requiere_cuello (que sí entran en reglas de combinación), esto NO
   *  cambia el puntaje ni bloquea nada: el motor la trata como cualquier
   *  otra prenda utilizable. Solo dispara un aviso en la UI (ver
   *  Outfits.tsx) para que el usuario sepa que, aunque el outfit combine
   *  bien, alguna prenda puesta ahí conviene reemplazarla pronto. Default
   *  false: no se marca nada como gastado que el usuario no cargó así. */
  necesita_cambio: boolean;
  created_at: string;
  updated_at: string;
}

/** Texto visible por categoría -- la UI mostraba `p.categoria` crudo con
 *  text-transform:capitalize en varios lugares (Placard, Outfits, Probar,
 *  Recomendaciones), algo que funcionaba solo de casualidad porque todas
 *  las categorías eran una sola palabra sin guion bajo. short_deportivo
 *  rompe ese supuesto -- capitalize no saca el "_", así que se vería
 *  literalmente "Short_deportivo" en tarjetas y leyendas reales. El resto
 *  de las categorías quedan con el mismo string crudo que ya tenían (para
 *  no cambiar nada de lo que ya se veía bien) -- el único valor que cambia
 *  de verdad es short_deportivo, reemplazando el guion bajo por un espacio.
 *
 *  "pantalon" -- bug real encontrado en la ronda de nombres específicos
 *  (pedido explícito del usuario: "necesito que los nombres de las
 *  prendas... sean más específicos para que los pueda reconocer"): el
 *  valor del enum (sin tilde, como toda columna de Postgres) se copió acá
 *  tal cual en vez de escribirse como texto visible real -- cualquier
 *  pantalón que cae al genérico (ver descripcionPrenda más abajo, ej. uno
 *  de pana/corderoy, hasta esta ronda sin rama propia) se mostraba
 *  literalmente "Pantalon", sin tilde, en Placard/Outfits/Probar/
 *  Recomendaciones. */
export const CATEGORIA_LABEL: Record<Categoria, string> = {
  pantalon: "pantalón",
  bermuda: "bermuda",
  short_deportivo: "short deportivo",
  remera: "remera",
  buzo: "buzo",
  sweater: "sweater",
  camisa: "camisa",
  calzado: "calzado",
  campera: "campera",
  accesorio: "accesorio",
  saco: "saco",
};

/** Etiqueta más específica que CATEGORIA_LABEL para una prenda puntual --
 *  pedido explícito del usuario: "estaría bueno que las prendas den más
 *  información y al menos aclare pantalón de Jean" (reportando que un jean
 *  cargado en el placard se veía, en toda la app, solo como "pantalon"
 *  genérico). Deriva el nombre de categoria+textura(+estilo/con_capucha) ya
 *  cargados -- no un campo nuevo a mano: así nunca queda desactualizado
 *  respecto de la prenda real, y una prenda agregada por foto (sin pasar
 *  por el catálogo) también se beneficia en cuanto tenga textura cargada.
 *  Solo cubre combinaciones donde categoria+textura(+lo que haga falta)
 *  identifican la prenda SIN AMBIGÜEDAD contra el resto del catálogo real
 *  (ej. campera+lana se deja afuera a propósito: puede ser un tapado de
 *  paño o una campera-sweater, dos prendas reales distintas con la misma
 *  textura -- no hay forma de saber cuál sin inventar). Cuando no hay un
 *  patrón inequívoco, cae en CATEGORIA_LABEL capitalizado, el mismo texto
 *  genérico que ya se mostraba. */
export function descripcionPrenda(p: Prenda): string {
  if ((p.categoria === "pantalon" || p.categoria === "bermuda") && p.textura) {
    const esPantalon = p.categoria === "pantalon";
    if (p.textura === "denim") return esPantalon ? "Jean" : "Bermuda de jean";
    if (p.textura === "lana") return esPantalon ? "Pantalón de vestir" : "Bermuda de vestir";
    // gabardina -- ver el comentario largo en el enum Textura de arriba.
    // El nombre real de la prenda en la calle es justamente "pantalón de
    // gabardina" (el de oficina), distinto del "pantalón de vestir" de
    // lana que se corta con el traje: son dos prendas que un sastre no
    // confunde, así que la descripción tampoco las confunde.
    if (p.textura === "gabardina") return esPantalon ? "Pantalón de gabardina" : "Bermuda de gabardina";
    if (p.textura === "poliester") {
      // pedido explícito del usuario, revisado como sastre/ingeniero
      // textil: "en el catálogo hay joggers, pero cuando le pongo que su
      // textura es de poliéster en mi placard lo convierte a pantalón
      // deportivo... es un pantalón casual tipo jogger con ajuste elástico
      // en cadera y tobillos". Bug real: esta rama asumía "poliéster =
      // deportivo" sin excepción, pero un jogger real (streetwear/casual)
      // se cose hoy tan seguido en poliéster/poli-blend técnico (fleece
      // con spandex, quick-dry) como en algodón -- la FIBRA no distingue
      // un jogger casual de un pantalón de entrenamiento, lo que los
      // distingue es el CORTE (puño elástico angostado, calce="holgado" --
      // ver esJogger en PrendaIcon.tsx, que YA reconocía poliéster como
      // tela de jogger válida, solo esta descripción de texto se había
      // quedado atrás) y el REGISTRO real (estilo="deportivo" para un
      // pantalón de entrenamiento de verdad, no cualquier prenda de tela
      // técnica). "Bermuda deportiva" no cambia -- la bermuda no tiene el
      // mismo dato de corte jogger (calce) modelado hoy.
      if (esPantalon && p.calce === "holgado" && p.estilo !== "deportivo") return "Jogger";
      return esPantalon ? "Pantalón deportivo" : "Bermuda deportiva";
    }
    if (p.textura === "algodon") {
      if (!esPantalon) return "Bermuda chino";
      return p.estilo === "clasico" ? "Pantalón chino" : "Jogger";
    }
    // pana/corderoy -- ronda de nombres específicos (pedido explícito del
    // usuario: "necesito que los nombres de las prendas... sean más
    // específicos para que los pueda reconocer"), revisada como sastre e
    // ingeniero textil. Hueco real, encontrado corriendo descripcionPrenda
    // contra el placard real del usuario: tenía 4 pantalones de
    // pana/corderoy y los 4 caían al genérico "Pantalón" -- esta rama
    // nunca se había escrito, aunque la textura ya existe en el catálogo
    // desde la ronda de pantalon-pana-marron/verde. "corderoy" es sinónimo
    // de "pana" en el enum (ver types.ts/PatronTextura en PrendaIcon.tsx),
    // mismo nombre para las dos.
    if (p.textura === "pana" || p.textura === "corderoy") return esPantalon ? "Pantalón de pana" : "Bermuda de pana";
  }
  if (p.categoria === "buzo") {
    // color-block -- ver Patron arriba. Antes que con/sin capucha: es el
    // dato más específico y reconocible (un color-block real casi siempre
    // es crewneck, pero el corte importa menos que el color acá).
    if (p.patron === "bloques") return "Buzo color-block";
    return p.con_capucha ? "Buzo con capucha" : "Buzo sin capucha";
  }
  // chomba/polo -- ver Cuello en types.ts (ronda de completitud del
  // catálogo). Antes de esta rama, cualquier remera caía en el genérico
  // "Remera" sin excepción -- una chomba con cuello camisero abrochado es
  // una prenda con nombre propio, no una remera más.
  if (p.categoria === "remera" && p.cuello === "polo") return "Chomba";
  // remera deportiva -- ronda de nombres específicos, mismo hueco real que
  // el resto de las ramas nuevas de acá abajo: el catálogo ya nombra estas
  // prendas "Remera deportiva" (ver remera-deportiva-negra/gris en
  // catalogo.ts) y el ícono ya les dibuja la manga raglán real (ver
  // esRemeraDeportiva en PrendaIcon.tsx, mismo criterio de textura), pero
  // descripcionPrenda nunca tuvo una rama para remera -- toda remera de
  // poliéster del placard real del usuario se mostraba "Remera" a secas,
  // indistinguible de una remera de algodón común.
  if (p.categoria === "remera" && p.textura === "poliester") return "Remera deportiva";
  // a rayas (Breton stripe) -- mismo hallazgo que la de arriba: el
  // catálogo ya tiene "remera-rayas-marina" con este nombre específico,
  // pero sin esta rama caía en el genérico "Remera" como cualquier otra.
  if (p.categoria === "remera" && p.patron === "rayas") return "Remera a rayas";
  if (p.categoria === "sweater") {
    // chaleco -- ver Manga en types.ts: primero, porque un chaleco de
    // lana sigue siendo chaleco (la ausencia de mangas es lo que define
    // la prenda, no la fibra) -- si esta rama fuera después del chequeo
    // de textura de más abajo, un chaleco de lana caería en el genérico
    // "Sweater" en vez de nombrarse por lo que es.
    if (p.manga === "sin_mangas") return "Chaleco";
    // cuello alto -- ver Cuello en types.ts: "sweater-cuello-alto-negro"
    // ya existía en el catálogo con ese nombre pero sin ningún dato que lo
    // distinguiera de un sweater cuello redondo/V; ahora lo tiene.
    if (p.cuello === "alto") return "Sweater cuello alto";
    if (p.textura && p.textura !== "lana") return "Sweater liviano";
  }
  if (p.categoria === "campera") {
    if (p.textura === "denim") return "Campera de jean";
    if (p.textura === "acolchado") return "Campera de pluma";
    // pana/corderoy -- ronda de nombres específicos: hueco real, mismo
    // motivo que pantalón/bermuda de pana más arriba. Sin ambigüedad (a
    // diferencia de la lana, ver más abajo): el catálogo no tiene ningún
    // otro archetype de campera de pana, y es una prenda real con nombre
    // propio -- el "chaqueta de pana" de entretiempo clásico, la pareja de
    // torso del pantalón de pana.
    if (p.textura === "pana" || p.textura === "corderoy") return "Campera de pana";
    // lana -- a diferencia del resto de las texturas de acá, esta SIGUE
    // siendo ambigua sin más dato: puede ser un tapado de paño (abrigo de
    // vestir sobre un traje, ver tapado-pano-gris en catalogo.ts) o una
    // campera-sweater/cardigan de punto con cierre (ver
    // campera-sweater-azul-marino y esCamperaDePunto en PrendaIcon.tsx) --
    // dos prendas reales bien distintas con la misma fibra. Lo que las
    // separa en el catálogo es la ESTACIÓN (mismo dato ya usado por
    // esCamperaDePunto para decidir el dibujo: cardigan en entretiempo,
    // tapado en invierno) -- si la prenda la tiene cargada, ya no hace
    // falta dejarla en el genérico.
    if (p.textura === "lana") {
      if (p.estacion === "invierno") return "Tapado de paño";
      if (p.estacion === "entretiempo") return "Campera sweater";
    }
    // poliester/impermeable agregados junto con "campera-piloto-negra"
    // (pedido explícito del usuario: "la campera piloto en realidad es una
    // campera impermeable") -- a diferencia de campera+lana, acá SÍ
    // identifican la prenda sin ambigüedad: hoy "poliester" es exclusivo
    // del rompeviento deportivo e "impermeable" del piloto, verificado
    // contra el resto del catálogo (ver esCamperaTecnica en PrendaIcon.tsx).
    if (p.textura === "poliester") return "Campera rompeviento";
    if (p.textura === "impermeable") return "Campera impermeable";
    // tricot -- pedido explícito del usuario: "las camperas deportivas no
    // son solo rompeviento, también hay algunas de entretiempo", verificado
    // contra lo que venden Adidas/Nike/Puma (el "track jacket"/"campera de
    // buzo" real es tela tricot, no el poliéster técnico liso del
    // rompeviento). Sin ambigüedad, mismo criterio que poliester/
    // impermeable de arriba.
    if (p.textura === "tricot") return "Campera deportiva";
  }
  if (p.categoria === "camisa") {
    if (p.patron === "rayas") return "Camisa a rayas";
    if (p.patron === "cuadros") return "Camisa a cuadros";
    // manga corta -- ver Manga en types.ts, ronda de completitud del
    // catálogo: después de rayas/cuadros a propósito (el estampado es el
    // dato más específico cuando los dos están cargados; una camisa a
    // rayas de manga corta sigue siendo, ante todo, "a rayas").
    if (p.manga === "corta") return "Camisa manga corta";
  }
  if (p.categoria === "calzado") {
    if (p.corte_calzado === "zapatilla_running") return "Zapatillas running";
    if (p.corte_calzado === "zapato_vestir") return "Zapatos de vestir";
    if (p.corte_calzado === "mocasin") return "Mocasines";
    // zapatilla_cuero -- ver CorteCalzado arriba, pedido explícito del
    // usuario con foto real de una prenda propia.
    if (p.corte_calzado === "zapatilla_cuero") return "Zapatillas de cuero";
    if (p.corte_calzado === "zapatilla_lona") return "Zapatillas de lona";
    if (p.corte_calzado === "botin") return "Botines";
    // sandalia -- ver CorteCalzado en types.ts, ronda de completitud del
    // catálogo (el calzado de verano que faltaba, contraparte del botín).
    if (p.corte_calzado === "sandalia") return "Sandalias";
    return "Zapatillas urbanas";
  }
  // gorro/gorra -- ver posicion_accesorio en types.ts, ronda de
  // completitud del catálogo: distinguidos por textura, mismo criterio
  // real que un sastre usaría (lana = gorro/beanie de invierno; el resto,
  // típicamente algodón/gabardina, = gorra de visera).
  if (p.categoria === "accesorio" && p.posicion_accesorio === "cabeza") {
    return p.textura === "lana" ? "Gorro de lana" : "Gorra";
  }
  // cinturón/corbata/bufanda -- ronda de nombres específicos (pedido
  // explícito del usuario: "necesito que los nombres de las prendas...
  // sean más específicos"). Hueco real y de los más grandes encontrados
  // corriendo esta función contra el placard real del usuario: "accesorio"
  // es la categoría más vieja del catálogo (posicion_accesorio existe
  // desde la migración 0016) y sin embargo nunca tuvo una rama propia acá
  // -- un cinturón de cuero, una corbata de seda y una bufanda de lana se
  // mostraban las tres, literalmente, "Accesorio". Mismos datos que ya usa
  // el dibujo (PrendaIcon.tsx/Maniqui.tsx) para elegir la forma -- no hace
  // falta inventar nada nuevo, solo nombrarlo con esos mismos dos campos:
  // posicion_accesorio distingue cintura (cinturón) de cuello (corbata o
  // bufanda), y requiere_cuello distingue esas dos entre sí.
  if (p.categoria === "accesorio" && p.posicion_accesorio === "cintura") return "Cinturón";
  if (p.categoria === "accesorio" && p.posicion_accesorio === "cuello") {
    return p.requiere_cuello ? "Corbata" : "Bufanda";
  }
  const generico = CATEGORIA_LABEL[p.categoria];
  return generico.charAt(0).toUpperCase() + generico.slice(1);
}

/** Texto visible por estación, mismo criterio que ESTILO_LABEL en
 *  recommend.ts (capitalizado, no el valor crudo del enum) -- pedido
 *  explícito del usuario: un filtro real de "mostrame solo mis abrigos de
 *  invierno" en Placard. */
export const ESTACION_LABEL: Record<Estacion, string> = {
  verano: "Verano",
  invierno: "Invierno",
  entretiempo: "Entretiempo",
};

export type NivelCompatibilidad = "excelente" | "muy_bueno" | "con_cuidado";

export interface Recomendacion {
  prenda: Prenda;
  nivel: NivelCompatibilidad;
  tag?: "tono_sobre_tono" | "combinacion_audaz";
  explicacion: string;
  tecnicaRescate?: string;
}

/** Categorías que se sugieren como complemento de cada categoría base.
 *  bermuda/short_deportivo son, como pantalon, prendas "de piernas" -- se
 *  agregan con la misma lista de complementos que pantalon (en su propia
 *  entrada) y se suman a la lista de todas las categorías de torso/calzado/
 *  accesorio que ya incluían a pantalon, para no dejarlas fuera de la
 *  pantalla "Combinar" ni de "Probar antes de comprar" (las dos pantallas
 *  que arman sus candidatas a partir de este mapa).
 *
 *  saco -- pedido explícito del usuario ("un traje azul marino"), revisado
 *  como modista: a diferencia de campera (que sí combina con bermuda/short_
 *  deportivo/remera -- una campera urbana con un jean o hasta con un short
 *  deportivo es un combo real de calle), un saco de traje NUNCA combina con
 *  ropa deportiva/de entrecasa real -- por eso su propia entrada, y las
 *  entradas donde aparece, son más angostas que las de campera: no aparece
 *  en bermuda/short_deportivo (ropa deportiva/de entrecasa real) ni dentro
 *  de la propia entrada de campera (son capas mutuamente excluyentes, un
 *  saco de traje no se usa arriba ni abajo de una campera).
 *
 *  saco+remera / saco+sweater / camisa+sweater -- segunda opinión de
 *  sastrería (Consejo, ronda siguiente): la primera pasada excluía estos
 *  tres pares con el mismo argumento que excluye saco+buzo ("no se
 *  combinan dos capas de afuera del torso a la vez"), pero ese argumento no
 *  aplica acá -- blazer + remera lisa es el smart casual más difundido que
 *  hay (no dos capas de afuera, una remera es la capa base), y sweater
 *  sobre camisa (o bajo un saco) es la capa de sastrería clásica de
 *  invierno, la capa de oficina estándar. El resto del motor (formalidad,
 *  cuero, corbata/cuello, registro deportivo) ya filtra los casos malos que
 *  esto habilita -- p.ej. saco + remera deportiva sigue chocando por
 *  chocaRegistroDeportivo. buzo se queda afuera de saco (un hoodie sí es
 *  una segunda capa de afuera real, a diferencia de remera/sweater). */
export const CATEGORIAS_COMPLEMENTARIAS: Record<Categoria, Categoria[]> = {
  pantalon: ["remera", "buzo", "sweater", "camisa", "campera", "saco", "calzado", "accesorio"],
  bermuda: ["remera", "buzo", "sweater", "camisa", "campera", "calzado", "accesorio"],
  short_deportivo: ["remera", "buzo", "sweater", "camisa", "campera", "calzado", "accesorio"],
  remera: ["pantalon", "bermuda", "short_deportivo", "campera", "saco", "calzado", "accesorio"],
  buzo: ["pantalon", "bermuda", "short_deportivo", "calzado", "accesorio"],
  sweater: ["pantalon", "bermuda", "short_deportivo", "camisa", "saco", "calzado", "accesorio"],
  camisa: ["pantalon", "bermuda", "short_deportivo", "sweater", "campera", "saco", "calzado", "accesorio"],
  // "accesorio" agregado -- segunda opinión de sastrería (Consejo, ronda
  // siguiente): faltaba, a pesar de que `accesorio` sí lista a `calzado`
  // (asimetría real, no a propósito). Es justo el par cinturón/zapato que
  // motivó toda la regla de coordinación de cuero (esDescoordinacionDeCuero
  // más arriba en recommend.ts) -- sin esto, "Combinar" nunca ofrecía
  // comparar un calzado directo contra un accesorio.
  calzado: ["pantalon", "bermuda", "short_deportivo", "remera", "buzo", "sweater", "camisa", "campera", "saco", "accesorio"],
  campera: ["pantalon", "bermuda", "short_deportivo", "remera", "camisa", "calzado", "accesorio"],
  accesorio: ["pantalon", "bermuda", "short_deportivo", "remera", "buzo", "sweater", "camisa", "campera", "saco", "calzado"],
  saco: ["pantalon", "remera", "sweater", "camisa", "calzado", "accesorio"],
};
