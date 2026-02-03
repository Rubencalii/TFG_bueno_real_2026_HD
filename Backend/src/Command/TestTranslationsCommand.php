<?php

namespace App\Command;

use App\Repository\IdiomaRepository;
use App\Repository\ProductoRepository;
use App\Repository\CategoriaRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:test-translations',
    description: 'Prueba que las traducciones funcionan correctamente',
)]
class TestTranslationsCommand extends Command
{
    public function __construct(
        private IdiomaRepository $idiomaRepository,
        private ProductoRepository $productoRepository,
        private CategoriaRepository $categoriaRepository
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Obtener idiomas
        $idiomaEs = $this->idiomaRepository->findOneBy(['codigo' => 'es']);
        $idiomaFr = $this->idiomaRepository->findOneBy(['codigo' => 'fr']);
        $idiomaEn = $this->idiomaRepository->findOneBy(['codigo' => 'en']);

        if (!$idiomaEs || !$idiomaFr || !$idiomaEn) {
            $io->error('No se encontraron todos los idiomas');
            return Command::FAILURE;
        }

        $io->title('Probando traducciones...');

        // Probar algunos productos
        $productos = $this->productoRepository->findBy([], null, 5);
        
        $io->section('Productos:');
        foreach ($productos as $producto) {
            $io->writeln("Original: {$producto->getNombre()}");
            $io->writeln("Francés:  {$producto->getNombreTraducido($idiomaFr)}");
            $io->writeln("Inglés:   {$producto->getNombreTraducido($idiomaEn)}");
            $io->writeln("---");
        }

        // Probar categorías
        $categorias = $this->categoriaRepository->findBy([], null, 3);
        
        $io->section('Categorías:');
        foreach ($categorias as $categoria) {
            $io->writeln("Original: {$categoria->getNombre()}");
            $io->writeln("Francés:  {$categoria->getNombreTraducido($idiomaFr)}");
            $io->writeln("Inglés:   {$categoria->getNombreTraducido($idiomaEn)}");
            $io->writeln("---");
        }

        $io->success('Prueba completada');
        return Command::SUCCESS;
    }
}