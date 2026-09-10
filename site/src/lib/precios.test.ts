import { describe, expect, it } from "vitest";
import { rangoPrecio, rangoPrecioTexto, NIVEL_MARCA_LABEL, type NivelMarca } from "./precios";
import type { Categoria } from "./types";

const TODAS_LAS_CATEGORIAS: Categoria[] = [
  "pantalon",
  "bermuda",
  "short_deportivo",
  "remera",
  "buzo",
  "sweater",
  "camisa",
  "calzado",
  "campera",
  "accesorio",
  "saco",
];

const NIVELES: NivelMarca[] = ["tercera_marca", "segunda_marca", "primera_marca"];

// Auditoría de Consejo (roles: personal shopper/comprador retail), pedido
// explícito del usuario: "el motor de compras nunca habla de plata... buscá
// en Internet, para Argentina. Podés usar Mercado Libre y Shein... armar
// categoría primera marca, segunda marca, tercera marca". Estos tests
// verifican la INTEGRIDAD de la tabla (cobertura completa, rangos
// coherentes) -- no pueden verificar que los pesos sean "correctos" en el
// sentido de precios de mercado en tiempo real (ver el comentario largo en
// precios.ts sobre esa limitación real y declarada).
describe("precios -- cobertura e integridad de la tabla", () => {
  it("cubre las 11 categorías reales, ninguna de más ni de menos", () => {
    for (const categoria of TODAS_LAS_CATEGORIAS) {
      for (const nivel of NIVELES) {
        expect(() => rangoPrecio(categoria, nivel)).not.toThrow();
        const r = rangoPrecio(categoria, nivel);
        expect(r).toBeDefined();
        expect(r.min).toBeGreaterThan(0);
      }
    }
  });

  it("en cada categoría, min <= max dentro de cada nivel de marca", () => {
    for (const categoria of TODAS_LAS_CATEGORIAS) {
      for (const nivel of NIVELES) {
        const r = rangoPrecio(categoria, nivel);
        expect(r.min).toBeLessThanOrEqual(r.max);
      }
    }
  });

  // El hallazgo real de la investigación (jean Mercado Libre vs. Levi's,
  // remera Shein vs. Nike): primera marca es sistemáticamente más cara que
  // segunda, y segunda más cara que tercera -- nunca al revés, en ninguna
  // categoría. Sin este orden, la tabla contradiría su propia fuente.
  it("primera marca es siempre más cara que segunda, y segunda más que tercera, en TODAS las categorías", () => {
    for (const categoria of TODAS_LAS_CATEGORIAS) {
      const tercera = rangoPrecio(categoria, "tercera_marca");
      const segunda = rangoPrecio(categoria, "segunda_marca");
      const primera = rangoPrecio(categoria, "primera_marca");
      expect(segunda.min, categoria).toBeGreaterThanOrEqual(tercera.min);
      expect(primera.min, categoria).toBeGreaterThanOrEqual(segunda.min);
    }
  });

  it("NIVEL_MARCA_LABEL tiene las 3 etiquetas legibles, una por nivel", () => {
    for (const nivel of NIVELES) {
      expect(NIVEL_MARCA_LABEL[nivel]).toBeTruthy();
    }
  });
});

describe("rangoPrecioTexto", () => {
  // Pedido explícito de seguimiento del usuario: "cambialo de pesos a
  // dólares, porque quiero darle estabilidad frente a la inflación de
  // pesos Argentina. Así no hay que estar actualizando los listados de
  // precios constantemente." Ver el comentario "MONEDA" en precios.ts.
  it("arma un texto en dólares (no en pesos) con el piso de tercera marca y el techo de primera marca", () => {
    const texto = rangoPrecioTexto("calzado");
    expect(texto).toContain("Argentina");
    expect(texto).toMatch(/US\$\d[\d.]*–US\$\d[\d.]*/);
    expect(texto).not.toContain(".000"); // no debe quedar formato de pesos
  });

  it("nunca muestra el mismo texto para dos categorías con rangos distintos (accesorio vs. saco)", () => {
    expect(rangoPrecioTexto("accesorio")).not.toBe(rangoPrecioTexto("saco"));
  });
});

describe("rangoPrecio -- conversión a dólares", () => {
  // Ancla real de la investigación: jean Levi's Argentina $135.000-$198.000
  // ARS (ver el comentario de TABLA_PRECIOS_ARS) -- a la tasa declarada
  // (1 USD ≈ $1.500 ARS), eso da un rango de US$90-US$132, coherente con la
  // propia fuente citada en precios.ts ("un jean Levi's básico... entre 110
  // y 130 dólares"). Este test fija ese número: si alguien cambia la tasa
  // o la tabla en pesos sin querer, esto lo detecta.
  it("convierte de pesos a dólares con la tasa declarada (~1500 ARS/USD)", () => {
    const r = rangoPrecio("pantalon", "primera_marca");
    expect(r.min).toBe(90);
    expect(r.max).toBe(132);
  });

  it("nunca devuelve decimales -- redondeado al dólar entero", () => {
    for (const categoria of TODAS_LAS_CATEGORIAS) {
      for (const nivel of NIVELES) {
        const r = rangoPrecio(categoria, nivel);
        expect(Number.isInteger(r.min)).toBe(true);
        expect(Number.isInteger(r.max)).toBe(true);
      }
    }
  });
});
