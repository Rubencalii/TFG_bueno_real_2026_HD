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
                'nombreEn' => 'Meat in Sauce',
                'descripcion' => 'Deliciosa carne guisada en salsa casera.',
                'descripcionEn' => 'Delicious meat stewed in homemade sauce.',
                'precio' => '13.00',
                'imagen' => 'https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=400',
                'categoria' => 'Platos Principales',
                'alergenos' => [],
                'destacado' => true,
            ],
            [
                'nombre' => 'Croquetas Caseras',
                'nombreEn' => 'Homemade Croquettes',
                'descripcion' => 'Croquetas tradicionales hechas en casa.',
                'descripcionEn' => 'Traditional croquettes made in-house.',
                'precio' => '13.00',
                'imagen' => 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
                'categoria' => 'Platos Principales',
                'alergenos' => ['gluten', 'huevo', 'lactosa'],
            ],
            [
                'nombre' => 'Croquetas de Coliflor y Chocolate Blanco',
                'nombreEn' => 'Cauliflower & White Chocolate Croquettes',
                'descripcion' => 'Nuestra especialidad: croquetas caseras de coliflor con toque de chocolate blanco.',
                'descripcionEn' => 'Our specialty: cauliflower croquettes with a hint of white chocolate.',
                'precio' => '13.00',
                'imagen' => 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
                'categoria' => 'Platos Principales',
                'alergenos' => ['gluten', 'huevo', 'lactosa'],
                'destacado' => true,
            ],
            [
                'nombre' => 'Solomillo Trinchado',
                'nombreEn' => 'Grilled Sirloin Steak',
                'descripcion' => 'Solomillo de ternera trinchado a la plancha.',
                'descripcionEn' => 'Sliced beef sirloin steak grilled to perfection.',
                'precio' => '14.00',
                'imagen' => 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
                'categoria' => 'Platos Principales',
                'alergenos' => [],
            ],
            [
                'nombre' => 'Secreto Trinchado',
                'nombreEn' => 'Grilled Iberian Secret',
                'descripcion' => 'Secreto ibérico trinchado a la plancha.',
                'descripcionEn' => 'Sliced Iberian secret pork grilled to perfection.',
                'precio' => '14.00',
                'imagen' => 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400',
                'categoria' => 'Platos Principales',
                'alergenos' => [],
            ],
            [
                'nombre' => 'Lomo con Ajos',
                'nombreEn' => 'Pork Loin with Garlic',
                'descripcion' => 'Lomo de cerdo con ajos dorados.',
                'descripcionEn' => 'Pork loin with golden brown garlic.',
                'precio' => '13.00',
                'imagen' => 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
                'categoria' => 'Platos Principales',
                'alergenos' => [],
            ],
            [
                'nombre' => 'Huevos Rotos con Patatas y Jamón',
                'nombreEn' => 'Broken Eggs with Fries and Ham',
                'descripcion' => 'Huevos rotos sobre patatas fritas con jamón. Precio por persona.',
                'descripcionEn' => 'Broken eggs over french fries with Spanish ham. Price per person.',
                'precio' => '4.00',
                'imagen' => 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
                'categoria' => 'Platos Principales',
                'alergenos' => ['huevo'],
            ],
            [
                'nombre' => 'Cazón',
                'nombreEn' => 'Marinated Dogfish',
                'descripcion' => 'Cazón frito al estilo andaluz.',
                'descripcionEn' => 'Andalusian style fried marinated dogfish.',
                'precio' => '14.00',
                'imagen' => 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400',
                'categoria' => 'Platos Principales',
                'alergenos' => ['pescado', 'gluten'],
            ],
            [
                'nombre' => 'Calamares',
                'nombreEn' => 'Fried Squid',
                'descripcion' => 'Calamares a la romana.',
                'descripcionEn' => 'Romanian style fried squid.',
                'precio' => '14.00',
                'imagen' => 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
                'categoria' => 'Platos Principales',
                'alergenos' => ['marisco', 'gluten'],
            ],
            [
                'nombre' => 'Fritura de Pescado',
                'nombreEn' => 'Assorted Fried Fish',
                'descripcion' => 'Variado de pescado frito: boquerones, calamares, gambas y más.',
                'descripcionEn' => 'Assorted fried fish: anchovies, squid, shrimp and more.',
                'precio' => '20.00',
                'imagen' => 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400',
                'categoria' => 'Platos Principales',
                'alergenos' => ['pescado', 'marisco', 'gluten'],
                'destacado' => true,
            ],

            // ============ COMBOS (TODOS 6€) ============
            [
                'nombre' => 'Combo Carne Kebab con Patatas',
                'nombreEn' => 'Kebab Meat Combo with Fries',
                'descripcion' => 'Carne kebab con patatas fritas.',
                'descripcionEn' => 'Kebab meat served with french fries.',
                'precio' => '6.00',
                'imagen' => 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400',
                'categoria' => 'Combos',
                'alergenos' => ['gluten'],
            ],
            [
                'nombre' => 'Combo Carne en Salsa con Patatas',
                'nombreEn' => 'Meat in Sauce Combo with Fries',
                'descripcion' => 'Carne en salsa casera con patatas fritas.',
                'descripcionEn' => 'Meat in homemade sauce served with french fries.',
                'precio' => '6.00',
                'imagen' => 'https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=400',
                'categoria' => 'Combos',
                'alergenos' => [],
            ],
            [
                'nombre' => 'Combo Nuggets con Patatas',
                'nombreEn' => 'Chicken Nuggets Combo with Fries',
                'descripcion' => 'Nuggets de pollo con patatas fritas.',
                'descripcionEn' => 'Chicken nuggets served with french fries.',
                'precio' => '6.00',
                'imagen' => 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400',
                'categoria' => 'Combos',
                'alergenos' => ['gluten'],
            ],

            // ============ PIZZAS (TODAS 11€) ============
            [
                'nombre' => 'Pizza York y Queso',
                'nombreEn' => 'Ham and Cheese Pizza',
                'descripcion' => 'Jamón york, queso, mozzarella y orégano.',
                'descripcionEn' => 'Ham, cheese, mozzarella and oregano.',
                'precio' => '11.00',
                'imagen' => 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
                'categoria' => 'Pizzas',
                'alergenos' => ['gluten', 'lactosa'],
            ],
            [
                'nombre' => 'Pizza Barbacoa',
                'nombreEn' => 'BBQ Pizza',
                'descripcion' => 'Carne picada, bacon y salsa barbacoa.',
                'descripcionEn' => 'Minced meat, bacon and BBQ sauce.',
                'precio' => '11.00',
                'imagen' => 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
                'categoria' => 'Pizzas',
                'alergenos' => ['gluten', 'lactosa'],
                'destacado' => true,
            ],
            [
                'nombre' => 'Pizza 4 Quesos',
                'nombreEn' => '4 Cheese Pizza',
                'descripcion' => 'Diferentes quesos, incluido roquefort y orégano.',
                'descripcionEn' => 'Assorted cheeses including Roquefort and oregano.',
                'precio' => '11.00',
                'imagen' => 'https://images.unsplash.com/photo-15104890138-7c749659a591?w=400',
                'categoria' => 'Pizzas',
                'alergenos' => ['gluten', 'lactosa'],
            ],
            [
                'nombre' => 'Pizza Kebab',
                'nombreEn' => 'Kebab Pizza',
                'descripcion' => 'Carne kebab, mozzarella, orégano, cebolla y salsa kebab.',
                'descripcionEn' => 'Kebab meat, mozzarella, oregano, onion and kebab sauce.',
                'precio' => '11.00',
                'imagen' => 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
                'categoria' => 'Pizzas',
                'alergenos' => ['gluten', 'lactosa'],
            ],
            [
                'nombre' => 'Pizza Atún',
                'nombreEn' => 'Tuna Pizza',
                'descripcion' => 'Mozzarella, orégano, pimiento verde y atún.',
                'descripcionEn' => 'Mozzarella, oregano, green pepper and tuna.',
                'precio' => '11.00',
                'imagen' => 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
                'categoria' => 'Pizzas',
                'alergenos' => ['gluten', 'lactosa', 'pescado'],
            ],
            [
                'nombre' => 'Pizza Carbonara',
                'nombreEn' => 'Carbonara Pizza',
                'descripcion' => 'Mozzarella, orégano, beicon, cebolla, champiñones y nata.',
                'descripcionEn' => 'Mozzarella, oregano, bacon, onion, mushrooms and cream.',
                'precio' => '11.00',
                'imagen' => 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
                'categoria' => 'Pizzas',
                'alergenos' => ['gluten', 'lactosa'],
            ],
            [
                'nombre' => 'Pizza Vegetal',
                'nombreEn' => 'Veggie Pizza',
                'descripcion' => 'Mozzarella, orégano, pimiento, cebolla, maíz, espárragos y champiñones.',
                'descripcionEn' => 'Mozzarella, oregano, peppers, onion, corn, asparagus and mushrooms.',
                'precio' => '11.00',
                'imagen' => 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
                'categoria' => 'Pizzas',
                'alergenos' => ['gluten', 'lactosa'],
                'vegetariano' => true,
            ],
            [
                'nombre' => 'Pizza Hamburguesa',
                'nombreEn' => 'Cheeseburger Pizza',
                'descripcion' => 'Tomate, queso, mini burger y salsa burger.',
                'descripcionEn' => 'Tomato, cheese, mini burger and burger sauce.',
                'precio' => '11.00',
                'imagen' => 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
                'categoria' => 'Pizzas',
                'alergenos' => ['gluten', 'lactosa'],
            ],

            // ============ BOCADILLOS Y SÁNDWICHES ============
            [
                'nombre' => 'Bocata XXL',
                'nombreEn' => 'XXL Sandwich',
                'descripcion' => 'Lomo, queso, huevo, beicon, tomate y lechuga.',
                'descripcionEn' => 'Pork loin, cheese, egg, bacon, tomato and lettuce.',
                'precio' => '12.00',
                'imagen' => 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400',
                'categoria' => 'Bocadillos y Sándwiches',
                'alergenos' => ['gluten', 'huevo', 'lactosa'],
                'destacado' => true,
            ],
            [
                'nombre' => 'Bocadillo Normal',
                'nombreEn' => 'Regular Sandwich',
                'descripcion' => 'A elegir entre: lomo, carne en salsa, tortilla, jamón o atún.',
                'descripcionEn' => 'Choice of: pork loin, meat in sauce, omelet, ham or tuna.',
                'precio' => '5.00',
                'imagen' => 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400',
                'categoria' => 'Bocadillos y Sándwiches',
                'alergenos' => ['gluten'],
            ],
            [
                'nombre' => 'Bocadillo Completo',
                'nombreEn' => 'Deluxe Sandwich',
                'descripcion' => 'A elegir entre: lomo, carne en salsa, tortilla, jamón o atún. Con extras.',
                'descripcionEn' => 'Choice of: pork loin, meat in sauce, omelet, ham or tuna. With extras.',
                'precio' => '6.00',
                'imagen' => 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400',
                'categoria' => 'Bocadillos y Sándwiches',
                'alergenos' => ['gluten'],
            ],
            [
                'nombre' => 'Sándwich Mixto',
                'nombreEn' => 'Ham and Cheese Sandwich',
                'descripcion' => 'Jamón york y queso.',
                'descripcionEn' => 'Ham and cheese toasted sandwich.',
                'precio' => '4.00',
                'imagen' => 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
                'categoria' => 'Bocadillos y Sándwiches',
                'alergenos' => ['gluten', 'lactosa'],
            ],
            [
                'nombre' => 'Sándwich Completo',
                'nombreEn' => 'Deluxe Sandwich (Toasted)',
                'descripcion' => 'Jamón york, queso, huevo, tomate y lechuga.',
                'descripcionEn' => 'Ham, cheese, egg, tomato and lettuce.',
                'precio' => '5.00',
                'imagen' => 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
                'categoria' => 'Bocadillos y Sándwiches',
                'alergenos' => ['gluten', 'lactosa', 'huevo'],
            ],
            [
                'nombre' => 'Sándwich Vegetal',
                'nombreEn' => 'Veggie Sandwich',
                'descripcion' => 'Lechuga, tomate, huevo, espárragos y atún.',
                'descripcionEn' => 'Lettuce, tomato, egg, asparagus and tuna.',
                'precio' => '5.00',
                'imagen' => 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
                'categoria' => 'Bocadillos y Sándwiches',
                'alergenos' => ['gluten', 'huevo', 'pescado'],
            ],
            [
                'nombre' => 'Kebab',
                'nombreEn' => 'Kebab',
                'descripcion' => 'Tomate, lechuga, huevo, queso, carne kebab y salsa kebab.',
                'descripcionEn' => 'Tomato, lettuce, egg, cheese, kebab meat and kebab sauce.',
                'precio' => '6.00',
                'imagen' => 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400',
                'categoria' => 'Bocadillos y Sándwiches',
                'alergenos' => ['gluten', 'huevo', 'lactosa'],
            ],

            // ============ HAMBURGUESAS ============
            [
                'nombre' => 'Hamburguesa Normal',
                'nombreEn' => 'Regular Burger',
                'descripcion' => 'Carne, tomate, queso y lechuga.',
                'descripcionEn' => 'Beef, tomato, cheese and lettuce.',
                'precio' => '4.50',
                'imagen' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
                'categoria' => 'Hamburguesas',
                'alergenos' => ['gluten', 'lactosa'],
            ],
            [
                'nombre' => 'Hamburguesa Completa',
                'nombreEn' => 'Deluxe Burger',
                'descripcion' => 'Carne, tomate, queso, lechuga, huevo y beicon.',
                'descripcionEn' => 'Beef, tomato, cheese, lettuce, egg and bacon.',
                'precio' => '5.50',
                'imagen' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
                'categoria' => 'Hamburguesas',
                'alergenos' => ['gluten', 'lactosa', 'huevo'],
            ],
            [
                'nombre' => 'Hamburguesa Casa Encarni',
                'nombreEn' => 'Casa Encarni Special Burger',
                'descripcion' => 'Carne de ternera 180gr, cebolla caramelizada, queso cheddar, beicon, huevo y salsa cheddar.',
                'descripcionEn' => '180g beef, caramelized onion, cheddar cheese, bacon, egg and cheddar sauce.',
                'precio' => '10.00',
                'imagen' => 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400',
                'categoria' => 'Hamburguesas',
                'alergenos' => ['gluten', 'lactosa', 'huevo'],
                'destacado' => true,
            ],

            // ============ BEBIDAS ============
            [
                'nombre' => 'Coca-Cola',
                'nombreEn' => 'Coke',
                'descripcion' => 'Refresco 330ml.',
                'descripcionEn' => '330ml soft drink.',
                'precio' => '2.00',
                'imagen' => 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
                'categoria' => 'Bebidas',
                'alergenos' => [],
            ],
            [
                'nombre' => 'Fanta Naranja',
                'nombreEn' => 'Orange Fanta',
                'descripcion' => 'Refresco de naranja 330ml.',
                'descripcionEn' => '330ml orange soft drink.',
                'precio' => '2.00',
                'imagen' => 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400',
                'categoria' => 'Bebidas',
                'alergenos' => [],
            ],
            [
                'nombre' => 'Agua Mineral',
                'nombreEn' => 'Mineral Water',
                'descripcion' => 'Agua mineral natural 500ml.',
                'descripcionEn' => '500ml natural mineral water.',
                'precio' => '1.50',
                'imagen' => 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400',
                'categoria' => 'Bebidas',
                'alergenos' => [],
            ],
            [
                'nombre' => 'Cerveza',
                'nombreEn' => 'Beer',
                'descripcion' => 'Cerveza de barril o botellín.',
                'descripcionEn' => 'Draft or bottled beer.',
                'precio' => '2.50',
                'imagen' => 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400',
                'categoria' => 'Bebidas',
                'alergenos' => ['gluten'],
            ],
            [
                'nombre' => 'Tinto de Verano',
                'nombreEn' => 'Red Wine Spritzer',
                'descripcion' => 'Vino tinto con gaseosa.',
                'descripcionEn' => 'Red wine mixed with lemon soda.',
                'precio' => '2.50',
                'imagen' => 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
                'categoria' => 'Bebidas',
                'alergenos' => [],
            ],
            [
                'nombre' => 'Café',
                'nombreEn' => 'Coffee',
                'descripcion' => 'Café solo, cortado o con leche.',
                'descripcionEn' => 'Black, macchiato or white coffee.',
                'precio' => '1.50',
                'imagen' => 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
                'categoria' => 'Bebidas',
                'alergenos' => ['lactosa'],
            ],
        ];

        foreach ($productosData as $data) {
            $producto = new Producto();
            $producto->setNombre($data['nombre']);
            $producto->setNombreEn($data['nombreEn'] ?? null);
            $producto->setDescripcion($data['descripcion']);
            $producto->setDescripcionEn($data['descripcionEn'] ?? null);
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
