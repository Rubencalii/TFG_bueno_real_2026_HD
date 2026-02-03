<?php

namespace App\Controller;

use App\Entity\Idioma;
use App\Entity\ProductoTraduccion;
use App\Entity\CategoriaTraduccion;
use App\Repository\MesaRepository;
use App\Repository\CategoriaRepository;
use App\Repository\ProductoRepository;
use App\Repository\IdiomaRepository;
use App\Repository\ProductoTraduccionRepository;
use App\Repository\CategoriaTraduccionRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class MesaController extends AbstractController
{
    public function __construct(
        private MesaRepository $mesaRepository,
        private CategoriaRepository $categoriaRepository,
        private ProductoRepository $productoRepository,
        private IdiomaRepository $idiomaRepository,
        private ProductoTraduccionRepository $productoTraduccionRepository,
        private CategoriaTraduccionRepository $categoriaTraduccionRepository
    ) {}

    #[Route('/mesa/{token}', name: 'menu_mesa')]
    public function menuMesa(string $token, Request $request): Response
    {
        $mesa = $this->mesaRepository->findOneBy(['tokenQr' => $token, 'activa' => true]);
        
        if (!$mesa) {
            throw $this->createNotFoundException('Mesa no encontrada o no activa');
        }

        // Obtener idioma seleccionado o detectar automáticamente
        $idiomaSeleccionado = $request->query->get('lang', 'es');
        $idioma = $this->idiomaRepository->findOneBy(['codigo' => $idiomaSeleccionado, 'activo' => true]) 
                ?? $this->idiomaRepository->findOneBy(['codigo' => 'es', 'activo' => true]);

        // Obtener todos los idiomas disponibles
        $idiomasDisponibles = $this->idiomaRepository->findAllActivos();

        // Obtener categorías activas ordenadas
        $categoriasEntities = $this->categoriaRepository->findAllActivas();
        
        // Obtener productos activos
        $productosEntities = $this->productoRepository->findActivos();

        // Serializar categorías para React con traducciones
        $categorias = array_map(function($cat) use ($idioma) {
            return [
                'id' => $cat->getId(),
                'nombre' => $cat->getNombreTraducido($idioma),
            ];
        }, $categoriasEntities);

        // Serializar productos para React con traducciones
        $productos = array_map(function($prod) use ($idioma) {
            return [
                'id' => $prod->getId(),
                'nombre' => $prod->getNombreTraducido($idioma),
                'descripcion' => $prod->getDescripcionTraducida($idioma),
                'precio' => $prod->getPrecio(),
                'imagen' => $prod->getImagen(),
                'categoriaId' => $prod->getCategoria()->getId(),
                'alergenos' => array_map(fn($a) => strtolower($a->getNombre()), $prod->getAlergenos()->toArray()),
                'destacado' => $prod->isDestacado(),
                'vegetariano' => $prod->isVegetariano(),
            ];
        }, $productosEntities);

        // Serializar idiomas disponibles
        $idiomas = array_map(function($idioma) {
            return [
                'codigo' => $idioma->getCodigo(),
                'nombre' => $idioma->getNombre(),
                'bandera' => $idioma->getBandera(),
            ];
        }, $idiomasDisponibles);

        // Lista de alérgenos para el filtro
        $alergenos = ['gluten', 'huevo', 'lactosa', 'frutos secos', 'marisco', 'pescado', 'soja'];

        return $this->render('mesa/menu.html.twig', [
            'mesa' => [
                'id' => $mesa->getId(),
                'numero' => $mesa->getNumero(),
                'tokenQr' => $mesa->getTokenQr(),
            ],
            'categorias' => $categorias,
            'productos' => $productos,
            'alergenos' => $alergenos,
            'idiomas' => $idiomas,
            'idiomaActual' => [
                'codigo' => $idioma->getCodigo(),
                'nombre' => $idioma->getNombre(),
                'bandera' => $idioma->getBandera(),
            ],
        ]);
    }

    #[Route('/api/idiomas', name: 'api_idiomas', methods: ['GET'])]
    public function getIdiomas(): JsonResponse
    {
        $idiomas = $this->idiomaRepository->findAllActivos();
        
        $data = array_map(function($idioma) {
            return [
                'codigo' => $idioma->getCodigo(),
                'nombre' => $idioma->getNombre(),
                'bandera' => $idioma->getBandera(),
            ];
        }, $idiomas);

        return $this->json($data);
    }

    #[Route('/pedido/mesa/{identificador}', name: 'pedido_mesa')]
    public function pedidoMesa(string $identificador): Response
    {
        // Redirect to new route
        return $this->redirectToRoute('menu_mesa', ['token' => $identificador]);
    }
}
