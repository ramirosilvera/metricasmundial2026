import { nombreColor } from "./color";
import { CATALOGO_CON_HSL, type PresetPrenda } from "./catalogo";
import {
  categoriasAusentes,
  ESTILO_LABEL,
  estilosDe,
  sugerenciaDeAbrigoEntretiempo,
  sugerenciaDeAbrigoInvierno,
  sugerenciaDeAccesorio,
  sugerenciaDeAncla,
  sugerenciaDeAnclaInvernal,
  sugerenciaDeCalzado,
  sugerenciaDeCorteCalzado,
  sugerenciaDeSacoDeVerano,
  sugerenciaDeVariedad,
} from "./recommend";
import { CATEGORIA_LABEL, descripcionPrenda, ESTACION_LABEL, type Categoria, type Estacion, type Estilo, type HSL, type Prenda } from "./types";

/** Mismo orden que CATEGORIA_LABEL en types.ts -- se deriva de sus claves en
 *  vez de repetir el array a mano para no poder desincronizarse si se agrega
 *  una categoría nueva ahí y no acá. Exportada: Placard.tsx la reusa para
 *  agrupar el placard en secciones en ese mismo orden fijo. */
export const TODAS_LAS_CATEGORIAS = Object.keys(CATEGORIA_LABEL) as Categoria[];

/** pantalon/bermuda/short_deportivo son, para el motor de recomendación
 *  (recommend.ts, CATEGORIAS_PIERNAS), el "ancla" de un outfit: sin ninguna
 *  prenda de esta lista, armarOutfitsSugeridos no genera nada. Duplicado a
 *  propósito acá (mismo criterio que el resto del archivo ya documenta para
 *  no crear una dependencia cruzada por 3 strings): recommend.ts no la
 *  exporta. */
const CATEGORIAS_PIERNAS: Categoria[] = ["pantalon", "bermuda", "short_deportivo"];

/** sweater/campera son, a partir de la revisión que diferenció abrigos de
 *  entretiempo/invierno, las únicas dos categorías que se tagean por
 *  `estacion` sin ambigüedad (ver el criterio largo en catalogo.ts) --
 *  buzo queda afuera a propósito (pedido explícito del usuario: "tampoco
 *  los llamaría de invierno o de entretiempo"). Duplicado acá, mismo
 *  motivo que CATEGORIAS_PIERNAS arriba: recommend.ts no la exporta. */
const CATEGORIAS_ABRIGO_CON_ESTACION: Categoria[] = ["sweater", "campera"];

const ESTILOS: Estilo[] = ["formal", "oficina", "clasico", "urbano", "casual", "deportivo"];
const ESTACIONES: Estacion[] = ["verano", "entretiempo", "invierno"];

export interface ConteoCategoria {
  categoria: Categoria;
  label: string;
  cantidad: number;
}

/** Cantidad de prendas por categoría, TODAS las categorías incluidas (con
 *  0 las que no tenés todavía) -- una categoría en cero es justo la
 *  información que "dónde tengo oportunidades de mejora" necesita, no algo
 *  para ocultar. Orden: mayor a menor cantidad. */
export function contarPorCategoria(placard: Prenda[]): ConteoCategoria[] {
  const conteos = new Map<Categoria, number>(TODAS_LAS_CATEGORIAS.map((c) => [c, 0]));
  for (const p of placard) conteos.set(p.categoria, (conteos.get(p.categoria) ?? 0) + 1);
  return TODAS_LAS_CATEGORIAS.map((categoria) => ({
    categoria,
    label: CATEGORIA_LABEL[categoria],
    cantidad: conteos.get(categoria) ?? 0,
  })).sort((a, b) => b.cantidad - a.cantidad);
}

export interface ConteoEstilo {
  estilo: Estilo;
  label: string;
  cantidad: number;
}

/** Cantidad de prendas por estilo, los 5 estilos incluidos. Una prenda
 *  cuenta para TODOS sus estilos (principal + secundarios vía estilosDe) --
 *  una prenda versátil (ej. sweater mostaza clásico+casual) suma en los dos
 *  registros, no solo el principal. Sin ningún estilo cargado no cuenta
 *  para ninguno -- no se le inventa un valor por defecto, igual que el
 *  resto de la app (ver registroOutfit en recommend.ts). */
export function contarPorEstilo(placard: Prenda[]): ConteoEstilo[] {
  const conteos = new Map<Estilo, number>(ESTILOS.map((e) => [e, 0]));
  for (const p of placard) {
    for (const estilo of estilosDe(p)) conteos.set(estilo, (conteos.get(estilo) ?? 0) + 1);
  }
  return ESTILOS.map((estilo) => ({
    estilo,
    label: ESTILO_LABEL[estilo],
    cantidad: conteos.get(estilo) ?? 0,
  })).sort((a, b) => b.cantidad - a.cantidad);
}

export interface ConteoColor {
  nombre: string;
  cantidad: number;
  /** color_hex real de una de las prendas de este grupo, para pintar el
   *  swatch -- no es un promedio ni un color inventado. */
  hex: string;
}

/** Agrupa el placard por el mismo nombre de color que ya usa el resto de la
 *  app (nombreColor, color.ts) -- así "Azul" y "Azul oscuro" son grupos
 *  distintos igual que en cualquier otra pantalla, en vez de inventar una
 *  segunda forma de agrupar colores. Orden: mayor a menor cantidad. */
export function contarPorColor(placard: Prenda[]): ConteoColor[] {
  const grupos = new Map<string, ConteoColor>();
  for (const p of placard) {
    const nombre = nombreColor(p.color_h, p.color_s, p.color_l);
    const actual = grupos.get(nombre);
    if (actual) actual.cantidad += 1;
    else grupos.set(nombre, { nombre, cantidad: 1, hex: p.color_hex });
  }
  return [...grupos.values()].sort((a, b) => b.cantidad - a.cantidad);
}

export interface ConteoEstacion {
  estacion: Estacion;
  label: string;
  cantidad: number;
}

/** Cantidad de prendas por estación cargada -- pedido explícito del
 *  usuario: un filtro real de "mostrame solo mis abrigos de invierno" en
 *  Placard. Sin `estacion` cargada no cuenta para ninguna (no se inventa
 *  un valor por defecto), mismo criterio que contarPorEstilo. A diferencia
 *  de estilo, acá no hay "estilosDe" -- una prenda tiene UNA sola estación
 *  o ninguna, no varias. Orden fijo (verano -> entretiempo -> invierno, el
 *  ciclo real del año), no por cantidad: son solo 3 valores, un orden
 *  estable se lee mejor que uno que se reordena cada vez que cambia el
 *  placard. */
export function contarPorEstacion(placard: Prenda[]): ConteoEstacion[] {
  const conteos = new Map<Estacion, number>(ESTACIONES.map((e) => [e, 0]));
  for (const p of placard) {
    if (p.estacion) conteos.set(p.estacion, (conteos.get(p.estacion) ?? 0) + 1);
  }
  return ESTACIONES.map((estacion) => ({
    estacion,
    label: ESTACION_LABEL[estacion],
    cantidad: conteos.get(estacion) ?? 0,
  }));
}

export interface AnalisisFoda {
  totalPrendas: number;
  variedadColores: number;
  /** Interno + positivo: lo que ya funciona bien. */
  fortalezas: string[];
  /** Interno + negativo: huecos propios del placard (mismo contenido que
   *  antes vivía bajo "oportunidades de mejora" -- ver el comentario de
   *  analizarFoda más abajo sobre por qué ese nombre estaba mal puesto en
   *  términos de la metodología FODA real). */
  debilidades: string[];
  /** Externo + positivo: qué ofrece el catálogo (el "mercado" de esta app)
   *  para cerrar un hueco concreto -- a diferencia de debilidades (un
   *  diagnóstico), esto es siempre una acción puntual y comprable. */
  oportunidades: string[];
  /** Externo + negativo: riesgos de estructura, no solo huecos -- qué pasa
   *  si una prenda puntual deja de estar disponible, o si cambia el clima. */
  amenazas: string[];
  /** Lectura general de salud del placard -- severidad real (sólido/con
   *  huecos/frágil), no un cuadrante más. Ver diagnosticoGeneral más abajo
   *  para los umbrales. */
  nivelSalud: NivelSaludFoda;
  /** Síntesis de una línea, la frase con la que un gerente abriría el
   *  informe -- pedido explícito del usuario ("informe resumido, visual y
   *  ejecutivo"). Deriva de nivelSalud, nunca al revés. */
  veredicto: string;
  /** Estrategias cruzadas -- matriz TOWS (Weihrich), el paso estándar
   *  "después" de un FODA/SWOT clásico: en vez de solo listar los 4
   *  cuadrantes por separado, los cruza en 4 acciones concretas. Ver el
   *  comentario largo en analizarFoda más abajo. 0 a 4 elementos -- solo se
   *  genera un cruce cuando los dos cuadrantes que lo alimentan tienen
   *  contenido real. */
  estrategias: EstrategiaFoda[];
  /** La compra de mayor impacto de TODO el placard -- pedido explícito del
   *  usuario: "una recomendación de compra general que surja del FODA y de
   *  los outfits en estadísticas". A diferencia de `oportunidades` (una
   *  lista plana, una por estilo con hueco), esto es LA prioridad -- ver
   *  compraDeMayorImpacto más abajo para el criterio de selección (severidad
   *  del hueco primero, versatilidad entre estilos como desempate). `null`
   *  solo si de verdad no hay ningún hueco de compra en ninguno de los 6
   *  estilos (placard maduro en todas las puntas) -- mismo criterio de "no
   *  inventar una sugerencia sin motivo real" que el resto de este módulo. */
  compraPrioritaria: CompraPrioritaria | null;
  /** Ranking completo de huecos de compra (hasta 6, uno por estilo con
   *  algo pendiente) -- pedido explícito del usuario: "exportar... un
   *  estado de recomendaciones ordenadas por ranking de necesidades...
   *  para pasarle ese archivo a las personas para que me hagan un regalo
   *  de cumple". `compraPrioritaria` ya elige LA mejor compra puntual;
   *  esto expone la lista entera detrás de esa elección, ordenada por la
   *  misma severidad (TierHueco, 0=bloqueo total, 8=el hueco más sutil) --
   *  mismo dato que ya alimenta `oportunidades`, sin recalcular nada.
   *  Deduplicado por prenda sugerida: si el catálogo elige la MISMA
   *  prenda para tapar el hueco de más de un estilo (ej. un cinturón
   *  negro que sirve para formal Y para oficina), aparece una sola vez en
   *  la lista, con todos los estilos a los que ayuda -- mismo criterio
   *  real que ya usa compraDeMayorImpacto para "esta compra resuelve más
   *  de un hueco a la vez", pero acá se ve toda la lista, no solo la
   *  ganadora. */
  necesidades: NecesidadDeCompra[];
}

/** Ver el campo `necesidades` de AnalisisFoda arriba. */
export interface NecesidadDeCompra {
  tier: TierHueco;
  /** Todos los estilos para los que esta MISMA prenda del catálogo tapa un
   *  hueco -- casi siempre uno solo, a veces más de uno (ver el comentario
   *  de `necesidades`). */
  estilos: Estilo[];
  /** El mensaje del hueco de menor tier (más severo) entre los que esta
   *  prenda resuelve -- la explicación más relevante de las posibles. */
  mensaje: string;
  sugerida: PresetPrenda & { hsl: HSL };
}

export type NivelSaludFoda = "solido" | "con_huecos" | "fragil";

export interface EstrategiaFoda {
  /** Los 4 cuadrantes cruzados de la matriz TOWS: FO (fortalezas+
   *  oportunidades), DO (debilidades+oportunidades), FA (fortalezas+
   *  amenazas), DA (debilidades+amenazas). */
  tipo: "FO" | "DO" | "FA" | "DA";
  /** Nombre de la acción TOWS estándar para ese cruce (Explotar/Reforzar/
   *  Proteger/Prioridad). */
  titulo: string;
  texto: string;
}

// Umbrales del análisis: no salen de una fórmula, son un piso razonable
// para no marcar como "fortaleza" o "debilidad" algo que en un placard
// recién arrancado (2-3 prendas) todavía no dice nada. 3 prendas en un
// estilo ya alcanza para armar más de una combinación real; 4 colores
// distintos es lo mínimo para no repetir combinación de color en cada
// outfit.
const MIN_PRENDAS_FORTALEZA_ESTILO = 3;
const MIN_COLORES_VARIEDAD_BUENA = 4;
const MAX_COLORES_VARIEDAD_BAJA = 2;
// Concentración de color: a partir de qué participación un solo color
// "domina" el placard lo suficiente como para ser un riesgo real (perder o
// ensuciar esa prenda puntual golpea desproporcionado). Con menos de 4
// prendas en total no dice nada -- mismo piso de "muestra chica" que el
// resto del análisis.
const MIN_PRENDAS_PARA_CONCENTRACION = 4;
const UMBRAL_CONCENTRACION_COLOR = 0.5;
// Umbral de "frágil": no hace falta que debilidades y amenazas empaten en
// cantidad con las fortalezas para que el placard esté en problemas -- 3
// debilidades internas o 2 amenazas de estructura ya alcanzan para que el
// diagnóstico deje de ser "con huecos puntuales" y pase a "resolvé esto
// antes de seguir sumando variedad". Mismo criterio de piso razonable (no
// una fórmula) que el resto de los umbrales de este archivo.
const UMBRAL_FRAGIL_DEBILIDADES = 3;
const UMBRAL_FRAGIL_AMENAZAS = 2;
// Largo máximo de un ítem citado dentro de una estrategia TOWS -- las
// frases de fortalezas/debilidades/oportunidades/amenazas ya son oraciones
// completas (pensadas para leerse solas en su propio cuadrante); citarlas
// enteras dentro de otra oración las vuelve ilegibles. Se corta en el
// último espacio antes del límite, nunca a mitad de palabra.
const MAX_LARGO_CITA_ESTRATEGIA = 70;

function contarSustantivo(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

function resumir(texto: string, maxLen = MAX_LARGO_CITA_ESTRATEGIA): string {
  if (texto.length <= maxLen) return texto;
  const corte = texto.lastIndexOf(" ", maxLen);
  return `${texto.slice(0, corte > 0 ? corte : maxLen).trimEnd()}…`;
}

/** Cruces de la matriz TOWS (Weihrich) -- el paso estándar "después" de un
 *  FODA/SWOT clásico en cualquier curso de estrategia de MBA: en vez de
 *  dejar los 4 cuadrantes como 4 listas separadas, los cruza de a pares
 *  (interno x externo) en una acción concreta:
 *  - FO "Explotar": la fortaleza más fuerte + la oportunidad más fuerte --
 *    el movimiento de mayor impacto y menor esfuerzo.
 *  - DO "Reforzar": la oportunidad más fuerte usada para tapar la
 *    debilidad más urgente.
 *  - FA "Proteger": la fortaleza más fuerte usada como colchón contra la
 *    amenaza más urgente (amortigua, no la elimina).
 *  - DA "Prioridad": debilidad + amenaza más urgentes juntas -- el combo
 *    más frágil del placard, lo primero a resolver.
 *  Cada cruce usa el PRIMER ítem real de cada cuadrante (el que
 *  analizarFoda ya empuja primero, en su propio orden de prioridad -- ver
 *  ese comentario) resumido con `resumir`, nunca un texto inventado acá.
 *  Sin contenido real en los dos cuadrantes que alimentan un cruce, ese
 *  cruce no se genera -- 4 cruces es el techo, no un piso forzado. */
function estrategiasTows(fortalezas: string[], debilidades: string[], oportunidades: string[], amenazas: string[]): EstrategiaFoda[] {
  const estrategias: EstrategiaFoda[] = [];
  if (fortalezas.length > 0 && oportunidades.length > 0) {
    estrategias.push({
      tipo: "FO",
      titulo: "Explotar",
      texto: `Tu fortaleza más clara -- "${resumir(fortalezas[0])}" -- combina directo con "${resumir(oportunidades[0])}": el movimiento de mayor impacto y menor esfuerzo ahora mismo.`,
    });
  }
  if (debilidades.length > 0 && oportunidades.length > 0) {
    estrategias.push({
      tipo: "DO",
      titulo: "Reforzar",
      texto: `"${resumir(oportunidades[0])}" es el camino más directo para cerrar "${resumir(debilidades[0])}".`,
    });
  }
  if (fortalezas.length > 0 && amenazas.length > 0) {
    estrategias.push({
      tipo: "FA",
      titulo: "Proteger",
      texto: `"${resumir(fortalezas[0])}" amortigua el riesgo de "${resumir(amenazas[0])}", pero no lo elimina -- vale la pena resolverlo antes de que se note.`,
    });
  }
  if (debilidades.length > 0 && amenazas.length > 0) {
    estrategias.push({
      tipo: "DA",
      titulo: "Prioridad",
      texto: `El combo más frágil: "${resumir(debilidades[0])}" + "${resumir(amenazas[0])}". Resolvé esto antes que el resto del placard.`,
    });
  }
  return estrategias;
}

/** Veredicto de una línea + nivel de salud -- la síntesis con la que un
 *  gerente abriría el informe, en vez de arrancar directo por la lista de
 *  hallazgos. "Sólido" exige CERO debilidades y CERO amenazas (no alcanza
 *  con tener más fortalezas que problemas); "frágil" dispara apenas se
 *  cruza cualquiera de los dos pisos de UMBRAL_FRAGIL_* -- de ahí para
 *  abajo, "con huecos puntuales" es el estado intermedio por default. */
function diagnosticoGeneral(
  fortalezas: string[],
  debilidades: string[],
  amenazas: string[],
  totalPrendas: number,
): { nivelSalud: NivelSaludFoda; veredicto: string } {
  if (totalPrendas === 0) {
    return { nivelSalud: "con_huecos", veredicto: "Sin prendas cargadas todavía: no hay diagnóstico posible." };
  }
  if (debilidades.length === 0 && amenazas.length === 0) {
    return {
      nivelSalud: "solido",
      veredicto: `Placard sólido: ${contarSustantivo(fortalezas.length, "fortaleza identificada", "fortalezas identificadas")}, sin debilidades ni amenazas de estructura pendientes.`,
    };
  }
  if (debilidades.length >= UMBRAL_FRAGIL_DEBILIDADES || amenazas.length >= UMBRAL_FRAGIL_AMENAZAS) {
    return {
      nivelSalud: "fragil",
      veredicto: `Placard frágil: ${contarSustantivo(debilidades.length, "debilidad", "debilidades")} y ${contarSustantivo(amenazas.length, "amenaza", "amenazas")}, sin fortalezas suficientes para compensarlas -- conviene resolver estructura antes de sumar variedad nueva.`,
    };
  }
  const fraseDebilidad =
    debilidades.length === 1 ? "una debilidad interna que vale la pena cerrar" : `${debilidades.length} debilidades internas que valen la pena cerrar`;
  return {
    nivelSalud: "con_huecos",
    veredicto: `Placard funcional, con huecos puntuales: tenés ${fraseDebilidad}.`,
  };
}

/** Severidad real de un hueco de compra -- MISMO orden de impacto que ya usa
 *  auditoriaDeGuardarropa en recommend.ts (ver su comentario largo ahí, "en
 *  orden de impacto real sobre la cantidad de combinaciones posibles"),
 *  generalizado acá para poder comparar huecos ENTRE estilos distintos, no
 *  solo priorizarlos dentro de un mismo estilo:
 *  0. sin ancla -- cero outfits posibles en ese estilo, el bloqueo total.
 *  1. ancla real para invierno (bermuda/short no cuenta) -- cero outfits en
 *     esa estación, aunque el estilo "tenga ancla" en sentido amplio.
 *  2. abrigo de invierno -- cero outfits en esa estación con frío real.
 *  3. abrigo de entretiempo -- cero outfits en clima templado.
 *  4. saco de verano (solo "formal") -- cero outfits formales con calor real.
 *  5. variedad de torso/color -- no bloquea una estación entera, pero limita
 *     cuántas combinaciones distintas arma con lo que hay.
 *  6. variedad de calzado (cantidad) -- todo outfit posible termina en el
 *     mismo par.
 *  7. variedad de CORTE de calzado -- auditoría de Consejo (roles: asesor de
 *     imagen/sastre), pedido explícito del usuario: "no solo te bases en el
 *     color sino tmb en el tipo y estilo de prendas". Hay 2+ pares (el punto
 *     6 no aplica) pero todos el mismo corte_calzado (zapatilla_urbana,
 *     zapato_vestir, etc.) -- ver sugerenciaDeCorteCalzado en recommend.ts.
 *  8. variedad de POSICIÓN de accesorio -- mismo hallazgo para "accesorio":
 *     cinturón/corbata/bufanda/gorro son tipos de prenda distintos bajo una
 *     sola categoría, invisibles para categoriasAusentes -- ver
 *     sugerenciaDeAccesorio en recommend.ts. */
export type TierHueco = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface HuecoDeCompra {
  tier: TierHueco;
  estilo: Estilo;
  mensaje: string;
  sugerida: PresetPrenda & { hsl: HSL };
}

export interface CompraPrioritaria {
  estilo: Estilo;
  mensaje: string;
  sugerida: PresetPrenda & { hsl: HSL };
}

/** El hueco más severo de UN estilo puntual -- misma cadena de prioridad que
 *  auditoriaDeGuardarropa (recommend.ts), generalizada acá para no depender
 *  de un `clima` elegido en pantalla: auditoriaDeGuardarropa responde "qué
 *  te falta HOY, con el clima de hoy" (por eso ancla invernal/abrigo de
 *  invierno solo corren si el usuario eligió ese clima en "Vestite hoy")
 *  -- pero un reporte de estadísticas/FODA pregunta algo distinto,
 *  estructural: "¿qué le falta a tu placard en general, sea cual sea la
 *  estación de hoy?". Por eso acá SIEMPRE se chequean las dos estaciones
 *  (invierno y entretiempo) y no una sola: un hueco de abrigo de invierno es
 *  real y accionable en pleno verano, aunque hoy no se note. `null` solo si
 *  de verdad no hay ningún hueco en ninguna de las 9 capas para este
 *  estilo. */
// Ver el comentario largo de `excluirIds` en mejorCandidatoDelCatalogo
// (recommend.ts), pedido explícito del usuario: "quiero que se puedan
// actualizar las recomendaciones de compra... quizás no quiero comprar esa
// prenda pero quiero ver qué más sugiere". Mismo mecanismo, hilado por
// esta cadena espejo (ver el comentario de TierHueco sobre por qué existen
// dos cadenas) para que "Compra prioritaria" en Estadísticas también
// pueda saltar lo ya descartado.
function huecoDeEstilo(
  estilo: Estilo,
  placard: Prenda[],
  catalogo: (PresetPrenda & { hsl: HSL })[],
  excluirIds?: Set<string>,
): HuecoDeCompra | null {
  const ancla = sugerenciaDeAncla(estilo, placard, catalogo, excluirIds);
  if (ancla) return { tier: 0, estilo, ...ancla };

  const anclaInvernal = sugerenciaDeAnclaInvernal(estilo, placard, catalogo, excluirIds);
  if (anclaInvernal) return { tier: 1, estilo, ...anclaInvernal };

  const abrigoInvierno = sugerenciaDeAbrigoInvierno(estilo, placard, catalogo, excluirIds);
  if (abrigoInvierno) return { tier: 2, estilo, ...abrigoInvierno };

  const abrigoEntretiempo = sugerenciaDeAbrigoEntretiempo(estilo, placard, catalogo, excluirIds);
  if (abrigoEntretiempo) return { tier: 3, estilo, ...abrigoEntretiempo };

  if (estilo === "formal") {
    const saco = sugerenciaDeSacoDeVerano(placard, catalogo, excluirIds);
    if (saco) return { tier: 4, estilo, ...saco };
  }

  const variedad = sugerenciaDeVariedad(estilo, placard, catalogo, excluirIds);
  if (variedad) return { tier: 5, estilo, ...variedad };

  const calzado = sugerenciaDeCalzado(estilo, placard, catalogo, excluirIds);
  if (calzado) return { tier: 6, estilo, ...calzado };

  const corteCalzado = sugerenciaDeCorteCalzado(estilo, placard, catalogo, excluirIds);
  if (corteCalzado) return { tier: 7, estilo, ...corteCalzado };

  const accesorio = sugerenciaDeAccesorio(estilo, placard, catalogo, excluirIds);
  if (accesorio) return { tier: 8, estilo, ...accesorio };

  return null;
}

/** La compra de mayor impacto de TODO el placard -- pedido explícito del
 *  usuario: "una recomendación de compra general que surja del FODA y de
 *  los outfits en estadísticas", actuando en múltiples roles (asesor de
 *  imagen, sastre, experto en moda/colores/prendas, gerente ejecutivo).
 *  Corre huecoDeEstilo sobre los 6 estilos y aplica el mismo criterio que
 *  un gerente ejecutivo real usaría para priorizar una lista de pendientes:
 *
 *  1. Severidad primero (`tier`, ver su comentario): un estilo sin ancla
 *     (cero outfits posibles) siempre gana sobre uno que solo necesita más
 *     variedad de calzado, sea cual sea cuántos estilos afecte cada uno.
 *  2. A igual severidad, la sugerencia que resuelve el hueco de MÁS estilos
 *     A LA VEZ gana -- no por estar "tageada" para varios registros (ver el
 *     comentario de compararNeutralidadColor en recommend.ts sobre por qué
 *     ESE criterio es incorrecto para un outfit puntual), sino porque el
 *     catálogo, evaluado independientemente para cada estilo, eligió
 *     exactamente LA MISMA prenda (mismo id) como mejor opción para más de
 *     uno -- un hecho verificable, no una etiqueta: comprar esa prenda de
 *     verdad tapa más de un hueco real a la vez, el mejor "retorno" posible
 *     de una sola compra.
 *
 *  Devuelve `null` solo si de verdad no hay ningún hueco en ninguno de los
 *  6 estilos -- un placard maduro en todas las puntas no necesita que se le
 *  invente una recomendación. */
export function compraDeMayorImpacto(
  placard: Prenda[],
  catalogo: (PresetPrenda & { hsl: HSL })[] = CATALOGO_CON_HSL,
  // Ver el comentario de `excluirIds` en huecoDeEstilo, arriba.
  excluirIds?: Set<string>,
): CompraPrioritaria | null {
  const huecos = ESTILOS.map((estilo) => huecoDeEstilo(estilo, placard, catalogo, excluirIds)).filter(
    (h): h is HuecoDeCompra => h !== null,
  );
  return elegirCompraPrioritaria(huecos);
}

/** Núcleo puro de compraDeMayorImpacto, separado para que analizarFoda
 *  pueda reusar el MISMO array de huecos que ya calculó para `oportunidades`
 *  (ver su uso ahí) en vez de correr huecoDeEstilo sobre los 6 estilos por
 *  segunda vez -- nunca hay riesgo de que oportunidades y compraPrioritaria
 *  queden inconsistentes entre sí (una lista de huecos, dos lecturas). */
function elegirCompraPrioritaria(huecos: HuecoDeCompra[]): CompraPrioritaria | null {
  if (huecos.length === 0) return null;

  const vecesPorId = new Map<string, number>();
  for (const h of huecos) vecesPorId.set(h.sugerida.id, (vecesPorId.get(h.sugerida.id) ?? 0) + 1);

  const [mejor] = [...huecos].sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return (vecesPorId.get(b.sugerida.id) ?? 1) - (vecesPorId.get(a.sugerida.id) ?? 1);
  });

  const otrosEstilos = huecos
    .filter((h) => h.sugerida.id === mejor.sugerida.id && h.estilo !== mejor.estilo)
    .map((h) => ESTILO_LABEL[h.estilo]);
  const mensaje =
    otrosEstilos.length > 0
      ? `${mejor.mensaje} Esta misma compra también te resuelve un hueco en ${otrosEstilos.join(", ")} -- la de mayor impacto de todo tu placard hoy.`
      : mejor.mensaje;

  return { estilo: mejor.estilo, mensaje, sugerida: mejor.sugerida };
}

/** Núcleo puro de `necesidades` en AnalisisFoda -- pedido explícito del
 *  usuario: "exportar... un estado de recomendaciones ordenadas por
 *  ranking de necesidades... para pasarle ese archivo a las personas para
 *  que me hagan un regalo de cumple". Mismo criterio de reuso que
 *  elegirCompraPrioritaria (recibe el array de huecos ya calculado, no
 *  vuelve a llamar huecoDeEstilo) -- separado para poder testearlo sin
 *  depender de un placard real.
 *
 *  Dos pasos: (1) agrupar por `sugerida.id` -- si el catálogo elige la
 *  MISMA prenda para más de un estilo (ej. un cinturón negro que resuelve
 *  formal y oficina a la vez), es una sola línea de regalo, no dos, con
 *  todos los estilos que ayuda listados; (2) ordenar por el tier más
 *  severo de cada grupo -- lo más urgente primero, el mismo orden de
 *  prioridad que ya usa auditoriaDeGuardarropa/compraDeMayorImpacto, no
 *  un ranking inventado aparte -- y a igual tier, por cuántos estilos
 *  resuelve (desempate), EL MISMO criterio que ya usa
 *  elegirCompraPrioritaria (vecesPorId) para elegir la ganadora -- así el
 *  primer puesto de este ranking siempre coincide con compraPrioritaria,
 *  nunca dos lecturas que se contradicen entre sí. */
function rankearNecesidades(huecos: HuecoDeCompra[]): NecesidadDeCompra[] {
  const porId = new Map<string, NecesidadDeCompra>();
  for (const hueco of huecos) {
    const existente = porId.get(hueco.sugerida.id);
    if (!existente) {
      porId.set(hueco.sugerida.id, { tier: hueco.tier, estilos: [hueco.estilo], mensaje: hueco.mensaje, sugerida: hueco.sugerida });
      continue;
    }
    existente.estilos.push(hueco.estilo);
    if (hueco.tier < existente.tier) {
      existente.tier = hueco.tier;
      existente.mensaje = hueco.mensaje;
    }
  }
  return [...porId.values()].sort((a, b) => a.tier - b.tier || b.estilos.length - a.estilos.length);
}

/** Lectura "de MBA" del placard vía la matriz FODA/SWOT clásica -- pedido
 *  explícito del usuario, reemplazando el "fortalezas y oportunidades de
 *  mejora" anterior. Esa versión anterior, con la mejor intención, mezclaba
 *  dos ejes distintos de la metodología real bajo un solo nombre
 *  ("oportunidades" ahí eran en realidad huecos INTERNOS del placard, no
 *  oportunidades del entorno) -- acá se separan en los 4 cuadrantes
 *  correctos: interno/externo cruzado con positivo/negativo.
 *
 *  - Fortalezas y Debilidades reusan exactamente el mismo análisis interno
 *    que ya existía (categoriasAusentes, conteo por estilo/color) -- ver el
 *    comentario de cada bloque.
 *  - Oportunidades es nuevo: reusa el mismo motor de sugerencias que ya usa
 *    "Vestite hoy" (sugerenciaDeAncla/sugerenciaDeVariedad en
 *    recommend.ts) -- el catálogo real hace de "mercado externo" del que
 *    surge la oportunidad concreta, nunca una sugerencia inventada acá.
 *  - Amenazas es nuevo: riesgos de estructura (un registro que depende de
 *    una sola prenda ancla, sin abrigo de invierno cargado, un color que
 *    concentra la mitad del placard) -- directamente motivado por el
 *    trabajo reciente de diferenciar abrigos de entretiempo/invierno. */
export function analizarFoda(
  placard: Prenda[],
  // Ver el comentario de `excluirIds` en huecoDeEstilo, arriba -- pedido
  // explícito del usuario: poder pedir "otra opción" para la tarjeta de
  // "Compra prioritaria" sin tener que comprar la que ya se ofreció.
  excluirIds?: Set<string>,
): AnalisisFoda {
  const totalPrendas = placard.length;
  const porColor = contarPorColor(placard);
  const variedadColores = porColor.length;
  const fortalezas: string[] = [];
  const debilidades: string[] = [];
  const oportunidades: string[] = [];
  const amenazas: string[] = [];

  if (totalPrendas === 0) {
    debilidades.push("Todavía no cargaste ninguna prenda -- empezá por tu placard para ver indicadores reales.");
    const { nivelSalud, veredicto } = diagnosticoGeneral(fortalezas, debilidades, amenazas, totalPrendas);
    return {
      totalPrendas,
      variedadColores,
      fortalezas,
      debilidades,
      oportunidades,
      amenazas,
      nivelSalud,
      veredicto,
      estrategias: [],
      compraPrioritaria: null,
      necesidades: [],
    };
  }

  const piernas = placard.filter((p) => CATEGORIAS_PIERNAS.includes(p.categoria));
  if (piernas.length === 0) {
    debilidades.push(
      "No tenés ningún pantalón, bermuda o short cargado: es la prenda ancla del armado automático de outfits, sin una no hay sugerencias.",
    );
  } else {
    fortalezas.push(
      `Tenés ${piernas.length} prenda${piernas.length === 1 ? "" : "s"} de piernas (pantalón/bermuda/short): la base para armar outfits automáticos.`,
    );
  }

  // pantalon/bermuda/short_deportivo compiten por el mismo lugar del
  // outfit (CATEGORIAS_PIERNAS) -- ya tienen su propio mensaje arriba, así
  // que se excluyen acá para no repetir "te falta pantalón" cuando el
  // usuario ya tiene un bermuda cargado.
  const ausentes = categoriasAusentes(placard).filter((c) => !CATEGORIAS_PIERNAS.includes(c));
  if (ausentes.length > 0) {
    const lista = ausentes.map((c) => CATEGORIA_LABEL[c]).join(", ");
    debilidades.push(`Categorías sin ninguna prenda todavía: ${lista}.`);
  }

  const porEstilo = contarPorEstilo(placard);
  const conCarga = porEstilo.filter((e) => e.cantidad > 0);
  const fuertes = porEstilo.filter((e) => e.cantidad >= MIN_PRENDAS_FORTALEZA_ESTILO);
  for (const e of fuertes) {
    fortalezas.push(`Estilo ${e.label}: ${e.cantidad} prendas, suficiente para variar combinaciones en ese registro.`);
  }
  const sinCarga = ESTILOS.filter((estilo) => !conCarga.some((e) => e.estilo === estilo));
  if (sinCarga.length > 0 && sinCarga.length < ESTILOS.length) {
    const lista = sinCarga.map((e) => ESTILO_LABEL[e]).join(", ");
    debilidades.push(`Sin ninguna prenda de estilo ${lista}: no podés armar outfits para ese registro todavía.`);
  }

  if (variedadColores >= MIN_COLORES_VARIEDAD_BUENA) {
    fortalezas.push(`Buena variedad de colores: ${variedadColores} tonos distintos en el placard.`);
  } else if (totalPrendas >= 3 && variedadColores <= MAX_COLORES_VARIEDAD_BAJA) {
    debilidades.push(`Poca variedad de colores (solo ${variedadColores}): limita cuántas combinaciones distintas podés armar.`);
  }

  // Oportunidades: por cada estilo, el hueco de compra más severo que
  // encuentre huecoDeEstilo (ancla > ancla invernal > abrigo de invierno >
  // abrigo de entretiempo > saco de verano > variedad de torso/color >
  // variedad de calzado -- ver su comentario largo más arriba) -- nunca más
  // de uno por estilo, mismo criterio que ya regía acá (un tip claro y
  // accionable, no una pared de advertencias).
  //
  // Auditoría de exigencia de Consejo (roles: sastre/experto en moda),
  // pedido explícito del usuario ("mejora... la recomendación de compra
  // general que surja del FODA"): antes de este ajuste, acá solo se
  // chequeaban sugerenciaDeAncla y sugerenciaDeVariedad -- un estilo con
  // ancla y variedad de sobra pero SIN abrigo de invierno real (o sin saco
  // de verano, o con un solo par de calzado) no generaba NINGUNA
  // oportunidad, aunque el motor ya supiera detectar exactamente ese hueco
  // (lo usa auditoriaDeGuardarropa en "Vestite hoy"). El FODA quedaba
  // ciego a huecos reales que la propia app ya sabía nombrar.
  const huecosDeCompra = ESTILOS.map((estilo) => huecoDeEstilo(estilo, placard, CATALOGO_CON_HSL, excluirIds)).filter(
    (h): h is HuecoDeCompra => h !== null,
  );
  for (const hueco of huecosDeCompra) oportunidades.push(hueco.mensaje);

  // Amenazas -- 3 riesgos de estructura, no de contenido:
  // 1. Ancla única: un registro que hoy arma outfits pero depende de UNA
  //    sola prenda de piernas se cae entero si esa prenda no está
  //    disponible (lavado, rota, de viaje).
  for (const estilo of ESTILOS) {
    const piernasEstilo = piernas.filter((p) => estilosDe(p).includes(estilo));
    if (piernasEstilo.length === 1) {
      amenazas.push(`El registro ${ESTILO_LABEL[estilo]} depende de una sola prenda de piernas: sin ella no hay outfits de ese estilo.`);
    }
  }
  // 2. Sin abrigo de invierno real cargado -- directamente motivado por la
  //    diferenciación de esta ronda: sweater/campera son las dos
  //    categorías que sí llevan estacion, así que si el placard tiene
  //    abrigos pero NINGUNO tageado "invierno", no hay con qué responder
  //    cuando baje la temperatura de verdad (solo se avisa si hay al menos
  //    un abrigo cargado -- sin ninguno, ya lo cubre "Categorías sin
  //    ninguna prenda" arriba, no hace falta duplicar el aviso).
  const abrigos = placard.filter((p) => CATEGORIAS_ABRIGO_CON_ESTACION.includes(p.categoria));
  if (abrigos.length > 0 && !abrigos.some((p) => p.estacion === "invierno")) {
    amenazas.push("No tenés ningún sweater o campera tageado como de invierno: vas a quedar corto cuando baje la temperatura de verdad.");
  }
  // 3. Concentración de color: un solo color explica la mitad o más del
  //    placard -- perder o ensuciar esa prenda puntual golpea
  //    desproporcionado.
  if (totalPrendas >= MIN_PRENDAS_PARA_CONCENTRACION && porColor[0] && porColor[0].cantidad / totalPrendas >= UMBRAL_CONCENTRACION_COLOR) {
    const pct = Math.round((porColor[0].cantidad / totalPrendas) * 100);
    amenazas.push(`${porColor[0].nombre} concentra ${porColor[0].cantidad} de tus ${totalPrendas} prendas (${pct}%): mucha dependencia de un solo color.`);
  }

  const estrategias = estrategiasTows(fortalezas, debilidades, oportunidades, amenazas);
  const { nivelSalud, veredicto } = diagnosticoGeneral(fortalezas, debilidades, amenazas, totalPrendas);
  const compraPrioritaria = elegirCompraPrioritaria(huecosDeCompra);
  const necesidades = rankearNecesidades(huecosDeCompra);
  return {
    totalPrendas,
    variedadColores,
    fortalezas,
    debilidades,
    oportunidades,
    amenazas,
    nivelSalud,
    veredicto,
    estrategias,
    compraPrioritaria,
    necesidades,
  };
}

/** Buscador libre del placard (Placard.tsx): compara contra los mismos
 *  textos que ya se ven en cada card (nombre específico, categoría genérica,
 *  color, estilo/s, estación) -- nunca contra datos crudos que el usuario
 *  no tiene forma de escribir (hex, h/s/l). Incluye estilos secundarios
 *  (estilosDe): buscar "casual" también encuentra una prenda clásica con
 *  casual como secundario. Incluye tanto descripcionPrenda ("Jean",
 *  "Jogger", "Pantalón chino"...) como CATEGORIA_LABEL crudo ("pantalon") --
 *  pedido explícito del usuario al reportar el bug de "Jean azul": las
 *  cards ahora muestran el nombre específico, así que buscar "jean" tiene
 *  que encontrarlo igual que buscar "pantalon" (alguien puede seguir
 *  pensando en la categoría genérica). Substring, sin distinguir mayúsculas/
 *  acentos de más ni nada raro: "azul" matchea "Azul oscuro". Query vacía o
 *  solo espacios -> matchea todo (comportamiento de "sin filtro", no de
 *  "sin resultados"). */
// Ronda de nombres específicos (pedido explícito del usuario: "necesito
// que los nombres de las prendas... sean más específicos para que los
// pueda reconocer"): al corregir CATEGORIA_LABEL.pantalon (le faltaba la
// tilde -- ver ese comentario en types.ts) salió a la luz que este
// buscador nunca tuvo el acento-insensible que su propio comentario ya
// prometía ("sin distinguir mayúsculas/acentos de más") -- comparaba con
// `.includes()` puro, así que escribir "pantalon" sin tilde dejaba de
// encontrar "Pantalón" apenas la categoría empezó a mostrarse bien
// escrita. Bug real, no cosmético: la mayoría de teclados y hábitos de
// escritura casual en español omiten tildes, así que un buscador que las
// exige de verdad falla justo en el caso más común.
function normalizarBusqueda(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function coincideBusqueda(p: Prenda, query: string): boolean {
  const q = normalizarBusqueda(query.trim());
  if (!q) return true;
  const textos = [
    descripcionPrenda(p),
    CATEGORIA_LABEL[p.categoria],
    nombreColor(p.color_h, p.color_s, p.color_l),
    ...estilosDe(p).map((e) => ESTILO_LABEL[e]),
    p.estacion ? ESTACION_LABEL[p.estacion] : "",
  ];
  return textos.some((t) => normalizarBusqueda(t).includes(q));
}
