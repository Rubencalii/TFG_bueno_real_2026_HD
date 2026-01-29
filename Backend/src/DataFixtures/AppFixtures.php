<?php

namespace App\DataFixtures;

use App\Entity\Alergeno;
use App\Entity\Categoria;
use App\Entity\Producto;
use App\Entity\Mesa;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // ========== ALÉRGENOS ==========
        $alergenos = [];
        $alergenosData = [
            'gluten' => 'Gluten',
            'lactosa' => 'Lactosa',
            'huevo' => 'Huevo',
            'pescado' => 'Pescado',
            'marisco' => 'Marisco',
            'frutos_secos' => 'Frutos Secos',
            'soja' => 'Soja',
        ];

        foreach ($alergenosData as $key => $nombre) {
            $alergeno = new Alergeno();
            $alergeno->setNombre($nombre);
            $manager->persist($alergeno);
            $alergenos[$key] = $alergeno;
        }

        // ========== CATEGORÍAS - MENÚ CASA ENCARNI ==========
        $categorias = [];
        $categoriasData = [
            ['nombre' => 'Platos Principales', 'orden' => 1],
            ['nombre' => 'Combos', 'orden' => 2],
            ['nombre' => 'Pizzas', 'orden' => 3],
            ['nombre' => 'Bocadillos y Sándwiches', 'orden' => 4],
            ['nombre' => 'Hamburguesas', 'orden' => 5],
            ['nombre' => 'Bebidas', 'orden' => 6],
        ];

        foreach ($categoriasData as $data) {
            $categoria = new Categoria();
            $categoria->setNombre($data['nombre']);
            $categoria->setOrden($data['orden']);
            $categoria->setActiva(true);
            $manager->persist($categoria);
            $categorias[$data['nombre']] = $categoria;
        }

        // ========== PRODUCTOS - MENÚ REAL CASA ENCARNI ==========
        $productosData = [
            // ============ PLATOS PRINCIPALES ============
            [
                'nombre' => 'Carne en Salsa',
                'descripcion' => 'Deliciosa carne guisada en salsa casera.',
                'precio' => '13.00',
                'imagen' => 'https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=400',
                'categoria' => 'Platos Principales',
                'alergenos' => [],
                'destacado' => true,
            ],
            [
                'nombre' => 'Croquetas Caseras',
                'descripcion' => 'Croquetas tradicionales hechas en casa.',
                'precio' => '13.00',
                'imagen' => 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
                'categoria' => 'Platos Principales',
                'alergenos' => ['gluten', 'huevo', 'lactosa'],
            ],
            [
                'nombre' => 'Croquetas de Coliflor y Chocolate Blanco',
                'descripcion' => 'Nuestra especialidad: croquetas caseras de coliflor con toque de chocolate blanco.',
                'precio' => '13.00',
                'imagen' => 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
                'categoria' => 'Platos Principales',
                'alergenos' => ['gluten', 'huevo', 'lactosa'],
                'destacado' => true,
            ],
            [
                'nombre' => 'Solomillo Trinchado',
                'descripcion' => 'Solomillo de ternera trinchado a la plancha.',
                'precio' => '14.00',
                'imagen' => 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
                'categoria' => 'Platos Principales',
                'alergenos' => [],
            ],
            [
                'nombre' => 'Secreto Trinchado',
                'descripcion' => 'Secreto ibérico trinchado a la plancha.',
                'precio' => '14.00',
                'imagen' => 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400',
                'categoria' => 'Platos Principales',
                'alergenos' => [],
            ],
            [
                'nombre' => 'Lomo con Ajos',
                'descripcion' => 'Lomo de cerdo con ajos dorados.',
                'precio' => '13.00',
                'imagen' => 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
                'categoria' => 'Platos Principales',
                'alergenos' => [],
            ],
            [
                'nombre' => 'Huevos Rotos con Patatas y Jamón',
                'descripcion' => 'Huevos rotos sobre patatas fritas con jamón. Precio por persona.',
                'precio' => '4.00',
                'imagen' => 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
                'categoria' => 'Platos Principales',
                'alergenos' => ['huevo'],
            ],
            [
                'nombre' => 'Cazón',
                'descripcion' => 'Cazón frito al estilo andaluz.',
                'precio' => '14.00',
                'imagen' => 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400',
                'categoria' => 'Platos Principales',
                'alergenos' => ['pescado', 'gluten'],
            ],
            [
                'nombre' => 'Calamares',
                'descripcion' => 'Calamares a la romana.',
                'precio' => '14.00',
                'imagen' => 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
                'categoria' => 'Platos Principales',
                'alergenos' => ['marisco', 'gluten'],
            ],
            [
                'nombre' => 'Fritura de Pescado',
                'descripcion' => 'Variado de pescado frito: boquerones, calamares, gambas y más.',
                'precio' => '20.00',
                'imagen' => 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400',
                'categoria' => 'Platos Principales',
                'alergenos' => ['pescado', 'marisco', 'gluten'],
                'destacado' => true,
            ],

            // ============ COMBOS (TODOS 6€) ============
            [
                'nombre' => 'Combo Carne Kebab con Patatas',
                'descripcion' => 'Carne kebab con patatas fritas.',
                'precio' => '6.00',
                'imagen' => 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400',
                'categoria' => 'Combos',
                'alergenos' => ['gluten'],
            ],
            [
                'nombre' => 'Combo Carne en Salsa con Patatas',
                'descripcion' => 'Carne en salsa casera con patatas fritas.',
                'precio' => '6.00',
                'imagen' => 'https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=400',
                'categoria' => 'Combos',
                'alergenos' => [],
            ],
            [
                'nombre' => 'Combo Nuggets con Patatas',
                'descripcion' => 'Nuggets de pollo con patatas fritas.',
                'precio' => '6.00',
                'imagen' => 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400',
                'categoria' => 'Combos',
                'alergenos' => ['gluten'],
            ],

            // ============ PIZZAS (TODAS 11€) ============
            [
                'nombre' => 'Pizza York y Queso',
                'descripcion' => 'Jamón york, queso, mozzarella y orégano.',
                'precio' => '11.00',
                'imagen' => 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
                'categoria' => 'Pizzas',
                'alergenos' => ['gluten', 'lactosa'],
            ],
            [
                'nombre' => 'Pizza Barbacoa',
                'descripcion' => 'Carne picada, bacon y salsa barbacoa.',
                'precio' => '11.00',
                'imagen' => 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
                'categoria' => 'Pizzas',
                'alergenos' => ['gluten', 'lactosa'],
                'destacado' => true,
            ],
            [
                'nombre' => 'Pizza 4 Quesos',
                'descripcion' => 'Diferentes quesos, incluido roquefort y orégano.',
                'precio' => '11.00',
                'imagen' => 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
                'categoria' => 'Pizzas',
                'alergenos' => ['gluten', 'lactosa'],
            ],
            [
                'nombre' => 'Pizza Kebab',
                'descripcion' => 'Carne kebab, mozzarella, orégano, cebolla y salsa kebab.',
                'precio' => '11.00',
                'imagen' => 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
                'categoria' => 'Pizzas',
                'alergenos' => ['gluten', 'lactosa'],
            ],
            [
                'nombre' => 'Pizza Atún',
                'descripcion' => 'Mozzarella, orégano, pimiento verde y atún.',
                'precio' => '11.00',
                'imagen' => 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
                'categoria' => 'Pizzas',
                'alergenos' => ['gluten', 'lactosa', 'pescado'],
            ],
            [
                'nombre' => 'Pizza Carbonara',
                'descripcion' => 'Mozzarella, orégano, beicon, cebolla, champiñones y nata.',
                'precio' => '11.00',
                'imagen' => 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
                'categoria' => 'Pizzas',
                'alergenos' => ['gluten', 'lactosa'],
            ],
            [
                'nombre' => 'Pizza Vegetal',
                'descripcion' => 'Mozzarella, orégano, pimiento, cebolla, maíz, espárragos y champiñones.',
                'precio' => '11.00',
                'imagen' => 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
                'categoria' => 'Pizzas',
                'alergenos' => ['gluten', 'lactosa'],
                'vegetariano' => true,
            ],
            [
                'nombre' => 'Pizza Hamburguesa',
                'descripcion' => 'Tomate, queso, mini burger y salsa burger.',
                'precio' => '11.00',
                'imagen' => 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
                'categoria' => 'Pizzas',
                'alergenos' => ['gluten', 'lactosa'],
            ],

            // ============ BOCADILLOS Y SÁNDWICHES ============
            [
                'nombre' => 'Bocata XXL',
                'descripcion' => 'Lomo, queso, huevo, beicon, tomate y lechuga.',
                'precio' => '12.00',
                'imagen' => 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400',
                'categoria' => 'Bocadillos y Sándwiches',
                'alergenos' => ['gluten', 'huevo', 'lactosa'],
                'destacado' => true,
            ],
            [
                'nombre' => 'Bocadillo Normal',
                'descripcion' => 'A elegir entre: lomo, carne en salsa, tortilla, jamón o atún.',
                'precio' => '5.00',
                'imagen' => 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400',
                'categoria' => 'Bocadillos y Sándwiches',
                'alergenos' => ['gluten'],
            ],
            [
                'nombre' => 'Bocadillo Completo',
                'descripcion' => 'A elegir entre: lomo, carne en salsa, tortilla, jamón o atún. Con extras.',
                'precio' => '6.00',
                'imagen' => 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400',
                'categoria' => 'Bocadillos y Sándwiches',
                'alergenos' => ['gluten'],
            ],
            [
                'nombre' => 'Sándwich Mixto',
                'descripcion' => 'Jamón york y queso.',
                'precio' => '4.00',
                'imagen' => 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
                'categoria' => 'Bocadillos y Sándwiches',
                'alergenos' => ['gluten', 'lactosa'],
            ],
            [
                'nombre' => 'Sándwich Completo',
                'descripcion' => 'Jamón york, queso, huevo, tomate y lechuga.',
                'precio' => '5.00',
                'imagen' => 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
                'categoria' => 'Bocadillos y Sándwiches',
                'alergenos' => ['gluten', 'lactosa', 'huevo'],
            ],
            [
                'nombre' => 'Sándwich Vegetal',
                'descripcion' => 'Lechuga, tomate, huevo, espárragos y atún.',
                'precio' => '5.00',
                'imagen' => 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
                'categoria' => 'Bocadillos y Sándwiches',
                'alergenos' => ['gluten', 'huevo', 'pescado'],
            ],
            [
                'nombre' => 'Kebab',
                'descripcion' => 'Tomate, lechuga, huevo, queso, carne kebab y salsa kebab.',
                'precio' => '6.00',
                'imagen' => 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400',
                'categoria' => 'Bocadillos y Sándwiches',
                'alergenos' => ['gluten', 'huevo', 'lactosa'],
            ],

            // ============ HAMBURGUESAS ============
            [
                'nombre' => 'Hamburguesa Normal',
                'descripcion' => 'Carne, tomate, queso y lechuga.',
                'precio' => '4.50',
                'imagen' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
                'categoria' => 'Hamburguesas',
                'alergenos' => ['gluten', 'lactosa'],
            ],
            [
                'nombre' => 'Hamburguesa Completa',
                'descripcion' => 'Carne, tomate, queso, lechuga, huevo y beicon.',
                'precio' => '5.50',
                'imagen' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
                'categoria' => 'Hamburguesas',
                'alergenos' => ['gluten', 'lactosa', 'huevo'],
            ],
            [
                'nombre' => 'Hamburguesa Casa Encarni',
                'descripcion' => 'Carne de ternera 180gr, cebolla caramelizada, queso cheddar, beicon, huevo y salsa cheddar.',
                'precio' => '10.00',
                'imagen' => 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400',
                'categoria' => 'Hamburguesas',
                'alergenos' => ['gluten', 'lactosa', 'huevo'],
                'destacado' => true,
            ],

            // ============ BEBIDAS ============
            [
                'nombre' => 'Coca-Cola',
                'descripcion' => 'Refresco 330ml.',
                'precio' => '2.00',
                'imagen' => 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
                'categoria' => 'Bebidas',
                'alergenos' => [],
            ],
            [
                'nombre' => 'Fanta Naranja',
                'descripcion' => 'Refresco de naranja 330ml.',
                'precio' => '2.00',
                'imagen' => 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400',
                'categoria' => 'Bebidas',
                'alergenos' => [],
            ],
            [
                'nombre' => 'Agua Mineral',
                'descripcion' => 'Agua mineral natural 500ml.',
                'precio' => '1.50',
                'imagen' => 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400',
                'categoria' => 'Bebidas',
                'alergenos' => [],
            ],
            [
                'nombre' => 'Cerveza',
                'descripcion' => 'Cerveza de barril o botellín.',
                'precio' => '2.50',
                'imagen' => 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400',
                'categoria' => 'Bebidas',
                'alergenos' => ['gluten'],
            ],
            [
                'nombre' => 'Tinto de Verano',
                'descripcion' => 'Vino tinto con gaseosa.',
                'precio' => '2.50',
                'imagen' => 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
                'categoria' => 'Bebidas',
                'alergenos' => [],
            ],
            [
                'nombre' => 'Café',
                'descripcion' => 'Café solo, cortado o con leche.',
                'precio' => '1.50',
                'imagen' => 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
                'categoria' => 'Bebidas',
                'alergenos' => ['lactosa'],
            ],
        ];

        foreach ($productosData as $data) {
            $producto = new Producto();
            $producto->setNombre($data['nombre']);
            $producto->setDescripcion($data['descripcion']);
            $producto->setPrecio($data['precio']);
            $producto->setImagen($data['imagen']);
            $producto->setCategoria($categorias[$data['categoria']]);
            $producto->setActivo(true);
            $producto->setDestacado($data['destacado'] ?? false);
            $producto->setVegetariano($data['vegetariano'] ?? false);

            foreach ($data['alergenos'] as $alergenoKey) {
                if (isset($alergenos[$alergenoKey])) {
                    $producto->addAlergeno($alergenos[$alergenoKey]);
                }
            }

            $manager->persist($producto);
        }

        // ========== MESAS ==========
        for ($i = 1; $i <= 15; $i++) {
            $mesa = new Mesa();
            $mesa->setNumero($i);
            $mesa->setActiva(true);
            $manager->persist($mesa);
        }

        $manager->flush();
    }
}
