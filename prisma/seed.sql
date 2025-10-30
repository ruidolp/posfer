-- Catálogo Global de Productos

-- FRUTAS
INSERT INTO product_parents (id, tenant_id, name, is_global, suggested_unit, active, created_at, updated_at) VALUES
(gen_random_uuid(), NULL, 'Manzana', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Pera', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Plátano', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Naranja', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Limón', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Mandarina', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Sandía', true, 'un', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Melón', true, 'un', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Frutilla', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Durazno', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Damasco', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Chirimoya', true, 'un', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Palta', true, 'un', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Kiwi', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Uva', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Ciruela', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Nectarin', true, 'kg', true, NOW(), NOW());

-- VERDURAS
INSERT INTO product_parents (id, tenant_id, name, is_global, suggested_unit, active, created_at, updated_at) VALUES
(gen_random_uuid(), NULL, 'Papa', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Tomate', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Cebolla', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Zanahoria', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Lechuga', true, 'un', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Repollo', true, 'un', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Zapallo', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Choclo', true, 'un', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Ají', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Pimentón', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Betarraga', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Apio', true, 'un', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Pepino', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Brócoli', true, 'un', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Coliflor', true, 'un', true, NOW(), NOW());

-- HIERBAS / VERDURAS DE HOJA
INSERT INTO product_parents (id, tenant_id, name, is_global, suggested_unit, active, created_at, updated_at) VALUES
(gen_random_uuid(), NULL, 'Cilantro', true, 'atado', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Perejil', true, 'atado', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Cebolla Larga', true, 'atado', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Acelga', true, 'atado', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Espinaca', true, 'atado', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Albahaca', true, 'atado', true, NOW(), NOW());

-- OTROS
INSERT INTO product_parents (id, tenant_id, name, is_global, suggested_unit, active, created_at, updated_at) VALUES
(gen_random_uuid(), NULL, 'Huevos', true, 'bandeja', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Champiñones', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Ajo', true, 'kg', true, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Jengibre', true, 'kg', true, NOW(), NOW());
