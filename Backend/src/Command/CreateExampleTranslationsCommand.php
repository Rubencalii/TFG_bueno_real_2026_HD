<?php

namespace App\Command;

use App\Entity\Idioma;
use App\Entity\Producto;
use App\Entity\ProductoTraduccion;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:create-example-translations',
    description: 'Crea traducciones de ejemplo para productos existentes',
)]
class CreateExampleTranslationsCommand extends Command
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $idiomaFr = $this->entityManager->getRepository(Idioma::class)->findByCodigo('fr');
        $idiomaEn = $this->entityManager->getRepository(Idioma::class)->findByCodigo('en');

        if (!$idiomaFr || !$idiomaEn) {
            $io->error('No se encontraron los idiomas francés e inglés');
            return Command::FAILURE;
        }

        // Traducciones de ejemplo
        $traducciones = [
            'Carne en Salsa' => [
                'fr' => ['nombre' => 'Viande en Sauce', 'descripcion' => 'Viande tendre avec une sauce savoureuse'],
                'en' => ['nombre' => 'Meat in Sauce', 'descripcion' => 'Tender meat with flavorful sauce']
            ],
            'Croquetas Caseras' => [
                'fr' => ['nombre' => 'Croquettes Maison', 'descripcion' => 'Croquettes traditionnelles faites maison'],
                'en' => ['nombre' => 'Homemade Croquettes', 'descripcion' => 'Traditional homemade croquettes']
            ],
            'Solomillo Trinchado' => [
                'fr' => ['nombre' => 'Filet de Bœuf Tranché', 'descripcion' => 'Filet de bœuf tendre coupé en tranches'],
                'en' => ['nombre' => 'Sliced Sirloin', 'descripcion' => 'Tender sliced sirloin steak']
            ],
            'Huevos Rotos con Patatas y Jamón' => [
                'fr' => ['nombre' => 'Œufs Cassés aux Pommes de Terre et Jambon', 'descripcion' => 'Œufs cassés avec pommes de terre et jambon'],
                'en' => ['nombre' => 'Broken Eggs with Potatoes and Ham', 'descripcion' => 'Broken eggs with potatoes and ham']
            ],
            'Calamares' => [
                'fr' => ['nombre' => 'Calamars', 'descripcion' => 'Calamars frais préparés à la perfection'],
                'en' => ['nombre' => 'Squid', 'descripcion' => 'Fresh squid prepared to perfection']
            ],
            'Fritura de Pescado' => [
                'fr' => ['nombre' => 'Friture de Poisson', 'descripcion' => 'Assortiment de poissons frits'],
                'en' => ['nombre' => 'Fried Fish', 'descripcion' => 'Assorted fried fish selection']
            ],
        ];

        $count = 0;

        foreach ($traducciones as $nombreOriginal => $langs) {
            $producto = $this->entityManager->getRepository(Producto::class)->findOneBy(['nombre' => $nombreOriginal]);
            
            if ($producto) {
                // Verificar si ya existe traducción francesa
                $existeFr = $this->entityManager->getRepository(ProductoTraduccion::class)
                    ->findByProductoAndIdioma($producto, $idiomaFr);
                
                if (!$existeFr) {
                    $traduccionFr = new ProductoTraduccion();
                    $traduccionFr->setProducto($producto)
                                ->setIdioma($idiomaFr)
                                ->setNombre($langs['fr']['nombre'])
                                ->setDescripcion($langs['fr']['descripcion']);
                    $this->entityManager->persist($traduccionFr);
                    $count++;
                }

                // Verificar si ya existe traducción inglesa
                $existeEn = $this->entityManager->getRepository(ProductoTraduccion::class)
                    ->findByProductoAndIdioma($producto, $idiomaEn);

                if (!$existeEn) {
                    $traduccionEn = new ProductoTraduccion();
                    $traduccionEn->setProducto($producto)
                                ->setIdioma($idiomaEn)
                                ->setNombre($langs['en']['nombre'])
                                ->setDescripcion($langs['en']['descripcion']);
                    $this->entityManager->persist($traduccionEn);
                    $count++;
                }

                $io->writeln("✓ Traducciones creadas para: {$nombreOriginal}");
            } else {
                $io->writeln("✗ Producto no encontrado: {$nombreOriginal}");
            }
        }

        $this->entityManager->flush();

        $io->success("Se crearon {$count} traducciones de ejemplo.");

        return Command::SUCCESS;
    }
}