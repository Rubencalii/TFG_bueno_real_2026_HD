<?php

namespace App\Controller;

use App\Repository\MesaRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class MesaController extends AbstractController
{
    #[Route('/mesa/{token}', name: 'menu_mesa')]
    public function menuMesa(string $token, MesaRepository $mesaRepository): Response
    {
        $mesa = $mesaRepository->findOneBy(['tokenQr' => $token, 'activa' => true]);
        
        if (!$mesa) {
            throw $this->createNotFoundException('Mesa no encontrada o no activa');
        }

        // Mock data for now - will connect to real products later
        $categorias = [
            ['id' => 1, 'nombre' => 'Entrantes'],
            ['id' => 2, 'nombre' => 'Pizzas'],
            ['id' => 3, 'nombre' => 'Pastas'],
            ['id' => 4, 'nombre' => 'Bebidas'],
            ['id' => 5, 'nombre' => 'Postres'],
        ];

        $productos = [
            [
                'id' => 1,
                'nombre' => 'Pepperoni Especial',
                'descripcion' => 'Salsa de tomate italiano, mozzarella fundida, salami pepperoni picante y orégano fresco.',
                'precio' => '14.50',
                'imagen' => 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
                'categoriaId' => 2,
                'alergenos' => ['gluten', 'lactosa'],
                'destacado' => true,
            ],
            [
                'id' => 2,
                'nombre' => 'Margherita Clásica',
                'descripcion' => 'Mozzarella de búfala, tomates San Marzano, aceite de oliva virgen extra y albahaca fresca.',
                'precio' => '12.00',
                'imagen' => 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
                'categoriaId' => 2,
                'alergenos' => ['lactosa'],
                'vegetariano' => true,
            ],
            [
                'id' => 3,
                'nombre' => 'Cuatro Quesos',
                'descripcion' => 'Mozzarella, gorgonzola, parmesano y provolone. Una delicia para los amantes del queso.',
                'precio' => '15.50',
                'imagen' => 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
                'categoriaId' => 2,
                'alergenos' => ['lactosa'],
            ],
            [
                'id' => 4,
                'nombre' => 'Spaghetti Carbonara',
                'descripcion' => 'Receta tradicional con guanciale, pecorino romano, yema de huevo y pimienta negra.',
                'precio' => '13.00',
                'imagen' => 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400',
                'categoriaId' => 3,
                'alergenos' => ['gluten', 'huevo'],
            ],
            [
                'id' => 5,
                'nombre' => 'Penne Bolognese',
                'descripcion' => 'Ragú de ternera cocinado a fuego lento con hierbas italianas y toque de parmesano.',
                'precio' => '12.50',
                'imagen' => 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400',
                'categoriaId' => 3,
                'alergenos' => ['gluten'],
            ],
            [
                'id' => 6,
                'nombre' => 'Coca-Cola',
                'descripcion' => 'Refresco clásico 330ml',
                'precio' => '2.50',
                'imagen' => 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
                'categoriaId' => 4,
                'alergenos' => [],
            ],
            [
                'id' => 7,
                'nombre' => 'Tiramisú',
                'descripcion' => 'Postre italiano con mascarpone, bizcocho, café y cacao.',
                'precio' => '6.00',
                'imagen' => 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
                'categoriaId' => 5,
                'alergenos' => ['huevo', 'lactosa', 'gluten'],
            ],
        ];

        $alergenos = ['gluten', 'huevo', 'lactosa', 'vegano'];

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
