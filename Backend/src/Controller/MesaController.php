<?php

namespace App\Controller;

use App\Repository\MesaRepository;
use App\Repository\CategoriaRepository;
use App\Repository\ProductoRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class MesaController extends AbstractController
{
    public function __construct(
        private MesaRepository $mesaRepository,
        private CategoriaRepository $categoriaRepository,
        private ProductoRepository $productoRepository
    ) {}

    #[Route('/mesa/{token}', name: 'menu_mesa')]
    public function menuMesa(string $token): Response
    {
        $mesa = $this->mesaRepository->findOneBy(['tokenQr' => $token, 'activa' => true]);
        
        if (!$mesa) {
            throw $this->createNotFoundException('Mesa no encontrada o no activa');
        }

        // Obtener categorías activas ordenadas
        $categoriasEntities = $this->categoriaRepository->findAllActivas();
        
        // Obtener productos activos
        $productosEntities = $this->productoRepository->findActivos();

        // Serializar categorías para React
        $categorias = array_map(function($cat) {
            return [
                'id' => $cat->getId(),
                'nombre' => $cat->getNombre(),
            ];
        }, $categoriasEntities);

        // Serializar productos para React
        $productos = array_map(function($prod) {
            return [
                'id' => $prod->getId(),
                'nombre' => $prod->getNombre(),
                'descripcion' => $prod->getDescripcion(),
                'precio' => $prod->getPrecio(),
                'imagen' => $prod->getImagen(),
                'categoriaId' => $prod->getCategoria()->getId(),
                'alergenos' => array_map(fn($a) => strtolower($a->getNombre()), $prod->getAlergenos()->toArray()),
                'destacado' => $prod->isDestacado(),
                'vegetariano' => $prod->isVegetariano(),
            ];
        }, $productosEntities);

        // Lista de alérgenos para el filtro
        $alergenos = ['gluten', 'huevo', 'lactosa', 'frutos secos', 'marisco', 'pescado', 'soja'];

        return $this->render('mesa/menu.html.twig', [
            'mesa' => [
                'id' => $mesa->getId(),
                'numero' => $mesa->getNumero(),
                'token' => $mesa->getTokenQr(),
            ],
            'categorias' => $categorias,
            'productos' => $productos,
            'alergenos' => $alergenos,
        ]);
    }

    #[Route('/pedido/mesa/{identificador}', name: 'pedido_mesa')]
    public function pedidoMesa(string $identificador): Response
    {
        // Redirect to new route
        return $this->redirectToRoute('menu_mesa', ['token' => $identificador]);
    }
}
