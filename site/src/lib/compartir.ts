/**
 * Genera una imagen (PNG) de un outfit para compartir -- pedido explícito
 * del usuario: "compartir como imagen y por WhatsApp", con foco en que sea
 * "visual, claro, y que se entienda qué se está compartiendo". Todo
 * client-side (canvas), sin subir nada a ningún lado ni depender de un
 * servicio de terceros -- mismo criterio que procesarFoto() en photo.ts,
 * ya establecido en esta app.
 *
 * La estrategia: el maniquí YA está renderizado como <svg> en el DOM (cada
 * outfit-card lo dibuja con Maniqui.tsx) -- en vez de re-renderizarlo
 * aparte, se serializa ESE svg real (XMLSerializer -> data URI -> Image) y
 * se pega en un canvas más grande, junto con el encabezado de marca y el
 * texto del outfit (el mismo texto que la propia tarjeta ya le muestra al
 * usuario, no uno inventado para la imagen).
 */

const ANCHO = 1080;
const COLOR_FONDO = "#fbf7f2";
const COLOR_MARCA = "#c8763f";
const COLOR_TITULO = "#2b241d";
const COLOR_TEXTO_MUTED = "#6b6259";

export interface DatosOutfitParaCompartir {
  titulo: string;
  leyenda: string;
  registro: string | null;
}

/** Parte pura (sin canvas/DOM) y por lo tanto testeable: corta un texto en
 *  líneas que entran en `anchoMax`, midiendo con la función de medida que
 *  le pasen (en un canvas real, ctx.measureText(t).width). Separado de
 *  generarImagenOutfit() a propósito para poder testear el algoritmo de
 *  wrap sin necesitar un canvas real (vitest corre en Node, sin DOM). */
export function envolverTexto(texto: string, anchoMax: number, medir: (t: string) => number): string[] {
  const palabras = texto.split(" ").filter(Boolean);
  if (palabras.length === 0) return [];

  const lineas: string[] = [];
  let actual = palabras[0];
  for (const palabra of palabras.slice(1)) {
    const candidata = `${actual} ${palabra}`;
    if (medir(candidata) <= anchoMax) {
      actual = candidata;
    } else {
      lineas.push(actual);
      actual = palabra;
    }
  }
  lineas.push(actual);
  return lineas;
}

/** Dibuja el isotipo de la marca (la misma percha del favicon, ver
 *  site/public/*.png) directo en canvas -- mismas coordenadas que ese
 *  diseño (viewBox 0..100), para no depender de cargar un PNG aparte de
 *  forma asincrónica. */
function dibujarIsotipo(ctx: CanvasRenderingContext2D, x: number, y: number, escala: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(escala, escala);

  ctx.fillStyle = COLOR_MARCA;
  ctx.beginPath();
  ctx.arc(50, 50, 47, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = COLOR_FONDO;
  ctx.lineWidth = 6.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.arc(50, 22.5, 5.5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(50, 28);
  ctx.lineTo(50, 35);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(50, 35);
  ctx.lineTo(16, 62);
  ctx.quadraticCurveTo(13, 64.3, 16.5, 65.3);
  ctx.lineTo(83.5, 65.3);
  ctx.quadraticCurveTo(87, 64.3, 84, 62);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}

/** Serializa un <svg> del DOM (el maniquí ya renderizado) a un HTMLImageElement
 *  cargado, vía data URI -- no hay recursos externos referenciados adentro
 *  (todo gradientes/patrones inline), así que no hay riesgo de "tainted
 *  canvas" por CORS. */
function svgAImagen(svg: SVGSVGElement): Promise<HTMLImageElement> {
  const clon = svg.cloneNode(true) as SVGSVGElement;
  // el <svg> en la tarjeta no trae width/height explícitos (los toma del
  // CSS, 100% del contenedor) -- sin eso, algunos navegadores rasterizan
  // el <img> con un tamaño por defecto chico/incorrecto.
  clon.setAttribute("width", "600");
  clon.setAttribute("height", "1300");
  const xml = new XMLSerializer().serializeToString(clon);
  const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo rasterizar el maniquí"));
    img.src = dataUri;
  });
}

const AREA_TOP = 150;
const AREA_ALTO_MANIQUI = 860;
const ANCHO_TEXTO = ANCHO - 140;
const ALTO_LINEA_TITULO = 56;
const ALTO_LINEA_LEYENDA = 42;
const ALTO_PILL = 56;
const ALTO_FOOTER = 76;

/** Dibuja el bloque de texto (título + leyenda + badge de registro) a
 *  partir de `yInicial`, y devuelve el `y` final -- se usa DOS veces: una
 *  con un canvas descartable solo para medir cuánto ocupa el texto (así se
 *  sabe el alto real que necesita el canvas final antes de crearlo), y otra
 *  para dibujarlo de verdad. Un outfit con pocas prendas ("Remera + Jean")
 *  y uno con muchas ("Sweater + Pantalón de vestir + Calzado + Cinturón +
 *  Bufanda") ocupan un alto de texto MUY distinto -- un alto de canvas fijo
 *  hacía que los outfits largos se superpusieran con el pie de página
 *  ("Armado con Mi ropa"), confirmado renderizando un caso real largo. */
function dibujarBloqueTexto(ctx: CanvasRenderingContext2D, datos: DatosOutfitParaCompartir, yInicial: number): number {
  let y = yInicial;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = COLOR_TITULO;
  ctx.font = "700 46px system-ui, -apple-system, sans-serif";
  for (const linea of envolverTexto(datos.titulo, ANCHO_TEXTO, (t) => ctx.measureText(t).width)) {
    ctx.fillText(linea, ANCHO / 2, y);
    y += ALTO_LINEA_TITULO;
  }

  y += 18;
  ctx.fillStyle = COLOR_TEXTO_MUTED;
  ctx.font = "400 32px system-ui, -apple-system, sans-serif";
  for (const linea of envolverTexto(datos.leyenda, ANCHO_TEXTO, (t) => ctx.measureText(t).width)) {
    ctx.fillText(linea, ANCHO / 2, y);
    y += ALTO_LINEA_LEYENDA;
  }

  if (datos.registro) {
    y += 26;
    ctx.font = "700 28px system-ui, -apple-system, sans-serif";
    const textoAncho = ctx.measureText(datos.registro).width;
    const padX = 28;
    const pillAncho = textoAncho + padX * 2;
    const pillX = (ANCHO - pillAncho) / 2;
    const pillY = y - ALTO_PILL / 2;
    ctx.fillStyle = "#f0ded0";
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillAncho, ALTO_PILL, ALTO_PILL / 2);
    ctx.fill();
    ctx.fillStyle = COLOR_MARCA;
    ctx.textBaseline = "middle";
    ctx.fillText(datos.registro, ANCHO / 2, y + 2);
    ctx.textBaseline = "alphabetic";
    y += ALTO_PILL / 2;
  }

  return y;
}

/**
 * Arma la imagen completa (encabezado de marca + maniquí + texto del
 * outfit) y devuelve el PNG como Blob, listo para descargar o compartir.
 * El alto del canvas se calcula en base al texto real del outfit (ver
 * dibujarBloqueTexto), no un valor fijo -- así un outfit con muchas
 * prendas no se corta ni se pisa con el pie de página.
 */
export async function generarImagenOutfit(
  svgManiqui: SVGSVGElement,
  datos: DatosOutfitParaCompartir,
): Promise<Blob> {
  const yTextoInicial = AREA_TOP + AREA_ALTO_MANIQUI + 70;

  // canvas descartable de 1x1 solo para medir texto (measureText no
  // depende del tamaño del canvas, solo de la fuente ya seteada en el ctx).
  const medidor = document.createElement("canvas").getContext("2d");
  if (!medidor) throw new Error("No se pudo obtener contexto 2D de canvas");
  const yTextoFinal = dibujarBloqueTexto(medidor, datos, yTextoInicial);
  const alto = Math.round(yTextoFinal + ALTO_FOOTER);

  const canvas = document.createElement("canvas");
  canvas.width = ANCHO;
  canvas.height = alto;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo obtener contexto 2D de canvas");

  ctx.fillStyle = COLOR_FONDO;
  ctx.fillRect(0, 0, ANCHO, alto);

  // encabezado de marca -- para que quien lo reciba por WhatsApp entienda
  // de entrada que es una combinación armada con la app, no una foto suelta.
  dibujarIsotipo(ctx, 56, 40, 0.52);
  ctx.fillStyle = COLOR_MARCA;
  ctx.font = "700 34px system-ui, -apple-system, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("MI ROPA", 130, 68);

  // maniquí -- centrado, respetando el aspect ratio real del viewBox
  // "0 0 120 260" de Maniqui.tsx (120:260) en vez de estirarlo.
  const img = await svgAImagen(svgManiqui);
  const relacion = 120 / 260;
  const wManiqui = AREA_ALTO_MANIQUI * relacion;
  const xManiqui = (ANCHO - wManiqui) / 2;
  ctx.drawImage(img, xManiqui, AREA_TOP, wManiqui, AREA_ALTO_MANIQUI);

  // texto del outfit -- el mismo que ya ve el usuario en la tarjeta
  // (leyenda()/RegistroBadge en Outfits.tsx), no un texto inventado para
  // la imagen -- así lo que se comparte coincide con lo que se ve en la app.
  dibujarBloqueTexto(ctx, datos, yTextoInicial);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = COLOR_TEXTO_MUTED;
  ctx.font = "400 22px system-ui, -apple-system, sans-serif";
  ctx.fillText("Armado con Mi ropa", ANCHO / 2, alto - 36);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("No se pudo generar el PNG"))), "image/png");
  });
}

/**
 * Comparte (o descarga, como fallback) el blob de imagen ya generado.
 *
 * WhatsApp NO tiene una API web pública para adjuntar un archivo por URL --
 * el link wa.me solo precarga TEXTO, nunca un archivo (confirmado
 * investigando la documentación real de WhatsApp antes de armar esto: no
 * existe un parámetro de adjunto en wa.me). La única forma real y legítima
 * de compartir una IMAGEN a WhatsApp desde una página web es el share
 * sheet nativo del sistema operativo (Web Share API con `files`), donde
 * WhatsApp aparece como una app más entre las opciones -- eso es lo que se
 * usa acá. En navegadores/dispositivos sin esa API (la mayoría de
 * desktop), se descarga el PNG en vez de fingir un botón de WhatsApp que
 * en realidad no podría adjuntar nada.
 */
/**
 * Lista de regalos -- pedido explícito del usuario: "quiero que en la
 * sección de estadísticas me permita exportar una imagen, csv o algo con
 * un formato visual, con un estado de recomendaciones ordenadas por
 * ranking de necesidades... para poder pasarle ese archivo a las personas
 * para que me hagan un regalo de cumple en función de lo que necesito."
 * Roles de moda: personal shopper (qué mostrar -- precio y motivo, no solo
 * el nombre) y diseñador gráfico (que se lea bien reenviado por WhatsApp/
 * mail, el mismo canal que ya usa generarImagenOutfit).
 *
 * `compartir.ts` no sabe de placard/catálogo/motor de recomendación a
 * propósito (repite el criterio ya establecido de DatosOutfitParaCompartir
 * más arriba: recibe datos YA formateados para mostrar, nunca recalcula
 * lógica de negocio) -- quien arma este array (Estadisticas.tsx) es quien
 * conoce AnalisisFoda.necesidades y precios.ts.
 */
export interface ItemListaDeseos {
  /** 1-based -- el orden en que ya vienen los items importa (ranking real
   *  de severidad, ver rankearNecesidades en estadisticas.ts), esto es
   *  solo el número que se dibuja/exporta junto a cada fila. */
  prioridad: number;
  nombre: string;
  colorHex: string;
  categoria: string;
  /** Ya formateado como texto legible (ej. "Formal, Oficina") -- una
   *  prenda puede tapar el hueco de más de un estilo a la vez. */
  estilos: string;
  motivo: string;
  precioTexto: string;
}

function csvEscape(valor: string): string {
  // RFC 4180: entrecomillar si el valor tiene coma, comilla o salto de
  // línea, duplicando las comillas internas. El motivo/mensaje real puede
  // traer comas ("Zapatillas de lona negras, aprox...") así que esto no es
  // un caso de borde raro -- pasa con la primera fila real.
  if (/[",\r\n]/.test(valor)) return `"${valor.replace(/"/g, '""')}"`;
  return valor;
}

/** CSV de la lista de regalos, ya ordenada por prioridad -- separado de la
 *  descarga (ver descargarTexto más abajo) para poder testear el formato
 *  sin DOM, mismo criterio que envolverTexto arriba. Sin la columna de
 *  color (un hex no le sirve a quien va a comprar el regalo) -- si hace
 *  falta el color exacto, la imagen (generarImagenListaDeseos) ya lo
 *  muestra como swatch visual. */
export function generarCSVListaDeseos(items: ItemListaDeseos[]): string {
  const encabezado = ["Prioridad", "Prenda", "Categoría", "Para qué estilo", "Motivo", "Precio de referencia (Argentina)"];
  const filas = items.map((it) => [String(it.prioridad), it.nombre, it.categoria, it.estilos, it.motivo, it.precioTexto]);
  return [encabezado, ...filas].map((fila) => fila.map(csvEscape).join(",")).join("\r\n");
}

/** Descarga un archivo de texto plano (CSV) -- mismo mecanismo de descarga
 *  que el fallback de compartirOImagen (createObjectURL + <a download>),
 *  separado porque un CSV no pasa por el share sheet de imágenes (no tiene
 *  sentido "compartir" un CSV a WhatsApp -- ahí lo útil es abrirlo en
 *  Excel/Sheets, así que siempre se descarga). Con BOM UTF-8 (`﻿`)
 *  -- sin esto, Excel en Windows (el destino más probable de un CSV que
 *  alguien va a abrir para ver una lista) interpreta los acentos como
 *  caracteres random en vez de UTF-8. */
export function descargarTexto(contenido: string, nombreArchivo: string, tipoMime: string): void {
  const blob = new Blob(["﻿" + contenido], { type: `${tipoMime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const COLOR_BORDE = "#e6e0d4";

/** Alto de una fila de la lista de regalos -- separado para poder medir
 *  el alto TOTAL antes de crear el canvas final (mismo patrón de dos
 *  pasadas que dibujarBloqueTexto: medir con un canvas descartable,
 *  dibujar de verdad con el alto ya calculado, para que ninguna fila
 *  quede cortada por el pie de página). Devuelve el `y` final. */
function dibujarFilaListaDeseos(ctx: CanvasRenderingContext2D, item: ItemListaDeseos, yInicial: number, dibujar: boolean): number {
  const xIzquierda = 70;
  const xTexto = 190;
  const anchoTexto = ANCHO - xTexto - 70;
  let y = yInicial;

  if (dibujar) {
    // círculo de prioridad -- el número de ranking es lo primero que se
    // lee, antes que el nombre: es justamente el dato nuevo de esta
    // función (un CSV/imagen sin orden visible no sirve como "ranking de
    // necesidades", el pedido explícito del usuario).
    ctx.fillStyle = COLOR_MARCA;
    ctx.beginPath();
    ctx.arc(xIzquierda, y + 8, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "700 28px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(item.prioridad), xIzquierda, y + 9);

    // swatch de color -- mismo criterio que ChipsColores/CompraPrioritariaCard
    // en la app: un cuadrado de color dice más rápido que el texto "negro".
    ctx.fillStyle = item.colorHex;
    ctx.beginPath();
    ctx.roundRect(xIzquierda - 18, y + 46, 36, 36, 8);
    ctx.fill();
    ctx.strokeStyle = COLOR_BORDE;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = COLOR_TITULO;
  ctx.font = "700 34px system-ui, -apple-system, sans-serif";
  const yNombre = y + 14;
  if (dibujar) ctx.fillText(item.nombre, xTexto, yNombre);

  ctx.fillStyle = COLOR_MARCA;
  ctx.font = "700 24px system-ui, -apple-system, sans-serif";
  const yCategoria = yNombre + 38;
  if (dibujar) ctx.fillText(`${item.categoria} · Para ${item.estilos}`, xTexto, yCategoria);

  ctx.fillStyle = COLOR_TEXTO_MUTED;
  ctx.font = "400 26px system-ui, -apple-system, sans-serif";
  let yMotivo = yCategoria + 40;
  const lineasMotivo = envolverTexto(item.motivo, anchoTexto, (t) => ctx.measureText(t).width);
  for (const linea of lineasMotivo) {
    if (dibujar) ctx.fillText(linea, xTexto, yMotivo);
    yMotivo += 34;
  }

  ctx.fillStyle = COLOR_MARCA;
  ctx.font = "700 26px system-ui, -apple-system, sans-serif";
  let yPrecio = yMotivo + 6;
  // el precio venía con un solo fillText sin envolver: con marcas caras
  // ("de tercera a primera marca") el texto se salía del borde derecho
  // del canvas -- mismo tratamiento que el motivo, línea por línea.
  const lineasPrecio = envolverTexto(item.precioTexto, anchoTexto, (t) => ctx.measureText(t).width);
  for (const linea of lineasPrecio) {
    if (dibujar) ctx.fillText(linea, xTexto, yPrecio);
    yPrecio += 34;
  }

  const yFinal = yPrecio + 6;
  if (dibujar) {
    ctx.strokeStyle = COLOR_BORDE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(70, yFinal);
    ctx.lineTo(ANCHO - 70, yFinal);
    ctx.stroke();
  }
  return yFinal + 46;
}

/**
 * Arma la imagen completa de la lista de regalos (encabezado de marca +
 * título + filas numeradas por prioridad) y devuelve el PNG como Blob --
 * mismo formato de salida que generarImagenOutfit (Blob PNG, listo para
 * compartirOImagen). A diferencia de esa función, no hay ningún <svg> que
 * rasterizar (no es un outfit puesto, es una lista) así que todo el
 * dibujo es síncrono -- se mantiene async igual, mismo tipo de retorno,
 * para que el llamador no tenga que distinguir "esta sí es async, esta no".
 */
export async function generarImagenListaDeseos(items: ItemListaDeseos[]): Promise<Blob> {
  const yInicial = 260;

  const medidor = document.createElement("canvas").getContext("2d");
  if (!medidor) throw new Error("No se pudo obtener contexto 2D de canvas");
  let yMedido = yInicial;
  for (const item of items) yMedido = dibujarFilaListaDeseos(medidor, item, yMedido, false);
  const alto = Math.round(yMedido + ALTO_FOOTER);

  const canvas = document.createElement("canvas");
  canvas.width = ANCHO;
  canvas.height = alto;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo obtener contexto 2D de canvas");

  ctx.fillStyle = COLOR_FONDO;
  ctx.fillRect(0, 0, ANCHO, alto);

  dibujarIsotipo(ctx, 56, 40, 0.52);
  ctx.fillStyle = COLOR_MARCA;
  ctx.font = "700 34px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("MI ROPA", 130, 68);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = COLOR_TITULO;
  ctx.font = "700 44px system-ui, -apple-system, sans-serif";
  ctx.fillText("🎁 Lista de regalos", ANCHO / 2, 160);
  ctx.fillStyle = COLOR_TEXTO_MUTED;
  ctx.font = "400 26px system-ui, -apple-system, sans-serif";
  ctx.fillText("Ordenada por prioridad -- lo que más necesito primero", ANCHO / 2, 200);

  let y = yInicial;
  for (const item of items) y = dibujarFilaListaDeseos(ctx, item, y, true);

  ctx.textAlign = "center";
  ctx.fillStyle = COLOR_TEXTO_MUTED;
  ctx.font = "400 22px system-ui, -apple-system, sans-serif";
  ctx.fillText("Armado con Mi ropa", ANCHO / 2, alto - 36);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("No se pudo generar el PNG"))), "image/png");
  });
}

export async function compartirOImagen(blob: Blob, nombreArchivo: string, tituloCompartir: string): Promise<"compartido" | "descargado" | "cancelado"> {
  const file = new File([blob], nombreArchivo, { type: "image/png" });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: tituloCompartir });
      return "compartido";
    } catch (err) {
      // AbortError: el usuario cerró el share sheet sin elegir nada -- no
      // es un error real de la app, no hay que mostrar nada.
      if (err instanceof Error && err.name === "AbortError") return "cancelado";
      throw err;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return "descargado";
}
