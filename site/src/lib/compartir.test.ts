import { describe, expect, it } from "vitest";
import { envolverTexto, generarCSVListaDeseos, type ItemListaDeseos } from "./compartir";

// medir() simulado: cada carácter mide 1 unidad -- no depende de canvas
// real (vitest corre en Node sin DOM), pero alcanza para probar la lógica
// de corte de línea en sí, que es independiente de la medición real.
const medirPorCaracter = (t: string) => t.length;

describe("envolverTexto", () => {
  it("texto vacío -> sin líneas", () => {
    expect(envolverTexto("", 100, medirPorCaracter)).toEqual([]);
  });

  it("texto que entra entero en una línea -> una sola línea", () => {
    expect(envolverTexto("Camisa blanca", 50, medirPorCaracter)).toEqual(["Camisa blanca"]);
  });

  it("corta en el límite de palabra cuando no entra más", () => {
    // "Camisa blanca + Pantalón azul marino" (37 chars) con ancho 20:
    // "Camisa blanca" (13) cabe, sumar " +" (15) cabe, sumar " Pantalón" (24) no cabe -> corta.
    const resultado = envolverTexto("Camisa blanca + Pantalón azul marino", 20, medirPorCaracter);
    expect(resultado.join(" ")).toBe("Camisa blanca + Pantalón azul marino"); // ninguna palabra se pierde
    expect(resultado.every((linea) => medirPorCaracter(linea) <= 20 || linea.split(" ").length === 1)).toBe(true);
  });

  it("una palabra sola más larga que el ancho máximo no se corta a la mitad (queda en su propia línea)", () => {
    const resultado = envolverTexto("Supercalifragilisticoexpialidoso", 10, medirPorCaracter);
    expect(resultado).toEqual(["Supercalifragilisticoexpialidoso"]);
  });

  it("múltiples espacios/espacios de más no generan líneas vacías", () => {
    const resultado = envolverTexto("Camisa   blanca", 100, medirPorCaracter);
    expect(resultado).toEqual(["Camisa blanca"]);
  });

  it("nunca pierde ni duplica palabras, sin importar el ancho", () => {
    const texto = "Sweater gris + Pantalón de vestir negro + Calzado marrón";
    for (const ancho of [5, 10, 20, 40, 100, 1000]) {
      const resultado = envolverTexto(texto, ancho, medirPorCaracter);
      expect(resultado.join(" ")).toBe(texto);
    }
  });
});

// Consejo, ronda siguiente -- pedido explícito del usuario: "exportar...
// un csv... con un ranking de necesidades... para pasarle ese archivo a
// las personas para que me hagan un regalo de cumple".
describe("generarCSVListaDeseos", () => {
  function mkItem(overrides: Partial<ItemListaDeseos> = {}): ItemListaDeseos {
    return {
      prioridad: 1,
      nombre: "Zapatillas de lona negras",
      colorHex: "#1A1A1A",
      categoria: "Calzado",
      estilos: "Urbano",
      motivo: "Te falta una zapatilla de lona en ese registro.",
      precioTexto: "Aprox. US$12–US$100 en Argentina (de tercera a primera marca)",
      ...overrides,
    };
  }

  it("arma el encabezado y una fila por item, separados por coma", () => {
    const csv = generarCSVListaDeseos([mkItem()]);
    const [encabezado, fila] = csv.split("\r\n");
    expect(encabezado).toBe("Prioridad,Prenda,Categoría,Para qué estilo,Motivo,Precio de referencia (Argentina)");
    expect(fila).toContain("Zapatillas de lona negras");
    expect(fila).toContain("Urbano");
  });

  it("respeta el orden de prioridad ya dado -- no reordena", () => {
    const csv = generarCSVListaDeseos([mkItem({ prioridad: 1, nombre: "A" }), mkItem({ prioridad: 2, nombre: "B" })]);
    const filas = csv.split("\r\n").slice(1);
    expect(filas[0]).toContain("A");
    expect(filas[1]).toContain("B");
  });

  // Caso real, no de borde: un motivo con coma ("...te falta una zapatilla
  // de lona, un tipo que todavía no tenés...") es el texto REAL que ya usa
  // el motor (ver sugerenciaDeCorteCalzado en recommend.ts) -- sin escapar
  // bien, esto rompería el CSV en columnas de más al abrirlo en Excel/Sheets.
  it("entrecomilla valores con comas (RFC 4180), sin romper las columnas", () => {
    const csv = generarCSVListaDeseos([mkItem({ motivo: "Te falta un mocasín, un tipo que todavía no tenés en ese registro." })]);
    const fila = csv.split("\r\n")[1];
    expect(fila).toContain('"Te falta un mocasín, un tipo que todavía no tenés en ese registro."');
  });

  it("entrecomilla y duplica comillas internas", () => {
    const csv = generarCSVListaDeseos([mkItem({ nombre: 'Campera "urbana" negra' })]);
    const fila = csv.split("\r\n")[1];
    expect(fila).toContain('"Campera ""urbana"" negra"');
  });

  it("lista vacía -> solo el encabezado", () => {
    expect(generarCSVListaDeseos([])).toBe("Prioridad,Prenda,Categoría,Para qué estilo,Motivo,Precio de referencia (Argentina)");
  });
});
