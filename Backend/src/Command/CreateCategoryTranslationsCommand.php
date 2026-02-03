<?php

namespace App\Command;

use App\Entity\Idioma;
use App\Entity\Categoria;
use App\Entity\CategoriaTraduccion;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:create-category-translations',
    description: 'Crea traducciones para todas las categorías existentes',
)]
class CreateCategoryTranslationsCommand extends Command
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $idiomaFr = $this->entityManager->getRepository(Idioma::class)->findOneBy(['codigo' => 'fr']);
        $idiomaEn = $this->entityManager->getRepository(Idioma::class)->findOneBy(['codigo' => 'en']);

        if (!$idiomaFr || !$idiomaEn) {
            $io->error('No se encontraron los idiomas francés e inglés');
            return Command::FAILURE;
        }

        // Traducciones completas de categorías
        $traduccionesCategorias = [
            'Platos Principales' => [
                'fr' => 'Plats Principaux',
                'en' => 'Main Courses'
            ],
            'Combos' => [
                'fr' => 'Combos',
                'en' => 'Combos'
            ],
            'Pizzas' => [
                'fr' => 'Pizzas',
                'en' => 'Pizzas'
            ],
            'Bocadillos y Sándwiches' => [
                'fr' => 'Sandwichs',
                'en' => 'Sandwiches'
            ],
            'Hamburguesas' => [
                'fr' => 'Hamburgers',
                'en' => 'Burgers'
            ],
            'Bebidas' => [
                'fr' => 'Boissons',
                'en' => 'Drinks'
            ],
            'Cócteles' => [
                'fr' => 'Cocktails',
                'en' => 'Cocktails'
            ],
            'Cafés e Infusiones' => [
                'fr' => 'Cafés et Infusions',
                'en' => 'Coffees & Teas'
            ]
        ];

        $count = 0;
        $categorias = $this->entityManager->getRepository(Categoria::class)->findBy(['activa' => true]);

        foreach ($categorias as $categoria) {
            $nombreOriginal = $categoria->getNombre();
            
            if (isset($traduccionesCategorias[$nombreOriginal])) {
                // Verificar si ya existe traducción francesa
                $existeFr = $this->entityManager->getRepository(CategoriaTraduccion::class)
                    ->findByCategoriaAndIdioma($categoria, $idiomaFr);
                
                if (!$existeFr) {
                    $traduccionFr = new CategoriaTraduccion();
                    $traduccionFr->setCategoria($categoria)
                                ->setIdioma($idiomaFr)
                                ->setNombre($traduccionesCategorias[$nombreOriginal]['fr']);
                    $this->entityManager->persist($traduccionFr);
                    $count++;
                }

                // Verificar si ya existe traducción inglesa
                $existeEn = $this->entityManager->getRepository(CategoriaTraduccion::class)
                    ->findByCategoriaAndIdioma($categoria, $idiomaEn);

                if (!$existeEn) {
                    $traduccionEn = new CategoriaTraduccion();
                    $traduccionEn->setCategoria($categoria)
                                ->setIdioma($idiomaEn)
                                ->setNombre($traduccionesCategorias[$nombreOriginal]['en']);
                    $this->entityManager->persist($traduccionEn);
                    $count++;
                }

                $io->writeln("✓ Traducciones creadas para categoría: {$nombreOriginal}");
            } else {
                $io->writeln("✗ No hay traducción para categoría: {$nombreOriginal}");
            }
        }

        $this->entityManager->flush();

        $io->success("Se crearon {$count} traducciones de categorías.");

        return Command::SUCCESS;
    }
}