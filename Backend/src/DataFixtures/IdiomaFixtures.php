<?php

namespace App\DataFixtures;

use App\Entity\Idioma;
use App\Entity\Producto;
use App\Entity\Categoria;
use App\Entity\ProductoTraduccion;
use App\Entity\CategoriaTraduccion;
use App\Repository\IdiomaRepository;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;

class IdiomaFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        // Buscar idiomas (ya deberían existir por la migración)
        $idiomaEs = $manager->getRepository(Idioma::class)->findOneBy(['codigo' => 'es']);
        $idiomaFr = $manager->getRepository(Idioma::class)->findOneBy(['codigo' => 'fr']);
        $idiomaEn = $manager->getRepository(Idioma::class)->findOneBy(['codigo' => 'en']);

        // Si no existen, crearlos
        if (!$idiomaEs) {
            $idiomaEs = new Idioma();
            $idiomaEs->setCodigo('es')
                     ->setNombre('Español')
                     ->setBandera('🇪🇸')
                     ->setActivo(true);
            $manager->persist($idiomaEs);
        }

        if (!$idiomaFr) {
            $idiomaFr = new Idioma();
            $idiomaFr->setCodigo('fr')
                     ->setNombre('Français')
                     ->setBandera('🇫🇷')
                     ->setActivo(true);
            $manager->persist($idiomaFr);
        }

        if (!$idiomaEn) {
            $idiomaEn = new Idioma();
            $idiomaEn->setCodigo('en')
                     ->setNombre('English')
                     ->setBandera('🇬🇧')
                     ->setActivo(true);
            $manager->persist($idiomaEn);
        }

        $manager->flush();

        // Obtener algunas categorías y productos existentes para traducir
        $categorias = $manager->getRepository(Categoria::class)->findAll();
        $productos = $manager->getRepository(Producto::class)->findAll();

        // Traducciones de categorías de ejemplo
        $traduccionesCategorias = [
            'Entrantes' => [
                'fr' => 'Entrées',
                'en' => 'Starters'
            ],
            'Principales' => [
                'fr' => 'Plats principaux',
                'en' => 'Main courses'
            ],
            'Postres' => [
                'fr' => 'Desserts',
                'en' => 'Desserts'
            ],
            'Bebidas' => [
                'fr' => 'Boissons',
                'en' => 'Drinks'
            ],
            'Tapas' => [
                'fr' => 'Tapas',
                'en' => 'Tapas'
            ],
            'Ensaladas' => [
                'fr' => 'Salades',
                'en' => 'Salads'
            ]
        ];

        foreach ($categorias as $categoria) {
            $nombreOriginal = $categoria->getNombre();
            
            if (isset($traduccionesCategorias[$nombreOriginal])) {
                // Francés
                $traduccionFr = new CategoriaTraduccion();
                $traduccionFr->setCategoria($categoria)
                            ->setIdioma($idiomaFr)
                            ->setNombre($traduccionesCategorias[$nombreOriginal]['fr']);
                $manager->persist($traduccionFr);

                // Inglés
                $traduccionEn = new CategoriaTraduccion();
                $traduccionEn->setCategoria($categoria)
                            ->setIdioma($idiomaEn)
                            ->setNombre($traduccionesCategorias[$nombreOriginal]['en']);
                $manager->persist($traduccionEn);
            }
        }

        // Traducciones de productos de ejemplo
        $traduccionesProductos = [
            'Jamón Ibérico' => [
                'fr' => ['nombre' => 'Jambon Ibérique', 'descripcion' => 'Jambon ibérique de qualité supérieure'],
                'en' => ['nombre' => 'Iberian Ham', 'descripcion' => 'Premium quality Iberian ham']
            ],
            'Paella Valenciana' => [
                'fr' => ['nombre' => 'Paella Valencienne', 'descripcion' => 'Paella traditionnelle avec poulet, lapin et légumes'],
                'en' => ['nombre' => 'Valencian Paella', 'descripcion' => 'Traditional paella with chicken, rabbit and vegetables']
            ],
            'Tortilla Española' => [
                'fr' => ['nombre' => 'Tortilla Espagnole', 'descripcion' => 'Omelette aux pommes de terre traditionnelle'],
                'en' => ['nombre' => 'Spanish Omelette', 'descripcion' => 'Traditional potato omelette']
            ],
            'Gazpacho Andaluz' => [
                'fr' => ['nombre' => 'Gazpacho Andalou', 'descripcion' => 'Soupe froide de tomates et légumes'],
                'en' => ['nombre' => 'Andalusian Gazpacho', 'descripcion' => 'Cold tomato and vegetable soup']
            ],
            'Crema Catalana' => [
                'fr' => ['nombre' => 'Crème Catalane', 'descripcion' => 'Dessert traditionnel catalan caramélisé'],
                'en' => ['nombre' => 'Catalan Cream', 'descripcion' => 'Traditional Catalan caramelized dessert']
            ]
        ];

        foreach ($productos as $producto) {
            $nombreOriginal = $producto->getNombre();
            
            if (isset($traduccionesProductos[$nombreOriginal])) {
                // Francés
                $traduccionFr = new ProductoTraduccion();
                $traduccionFr->setProducto($producto)
                            ->setIdioma($idiomaFr)
                            ->setNombre($traduccionesProductos[$nombreOriginal]['fr']['nombre'])
                            ->setDescripcion($traduccionesProductos[$nombreOriginal]['fr']['descripcion']);
                $manager->persist($traduccionFr);

                // Inglés  
                $traduccionEn = new ProductoTraduccion();
                $traduccionEn->setProducto($producto)
                            ->setIdioma($idiomaEn)
                            ->setNombre($traduccionesProductos[$nombreOriginal]['en']['nombre'])
                            ->setDescripcion($traduccionesProductos[$nombreOriginal]['en']['descripcion']);
                $manager->persist($traduccionEn);
            }
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            AppFixtures::class,
        ];
    }
}