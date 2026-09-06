-- Ronda de completitud del catálogo (pedido explícito del usuario:
-- "revisá todas las prendas del catálogo, quiero que me digas si está
-- completo o se puede completar aún más"), revisada como modista y asesor
-- de imagen.
--
-- Hueco real y el más grande que tenía el catálogo: los cinco cortes de
-- calzado existentes (zapatilla urbana, running, zapato de vestir,
-- mocasín, zapatilla de lona) son TODOS calzado bajo. O sea que un placard
-- armado con este catálogo no tenía con qué vestirse los pies en invierno,
-- en una app que modela invierno/entretiempo/verano en todas las demás
-- categorías de abrigo.
--
-- El botín (chelsea/chukka/borcego de cuero) es el calzado de otoño-
-- invierno por defecto de un guardarropa real de hombre, y además es el
-- único corte de la lista que cambia la SILUETA (la caña por encima del
-- tobillo) y no solo la decoración -- por eso es también el más
-- reconocible en el ícono y en el maniquí.
alter table armario.prendas drop constraint prendas_corte_calzado_check;
alter table armario.prendas add constraint prendas_corte_calzado_check
  check (corte_calzado in ('zapatilla_urbana', 'zapatilla_running', 'zapato_vestir', 'mocasin', 'zapatilla_lona', 'botin'));
