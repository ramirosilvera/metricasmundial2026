import type { Calce, Categoria, CorteCalzado, Cuello, Estacion, Estilo, Manga, Ocasion, Patron, Prenda, Textura } from "./types";
import { hexToHsl } from "./color";

export interface PresetPrenda {
  id: string;
  nombre: string;
  categoria: Categoria;
  colorHex: string;
  textura?: Textura;
  estilo?: Estilo;
  /** Ver Prenda.estilos_secundarios en types.ts. Se omite (== []) salvo en
   *  las pocas prendas donde de verdad funcionan en más de un registro. */
  estilosSecundarios?: Estilo[];
  ocasion?: Ocasion;
  estacion?: Estacion;
  /** Ver Prenda.suela_contraste en types.ts. Solo tiene sentido en calzado;
   *  se omite (== false) en el resto de las categorías. */
  suelaContraste?: boolean;
  /** Ver Prenda.requiere_cuello en types.ts. Solo tiene sentido en
   *  accesorios tipo corbata; se omite (== false) en el resto. */
  requiereCuello?: boolean;
  /** Ver Prenda.posicion_accesorio en types.ts. Solo tiene sentido en
   *  categoria="accesorio"; se omite (== "cintura", cinturón) en el resto. */
  posicionAccesorio?: "cuello" | "cintura" | "cabeza";
  /** Ver Prenda.con_capucha en types.ts. Solo tiene sentido en
   *  categoria="buzo"; se omite (== true, hoodie) salvo en los crewneck
   *  puntuales sin capucha. */
  conCapucha?: boolean;
  /** Ver Prenda.patron en types.ts. Se omite (== "liso") en casi todo el
   *  catálogo -- solo las camisas a rayas/cuadros lo declaran. */
  patron?: Patron;
  /** Segundo color del estampado (ver Prenda.color2_* en types.ts) --
   *  obligatorio en la práctica cuando `patron` no es "liso", si no no hay
   *  con qué dibujar el estampado real. */
  colorHex2?: string;
  /** Ver CorteCalzado en types.ts. Solo tiene sentido en categoria="calzado";
   *  se omite (== "zapatilla_urbana") en el resto de las categorías. */
  corteCalzado?: CorteCalzado;
  /** Ver Calce en types.ts. Se omite (== "regular") en la mayoría del
   *  catálogo -- solo se declara en las prendas donde el volumen real es
   *  claramente distinto de un corte estándar (jogger/short deportivo
   *  holgados, camisa de vestir/blazer ajustados). */
  calce?: Calce;
  /** Ver Cuello en types.ts. Solo tiene sentido en categoria="remera"
   *  ("polo", la chomba) y categoria="sweater" ("alto", el cuello alto) --
   *  se omite (fallback por categoría, ver types.ts) en el resto. */
  cuello?: Cuello;
  /** Ver Manga en types.ts. Solo tiene sentido en categoria="camisa"
   *  ("corta") y categoria="sweater" ("sin_mangas", el chaleco) -- se
   *  omite (== "larga") en el resto. */
  manga?: Manga;
}

/**
 * Catálogo fijo de prendas comunes, para agregar al placard con un toque en
 * vez de configurar categoría+color+tags a mano cada vez. Curado a
 * propósito, no generado -- criterios:
 *
 * - Cubre casual, ropa de oficina, urbana, clásica y deportiva (pedido
 *   explícito -- el catálogo original no tenía NINGUNA prenda con estilo
 *   "deportivo"), en las 11 categorías que soporta el placard (incluye
 *   bermuda y short_deportivo, agregadas después junto con pantalon como
 *   las tres categorías de "piernas", y saco -- agregada después, pedido
 *   explícito del usuario, "un traje azul marino": un saco de traje no es
 *   una campera, es su propia categoría de torso). Ver CatalogoPicker.tsx
 *   para cómo se agrupa/filtra esto en la UI.
 * - Colores reales y de uso común, no una paleta arcoíris -- para cada
 *   prenda, los 2-4 colores que de verdad se usan más (ej. camisa: blanca/
 *   celeste/negra, no "camisa violeta").
 * - `estilo`/`ocasion` se completan solo cuando son inequívocos para esa
 *   prenda (una camisa de oficina es "laburo" sin duda; un buzo, sea cual
 *   sea su color, es casual sin ambigüedad real -- por eso las 3 entradas
 *   de buzo sí llevan ocasion:"casual").
 * - `estacion` se deja vacía en la mayoría de las categorías: es la
 *   dimensión más dependiente del clima real de cada usuario (una remera
 *   blanca sirve en verano Y en entretiempo) -- forzar una estación ahí
 *   haría más daño que bien. EXCEPCIÓN, pedido explícito del usuario:
 *   buzo, sweater y campera sí se tagean -- a diferencia de una remera, el
 *   nivel de abrigo real de la prenda determina sin ambigüedad si es de
 *   entretiempo o de invierno. Revisado como ingeniero textil, pedido
 *   explícito del usuario: la textura GENÉRICA de la categoría no alcanza,
 *   importa la FIBRA/el peso real de cada prenda puntual -- "acolchado" no
 *   es siempre invierno (una campera de pluma tipo Uniqlo, ajustada al
 *   cuerpo y de relleno fino, es una prenda de entretiempo real -- la
 *   protección de invierno de verdad es la de volumen/relleno mucho mayor,
 *   tipo Nuptse) y "lana" no es siempre entretiempo (un sweater de lana
 *   gruesa es LA prenda de punto de invierno por excelencia; lo que sí es
 *   de entretiempo es un sweater más liviano -- viscosa, poliéster, algodón
 *   fino). Por eso cada entrada de abrigo de acá abajo tiene su propio
 *   comentario justificando la estación por peso/fibra real, no una regla
 *   ciega por textura -- ninguna queda sin tagear.
 *   buzo -- historial real: en una ronda anterior había quedado AFUERA de
 *   esta excepción a pedido explícito del usuario ("los buzos tmb algunos
 *   son livianos y otros más pesados... pero tampoco los llamaría de
 *   invierno o de entretiempo"), dejando el peso real codificado SOLO en
 *   `textura` (frisado = más pesado/aislante, tejido_grueso = jersey/
 *   French terry más liviano). Revertido en la ronda siguiente, pedido
 *   explícito del usuario ("revisá todos los buzos porque no figuran las
 *   clasificaciones de invierno o entretiempo"): el motor de "Vestite hoy"
 *   (esAbrigoDeClima, recommend.ts) exige el campo `estacion` puntual para
 *   reconocer un torso como abrigo real de esa estación -- nunca mira
 *   `textura` -- así que sin `estacion` ningún buzo podía nunca contar
 *   como abrigo real para esa regla, aunque la tela ya distinguiera pesado
 *   de liviano. `textura` sigue siendo el dato real del gramaje (no se
 *   saca) -- ahora mapeada 1 a 1 a `estacion` (frisado->invierno,
 *   tejido_grueso->entretiempo) para que las dos partes del motor la
 *   reconozcan. `con_capucha` (ver types.ts) sigue siendo una tercera
 *   dimensión ortogonal a las otras dos: si el buzo es hoodie o crewneck,
 *   un dato de corte/diseño, no de tela ni de estación.
 * - `textura` solo cuando el nombre de la prenda ya la implica sin
 *   ambigüedad (zapatos de cuero -> cuero_liso, jean -> denim, campera de
 *   pluma -> acolchado, prenda con estilo "deportivo" -> poliester, pedido
 *   explícito del usuario). Las zapatillas y las camperas "genéricas"
 *   (negra, verde militar) quedan sin textura a propósito: el material
 *   varía demasiado (cuero, lona, nylon...) para asumir uno sin inventar un
 *   dato que no es real -- el calzado deportivo tampoco lleva "poliester"
 *   por el mismo motivo (suela de goma, entresuela de espuma: la prenda
 *   real no es "de tela").
 */
export const CATALOGO_PRENDAS: PresetPrenda[] = [
  // --- Remeras ---
  // #F5F5F5 (gris/blanco neutro, s=0) en vez de #F5F5F0 -- pedido explícito
  // del usuario: el tono anterior tenía una saturación de 20% (matiz
  // amarillento apenas perceptible), suficiente para que nombreColor()
  // (color.ts) lo clasificara como "Blanco roto" en vez de "Blanco" (el
  // umbral es s<=15). Mismo criterio para camisa-blanca más abajo.
  { id: "remera-blanca", nombre: "Remera blanca", categoria: "remera", colorHex: "#F5F5F5", textura: "algodon", estilo: "casual", ocasion: "casual" },
  { id: "remera-negra", nombre: "Remera negra", categoria: "remera", colorHex: "#1A1A1A", textura: "algodon", estilo: "casual", ocasion: "casual" },
  { id: "remera-gris", nombre: "Remera gris", categoria: "remera", colorHex: "#8C8C8C", textura: "algodon", estilo: "casual", ocasion: "casual" },
  { id: "remera-azul-marino", nombre: "Remera azul marino", categoria: "remera", colorHex: "#1F2A44", textura: "algodon", estilo: "casual", ocasion: "casual" },
  // mismo beige (#D8C7A1) que ya usan pantalon-beige/jogger-beige/campera-
  // pluma-beige/bermuda-beige -- reusa el mismo tono en vez de inventar un
  // beige levemente distinto, mismo criterio que ya documenta el archivo
  // para mantener consistente la paleta entre categorías.
  { id: "remera-beige", nombre: "Remera beige", categoria: "remera", colorHex: "#D8C7A1", textura: "algodon", estilo: "casual", ocasion: "casual" },
  // rojo y rosa -- pedido explícito del usuario: "más variedad de colores
  // según usos y costumbres de la moda". El catálogo no tenía NINGÚN rojo
  // ni rosa en ninguna categoría, un vacío real (el rojo cereza es color de
  // acento confirmado por búsqueda web para la temporada actual; rosa es
  // básico habitual en remeras unisex). Al cargar estos dos hex reales se
  // encontraron y corrigieron dos casos más de nombreColor() mal
  // clasificado (ver color.ts/color.test.ts): un rosa pastel con h>=345
  // caía en "Rojo", y un mostaza (ver sweater-mostaza más abajo) caía en
  // "Naranja".
  { id: "remera-roja", nombre: "Remera roja", categoria: "remera", colorHex: "#B93A32", textura: "algodon", estilo: "casual", ocasion: "casual" },
  { id: "remera-rosa", nombre: "Remera rosa", categoria: "remera", colorHex: "#E4A6B4", textura: "algodon", estilo: "casual", ocasion: "casual" },
  // verde y celeste -- ampliación del catálogo (Consejo, pedido explícito
  // del usuario: "variedad de colores... en función de usos y costumbres").
  // Vacío real: ninguna remera del catálogo cubría verde ni celeste, dos
  // colores básicos de remera tan comunes como el resto de la paleta ya
  // cargada. Mismos hex que ya usan buzo-verde (#1E5631, verde botella real)
  // y camisa-celeste/buzo-celeste (#B7D2EC) -- consistencia de paleta
  // cross-categoría, mismo criterio que documenta el resto del archivo.
  { id: "remera-verde", nombre: "Remera verde botella", categoria: "remera", colorHex: "#1E5631", textura: "algodon", estilo: "casual", ocasion: "casual" },
  { id: "remera-celeste", nombre: "Remera celeste", categoria: "remera", colorHex: "#B7D2EC", textura: "algodon", estilo: "casual", ocasion: "casual" },

  // --- Remera a rayas (Breton stripe) -- ampliación del catálogo. Hueco
  // real: el catálogo tenía camisas a rayas (ver más abajo) pero ninguna
  // remera a rayas, y la remera a rayas marina (blanco con rayas azul
  // marino, "marinière") es una prenda clásica real por derecho propio --
  // el básico de punto francés que usan Chanel/Saint James desde hace un
  // siglo, no una variante menor de la camisa. "clasico" (no "casual"):
  // es justamente el registro donde este básico juega mejor, junto con un
  // pantalón chino o de lino. Mismos hex que ya usan remera-blanca/
  // pantalon-vestir-azul (#F5F5F5/#1F2A44) -- consistencia de paleta.
  {
    id: "remera-rayas-marina",
    nombre: "Remera a rayas marina",
    categoria: "remera",
    colorHex: "#F5F5F5",
    colorHex2: "#1F2A44",
    patron: "rayas",
    textura: "algodon",
    estilo: "clasico",
    ocasion: "casual",
  },

  // --- Remera oversize (urbano) -- mismo criterio que buzo-negro-oversize
  // más abajo: el hoodie oversize ya cubre el torso de abrigo "holgado" de
  // calle real, pero la remera (la prenda de punto liviana, sin abrigo) se
  // había quedado sin ningún equivalente urbano -- hasta esta ronda
  // "urbano" en remera dependía por completo del pantalón/zapatilla que se
  // le sumara, sin ninguna remera que aportara ese registro por sí misma.
  // calce "holgado" -- el volumen exagerado (silueta boxy, mangas caídas)
  // es el rasgo real que define a esta prenda como streetwear, no el color.
  {
    id: "remera-negra-oversize",
    nombre: "Remera negra (oversize)",
    categoria: "remera",
    colorHex: "#1A1A1A",
    textura: "algodon",
    estilo: "urbano",
    ocasion: "casual",
    calce: "holgado",
  },

  // --- Remeras deportivas (agregadas en la ampliación del catálogo: el
  // estilo "deportivo" no tenía NINGUNA prenda cargada en todo el catálogo
  // hasta acá, un vacío real, no una omisión menor). Pedido explícito del
  // usuario: textura "poliester" por defecto en toda prenda deportiva --
  // antes quedaban sin textura porque el enum no tenía un valor para tela
  // técnica sintética; ahora sí (mismo criterio para pantalón/short/campera
  // rompeviento deportivos más abajo). Zapatillas running quedan afuera a
  // propósito: son calzado, no una prenda de tela -- "poliéster" describiría
  // mal una zapatilla real (suela de goma, entresuela de espuma).
  { id: "remera-deportiva-negra", nombre: "Remera deportiva negra", categoria: "remera", colorHex: "#1A1A1A", textura: "poliester", estilo: "deportivo", ocasion: "casual" },
  { id: "remera-deportiva-gris", nombre: "Remera deportiva gris", categoria: "remera", colorHex: "#8C8C8C", textura: "poliester", estilo: "deportivo", ocasion: "casual" },

  // --- Chomba/polo -- ronda de completitud del catálogo (pedido explícito
  // del usuario: "revisá todas las prendas del catálogo, decime si está
  // completo o se puede completar aún más"), revisada como modista y
  // asesor de imagen. Hueco real: la chomba es EL básico smart-casual de
  // verano por excelencia (tan citado en usos y costumbres como el chino o
  // la camisa blanca) y el catálogo no tenía ninguna -- toda remera hasta
  // esta ronda era, a los ojos del motor de dibujo, cuello redondo liso.
  //
  // categoria "remera" (no una categoría nueva): comparte estructura real
  // con la remera (manga corta, se usa sola o bajo una campera, mismo
  // rango de calce) -- lo único que cambia es el cuello (ver Cuello en
  // types.ts), y ya existe el campo para eso. Estilo "clasico" con
  // secundario "casual": una chomba lisa es el básico de fin de semana
  // "vestido pero relajado" -- más formal que una remera lisa (por el
  // cuello abrochado), menos que una camisa, el registro real que ocupa
  // el hueco entre las dos. Blanca y azul marino -- los dos colores de
  // chomba más citados en cualquier guía de vestuario básico masculino,
  // mismos hex que ya usa el resto del catálogo.
  { id: "chomba-blanca", nombre: "Chomba blanca", categoria: "remera", colorHex: "#F5F5F5", textura: "algodon", estilo: "clasico", estilosSecundarios: ["casual"], ocasion: "casual", cuello: "polo" },
  { id: "chomba-azul-marino", nombre: "Chomba azul marino", categoria: "remera", colorHex: "#1F2A44", textura: "algodon", estilo: "clasico", estilosSecundarios: ["casual"], ocasion: "casual", cuello: "polo" },
  // gris -- el tercer color de chomba más versátil (combina con cualquier
  // pantalón, ver esNeutro en recommend.ts), completa el kit sin
  // duplicar los dos colores "de vestuario" de arriba con uno puramente
  // neutro.
  { id: "chomba-gris", nombre: "Chomba gris", categoria: "remera", colorHex: "#8C8C8C", textura: "algodon", estilo: "clasico", estilosSecundarios: ["casual"], ocasion: "casual", cuello: "polo" },

  // --- Camisas (oficina) ---
  // #F5F5F5 -- ver el comentario de remera-blanca más arriba. #FAFAF7
  // (s=23) también clasificaba como "Blanco roto" en vez de "Blanco".
  // calce "ajustado" en las camisas de vestir clásicas (blanca/celeste/
  // gris/beige, no camisa-negra ni camisa-cuadros, más urbanas/casual) --
  // auditoría de sastrería (Consejo, ronda de auditoría del motor): una
  // camisa de oficina real se usa metida adentro, silueta entallada, la
  // contraparte de volumen contenido de un pantalón de vestir/saco.
  // "formal" sumado a las 4 -- Consejo, ronda de "nunca mostrar una prenda
  // en un estilo que no fue tageada": outfitEsCoherenteParaEstilo pasó a
  // exigir el tag EXACTO en toda prenda (antes alcanzaba con no ser "menos
  // formal" que el pantalón, el mismo agujero que dejaba pasar zapatillas
  // de lona en "Deportivo") -- sin este agregado, "Formal" (que exige
  // saco, ver outfitSirveParaEstilo) se quedaba sin NINGUNA camisa posible
  // en TODO el catálogo, porque ninguna llevaba el tag "formal" a pesar de
  // ser justamente la camisa de vestir que se usa bajo un traje real
  // (verificado por el test ya existente "traje azul marino + cinturón y
  // zapatos marrones -> 10/10", que dejó de pasar apenas se activó la
  // regla estricta). No es debilitar la regla nueva: es la corrección de
  // tageo real que esa regla dejó en evidencia -- una camisa de vestir
  // lisa clara SÍ funciona en los tres registros de vestir (clasico como
  // principal, oficina y formal como secundarios), mismo criterio que ya
  // usa sweater-mostaza para declarar que una prenda sirve en más de un
  // registro a propósito, en vez de inferirlo del rango de formalidad.
  //
  // Reafirmado en la ronda de separación estricta formal/oficina (pedido
  // explícito del usuario: "en el catálogo los filtros de formal y de
  // oficina deben ser distintos"): esa separación se aplicó al PANTALÓN
  // (ver pantalon-vestir-*/pantalon-gabardina-* más abajo, dos telas
  // reales y distintas que existen justamente para separar los dos usos),
  // no a la camisa. Preguntado explícitamente, el usuario confirmó dejar
  // camisa (y cinturón, ver cinturon-negro más abajo) compartidos: es la
  // MISMA prenda física en los dos registros -- una camisa blanca de
  // vestir no es dos camisas distintas según se use con o sin saco, a
  // diferencia del pantalón, donde sí hay dos prendas de tela distinta.
  { id: "camisa-blanca", nombre: "Camisa blanca", categoria: "camisa", colorHex: "#F5F5F5", textura: "algodon", estilo: "clasico", estilosSecundarios: ["oficina", "formal"], ocasion: "laburo", calce: "ajustado" },
  { id: "camisa-celeste", nombre: "Camisa celeste", categoria: "camisa", colorHex: "#B7D2EC", textura: "algodon", estilo: "clasico", estilosSecundarios: ["oficina", "formal"], ocasion: "laburo", calce: "ajustado" },
  // "urbano" a propósito, no un descuido: una camisa negra lee más
  // "urban professional" que clásica, a diferencia de blanca/celeste/gris.
  // colorHex #1A1A1A -- mismo negro que las otras 16+ prendas "negro/negra"
  // del catálogo (remera-negra, buzo-negro, campera-negra, etc.). Antes
  // usaba #232323 (l=14), un dato inconsistente sin ninguna razón
  // documentada: nombreColor() lo leía "Gris oscuro" en vez de "Negro" --
  // exactamente el bug que reportó el usuario ("una cosa es un gris
  // oscuro y otra un negro").
  { id: "camisa-negra", nombre: "Camisa negra", categoria: "camisa", colorHex: "#1A1A1A", textura: "algodon", estilo: "urbano", ocasion: "laburo" },
  { id: "camisa-gris", nombre: "Camisa gris", categoria: "camisa", colorHex: "#9A9A94", textura: "algodon", estilo: "clasico", estilosSecundarios: ["oficina", "formal"], ocasion: "laburo", calce: "ajustado" },
  // patron "cuadros" + colorHex2 -- corrección real de esta ronda: esta
  // entrada ya existía nombrada "a cuadros" pero se dibujaba como una
  // camisa lisa de un solo color, sin ningún cuadro real (el modelo de
  // datos no tenía forma de guardar un segundo color hasta esta revisión).
  // Línea del cuadro en el mismo beige de siempre (#D8C7A1) -- un
  // tattersall real sobre verde oliva suele llevar la línea en un tono
  // cálido/crema, no en otro verde (eso se leería como un solo color
  // fundido, no como un cuadro).
  { id: "camisa-cuadros", nombre: "Camisa a cuadros", categoria: "camisa", colorHex: "#4A5A3C", colorHex2: "#D8C7A1", patron: "cuadros", textura: "algodon", estilo: "urbano", ocasion: "casual" },
  // mismo beige que el resto del catálogo (ver remera-beige) -- clasico/
  // laburo, mismo registro que blanca/celeste/gris: una camisa beige es
  // tan de oficina como esas, no informal como la de cuadros.
  { id: "camisa-beige", nombre: "Camisa beige", categoria: "camisa", colorHex: "#D8C7A1", textura: "algodon", estilo: "clasico", estilosSecundarios: ["oficina", "formal"], ocasion: "laburo", calce: "ajustado" },

  // --- Camisa de lino (smart casual) -- hueco real encontrado en la
  // auditoría de imagen de esta ronda (Consejo, reporte real del usuario:
  // "Clásico" no armaba ningún look ni sugería nada para comprar).
  // Verificado por ejecución contra el placard real: TODAS las camisas/
  // sweaters "clasico" del catálogo son ocasion="laburo" -- ninguna sirve
  // de torso para un bermuda/short "clasico" (ocasion="casual"), porque
  // esa combinación se excluye a propósito en armarOutfitsSugeridos (un
  // bermuda no combina con una prenda de oficina real, ver esDeOficina).
  // Resultado: "clásico" con un ancla de piernas corta era, hasta esta
  // ronda, una combinación matemáticamente imposible en TODO el catálogo,
  // no solo en el placard de este usuario. La camisa de lino es la prenda
  // real que llena ese hueco -- el "smart casual" de verano por
  // excelencia (lino con bermuda/chino corto, sin corbata), verificado
  // por uso y costumbre real de la moda. Textura "lino" (ya existe en el
  // enum, ver corbata/tapado). Mismo beige de siempre, más una blanca --
  // los 2 colores más versátiles, mismo criterio que el resto del
  // catálogo.
  { id: "camisa-lino-blanca", nombre: "Camisa de lino blanca", categoria: "camisa", colorHex: "#F5F5F5", textura: "lino", estilo: "clasico", ocasion: "casual" },
  { id: "camisa-lino-beige", nombre: "Camisa de lino beige", categoria: "camisa", colorHex: "#D8C7A1", textura: "lino", estilo: "clasico", ocasion: "casual" },

  // --- Camisas a rayas -- pedido explícito del usuario: "camisas
  // ralladas, blanca y celestes y de otros colores tmb, inspírate en usos
  // y costumbres, moda". Curadas por real convención de vestimenta, del
  // registro más clásico al más urbano -- no una paleta arcoíris, mismo
  // criterio que el resto del archivo. Todas patron:"rayas", con
  // colorHex2 (la raya) real -- sin esto no habría estampado que dibujar,
  // solo el nombre.
  //
  // celeste sobre blanco -- LA camisa a rayas de oficina por excelencia
  // en Argentina y en el mundo (raya fina celeste sobre fondo blanco,
  // "Bengal stripe" clásico). Mismos hex que camisa-blanca/camisa-celeste
  // ya usan, por consistencia de paleta cross-prenda. "formal" sumado --
  // mismo motivo que camisa-blanca/celeste/gris/beige más arriba (ver su
  // comentario): es justamente la camisa de vestir que se usa bajo un
  // traje real, no una variante casual de la de oficina.
  { id: "camisa-rayas-celeste", nombre: "Camisa a rayas celeste", categoria: "camisa", colorHex: "#F5F5F5", colorHex2: "#B7D2EC", patron: "rayas", textura: "algodon", estilo: "clasico", estilosSecundarios: ["oficina", "formal"], ocasion: "laburo" },
  // azul marino sobre blanco -- el "pinstripe" clásico de oficina/
  // vestir, un escalón más formal que la celeste de arriba (se banca sin
  // problema una corbata y un traje). Mismo azul marino que ya usan
  // pantalon-vestir-azul/saco-azul-marino/corbata-azul-marino. "formal"
  // sumado -- mismo motivo que camisa-blanca más arriba, reforzado acá por
  // el propio comentario original ("se banca sin problema... un traje").
  { id: "camisa-rayas-azul-marino", nombre: "Camisa a rayas azul marino", categoria: "camisa", colorHex: "#F5F5F5", colorHex2: "#1F2A44", patron: "rayas", textura: "algodon", estilo: "clasico", estilosSecundarios: ["oficina", "formal"], ocasion: "laburo" },
  // rosa sobre blanco -- el color "no neutro" más estándar de oficina
  // desde hace años (estilo francés/business casual), tan de laburo como
  // la celeste, no un capricho de color. Mismo rosa que remera-rosa.
  // "formal" sumado -- mismo motivo que camisa-blanca más arriba: mismo
  // registro que la celeste/azul marino de arriba, no menos formal por el
  // color.
  { id: "camisa-rayas-rosa", nombre: "Camisa a rayas rosa", categoria: "camisa", colorHex: "#F5F5F5", colorHex2: "#E4A6B4", patron: "rayas", textura: "algodon", estilo: "clasico", estilosSecundarios: ["oficina", "formal"], ocasion: "laburo" },
  // Bengal invertida -- fondo celeste con raya blanca, no blanco con raya
  // celeste (la de arriba): mismo par de colores, pero la base más
  // saturada la hace un poco menos "de escritorio estricto" y más
  // versátil para un finde -- estilo secundario "casual" a propósito,
  // mismo criterio multi-estilo que ya usa sweater-mostaza (ejemplo real
  // del usuario: la misma prenda funciona en dos registros).
  { id: "camisa-rayas-celeste-base", nombre: "Camisa celeste a rayas blancas", categoria: "camisa", colorHex: "#B7D2EC", colorHex2: "#F5F5F5", patron: "rayas", textura: "algodon", estilo: "clasico", estilosSecundarios: ["casual", "oficina"], ocasion: "laburo" },
  // negro sobre blanco, estilo urbano -- una rayada bien de calle
  // (contraste alto, sin color de oficina de por medio), no una variante
  // más de la misma camisa de laburo. Mismo criterio que camisa-negra
  // (también urbano): la lectura de "urban professional" viene del
  // contraste del color, no de la fibra.
  { id: "camisa-rayas-negra", nombre: "Camisa a rayas negras", categoria: "camisa", colorHex: "#F5F5F5", colorHex2: "#1A1A1A", patron: "rayas", textura: "algodon", estilo: "urbano", ocasion: "casual" },

  // --- Camisa de manga corta (oficina de verano) -- ronda de completitud
  // del catálogo (ver Manga en types.ts). Hueco real: hasta esta ronda
  // toda camisa del catálogo era, a los ojos del motor, de manga larga --
  // sin forma de cargar la camisa de verano/oficina de manga corta, un
  // básico tan real como el pantalón de lino de acá abajo (misma estación,
  // mismo motivo: la lana/gabardina de invierno tiene su contraparte
  // liviana, la manga larga de oficina también). Celeste y blanca -- los
  // mismos dos colores de oficina más citados del resto del catálogo,
  // mismos hex que camisa-celeste/camisa-blanca.
  { id: "camisa-manga-corta-celeste", nombre: "Camisa celeste manga corta", categoria: "camisa", colorHex: "#B7D2EC", textura: "algodon", estilo: "clasico", estilosSecundarios: ["oficina"], ocasion: "laburo", manga: "corta" },
  { id: "camisa-manga-corta-blanca", nombre: "Camisa blanca manga corta", categoria: "camisa", colorHex: "#F5F5F5", textura: "algodon", estilo: "clasico", estilosSecundarios: ["oficina"], ocasion: "laburo", manga: "corta" },

  // --- Camisa de jean (overshirt) -- ampliación del catálogo. Distinta de
  // campera-jean de más abajo (esa es una campera, cierra como campera, se
  // usa como capa exterior sobre una remera) y de jean-azul (pantalón): una
  // camisa de jean/overshirt es más liviana, se abrocha como camisa y se
  // usa suelta y abierta sobre una remera, prenda real y con nombre propio
  // en el streetwear actual (denim shirt/overshirt), no una duplicación de
  // ninguna de las otras dos. Mismo denim azul que ya usan jean-azul/
  // bermuda-jean/campera-jean (#3B5998) -- consistencia de paleta.
  { id: "camisa-denim", nombre: "Camisa de jean (overshirt)", categoria: "camisa", colorHex: "#3B5998", textura: "denim", estilo: "urbano", ocasion: "casual" },

  // --- Pantalones ---
  // estilo secundario "urbano" en TODO jean, sea cual sea el color -- pedido
  // explícito del usuario, reportando que su jean AZUL real (el corte/tela
  // más estándar que existe) no aparecía en la sección Urbano de "Vestite
  // hoy". Corrección real de esta ronda: la ronda anterior que agregó
  // "urbano" solo lo cargó en jean-negro/jogger-negro, razonando "un jean
  // NEGRO es tan de calle como de casual" -- pero lo que hace a un jean
  // urbano/streetwear no es el color, es la PRENDA (denim de corte casual,
  // el pantalón más estándar del streetwear real, con zapatillas y campera
  // urbana) -- un jean azul con esa misma combinación es igual de urbano
  // que uno negro, si no más (es el jean más común de lejos). Mismo
  // criterio aplicado ahora de forma consistente a los joggers y a la
  // bermuda de jean de más abajo.
  { id: "jean-azul", nombre: "Jean azul", categoria: "pantalon", colorHex: "#3B5998", textura: "denim", estilo: "casual", estilosSecundarios: ["urbano"], ocasion: "casual" },
  // colorHex #1A1A1A -- ver el comentario de camisa-negra más arriba:
  // mismo negro estándar del catálogo, corrigiendo el mismo #232323
  // inconsistente que hacía que nombreColor() leyera "Gris oscuro".
  { id: "jean-negro", nombre: "Jean negro", categoria: "pantalon", colorHex: "#1A1A1A", textura: "denim", estilo: "casual", estilosSecundarios: ["urbano"], ocasion: "casual" },
  // calce "ajustado" en los 4 -- auditoría de sastrería (Consejo, ronda de
  // auditoría del motor): un pantalón de vestir real es de corte recto/
  // entallado, no ancho, la contraparte de volumen contenido que hace que
  // un saco/blazer (también "ajustado" más abajo) funcione en proporción.
  // SIN estilosSecundarios "oficina" en los 3 -- corregido en la ronda de
  // separación estricta formal/oficina (pedido explícito del usuario:
  // "separá el filtro de formal y oficina con el mismo criterio que lo
  // hicimos en mi placard"). La ronda anterior (gabardina) los dejaba con
  // secundario "oficina" bajo el argumento de que "el pantalón de vestir
  // en sí sirve para las dos ocasiones" -- pero el usuario, al cargar su
  // propio placard real, hizo lo contrario con sus propias prendas: separó
  // sus pantalones de lana (ahora "formal" puro, sin secundario) de sus
  // pantalones de oficina (gabardina/pana, "oficina" puro, sin "formal").
  // Es la separación real y correcta de sastrería que ya motivó toda la
  // distinción gabardina/lana de la ronda anterior, llevada hasta el
  // final: si la gabardina existe justamente para ser la tela de oficina
  // (sin ambigüedad con el traje), la lana de traje tiene que ser
  // simétricamente formal PURO -- dejarle el secundario "oficina" era la
  // mitad de la separación, no la separación completa. Quien va de
  // oficina sin saco usa el pantalón de gabardina (acá abajo), no el de
  // traje.
  // textura "lana" en los 3 -- son los pantalones de TRAJE: lana tropical/
  // fresco, la tela que se corta junto con el saco. Los tres colores que
  // quedan acá son exactamente los tres colores de traje reales (negro,
  // gris y azul marino); el beige salió de este grupo en la ronda de
  // gabardina de acá abajo, porque un pantalón de traje beige de lana no
  // es un básico real -- el pantalón beige de vestir que existe de verdad
  // es de gabardina (o un chino, que ya está más abajo).
  { id: "pantalon-vestir-negro", nombre: "Pantalón de vestir negro", categoria: "pantalon", colorHex: "#1A1A1A", textura: "lana", estilo: "formal", ocasion: "laburo", calce: "ajustado" },
  { id: "pantalon-vestir-gris", nombre: "Pantalón de vestir gris", categoria: "pantalon", colorHex: "#6E6E6E", textura: "lana", estilo: "formal", ocasion: "laburo", calce: "ajustado" },
  { id: "pantalon-vestir-azul", nombre: "Pantalón de vestir azul marino", categoria: "pantalon", colorHex: "#1F2A44", textura: "lana", estilo: "formal", ocasion: "laburo", calce: "ajustado" },

  // --- Pantalón de gabardina (el de OFICINA) -- pedido explícito del
  // usuario, revisado como sastre e ingeniero textil: "los pantalones de
  // vestir que tengo, negro y marrón, que son de oficina y clásicos, son
  // de gabardina... en el catálogo podés distinguir los de oficina, que
  // son típicamente de gabardina, y los formales, que son otra tela más
  // suave tipo de traje". Tenía razón y era un hueco real: hasta esta
  // ronda TODO pantalón de vestir del catálogo era "lana", así que la
  // prenda que más se usa para ir a trabajar no existía como tal.
  //
  // Por qué son entradas propias y no un color más de los de arriba: es
  // otra tela de verdad (sarga empinada ~63°, trama cerrada, mate y firme
  // contra la caída suave y difusa de la lana de traje -- ver el enum
  // Textura en types.ts), otro registro real (el de traje se corta con el
  // saco; el de gabardina se usa solo, con camisa o sweater) y hasta se
  // dibujan distinto (misma raya planchada, otra trama -- ver
  // esPantalonDeVestir y PatronTextura en PrendaIcon.tsx). Mismo criterio
  // que ya separó el chino de algodón del pantalón de vestir de lana.
  //
  // estilo "oficina" + secundario "clasico", NO "formal": un pantalón de
  // gabardina no es un pantalón de traje -- va perfecto a la oficina con
  // camisa o sweater y aguanta un blazer, pero no es la prenda que define
  // un traje (ver outfitSirveParaEstilo en recommend.ts, que exige saco
  // para "formal"). Los de lana de arriba son formal PURO, sin secundario
  // "oficina" -- corregido en la ronda de separación estricta (pedido
  // explícito del usuario: "en el catálogo los filtros de formal y de
  // oficina deben ser distintos"). Quien va a la oficina sin saco usa el
  // pantalón de gabardina de acá, no el de traje: son dos prendas de tela
  // distinta que existen justamente para separar esos dos usos, no una
  // sola prenda que sirve para los dos (a diferencia de una camisa o un
  // cinturón, que sí son la MISMA prenda física en ambos registros -- ver
  // el comentario de camisa-blanca más arriba).
  //
  // Marrón -- color nuevo en la categoría (el catálogo no tenía NINGÚN
  // pantalón de vestir marrón hasta ahora, y es uno de los dos que el
  // usuario tiene en el placard). Reusa el mismo marrón café del resto del
  // catálogo (#6F4E37, ya en zapatillas-marrones y pantalon-pana-marron)
  // por la misma consistencia de paleta que documenta el resto del archivo.
  { id: "pantalon-gabardina-negro", nombre: "Pantalón de gabardina negro", categoria: "pantalon", colorHex: "#1A1A1A", textura: "gabardina", estilo: "oficina", estilosSecundarios: ["clasico"], ocasion: "laburo", calce: "ajustado" },
  { id: "pantalon-gabardina-marron", nombre: "Pantalón de gabardina marrón", categoria: "pantalon", colorHex: "#6F4E37", textura: "gabardina", estilo: "oficina", estilosSecundarios: ["clasico"], ocasion: "laburo", calce: "ajustado" },
  { id: "pantalon-gabardina-gris", nombre: "Pantalón de gabardina gris", categoria: "pantalon", colorHex: "#6E6E6E", textura: "gabardina", estilo: "oficina", estilosSecundarios: ["clasico"], ocasion: "laburo", calce: "ajustado" },
  // el que antes era "pantalon-vestir-beige" (lana/formal) -- ver el
  // comentario de los de lana de arriba: el pantalón de vestir beige real
  // es de gabardina, no de lana de traje. Sigue siendo distinto de
  // pantalon-beige de acá abajo (el chino, algodón/clasico): mismo beige
  // del resto del catálogo, otra tela y otro registro.
  { id: "pantalon-gabardina-beige", nombre: "Pantalón de gabardina beige", categoria: "pantalon", colorHex: "#D8C7A1", textura: "gabardina", estilo: "oficina", estilosSecundarios: ["clasico"], ocasion: "laburo", calce: "ajustado" },
  { id: "pantalon-beige", nombre: "Pantalón chino beige", categoria: "pantalon", colorHex: "#D8C7A1", textura: "algodon", estilo: "clasico", ocasion: "laburo" },

  // --- Pantalón de lino (clásico, verano) -- ampliación del catálogo,
  // pareja real del pantalón chino de arriba: distinto tejido, mismo
  // registro. Verificado por uso y costumbre real de la moda: el lino es
  // LA tela de pantalón de vestir/smart-casual de verano por excelencia
  // (fresco, transpirable), la contraparte de estación cálida de la lana
  // de pantalon-vestir-* de arriba -- se usa con camisa-lino-* o una
  // remera lisa, sin corbata. Mismos hex que ya usan camisa-lino-blanca/
  // camisa-lino-beige -- consistencia de paleta cross-categoría.
  { id: "pantalon-lino-blanco", nombre: "Pantalón de lino blanco", categoria: "pantalon", colorHex: "#F5F5F5", textura: "lino", estilo: "clasico", ocasion: "casual" },
  { id: "pantalon-lino-beige", nombre: "Pantalón de lino beige", categoria: "pantalon", colorHex: "#D8C7A1", textura: "lino", estilo: "clasico", ocasion: "casual" },

  // --- Pantalón de pana (corduroy) -- ampliación del catálogo. Hueco real
  // encontrado en esta ronda: la textura "pana"/"corderoy" existe en el
  // enum (ver types.ts, con su propio patrón de canutillo real en
  // PatronTextura de PrendaIcon.tsx) pero NINGUNA prenda del catálogo
  // hasta ahora la usaba. Verificado por uso y costumbre real de la moda:
  // el pantalón de pana es el básico de entretiempo/invierno "clasico" por
  // excelencia (con sweater y mocasines, look de otoño/campus clásico),
  // tan real como el chino de algodón de arriba pero de otra estación.
  // Marrón/camel -- mismo hex que ya usa zapatillas-marrones (#6F4E37),
  // consistencia de paleta. Verde -- mismo hex que pantalon-deportivo-
  // verde-oscuro (#2F5233, verde bosque real), el otro color clásico de
  // pana además del marrón.
  { id: "pantalon-pana-marron", nombre: "Pantalón de pana marrón", categoria: "pantalon", colorHex: "#6F4E37", textura: "pana", estilo: "clasico", ocasion: "casual" },
  { id: "pantalon-pana-verde", nombre: "Pantalón de pana verde", categoria: "pantalon", colorHex: "#2F5233", textura: "pana", estilo: "clasico", ocasion: "casual" },

  // joggers -- casual como el jean (no "clasico" como el chino: no van a
  // la oficina), textura "algodon" sin ambigüedad porque el usuario la dio
  // así directamente. Colores reusados del resto del catálogo (negro
  // estándar, el mismo beige del chino, el gris de siempre) por la misma
  // razón de consistencia de paleta que ya documenta el resto del archivo.
  // estilo secundario "urbano" en los 3 -- mismo criterio que el jean de
  // arriba: es el jogger como PRENDA lo que lee urbano/streetwear, no un
  // color puntual (corrección de esta ronda: antes solo lo tenía el negro).
  // calce "holgado" en los 3 -- auditoría de sastrería (Consejo, ronda de
  // auditoría del motor): el corte ancho es el rasgo que define al jogger
  // como prenda (ver el comentario de arriba), no un dato aparte.
  { id: "jogger-negro", nombre: "Jogger negro", categoria: "pantalon", colorHex: "#1A1A1A", textura: "algodon", estilo: "casual", estilosSecundarios: ["urbano"], ocasion: "casual", calce: "holgado" },
  { id: "jogger-beige", nombre: "Jogger beige", categoria: "pantalon", colorHex: "#D8C7A1", textura: "algodon", estilo: "casual", estilosSecundarios: ["urbano"], ocasion: "casual", calce: "holgado" },
  { id: "jogger-gris", nombre: "Jogger gris", categoria: "pantalon", colorHex: "#8C8C8C", textura: "algodon", estilo: "casual", estilosSecundarios: ["urbano"], ocasion: "casual", calce: "holgado" },
  // pantalón deportivo (entrenamiento) -- distinto del jogger de arriba:
  // mismo corte ancho, pero tela técnica sintética (poliéster), no algodón
  // (mismo criterio que la remera deportiva de arriba). calce "holgado"
  // mismo motivo que el jogger.
  { id: "pantalon-deportivo-negro", nombre: "Pantalón deportivo negro", categoria: "pantalon", colorHex: "#1A1A1A", textura: "poliester", estilo: "deportivo", ocasion: "casual", calce: "holgado" },
  // verde oscuro real (no el verde militar/oliva de campera-verde-militar
  // más abajo, que es otro tono): un verde bosque/botella, el típico de un
  // pantalón de entrenamiento, no un verde caqui desaturado.
  { id: "pantalon-deportivo-verde-oscuro", nombre: "Pantalón deportivo verde oscuro", categoria: "pantalon", colorHex: "#2F5233", textura: "poliester", estilo: "deportivo", ocasion: "casual", calce: "holgado" },

  // --- Bermudas (chino/algodón, hasta la rodilla) --- agregadas a pedido
  // explícito del usuario: el catálogo no tenía ninguna prenda de piernas
  // más corta que un pantalón largo. Mismo criterio de textura/estilo que
  // el pantalón chino de arriba -- de hecho es la misma prenda en versión
  // corta, así que reusa su mismo estilo ("clasico") y textura
  // ("algodon"). El beige/caqui es a propósito el color más asociado a
  // "bermuda" en el uso real, no una elección arbitraria.
  { id: "bermuda-beige", nombre: "Bermuda beige", categoria: "bermuda", colorHex: "#D8C7A1", textura: "algodon", estilo: "clasico", ocasion: "casual" },
  { id: "bermuda-azul-marino", nombre: "Bermuda azul marino", categoria: "bermuda", colorHex: "#1F2A44", textura: "algodon", estilo: "clasico", ocasion: "casual" },
  // variante denim -- tan real como el jean largo de arriba, mismo criterio
  // de textura/estilo ("casual", no "clasico": un jean corto lee más
  // informal que un chino corto, igual que el jean largo vs. el pantalón
  // de vestir) y mismo secundario "urbano" que el resto de la familia
  // denim/jogger de esta ronda -- una bermuda de jean con zapatillas
  // urbanas es tan de calle como el jean largo.
  { id: "bermuda-jean", nombre: "Bermuda de jean", categoria: "bermuda", colorHex: "#3B5998", textura: "denim", estilo: "casual", estilosSecundarios: ["urbano"], ocasion: "casual" },
  { id: "bermuda-gris", nombre: "Bermuda gris", categoria: "bermuda", colorHex: "#8C8C8C", textura: "algodon", estilo: "clasico", ocasion: "casual" },

  // --- Shorts deportivos (tela técnica, hasta medio muslo) --- distintos
  // de la bermuda de arriba, no una variante del mismo dibujo: son mucho
  // más cortos (Maniqui.tsx los dibuja hasta la mitad del muslo, la
  // bermuda hasta la rodilla) y de tela sintética (poliéster), no chino/
  // denim -- mismo criterio que la remera y el pantalón deportivos de arriba.
  // calce "holgado" en los 3, mismo motivo que jogger/pantalón deportivo.
  { id: "short-deportivo-negro", nombre: "Short deportivo negro", categoria: "short_deportivo", colorHex: "#1A1A1A", textura: "poliester", estilo: "deportivo", ocasion: "casual", calce: "holgado" },
  { id: "short-deportivo-gris", nombre: "Short deportivo gris", categoria: "short_deportivo", colorHex: "#8C8C8C", textura: "poliester", estilo: "deportivo", ocasion: "casual", calce: "holgado" },
  { id: "short-deportivo-azul", nombre: "Short deportivo azul", categoria: "short_deportivo", colorHex: "#3366CC", textura: "poliester", estilo: "deportivo", ocasion: "casual", calce: "holgado" },

  // --- Buzos ---
  // `estacion` sí tageada en cada entrada de acá abajo -- ver el criterio
  // completo (y su historial real: quedó afuera en una ronda, se revirtió
  // en la siguiente) al principio del archivo. `con_capucha` default true
  // (hoodie) en los 6 de acá abajo -- son la variante hoodie del catálogo,
  // la única que existía hasta la revisión que agregó los crewneck.
  // `estacion: "entretiempo"` en los 6 de acá abajo (tejido_grueso) --
  // pedido explícito del usuario, ver el comentario largo junto a los
  // buzos frisado/invierno más abajo (mismo mapeo textura->estacion).
  { id: "buzo-gris", nombre: "Buzo gris", categoria: "buzo", colorHex: "#8C8C8C", textura: "tejido_grueso", estilo: "casual", ocasion: "casual", estacion: "entretiempo" },
  { id: "buzo-negro", nombre: "Buzo negro", categoria: "buzo", colorHex: "#1A1A1A", textura: "tejido_grueso", estilo: "casual", ocasion: "casual", estacion: "entretiempo" },
  { id: "buzo-azul-marino", nombre: "Buzo azul marino", categoria: "buzo", colorHex: "#1F2A44", textura: "tejido_grueso", estilo: "casual", ocasion: "casual", estacion: "entretiempo" },
  // mismo celeste que camisa-celeste (#B7D2EC) -- ver el criterio de
  // paleta consistente que ya documenta el archivo.
  { id: "buzo-celeste", nombre: "Buzo celeste", categoria: "buzo", colorHex: "#B7D2EC", textura: "tejido_grueso", estilo: "casual", ocasion: "casual", estacion: "entretiempo" },
  // mismo beige (#D8C7A1) que ya usan pantalon-beige/bermuda-beige/etc. --
  // ver el comentario de remera-beige más arriba. estilo/ocasion/textura
  // igual que el resto de los buzos (casual/casual/tejido_grueso): el
  // color no cambia el registro de la prenda.
  { id: "buzo-beige", nombre: "Buzo beige", categoria: "buzo", colorHex: "#D8C7A1", textura: "tejido_grueso", estilo: "casual", ocasion: "casual", estacion: "entretiempo" },
  // verde botella -- color de tendencia confirmado por búsqueda web para
  // la temporada actual ("lo llevamos en camel, verde botella o negro").
  // Matiz bien distinto del verde militar/oliva (h=140, un verde bosque/
  // botella real) y del verde deportivo del pantalón (h=127 pero mucho más
  // desaturado) -- no una variante redundante.
  { id: "buzo-verde", nombre: "Buzo verde botella", categoria: "buzo", colorHex: "#1E5631", textura: "tejido_grueso", estilo: "casual", ocasion: "casual", estacion: "entretiempo" },
  // frisado -- pedido explícito del usuario ("hay buzos... que son
  // livianos y otros más pesados"): un buzo frisado (interior de felpa/
  // fleece cepillada, más grueso y aislante que el jersey/French terry
  // "tejido_grueso" de los 6 de arriba) es un textil real y puntualmente
  // distinto -- por eso tiene su propio valor de Textura ("frisado", ver
  // types.ts) en vez de compartir "tejido_grueso" con una `estacion`
  // distinta como diferenciador (así se tageaba antes de esa revisión).
  // Siguen siendo hoodie (con_capucha default true): el peso de la tela y
  // el corte del cuello son datos independientes.
  //
  // `estacion` agregada -- Consejo, ronda siguiente, pedido explícito del
  // usuario ("revisá todos los buzos porque no figuran las clasificaciones
  // de invierno o entretiempo"): la textura sigue siendo el dato real del
  // GRAMAJE de la tela (no se saca), pero el motor de "Vestite hoy" exige
  // el campo `estacion` puntual para reconocer un buzo como abrigo real de
  // invierno/entretiempo (ver esAbrigoDeClima en recommend.ts, que mira
  // `estacion`, no `textura`) -- sin este campo, NINGÚN buzo del catálogo
  // podía nunca ser sugerido como "abrigo de esa estación", aunque la tela
  // ya distinguiera pesado de liviano. Mapeo directo del criterio textil ya
  // documentado: frisado (más grueso/aislante) -> invierno, tejido_grueso
  // (jersey/French terry, más liviano) -> entretiempo.
  { id: "buzo-frisado-negro", nombre: "Buzo frisado negro", categoria: "buzo", colorHex: "#1A1A1A", textura: "frisado", estilo: "casual", ocasion: "casual", estacion: "invierno" },
  { id: "buzo-frisado-gris", nombre: "Buzo frisado gris", categoria: "buzo", colorHex: "#8C8C8C", textura: "frisado", estilo: "casual", ocasion: "casual", estacion: "invierno" },
  // crewneck (sin capucha) -- pedido explícito del usuario, con dos
  // ejemplos reales de su propio placard: un buzo gris frisado/pesado y un
  // buzo verde tejido_grueso/liviano, los dos sin capucha. Estas dos
  // entradas cubren los dos perfiles textiles reales (pesado y liviano) en
  // versión crewneck -- no se duplican los 6 colores hoodie de arriba, dos
  // alcanza para que el motor de "comprar" tenga de dónde sugerir un
  // crewneck de cada peso.
  { id: "buzo-crewneck-gris", nombre: "Buzo crewneck gris (sin capucha)", categoria: "buzo", colorHex: "#8C8C8C", textura: "frisado", estilo: "casual", ocasion: "casual", conCapucha: false, estacion: "invierno" },
  { id: "buzo-crewneck-azul-marino", nombre: "Buzo crewneck azul marino (sin capucha)", categoria: "buzo", colorHex: "#1F2A44", textura: "tejido_grueso", estilo: "casual", ocasion: "casual", conCapucha: false, estacion: "entretiempo" },
  // buzo oversize -- auditoría de sastrería (Consejo, ronda de revisión
  // visual del maniquí), pedido explícito del usuario ("revisa en el
  // maniquí cómo quedan las prendas ajustada, regular u holgada... si no
  // hay prendas en el catálogo agrégalas"). Hueco real encontrado: el
  // catálogo tenía calce "holgado" en camperas de pluma, pero ningún buzo
  // ni sweater ni remera -- el hoodie oversize es EL básico "holgado" más
  // usado en indumentaria de calle real, y sin esta entrada no había cómo
  // ver el efecto del calce en un torso de punto (solo en camperas
  // acolchadas). "urbano" (no "casual") por el mismo motivo que ya
  // documenta campera-pluma-negra-oversize: el volumen exagerado es un
  // statement de calle, no un básico neutro.
  { id: "buzo-negro-oversize", nombre: "Buzo negro (oversize)", categoria: "buzo", colorHex: "#1A1A1A", textura: "tejido_grueso", estilo: "urbano", ocasion: "casual", calce: "holgado", estacion: "entretiempo" },

  // --- Buzo deportivo (hoodie técnico de entrenamiento) -- ampliación del
  // catálogo. Hueco real encontrado en esta ronda: NINGÚN buzo del
  // catálogo tenía estilo "deportivo", pese a que remera/pantalón/short/
  // campera deportivos ya existen hace rondas -- el buzo era la única
  // categoría de torso con abrigo real sin su versión de entrenamiento.
  // Textura "poliester" por defecto en toda prenda deportiva (mismo
  // criterio que el resto del catálogo). "entretiempo": tela técnica
  // liviana de entrenamiento, no abriga como un frisado real de invierno.
  // Mismos hex que remera-deportiva-negra/gris -- consistencia de paleta.
  { id: "buzo-deportivo-negro", nombre: "Buzo deportivo negro", categoria: "buzo", colorHex: "#1A1A1A", textura: "poliester", estilo: "deportivo", ocasion: "casual", estacion: "entretiempo" },
  { id: "buzo-deportivo-gris", nombre: "Buzo deportivo gris", categoria: "buzo", colorHex: "#8C8C8C", textura: "poliester", estilo: "deportivo", ocasion: "casual", estacion: "entretiempo" },

  // --- Sweaters (oficina/vestir) ---
  // estacion "invierno" en los 6 de lana -- corrección de una ronda
  // anterior, pedido explícito del usuario como ingeniero textil: un
  // sweater de lana gruesa/pullover es LA prenda de punto de invierno por
  // excelencia (fibra con aislación térmica real), no una capa liviana de
  // entretiempo. La versión de entretiempo es la de fibra más liviana
  // (viscosa/poliéster/algodón fino) -- ver "Sweater liviano" más abajo,
  // agregado justo para cubrir ese registro sin forzarlo en la lana.
  // estilosSecundarios: ["oficina"] en los 7 sweaters de acá abajo --
  // pedido explícito del usuario: "oficina es elegante sport -- pantalón
  // de vestir, camisa, sweater, sin corbatas, sin traje". Un sweater sobre
  // una camisa (o solo, sin nada debajo) es justamente la prenda que
  // define ese look sin saco -- ver el chequeo nuevo en
  // outfitSirveParaEstilo (recommend.ts).
  { id: "sweater-gris", nombre: "Sweater gris", categoria: "sweater", colorHex: "#8C8C8C", textura: "lana", estilo: "clasico", estilosSecundarios: ["oficina"], ocasion: "laburo", estacion: "invierno" },
  { id: "sweater-azul-marino", nombre: "Sweater azul marino", categoria: "sweater", colorHex: "#1F2A44", textura: "lana", estilo: "clasico", estilosSecundarios: ["oficina"], ocasion: "laburo", estacion: "invierno" },
  { id: "sweater-bordo", nombre: "Sweater bordo", categoria: "sweater", colorHex: "#6B2737", textura: "lana", estilo: "clasico", estilosSecundarios: ["oficina"], ocasion: "laburo", estacion: "invierno" },
  // colorHex #1A1A1A -- ver el comentario de camisa-negra más arriba: el
  // reporte real del usuario que motivó esta corrección era justo este
  // sweater ("tengo un suéter negro que dice gris oscuro").
  { id: "sweater-negro", nombre: "Sweater negro", categoria: "sweater", colorHex: "#1A1A1A", textura: "lana", estilo: "clasico", estilosSecundarios: ["oficina"], ocasion: "laburo", estacion: "invierno" },
  // mismo beige que el resto del catálogo -- clasico/laburo, mismo
  // registro que el resto de los sweaters (gris/marino/bordo/negro): un
  // sweater beige es tan de oficina como esos.
  { id: "sweater-beige", nombre: "Sweater beige", categoria: "sweater", colorHex: "#D8C7A1", textura: "lana", estilo: "clasico", estilosSecundarios: ["oficina"], ocasion: "laburo", estacion: "invierno" },
  // mostaza -- color evergreen de sweater de oficina, tan estándar como
  // bordó/azul marino/gris de acá arriba. Este hex real (h=40, s=62, l=47)
  // fue justamente el que encontró el bug de nombreColor() clasificándolo
  // como "Naranja" -- ver color.ts.
  // Estilo secundario "casual" a propósito -- el mismo sweater mostaza que
  // se usa con pantalón de vestir para la oficina funciona igual de bien
  // sobre un jean para un finde (ejemplo real que dio el usuario al pedir
  // soporte multi-estilo). "clasico" sigue siendo el principal: define el
  // registro del outfit cuando esta prenda es el ancla.
  {
    id: "sweater-mostaza",
    nombre: "Sweater mostaza",
    categoria: "sweater",
    colorHex: "#C3922E",
    textura: "lana",
    estilo: "clasico",
    estilosSecundarios: ["casual", "oficina"],
    ocasion: "laburo",
    estacion: "invierno",
  },
  // sweater liviano -- pedido explícito del usuario, agregado para cubrir
  // el hueco real que dejó la corrección de arriba: un sweater de fibra
  // liviana (viscosa/poliéster, no lana) es la prenda de punto real de
  // entretiempo -- mismo corte y uso que un sweater de lana, pero sin el
  // peso/aislación térmica que lo haría de invierno. Textura "viscosa"
  // (nueva en el enum, ver types.ts/Maniqui.tsx/recommend.ts): antes el
  // catálogo no tenía forma de describir esta fibra sin usar "lana" (dato
  // falso) o dejar la textura vacía (perdiendo la distinción real que
  // motivó este pedido). Gris y negro -- los dos colores más versátiles,
  // no una duplicación completa de los 6 sweaters de lana de arriba.
  { id: "sweater-liviano-gris", nombre: "Sweater liviano gris", categoria: "sweater", colorHex: "#8C8C8C", textura: "viscosa", estilo: "clasico", estilosSecundarios: ["casual", "oficina"], ocasion: "laburo", estacion: "entretiempo" },
  { id: "sweater-liviano-negro", nombre: "Sweater liviano negro", categoria: "sweater", colorHex: "#1A1A1A", textura: "viscosa", estilo: "clasico", estilosSecundarios: ["casual", "oficina"], ocasion: "laburo", estacion: "entretiempo" },

  // --- Sweater cuello alto (turtleneck) -- ampliación del catálogo. Hueco
  // real: todos los sweaters de arriba son cuello redondo/pullover -- el
  // cuello alto de lana negro es una prenda clásica real con nombre e
  // identidad propia (el básico minimalista de invierno por excelencia,
  // tan citado en moda como el sweater a rayas o la camisa blanca), no una
  // variante menor. Lana + invierno, mismo criterio textil que el resto de
  // los sweaters de lana de arriba. Mismo negro estándar del catálogo.
  // cuello: "alto" -- ronda de completitud del catálogo (ver Cuello en
  // types.ts): esta prenda ya existía con este nombre, pero hasta agregar
  // el campo se dibujaba exactamente igual que cualquier sweater cuello V.
  { id: "sweater-cuello-alto-negro", nombre: "Sweater cuello alto negro", categoria: "sweater", colorHex: "#1A1A1A", textura: "lana", estilo: "clasico", estilosSecundarios: ["oficina"], ocasion: "laburo", estacion: "invierno", cuello: "alto" },

  // --- Sweater de algodón (entretiempo, cuello en V) -- ampliación del
  // catálogo, pedido explícito del usuario: "sweater de algodón de
  // entretiempo cuello en V". Revisado como ingeniero textil: el algodón
  // es una fibra real de punto de entretiempo (sin la aislación térmica de
  // la lana, mismo criterio ya documentado para sweater-liviano-* -- ahí
  // la fibra liviana es viscosa, acá es algodón, otra fibra real y
  // distinta que hasta esta ronda "algodon" no tenía ningún sweater
  // propio en todo el catálogo, pese a estar en el enum Textura hace
  // rondas). No es un duplicado de sweater-liviano: son dos fibras reales
  // distintas con el mismo nivel de abrigo (ninguna es de invierno), tan
  // legítimo tenerlas dos como tener jean (denim) y jogger (algodón) como
  // pantalones separados. El escote en V ya es el corte por defecto de
  // TODO sweater en el ícono/maniquí (ver categoria==="sweater" en
  // PrendaIcon.tsx/Maniqui.tsx, la costura en V que se dibuja sin
  // excepción) -- no hace falta ningún cambio de renderizado, la silueta
  // ya es la correcta apenas se carga con esta categoría. estilo/
  // ocasion/estilosSecundarios igual que sweater-liviano-* (mismo
  // registro real: un sweater de punto liviano es tan de oficina/vestir
  // como de finde, sin corbata). Negro y gris -- mismos hex que el resto
  // del catálogo (#1A1A1A/#8C8C8C, ya usados en sweater-liviano-*).
  // Marrón -- mismo camel que ya usan pantalon-pana-marron/zapatillas-
  // marrones (#6F4E37): es justamente el tono de sweater más clásico
  // que existe (jersey camel), no un marrón nuevo inventado.
  { id: "sweater-algodon-negro", nombre: "Sweater de algodón negro", categoria: "sweater", colorHex: "#1A1A1A", textura: "algodon", estilo: "clasico", estilosSecundarios: ["casual", "oficina"], ocasion: "laburo", estacion: "entretiempo" },
  { id: "sweater-algodon-marron", nombre: "Sweater de algodón marrón", categoria: "sweater", colorHex: "#6F4E37", textura: "algodon", estilo: "clasico", estilosSecundarios: ["casual", "oficina"], ocasion: "laburo", estacion: "entretiempo" },
  { id: "sweater-algodon-gris", nombre: "Sweater de algodón gris", categoria: "sweater", colorHex: "#8C8C8C", textura: "algodon", estilo: "clasico", estilosSecundarios: ["casual", "oficina"], ocasion: "laburo", estacion: "entretiempo" },

  // --- Chaleco (sweater sin mangas) -- ronda de completitud del catálogo
  // (ver Manga en types.ts), revisada como sastre y modista. Hueco real y
  // prenda de sastrería con identidad propia, no una variante menor de
  // "sweater con mangas cortas" (eso no existe como prenda real): el
  // chaleco se usa solo sobre una camisa (el reemplazo liviano del saco
  // para un look de oficina sin sastrería completa) o bajo un saco en
  // invierno, capa que ni el sweater de mangas largas ni la camisa sola
  // cubrían. Lana + invierno, mismo criterio textil que el resto de los
  // sweaters de lana de arriba -- un chaleco real de oficina es de la
  // misma fibra que un sweater de invierno, la mangas es lo único que
  // cambia. Gris y azul marino -- los mismos dos colores de sweater de
  // oficina más versátiles del resto del catálogo.
  { id: "chaleco-gris", nombre: "Chaleco gris", categoria: "sweater", colorHex: "#8C8C8C", textura: "lana", estilo: "clasico", estilosSecundarios: ["oficina"], ocasion: "laburo", estacion: "invierno", manga: "sin_mangas" },
  { id: "chaleco-azul-marino", nombre: "Chaleco azul marino", categoria: "sweater", colorHex: "#1F2A44", textura: "lana", estilo: "clasico", estilosSecundarios: ["oficina"], ocasion: "laburo", estacion: "invierno", manga: "sin_mangas" },

  // --- Calzado ---
  // Revisado como modista/ingeniero textil, pedido explícito del usuario:
  // "dale más detalles a las zapatillas... revisa todos los estilos...
  // las costuras, cortes y decoración más usadas según usos y costumbres".
  // Antes el catálogo cubría 3 de los 5 registros (urbano/formal/
  // deportivo) con una sola silueta genérica de zapatilla -- ver
  // CorteCalzado en types.ts para el porqué de cada arquetipo real. Las
  // zapatillas negras y marrones aparecen dos veces a propósito -- una
  // versión monocromática de verdad (suela a tono, tan real como la de
  // suela blanca) y otra con la suela de goma en blanco/crema, que es el
  // otro look real y común. Ninguna de las dos es "la correcta": conviven
  // como dos prendas distintas (`suelaContraste`, ver types.ts) para que el
  // catálogo no le imponga una sola variante a todas las zapatillas del
  // mismo color -- eso fue justamente el error de una revisión anterior.
  {
    id: "zapatillas-blancas",
    nombre: "Zapatillas blancas (3 rayas)",
    categoria: "calzado",
    colorHex: "#F5F5F0",
    estilo: "urbano",
    ocasion: "casual",
    corteCalzado: "zapatilla_urbana",
  },
  {
    id: "zapatillas-negras",
    nombre: "Zapatillas negras (3 rayas)",
    categoria: "calzado",
    colorHex: "#1A1A1A",
    estilo: "urbano",
    ocasion: "casual",
    corteCalzado: "zapatilla_urbana",
  },
  {
    id: "zapatillas-negras-suela-blanca",
    nombre: "Zapatillas negras, suela blanca (3 rayas)",
    categoria: "calzado",
    colorHex: "#1A1A1A",
    estilo: "urbano",
    ocasion: "casual",
    suelaContraste: true,
    corteCalzado: "zapatilla_urbana",
  },
  {
    id: "zapatillas-grises",
    nombre: "Zapatillas grises (3 rayas)",
    categoria: "calzado",
    colorHex: "#8C8C8C",
    estilo: "urbano",
    ocasion: "casual",
    corteCalzado: "zapatilla_urbana",
  },
  // sin textura a propósito, mismo criterio que las demás -- una etiqueta
  // real de composición de zapatilla ("capellada 85% sintético / 15%
  // cuero, forro 100% textil sintético") no es "cuero" para nada del
  // motor: la mayoría es sintético, y ninguna Textura del enum describe
  // "sintético" sin inventar un dato que la prenda real no tiene.
  {
    id: "zapatillas-azul-marino",
    nombre: "Zapatillas azul marino (3 rayas)",
    categoria: "calzado",
    colorHex: "#1F2A44",
    estilo: "urbano",
    ocasion: "casual",
    corteCalzado: "zapatilla_urbana",
  },
  // marrón de gamuza/lona (mate), distinto del marrón de cuero lustroso de
  // los zapatos de vestir un par de líneas más abajo -- son materiales que
  // se ven distintos en la vida real, no el mismo color reusado sin razón.
  {
    id: "zapatillas-marrones",
    nombre: "Zapatillas marrones (3 rayas)",
    categoria: "calzado",
    colorHex: "#6F4E37",
    estilo: "urbano",
    ocasion: "casual",
    corteCalzado: "zapatilla_urbana",
  },
  {
    id: "zapatillas-marrones-suela-blanca",
    nombre: "Zapatillas marrones, suela blanca (3 rayas)",
    categoria: "calzado",
    colorHex: "#6F4E37",
    estilo: "urbano",
    ocasion: "casual",
    suelaContraste: true,
    corteCalzado: "zapatilla_urbana",
  },
  // estilosSecundarios "oficina" -- auditoría de Consejo, hueco real medido
  // sobre el catálogo completo: la pestaña "Oficina" quedaba en CERO
  // outfits posibles porque NINGÚN calzado del catálogo tenía ese tag (5016
  // de 5016 combinaciones descartadas por el calzado), y
  // outfitEsCoherenteParaEstilo exige que TODA prenda del outfit tenga el
  // estilo tageado. Como todo outfit lleva calzado, el registro entero era
  // inalcanzable -- ni armándolo con el catálogo entero en el placard, ni
  // comprando: las sugerencias de compra salen de este mismo catálogo. El
  // tag es correcto por usos y costumbres antes que por conveniencia: el
  // zapato de vestir con cordones y el mocasín SON el calzado del look de
  // oficina real (pantalón de vestir + camisa o sweater, sin corbata ni
  // saco -- ver Estilo en types.ts). No se toca `estilo` (sigue siendo
  // "formal"/"clasico", su registro principal), solo se declara el
  // secundario que faltaba.
  {
    id: "zapatos-cuero-negro",
    nombre: "Zapatos de vestir negros",
    categoria: "calzado",
    colorHex: "#1C1210",
    textura: "cuero_liso",
    estilo: "formal",
    estilosSecundarios: ["oficina"],
    ocasion: "laburo",
    corteCalzado: "zapato_vestir",
  },
  {
    id: "zapatos-cuero-marron",
    nombre: "Zapatos de vestir marrones",
    categoria: "calzado",
    colorHex: "#5C3A21",
    textura: "cuero_liso",
    estilo: "formal",
    estilosSecundarios: ["oficina"],
    ocasion: "laburo",
    corteCalzado: "zapato_vestir",
  },
  // zapatillas de running -- silueta técnica (suela alta + panel de malla),
  // deliberadamente SIN las 3 rayas de las urbanas de arriba: esas son un
  // diseño de calle/lifestyle, no de zapatilla técnica de entrenamiento
  // (distinción real entre "deportiva de calle" y "deportiva técnica" --
  // ver el comentario largo de CorteCalzado en types.ts).
  {
    id: "zapatillas-running-blancas",
    nombre: "Zapatillas running blancas",
    categoria: "calzado",
    colorHex: "#F5F5F0",
    estilo: "deportivo",
    ocasion: "casual",
    corteCalzado: "zapatilla_running",
  },
  {
    id: "zapatillas-running-negras",
    nombre: "Zapatillas running negras",
    categoria: "calzado",
    colorHex: "#1A1A1A",
    estilo: "deportivo",
    ocasion: "casual",
    corteCalzado: "zapatilla_running",
  },
  {
    id: "zapatillas-running-grises",
    nombre: "Zapatillas running grises",
    categoria: "calzado",
    colorHex: "#8C8C8C",
    estilo: "deportivo",
    ocasion: "casual",
    corteCalzado: "zapatilla_running",
  },
  // rojas -- ampliación del catálogo, mismo rojo que remera-roja/campera-
  // rompeviento-roja/bufanda-roja (#B93A32): completa el kit deportivo
  // rojo (campera + zapatilla) que hasta ahora solo tenía la campera.
  {
    id: "zapatillas-running-rojas",
    nombre: "Zapatillas running rojas",
    categoria: "calzado",
    colorHex: "#B93A32",
    estilo: "deportivo",
    ocasion: "casual",
    corteCalzado: "zapatilla_running",
  },
  // mocasines -- registro clásico, hueco real del catálogo (antes clasico
  // no tenía NINGÚN calzado propio). Sin cordones, con la tira/correa
  // cruzando el empeine (penny loafer) -- el detalle real más definitorio
  // de un mocasín, ver CorteCalzado en types.ts. Mismos 2 colores de cuero
  // ya establecidos para zapatos de vestir (negro/marrón): son la paleta
  // real de cuero de vestir, no una nueva inventada. ocasion "casual", no
  // "laburo" -- un mocasín es smart-casual real (funciona de fin de semana
  // también), a diferencia del zapato de vestir con cordones de arriba.
  {
    id: "mocasines-negros",
    nombre: "Mocasines negros",
    categoria: "calzado",
    colorHex: "#1C1210",
    textura: "cuero_liso",
    estilo: "clasico",
    // "oficina" -- mismo motivo que los zapatos de vestir de más arriba
    // (ver ese comentario): un mocasín es calzado de oficina real, y sin
    // ningún calzado tageado así la pestaña entera quedaba sin opciones.
    estilosSecundarios: ["casual", "oficina"],
    ocasion: "casual",
    corteCalzado: "mocasin",
  },
  {
    id: "mocasines-marrones",
    nombre: "Mocasines marrones",
    categoria: "calzado",
    colorHex: "#5C3A21",
    textura: "cuero_liso",
    estilo: "clasico",
    estilosSecundarios: ["casual", "oficina"],
    ocasion: "casual",
    corteCalzado: "mocasin",
  },
  // --- Botines de cuero -- ronda de completitud del catálogo (pedido
  // explícito del usuario: "revisá todas las prendas del catálogo, quiero
  // que me digas si está completo o se puede completar aún más"), revisado
  // como modista y asesor de imagen. Era el hueco MÁS GRANDE que tenía el
  // catálogo: los cinco cortes de calzado que existían (zapatilla urbana,
  // running, zapato de vestir, mocasín, zapatilla de lona) son todos
  // calzado BAJO, así que un placard armado con este catálogo no tenía con
  // qué vestirse los pies en invierno -- en una app que separa invierno,
  // entretiempo y verano en todas las demás categorías de abrigo.
  //
  // Marrón primero: el botín de cuero marrón es el más versátil de los dos
  // en un guardarropa real (va con jean, chino, pana y pantalón de
  // gabardina), y encima el catálogo ya tiene toda la familia de marrones
  // que lo acompañan (cinturón, mocasines, pana). Mismos hex que ya usan
  // mocasines-marrones (#5C3A21) y zapatillas-marrones (#6F4E37) --
  // consistencia de paleta, y dos marrones reales distintos de botín (uno
  // oscuro tipo borcego, uno más claro tipo chukka/camel).
  //
  // Sin `estacion`, igual que el resto del calzado: un botín se usa de
  // otoño a primavera, no solo con frío extremo -- tagearlo "invierno" lo
  // sacaría de todos los outfits de entretiempo, que es justo cuando más
  // se usa.
  {
    id: "botines-cuero-marron",
    nombre: "Botines de cuero marrones",
    categoria: "calzado",
    colorHex: "#5C3A21",
    textura: "cuero_liso",
    estilo: "clasico",
    estilosSecundarios: ["casual", "urbano"],
    ocasion: "casual",
    corteCalzado: "botin",
  },
  {
    id: "botines-cuero-camel",
    nombre: "Botines de cuero camel",
    categoria: "calzado",
    colorHex: "#6F4E37",
    textura: "cuero_liso",
    estilo: "clasico",
    estilosSecundarios: ["casual", "urbano"],
    ocasion: "casual",
    corteCalzado: "botin",
  },
  // negro -- el otro botín real del guardarropa: más urbano que clásico
  // (con jean negro y campera de cuero es el look de calle por excelencia),
  // por eso estilo "urbano" con "clasico" de secundario, al revés que los
  // marrones de acá arriba.
  {
    id: "botines-cuero-negros",
    nombre: "Botines de cuero negros",
    categoria: "calzado",
    colorHex: "#1C1210",
    textura: "cuero_liso",
    estilo: "urbano",
    estilosSecundarios: ["clasico", "casual"],
    ocasion: "casual",
    corteCalzado: "botin",
  },
  // zapatillas de lona -- registro casual, el otro hueco real del catálogo.
  // Los 3 colores clásicos de una zapatilla de lona real (blanco/negro/
  // azul marino), sin textura "cuero_liso" (es lona/textil, no cuero) --
  // mismo criterio que las urbanas de arriba. Puntera de goma + costura
  // lateral son el detalle real, ver CorteCalzado en types.ts.
  // estilosSecundarios ["urbano","clasico"] en las 3 -- auditoría de imagen
  // (misma ronda que campera-jean/cinturon de arriba). Inconsistencia real:
  // solo la azul marino tenía esta cobertura multi-estilo; blanca y negra
  // (los dos colores MÁS neutros/versátiles de cualquier calzado, no menos)
  // se habían quedado en "casual" solo. Pareja las 3 -- blanco y negro son,
  // si acaso, más versátiles que el azul marino, no menos.
  {
    id: "zapatillas-lona-blancas",
    nombre: "Zapatillas de lona blancas",
    categoria: "calzado",
    colorHex: "#F5F5F0",
    estilo: "casual",
    estilosSecundarios: ["urbano", "clasico"],
    ocasion: "casual",
    corteCalzado: "zapatilla_lona",
  },
  {
    id: "zapatillas-lona-negras",
    nombre: "Zapatillas de lona negras",
    categoria: "calzado",
    colorHex: "#1A1A1A",
    estilo: "casual",
    estilosSecundarios: ["urbano", "clasico"],
    ocasion: "casual",
    corteCalzado: "zapatilla_lona",
  },
  {
    id: "zapatillas-lona-azul-marino",
    nombre: "Zapatillas de lona azul marino",
    categoria: "calzado",
    colorHex: "#1F2A44",
    estilo: "casual",
    estilosSecundarios: ["urbano", "clasico"],
    ocasion: "casual",
    corteCalzado: "zapatilla_lona",
  },

  // --- Sandalias de cuero -- ronda de completitud del catálogo (ver
  // CorteCalzado en types.ts), revisada como modista y asesor de imagen:
  // la contraparte de verano del botín de acá arriba. Los cinco cortes
  // anteriores a esta ronda cubrían frío/entretiempo (botín) o calzado
  // cerrado de calle todo el año, pero ninguno era realmente de verano --
  // un guardarropa real no usa zapatilla cerrada con bermuda en pleno
  // enero. Cuero (no lona/goma): la sandalia de cuero tipo "sandalia
  // franciscana"/de tiras es el registro clásico/casual real, la
  // contraparte de verano del mocasín (mismo estilo, misma tela) más que
  // de la zapatilla urbana. Marrón y negro -- mismos hex que ya usan
  // mocasines-marrones/mocasines-negros, consistencia de paleta.
  { id: "sandalias-cuero-marron", nombre: "Sandalias de cuero marrones", categoria: "calzado", colorHex: "#5C3A21", textura: "cuero_liso", estilo: "clasico", estilosSecundarios: ["casual"], ocasion: "casual", corteCalzado: "sandalia" },
  { id: "sandalias-cuero-negras", nombre: "Sandalias de cuero negras", categoria: "calzado", colorHex: "#1A1A1A", textura: "cuero_liso", estilo: "clasico", estilosSecundarios: ["casual"], ocasion: "casual", corteCalzado: "sandalia" },

  // --- Camperas ---
  // "entretiempo" en negra/jean/verde militar/piloto -- ninguna lleva
  // relleno (bomber/utility/denim/nylon liviano sin forro): cortan viento
  // pero no abrigan como una pluma o un paño de invierno real.
  { id: "campera-negra", nombre: "Campera negra", categoria: "campera", colorHex: "#1A1A1A", estilo: "urbano", ocasion: "casual", estacion: "entretiempo" },
  // estilo secundario "urbano" -- auditoría de imagen (Consejo, pedido
  // explícito del usuario: "cuál es la diferencia entre casual, urbano y
  // clásico... revisá todo el catálogo"). Inconsistencia real encontrada:
  // el jean PANTALÓN de más arriba ya lleva "urbano" en TODO color con el
  // argumento explícito de que "lo que hace a un jean urbano/streetwear no
  // es el color, es la PRENDA (denim de corte casual)" -- ese mismo
  // argumento aplica letra por letra a una campera de jean, y sin embargo
  // se había quedado afuera (única prenda de denim del catálogo sin
  // "urbano"). Corregido para ser consistente con el propio criterio que
  // el archivo ya documenta.
  { id: "campera-jean", nombre: "Campera de jean", categoria: "campera", colorHex: "#5B7FA6", textura: "denim", estilo: "casual", estilosSecundarios: ["urbano"], ocasion: "casual", estacion: "entretiempo" },
  { id: "campera-verde-militar", nombre: "Campera verde militar", categoria: "campera", colorHex: "#5A5F3D", estilo: "urbano", ocasion: "casual", estacion: "entretiempo" },
  // campera de cuero (biker/motociclista) -- ampliación del catálogo. Hueco
  // real: "cuero_liso" ya existe en el enum y se usa en zapatos/mocasines/
  // cinturones, pero ninguna campera del catálogo lo usaba -- la campera de
  // cuero negra es EL ícono urbano por excelencia (Perfecto/biker jacket),
  // tan real y citado como la de jean o la de pluma, no una variante menor
  // de campera-negra (tela lisa) -- el cuero liso ya suma su propio brillo
  // real en el ícono/maniquí (ver TEXTURA_BRILLO en PrendaIcon.tsx), así
  // que se distingue visualmente de las demás camperas negras del catálogo.
  // Mismo negro de cuero que ya usan zapatos-cuero-negro/mocasines-negros
  // (#1C1210, no el #1A1A1A de tela) -- consistencia de paleta cross-
  // categoría: es el mismo material, tiene que ser el mismo tono.
  { id: "campera-cuero-negra", nombre: "Campera de cuero negra", categoria: "campera", colorHex: "#1C1210", textura: "cuero_liso", estilo: "urbano", ocasion: "casual", estacion: "entretiempo" },
  // piloto -- no es un rompeviento deportivo (más abajo) ni una campera de
  // vestir: es la campera de lluvia liviana/impermeable de uso diario
  // (nylon/microfibra), verificado por búsqueda web. Pedido explícito del
  // usuario, revisado como sastre/ingeniero textil: "la campera piloto en
  // realidad es una campera impermeable" -- hasta esta revisión se dejaba
  // sin textura (ninguna del enum describía "nylon impermeable" sin
  // inventar un dato falso), lo que la volvía indistinguible de
  // campera-negra en los hechos (mismo estilo/ocasión, ningún otro campo
  // las separaba). Se agrega "impermeable" como textura real (migración
  // 0024), mismo criterio que denim/acolchado/poliéster/viscosa/frisado:
  // dibuja un patrón/brillo real en el ícono y el maniquí (ver
  // TEXTURA_BRILLO en PrendaIcon.tsx -- una tela técnica tratada brilla
  // más que el algodón/lana, mismo criterio que ya vale para poliéster/
  // seda/cuero_liso), y además distingue esta prenda de una campera de
  // tela lisa. "urbano", no "deportivo": se usa a diario en la calle, no
  // para entrenar (mismo criterio que campera-negra, no camisa-negra) --
  // por eso tampoco entra en el "poliéster por defecto" que sí aplica a
  // las prendas con estilo "deportivo".
  { id: "campera-piloto-negra", nombre: "Campera piloto negra", categoria: "campera", colorHex: "#1A1A1A", textura: "impermeable", estilo: "urbano", ocasion: "casual", estacion: "entretiempo" },
  // sweater con cierre -- de punto/lana, no un buzo ni un sweater sin
  // cierre (esos ya están en sus propias categorías): es una prenda de
  // punto que se usa COMO campera, así que va en categoria="campera" con
  // textura "lana" (verificado por búsqueda web: "campera de lana con
  // cierre"), mismo estilo/ocasion que el resto de los sweaters de vestir
  // (clasico/laburo) -- es la misma idea de prenda, solo con cierre en vez
  // de cuello redondo/pullover. Lana fina de punto, no paño grueso -> mismo
  // criterio "entretiempo" que los sweaters de arriba, no invierno.
  { id: "campera-sweater-azul-marino", nombre: "Campera sweater azul marino", categoria: "campera", colorHex: "#1F2A44", textura: "lana", estilo: "clasico", ocasion: "laburo", estacion: "entretiempo" },
  // pluma/puffer (tipo Uniqlo, ajustada al cuerpo, relleno fino) -- colores
  // reusados de otras categorías, ver criterio de "Accesorios" más abajo.
  // Revisado como ingeniero textil, pedido explícito del usuario: "acolchado"
  // no siempre es invierno -- este modelo puntual (Uniqlo Ultra Light Down
  // y equivalentes) es justamente una campera de relleno liviano, pensada y
  // vendida para entretiempo/viaje, no la protección real de un invierno
  // crudo. La de invierno de verdad es la oversize de acá abajo, con mucho
  // más volumen/relleno.
  // calce "ajustado" en las 3 -- son la "Uniqlo-type" que ya menciona el
  // comentario de más abajo, en contraste directo con la oversize: relleno
  // fino, silueta pegada al cuerpo, no voluminosa (auditoría de sastrería,
  // Consejo, ronda de auditoría del motor).
  { id: "campera-pluma-negra", nombre: "Campera de pluma negra", categoria: "campera", colorHex: "#1A1A1A", textura: "acolchado", estilo: "casual", ocasion: "casual", estacion: "entretiempo", calce: "ajustado" },
  { id: "campera-pluma-azul-marino", nombre: "Campera de pluma azul marino", categoria: "campera", colorHex: "#1F2A44", textura: "acolchado", estilo: "casual", ocasion: "casual", estacion: "entretiempo", calce: "ajustado" },
  { id: "campera-pluma-beige", nombre: "Campera de pluma beige", categoria: "campera", colorHex: "#D8C7A1", textura: "acolchado", estilo: "casual", ocasion: "casual", estacion: "entretiempo", calce: "ajustado" },
  // pluma oversize (tipo campera retro estilo Nuptse: mucho más grande y
  // abrigada que la de arriba, silueta voluminosa en vez de ajustada al
  // cuerpo) -- pedido explícito del usuario, distinguiéndola de la
  // Uniqlo-type de arriba. Acá SÍ es "invierno" de verdad: más volumen real
  // significa más relleno/aislación, a diferencia de las tres de arriba
  // (mismo material acolchado, pero relleno fino) -- se distingue por
  // nombre, mismo patrón que ya usa "(suela blanca)" en las zapatillas.
  // "urbano" en vez de "casual": el volumen exagerado es un statement de
  // calle, no una campera básica.
  { id: "campera-pluma-negra-oversize", nombre: "Campera de pluma negra (oversize)", categoria: "campera", colorHex: "#1A1A1A", textura: "acolchado", estilo: "urbano", ocasion: "casual", estacion: "invierno", calce: "holgado" },
  // rompeviento -- deportivo, distinto de la campera de jean/pluma de
  // arriba (esas son casual/urbano, no para entrenar). Poliéster por
  // defecto, mismo criterio que el resto de las prendas "deportivo".
  // "entretiempo": corta viento/llovizna pero no tiene relleno térmico --
  // no protege del frío real de invierno.
  { id: "campera-rompeviento-negra", nombre: "Campera rompeviento negra", categoria: "campera", colorHex: "#1A1A1A", textura: "poliester", estilo: "deportivo", ocasion: "casual", estacion: "entretiempo" },
  { id: "campera-rompeviento-azul", nombre: "Campera rompeviento azul", categoria: "campera", colorHex: "#3366CC", textura: "poliester", estilo: "deportivo", ocasion: "casual", estacion: "entretiempo" },
  // pedido explícito del usuario: campera deportiva de entretiempo, roja y
  // azul marino -- mismo modelo rompeviento de arriba (deportivo,
  // poliéster, entretiempo), solo suma color. "roja" reusa el hex de
  // remera-roja/bufanda-roja (#B93A32), no un rojo nuevo. "azul marino"
  // reusa #1F2A44 -- el mismo criterio documentado en Accesorios más abajo
  // (consistencia cross-categoría: esta campera combina con el resto de
  // las prendas azul marino ya cargadas, no con un azul ligeramente
  // distinto) -- y es DISTINTO a propósito del "azul" de la línea de
  // arriba (#3366CC, un azul eléctrico/cobalto ya reservado para
  // deportivo, ver short-deportivo-azul): "azul marino" es la navy oscura
  // y desaturada de siempre, no una tercera variante de celeste.
  { id: "campera-rompeviento-roja", nombre: "Campera rompeviento roja", categoria: "campera", colorHex: "#B93A32", textura: "poliester", estilo: "deportivo", ocasion: "casual", estacion: "entretiempo" },
  { id: "campera-rompeviento-azul-marino", nombre: "Campera rompeviento azul marino", categoria: "campera", colorHex: "#1F2A44", textura: "poliester", estilo: "deportivo", ocasion: "casual", estacion: "entretiempo" },
  // "campera deportiva" (track jacket/"campera de buzo") -- pedido
  // explícito del usuario: "las camperas deportivas no son solo
  // rompeviento, también hay algunas de entretiempo. Revisa en las marcas
  // deportivas tipo Adidas, Puma, Nike que venden". Verificado por
  // búsqueda web (adidas.com, Firebird Track Jacket y equivalentes de
  // Puma/Nike): es una prenda real y distinta del rompeviento de arriba,
  // no otro color del mismo modelo -- tela TRICOT (punto liviano de
  // poliéster con brillo característico, no el tejido plano técnico del
  // rompeviento), cuello alto tipo banda (más bajo/relajado que el cuello
  // funnel del rompeviento) y puño/ruedo acanalados, cierre expuesto (sin
  // tapeta -- a diferencia del impermeable, no corta agua, no la
  // necesita). "entretiempo": es la capa liviana de entrenamiento/uso
  // diario, no abriga como un buzo frisado ni protege como una pluma real.
  // Colores reusados de otras prendas deportivas ya cargadas (negro,
  // azul marino, gris -- mismos hex que pantalon-deportivo-negro/
  // campera-rompeviento-azul-marino/remera-deportiva-gris), consistencia
  // cross-categoría, mismo criterio que el resto del catálogo.
  { id: "campera-deportiva-negra", nombre: "Campera deportiva negra", categoria: "campera", colorHex: "#1A1A1A", textura: "tricot", estilo: "deportivo", ocasion: "casual", estacion: "entretiempo" },
  { id: "campera-deportiva-azul-marino", nombre: "Campera deportiva azul marino", categoria: "campera", colorHex: "#1F2A44", textura: "tricot", estilo: "deportivo", ocasion: "casual", estacion: "entretiempo" },
  { id: "campera-deportiva-gris", nombre: "Campera deportiva gris", categoria: "campera", colorHex: "#8C8C8C", textura: "tricot", estilo: "deportivo", ocasion: "casual", estacion: "entretiempo" },
  // tapado/sobretodo de paño -- pedido explícito del usuario ("agregá
  // prendas si es necesario" al diferenciar abrigos de invierno):
  // revisando el catálogo, TODAS las prendas de invierno real (acolchado)
  // eran casual/urbano -- un look clásico/formal de invierno no tenía
  // ninguna campera propia, solo le quedaba combinar con una pluma
  // deportiva-casual, algo que no pasa en la vida real (un tapado de paño
  // es la prenda de abrigo estándar sobre un traje o pantalón de vestir,
  // no una campera de pluma). Gris carbón -- combina con el pantalón/
  // sweater gris ya existentes y no repite el negro/azul marino que ya
  // domina el resto de camperas clásicas. Textura "lana": el paño de
  // tapado es lana tejida apretada, la aproximación más cercana que tiene
  // el enum sin inventar una textura "paño" que no existe.
  { id: "tapado-pano-gris", nombre: "Tapado de paño gris", categoria: "campera", colorHex: "#4A4A4A", textura: "lana", estilo: "clasico", ocasion: "laburo", estacion: "invierno" },

  // --- Campera de gabardina (oficina) -- pedido explícito del usuario:
  // "sumá al catálogo... campera de gabardina para oficina", en la misma
  // ronda que llevó la separación formal/oficina hasta el final (ver el
  // comentario largo en pantalon-vestir-* de más arriba). Mismo criterio
  // textil que ese pantalón y que pantalon-gabardina-* de más arriba: la
  // gabardina es justamente la tela real de un sobretodo/trench de
  // oficina -- sarga cerrada, mate y firme, resistente al uso diario y algo
  // al agua por lo apretado del tejido (el "trench coat" clásico es
  // literalmente esta tela) -- tan de oficina como el pantalón homónimo.
  //
  // Reusa la silueta genérica de campera a propósito, sin pieza nueva:
  // esta app no modela el LARGO de un abrigo (un trench real llega a la
  // rodilla, más largo que una campera de calle), mismo criterio ya
  // establecido por tapado-pano-gris de acá arriba (paño/lana, invierno) --
  // es la fibra la que cambia la lectura, no un dibujo aparte por prenda.
  //
  // estilo "oficina" + secundario "clasico", igual que pantalon-gabardina-*
  // -- NUNCA "formal": un sobretodo de gabardina no es una prenda de traje
  // (no se corta junto con el saco), se usa arriba de un pantalón de
  // gabardina o de un chino, no de un traje completo. Entretiempo, no
  // invierno: la gabardina es una tela más liviana y de tejido más
  // cerrado que el paño de tapado-pano-gris, la contraparte de estación
  // intermedia de ese mismo rol (sobretodo de oficina), no un duplicado.
  //
  // Beige -- el color de gabardina/trench MÁS citado en cualquier
  // guardarropa real (el trench coat clásico es directamente este color),
  // mismo hex que ya usa el resto del catálogo (pantalon-gabardina-beige y
  // compañía). Negro -- el otro sobretodo de oficina real, más neutro.
  { id: "campera-gabardina-beige", nombre: "Campera de gabardina beige", categoria: "campera", colorHex: "#D8C7A1", textura: "gabardina", estilo: "oficina", estilosSecundarios: ["clasico"], ocasion: "laburo", estacion: "entretiempo" },
  { id: "campera-gabardina-negra", nombre: "Campera de gabardina negra", categoria: "campera", colorHex: "#1A1A1A", textura: "gabardina", estilo: "oficina", estilosSecundarios: ["clasico"], ocasion: "laburo", estacion: "entretiempo" },

  // --- Sacos ---
  // Categoría nueva -- pedido explícito del usuario ("quiero que agregues
  // al catálogo... un traje azul marino"). Revisado como modista: un
  // traje son DOS prendas por separado (saco + pantalón de vestir), no una
  // sola -- el pantalón de vestir ya existe en el catálogo hace rato
  // (pantalon-vestir-azul y compañía, más arriba); lo que faltaba era el
  // saco en sí. No es una "campera" -- una campera es ropa de calle/
  // abrigo (cierre de cremallera, cuello camisero simple, ver Maniqui.tsx),
  // un saco de traje es tailoring (solapas, botones, se usa abierto sobre
  // camisa y corbata) -- por eso su propia categoría, no una campera con
  // otro color. Azul marino (#1F2A44), el mismo hex que ya usan pantalon-
  // vestir-azul/sweater-azul-marino/corbata-azul-marino/zapatillas-azul-
  // marino -- consistencia de paleta cross-categoría, mismo criterio que
  // ya documenta el resto del archivo. Textura "lana": el paño de traje es
  // lana tejida, la aproximación más cercana que tiene el enum (mismo
  // criterio que tapado-pano-gris de acá arriba). Sin `estacion`: a
  // diferencia de sweater/campera, un traje no se elige por temperatura --
  // se usa para una ocasión formal sea la época del año que sea (mismo
  // criterio que se aplicó a buzo en la revisión anterior, por el mismo
  // motivo real: no es una dimensión que determine sin ambigüedad si es de
  // entretiempo o invierno).
  // calce "ajustado" -- un saco/blazer de sastrería real es entallado, no
  // ancho (auditoría de sastrería, Consejo, ronda de auditoría del motor).
  { id: "saco-azul-marino", nombre: "Saco azul marino", categoria: "saco", colorHex: "#1F2A44", textura: "lana", estilo: "formal", ocasion: "laburo", calce: "ajustado" },
  // saco de lino -- Consejo, ronda siguiente, pedido explícito del usuario
  // ("falta la recomendación de compra cuando no hay opciones de outfit"):
  // diagnosticado por ejecución, "Formal" con clima="Calor" quedaba
  // estructuralmente imposible para CUALQUIER placard -- el único saco de
  // acá arriba es de lana (paño de invierno real), y armarOutfitsSugeridos
  // excluye TODO saco con calor real, sin importar la tela. Un saco de
  // lino (o algodón/mixto) es el saco de verano de sastrería real -- sin
  // forro pesado, tela suelta que transpira -- verificado por búsqueda
  // web: es la prenda estándar para "traje de verano" (bodas/eventos
  // formales de temporada cálida). Beige, el color de lino más clásico y
  // el mismo hex que ya usa el resto del catálogo (pantalon-gabardina-beige y
  // compañía) -- consistencia de paleta cross-categoría. calce "regular"
  // (no "ajustado" como el de lana): un saco de lino real es más suelto,
  // parte de por qué transpira mejor.
  { id: "saco-lino-beige", nombre: "Saco de lino beige", categoria: "saco", colorHex: "#D8C7A1", textura: "lino", estilo: "formal", ocasion: "laburo", calce: "regular" },
  // saco negro y gris carbón -- ampliación del catálogo. Hueco real: hasta
  // esta ronda el único saco de paño era azul marino, dejando afuera los
  // otros dos colores de traje más estándar que existen (negro y gris
  // carbón), tan reales como el azul marino en cualquier placard formal.
  // Gris carbón reusa el mismo hex que pantalon-vestir-gris (#6E6E6E) --
  // consistencia de paleta cross-categoría: arma el mismo traje completo
  // que ya arma el azul marino (saco + pantalón de vestir a tono).
  { id: "saco-negro", nombre: "Saco negro", categoria: "saco", colorHex: "#1A1A1A", textura: "lana", estilo: "formal", ocasion: "laburo", calce: "ajustado" },
  { id: "saco-gris", nombre: "Saco gris carbón", categoria: "saco", colorHex: "#6E6E6E", textura: "lana", estilo: "formal", ocasion: "laburo", calce: "ajustado" },

  // --- Accesorios ---
  // Reusa hex ya presentes en otras categorías (azul marino, bordo) a
  // propósito, no por pereza: mantiene la consistencia cross-categoría del
  // catálogo (una corbata azul marino combina con las prendas azul marino
  // ya cargadas, no con un azul ligeramente distinto).
  // estilo secundario "casual" -- auditoría de imagen (misma ronda que
  // campera-jean más arriba). Inconsistencia real: mocasines-negros/
  // mocasines-marrones (más abajo, calzado) ya llevan "casual" secundario
  // con el argumento "es smart-casual real" -- un cinturón de cuero liso
  // sin decoración es, si acaso, TODAVÍA más versátil que un mocasín (no
  // tiene ninguna silueta que competir con un jean o una zapatilla), y sin
  // embargo se había quedado solo en "clasico". Corregido por la misma
  // razón.
  // "formal"/"oficina" sumados -- Consejo, ronda siguiente: pedido
  // explícito del usuario sobre SU propio placard ("el cinturón yo
  // solamente los tagué para formal y oficina, no me lo ofrezcas para
  // urbano") llevó a que el motor empiece a respetar el estilo PROPIO del
  // cinturón de verdad (ver esCinturon/su chequeo en outfitSirveParaEstilo)
  // -- antes ningún chequeo lo miraba, así que el tageo real del catálogo
  // nunca importaba. Sin este agregado, ESTE cinturón (liso, sin hebilla
  // vistosa -- el más versátil de los dos que existen) hubiera quedado
  // bloqueado de aparecer en outfits "Formal"/"Oficina" a partir de ahora,
  // aunque un cinturón de cuero liso negro/marrón sin decoración es
  // exactamente el que corresponde con un traje real -- no se toca
  // "urbano" (queda afuera a propósito, mismo criterio que pidió el
  // usuario: un cinturón de vestir no es una pieza de streetwear).
  //
  // "formal" + "oficina" juntos siguen a propósito tras la ronda de
  // separación estricta formal/oficina (mismo criterio que camisa-blanca,
  // ver ese comentario): el usuario, preguntado explícitamente, confirmó
  // dejar el cinturón compartido -- es el mismo cinturón de cuero puesto
  // con o sin saco, no dos cinturones de tela distinta como sí pasa con
  // el pantalón (lana de traje vs. gabardina de oficina).
  { id: "cinturon-negro", nombre: "Cinturón negro de cuero", categoria: "accesorio", colorHex: "#1A1A1A", textura: "cuero_liso", estilo: "clasico", estilosSecundarios: ["casual", "formal", "oficina"] },
  { id: "cinturon-marron", nombre: "Cinturón marrón de cuero", categoria: "accesorio", colorHex: "#5C3A21", textura: "cuero_liso", estilo: "clasico", estilosSecundarios: ["casual", "formal", "oficina"] },
  { id: "corbata-azul-marino", nombre: "Corbata azul marino", categoria: "accesorio", colorHex: "#1F2A44", textura: "seda", estilo: "formal", ocasion: "laburo", requiereCuello: true, posicionAccesorio: "cuello" },
  { id: "corbata-bordo", nombre: "Corbata bordo", categoria: "accesorio", colorHex: "#6B2737", textura: "seda", estilo: "formal", ocasion: "laburo", requiereCuello: true, posicionAccesorio: "cuello" },
  // roja -- la corbata de vestir más clásica que existe ("power tie"), un
  // vacío real en un catálogo que hasta ahora solo tenía azul marino/bordó.
  { id: "corbata-roja", nombre: "Corbata roja", categoria: "accesorio", colorHex: "#A6332B", textura: "seda", estilo: "formal", ocasion: "laburo", requiereCuello: true, posicionAccesorio: "cuello" },
  // negra -- ampliación del catálogo. Hueco real: la corbata negra lisa es
  // tan estándar de vestir (junto con la azul marino) como cualquiera de
  // las tres de arriba, y el catálogo no tenía ninguna. Mismo negro
  // estándar que ya usa el resto del catálogo (#1A1A1A).
  { id: "corbata-negra", nombre: "Corbata negra", categoria: "accesorio", colorHex: "#1A1A1A", textura: "seda", estilo: "formal", ocasion: "laburo", requiereCuello: true, posicionAccesorio: "cuello" },
  { id: "bufanda-gris", nombre: "Bufanda gris", categoria: "accesorio", colorHex: "#8C8C8C", textura: "lana", estilo: "casual", ocasion: "casual", posicionAccesorio: "cuello" },
  // roja -- mismo hex que remera-roja de arriba, mismo criterio de paleta
  // consistente que ya documenta el archivo (una bufanda roja combina con
  // la remera roja ya cargada, no con un rojo ligeramente distinto). Color
  // de acento típico de bufanda de invierno.
  { id: "bufanda-roja", nombre: "Bufanda roja", categoria: "accesorio", colorHex: "#B93A32", textura: "lana", estilo: "casual", ocasion: "casual", posicionAccesorio: "cuello" },
  // azul marino -- ampliación del catálogo. Hueco real: la bufanda azul
  // marino es tan de invierno estándar como la gris/roja de arriba, y
  // combina con toda la ropa azul marino ya cargada en el resto del
  // catálogo (buzo/sweater/pantalón/campera/zapatillas). Mismo hex de
  // siempre (#1F2A44) -- consistencia de paleta cross-categoría.
  { id: "bufanda-azul-marino", nombre: "Bufanda azul marino", categoria: "accesorio", colorHex: "#1F2A44", textura: "lana", estilo: "casual", ocasion: "casual", posicionAccesorio: "cuello" },

  // --- Gorro/gorra -- ronda de completitud del catálogo (ver
  // posicion_accesorio en types.ts), revisada como modista y asesor de
  // imagen. Hueco real: la única prenda de cabeza posible en todo el
  // catálogo, hasta esta ronda, era no tener ninguna -- ni siquiera existía
  // dónde dibujarla.
  //
  // Gorro de lana (beanie) -- distinguido de la gorra por textura "lana"
  // (ver descripcionPrenda en types.ts), mismo criterio real que separa
  // las dos prendas en cualquier guardarropa: el gorro es de invierno, va
  // con bufanda/campera de abrigo. Negro y gris -- los dos colores de
  // gorro más versátiles, mismos hex que el resto del catálogo.
  { id: "gorro-lana-negro", nombre: "Gorro de lana negro", categoria: "accesorio", colorHex: "#1A1A1A", textura: "lana", estilo: "casual", ocasion: "casual", estacion: "invierno", posicionAccesorio: "cabeza" },
  { id: "gorro-lana-gris", nombre: "Gorro de lana gris", categoria: "accesorio", colorHex: "#8C8C8C", textura: "lana", estilo: "casual", ocasion: "casual", estacion: "invierno", posicionAccesorio: "cabeza" },
  // Gorra de visera (algodón) -- la contraparte de todo el año/verano del
  // gorro: registro urbano/deportivo, no de abrigo (sin `estacion`, mismo
  // criterio que el resto del calzado/accesorios sin temporada marcada).
  // Negra y azul marino -- los dos colores de gorra más neutros y
  // versátiles, mismos hex de siempre.
  { id: "gorra-negra", nombre: "Gorra negra", categoria: "accesorio", colorHex: "#1A1A1A", textura: "algodon", estilo: "urbano", estilosSecundarios: ["deportivo", "casual"], ocasion: "casual", posicionAccesorio: "cabeza" },
  { id: "gorra-azul-marino", nombre: "Gorra azul marino", categoria: "accesorio", colorHex: "#1F2A44", textura: "algodon", estilo: "urbano", estilosSecundarios: ["deportivo", "casual"], ocasion: "casual", posicionAccesorio: "cabeza" },
];

/** Deriva h/s/l de cada preset una sola vez (no en cada render). hsl2 solo
 *  cuando el preset declara colorHex2 (estampado real) -- undefined si no,
 *  no se inventa un segundo color para una prenda lisa. */
export const CATALOGO_CON_HSL = CATALOGO_PRENDAS.map((p) => ({
  ...p,
  hsl: hexToHsl(p.colorHex),
  hsl2: p.colorHex2 ? hexToHsl(p.colorHex2) : undefined,
}));

/** Convierte un preset del catálogo en una Prenda sintética -- misma forma
 *  que una fila real de Supabase, para poder pasarla a Maniqui/recomendar()
 *  sin que les importe que no está guardada. Se usa para mostrar "esto es
 *  lo que te sugerimos comprar" en Outfits (armarOutfitsParaComprar en
 *  recommend.ts). El id lleva el prefijo "sugerida-" a propósito: es lo que
 *  Outfits.tsx usa para marcar visualmente esa prenda como "no la tenés
 *  todavía" en el maniquí, y para no intentar guardarla como si fuera una
 *  prenda real del usuario. */
export function presetAPrendaSintetica(preset: PresetPrenda & { hsl: { h: number; s: number; l: number } }): Prenda {
  // hsl2 se recalcula acá (no se exige en el tipo del parámetro) para no
  // tener que tocar la firma en los ~26 lugares que ya la usan sin
  // estampado -- mismo hexToHsl que ya usa CATALOGO_CON_HSL para el color
  // principal.
  const hsl2 = preset.colorHex2 ? hexToHsl(preset.colorHex2) : null;
  return {
    id: `sugerida-${preset.id}`,
    user_id: "",
    categoria: preset.categoria,
    color_hex: preset.colorHex,
    color_h: preset.hsl.h,
    color_s: preset.hsl.s,
    color_l: preset.hsl.l,
    textura: preset.textura ?? null,
    estilo: preset.estilo ?? null,
    estilos_secundarios: preset.estilosSecundarios ?? [],
    ocasion: preset.ocasion ?? null,
    estacion: preset.estacion ?? null,
    foto_path: null,
    suela_contraste: preset.suelaContraste ?? false,
    requiere_cuello: preset.requiereCuello ?? false,
    posicion_accesorio: preset.posicionAccesorio ?? "cintura",
    con_capucha: preset.conCapucha ?? true,
    patron: preset.patron ?? "liso",
    color2_hex: preset.colorHex2 ?? null,
    color2_h: hsl2?.h ?? null,
    color2_s: hsl2?.s ?? null,
    color2_l: hsl2?.l ?? null,
    corte_calzado: preset.corteCalzado ?? "zapatilla_urbana",
    calce: preset.calce ?? "regular",
    cuello: preset.cuello ?? null,
    manga: preset.manga ?? null,
    // el catálogo de presets/sugerencias nunca modela una prenda gastada
    // -- necesita_cambio es un dato real de UNA prenda puntual que el
    // usuario ya tiene puesta, no algo que tenga sentido en un preset.
    necesita_cambio: false,
    created_at: "",
    updated_at: "",
  };
}
