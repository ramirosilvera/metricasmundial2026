-- Ronda de completitud del catálogo (pedido explícito del usuario: "revisá
-- todas las prendas del catálogo, decime si está completo"), revisada como
-- modista y asesor de imagen. Hueco real: un gorro de lana o una gorra no
-- son ni cuello ni cintura, y hasta esta migración no tenían dónde
-- dibujarse -- la única prenda de cabeza posible en el catálogo era,
-- literalmente, no tener ninguna.
alter table armario.prendas drop constraint prendas_posicion_accesorio_check;
alter table armario.prendas add constraint prendas_posicion_accesorio_check
  check (posicion_accesorio in ('cuello', 'cintura', 'cabeza'));
