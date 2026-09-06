-- Pedido explícito del usuario: "los pantalones de vestir que tengo en mi
-- placard, negro y marrón, que son de oficina y clásicos, son de
-- gabardina... quizás en el catálogo también podés distinguir los
-- pantalones de vestir de oficina, que son típicamente de gabardina, y los
-- formales, que son otra tela más suave tipo de traje."
--
-- Revisado como sastre e ingeniero textil: tiene razón y era un hueco real
-- del modelo. La gabardina es un tejido de sarga MUY empinada (~63°,
-- contra los ~45° del denim), de trama cerrada, mate y firme -- es la tela
-- del pantalón de oficina que se usa todos los días, aguanta uso y
-- planchado. La lana de traje (tropical/fresco) es la contraria: caída
-- suave, superficie difusa, y es la que se corta junto con el saco. Misma
-- silueta (las dos llevan raya planchada al frente), fibra y registro
-- distintos. Hasta esta migración TODO pantalón de vestir era 'lana', así
-- que la prenda que más se usa para ir a trabajar no se podía distinguir
-- de un pantalón de traje.
--
-- Mismo criterio y misma forma que ya separaron 'impermeable' de
-- 'poliester' (0024) y 'tricot' de 'impermeable' (0025): fibra parecida,
-- construcción real y visualmente distinta -> textura propia, en vez de
-- reusar una existente y perder la diferencia.
alter table armario.prendas drop constraint prendas_textura_check;
alter table armario.prendas add constraint prendas_textura_check
  check (textura in
    ('algodon','seda','cuero_liso','lino','lana','pana','corderoy','tejido_grueso','frisado','denim','acolchado','poliester','viscosa','impermeable','tricot','gabardina') or textura is null);
