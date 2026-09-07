-- Ronda de completitud del catálogo (pedido explícito del usuario: "revisá
-- todas las prendas del catálogo, quiero que me digas si está completo o
-- se puede completar aún más"), revisada como modista y asesor de imagen.
--
-- Dos huecos reales que este par de columnas resuelve:
--
-- 1. La chomba/polo (remera con cuello camisero abrochado) no tenía forma
--    de representarse: toda remera del catálogo era, a los ojos del motor
--    de dibujo, cuello redondo liso -- y la chomba es EL básico
--    smart-casual de verano por excelencia.
-- 2. "sweater-cuello-alto-negro" ya existía en el catálogo con ese nombre,
--    pero no había ningún dato que lo distinguiera de un sweater cuello
--    redondo/V real -- se dibujaba exactamente igual que cualquier otro.
--    El chaleco (sweater sin mangas) tenía el mismo problema: no existía
--    como prenda, aunque es una pieza de sastrería real y distinta (se usa
--    sola sobre una camisa, o bajo un saco en invierno).
--
-- Nullable (a diferencia de patron/calce/corte_calzado, que tienen un
-- default único NOT NULL): el fallback correcto DIFIERE por categoría
-- (redondo en remera vs. v en sweater; larga en las dos), así que un único
-- default de columna rompería una de las dos sin que el usuario cargara
-- nada nuevo -- ver el comentario largo de Cuello/Manga en types.ts.
alter table armario.prendas add column cuello text
  check (cuello in ('redondo', 'v', 'polo', 'alto') or cuello is null);
alter table armario.prendas add column manga text
  check (manga in ('corta', 'larga', 'sin_mangas') or manga is null);
