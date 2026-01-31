<?php

namespace App\Controller;

use App\Entity\Producto;
use App\Entity\Categoria;
use App\Entity\Mesa;
use App\Entity\User;
use App\Repository\PedidoRepository;
use App\Repository\ProductoRepository;
use App\Repository\CategoriaRepository;
use App\Repository\MesaRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin')]
class AdminController extends AbstractController
{
    public function __construct(
        private PedidoRepository $pedidoRepository,
        private ProductoRepository $productoRepository,
        private CategoriaRepository $categoriaRepository,
        private MesaRepository $mesaRepository,
        private UserRepository $userRepository,
        private EntityManagerInterface $entityManager,
        private \App\Service\AuditLogService $auditLogService
    ) {}

    #[Route('/', name: 'admin_panel')]
    public function index(): Response
    {
        return $this->render('admin/panel.html.twig');
    }

    #[Route('/api/ventas', name: 'admin_api_ventas', methods: ['GET'])]
    public function getVentas(Request $request): JsonResponse
    {
        $desdeStr = $request->query->get('desde');
        $hastaStr = $request->query->get('hasta');

        if ($desdeStr && $hastaStr) {
            $inicio = new \DateTime($desdeStr . ' 00:00:00');
            $fin = new \DateTime($hastaStr . ' 23:59:59');
        } else {
            $inicio = new \DateTime('today');
            $fin = new \DateTime('tomorrow');
        }

        $tickets = $this->pedidoRepository->findTicketsRange($inicio, $fin);
        $resumen = $this->pedidoRepository->getResumenVentasRange($inicio, $fin);

        $data = [
            'tickets' => array_map(function(\App\Entity\Pedido $p) {
                return [
                    'id' => $p->getId(),
                    'factura' => $p->getNumeroFactura() ?? ('T-' . str_pad($p->getId(), 6, '0', STR_PAD_LEFT)),
                    'mesa' => $p->getMesa()->getNumero(),
                    'metodo' => $p->getMetodoPago() ?? '-',
                    'estado' => $p->getEstadoPago(),
                    'base' => $p->getBaseImponible(),
                    'iva' => $p->getIva(),
                    'total' => $p->getTotalCalculado(),
                    'anulado' => $p->isAnulado(),
                    'hora' => $p->getCreatedAt()->format('H:i:s')
                ];
            }, $tickets),
            'resumen' => $resumen,
            'fecha' => $inicio->format('d/m/Y') . ($desdeStr ? ' al ' . $fin->format('d/m/Y') : ''),
            'actualizacion' => (new \DateTime())->format('H:i:s')
        ];

        return new JsonResponse($data);
    }

    // --- API CARTA (PRODUCTOS & CATEGORÍAS) ---

    #[Route('/api/carta', name: 'admin_api_carta', methods: ['GET'])]
    public function getCarta(): JsonResponse
    {
        $categorias = $this->categoriaRepository->findBy([], ['orden' => 'ASC']);
        
        $data = array_map(function(Categoria $cat) {
            return [
                'id' => $cat->getId(),
                'nombre' => $cat->getNombre(),
                'tipo' => $cat->getTipo(),
                'activa' => $cat->isActiva(),
                'productos' => array_map(function(Producto $prod) {
                    return [
                        'id' => $prod->getId(),
                        'nombre' => $prod->getNombre(),
                        'nombreEn' => $prod->getNombreEn(),
                        'descripcionEn' => $prod->getDescripcionEn(),
                        'precio' => $prod->getPrecio(),
                        'activo' => $prod->isActivo(),
                        'imagen' => $prod->getImagen(),
                        'destacado' => $prod->isDestacado()
                    ];
                }, $cat->getProductos()->toArray())
            ];
        }, $categorias);

        return new JsonResponse($data);
    }

    #[Route('/api/categoria/{id}/toggle', name: 'admin_api_categoria_toggle', methods: ['PATCH'])]
    public function toggleCategoria(Categoria $cat): JsonResponse
    {
        $cat->setActiva(!$cat->isActiva());
        $this->entityManager->flush();
        
        $this->auditLogService->log(
            'CATEGORIA_TOGGLE', 
            sprintf('Categoría "%s" (ID: %d) cambiada a %s', $cat->getNombre(), $cat->getId(), $cat->isActiva() ? 'ACTIVA' : 'INACTIVA')
        );

        return new JsonResponse(['success' => true, 'activa' => $cat->isActiva()]);
    }

    #[Route('/api/producto/{id}/toggle', name: 'admin_api_producto_toggle', methods: ['PATCH'])]
    public function toggleProducto(Producto $prod): JsonResponse
    {
        $prod->setActivo(!$prod->isActivo());
        $this->entityManager->flush();

        $this->auditLogService->log(
            'PRODUCTO_TOGGLE', 
            sprintf('Producto "%s" (ID: %d) cambiado a %s', $prod->getNombre(), $prod->getId(), $prod->isActivo() ? 'ACTIVO' : 'INACTIVO')
        );

        return new JsonResponse(['success' => true, 'activo' => $prod->isActivo()]);
    }

    #[Route('/api/producto/{id}', name: 'admin_api_producto_update', methods: ['PUT'])]
    public function updateProducto(Producto $prod, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (isset($data['nombre'])) $prod->setNombre($data['nombre']);
        if (isset($data['descripcion'])) $prod->setDescripcion($data['descripcion']);
        if (isset($data['precio'])) $prod->setPrecio($data['precio']);
        if (isset($data['imagen'])) $prod->setImagen($data['imagen']);
        if (isset($data['categoriaId'])) {
            $cat = $this->categoriaRepository->find($data['categoriaId']);
            if ($cat) $prod->setCategoria($cat);
        }

        $this->entityManager->flush();

        $this->auditLogService->log(
            'PRODUCTO_UPDATE', 
            sprintf('Producto "%s" (ID: %d) actualizado', $prod->getNombre(), $prod->getId())
        );

        return new JsonResponse(['success' => true]);
    }

    #[Route('/api/producto', name: 'admin_api_producto_create', methods: ['POST'])]
    public function createProducto(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        $prod = new Producto();
        $prod->setNombre($data['nombre'] ?? 'Nuevo Producto');
        $prod->setDescripcion($data['descripcion'] ?? '');
        $prod->setPrecio($data['precio'] ?? '0.00');
        $prod->setImagen($data['imagen'] ?? null);
        $prod->setActivo(true);
        
        if (isset($data['categoriaId'])) {
            $cat = $this->categoriaRepository->find($data['categoriaId']);
            if ($cat) $prod->setCategoria($cat);
        }

        $this->entityManager->persist($prod);
        $this->entityManager->flush();

        $this->auditLogService->log(
            'PRODUCTO_CREATE', 
            sprintf('Nuevo producto creado: "%s" (ID: %d)', $prod->getNombre(), $prod->getId())
        );

        return new JsonResponse(['success' => true, 'id' => $prod->getId()]);
    }

    #[Route('/api/producto/{id}', name: 'admin_api_producto_delete', methods: ['DELETE'])]
    public function deleteProducto(Producto $prod): JsonResponse
    {
        $nombre = $prod->getNombre();
        $id = $prod->getId();
        
        $this->entityManager->remove($prod);
        $this->entityManager->flush();

        $this->auditLogService->log(
            'PRODUCTO_DELETE', 
            sprintf('Producto eliminado: "%s" (ID: %d)', $nombre, $id)
        );

        return new JsonResponse(['success' => true]);
    }

    #[Route('/api/categoria', name: 'admin_api_categoria_create', methods: ['POST'])]
    public function createCategoria(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        $cat = new Categoria();
        $cat->setNombre($data['nombre'] ?? 'Nueva Categoría');
        $cat->setActiva(true);
        $cat->setOrden(count($this->categoriaRepository->findAll()) + 1);

        $this->entityManager->persist($cat);
        $this->entityManager->flush();

        $this->auditLogService->log(
            'CATEGORIA_CREATE', 
            sprintf('Nueva categoría creada: "%s" (ID: %d)', $cat->getNombre(), $cat->getId())
        );

        return new JsonResponse(['success' => true, 'id' => $cat->getId()]);
    }

    #[Route('/api/categoria/{id}', name: 'admin_api_categoria_delete', methods: ['DELETE'])]
    public function deleteCategoria(Categoria $cat): JsonResponse
    {
        if (!$cat->getProductos()->isEmpty()) {
            return new JsonResponse(['success' => false, 'message' => 'No se puede eliminar una categoría que contiene productos.'], 400);
        }

        $nombre = $cat->getNombre();
        $id = $cat->getId();
        
        $this->entityManager->remove($cat);
        $this->entityManager->flush();

        $this->auditLogService->log(
            'CATEGORIA_DELETE', 
            sprintf('Categoría eliminada: "%s" (ID: %d)', $nombre, $id)
        );

        return new JsonResponse(['success' => true]);
    }

    #[Route('/api/auto-translate', name: 'admin_api_auto_translate', methods: ['GET'])]
    public function autoTranslate(): JsonResponse
    {
        $productos = $this->entityManager->getRepository(Producto::class)->findAll();
        $map = [
            'Carne en Salsa' => ['Meat in Sauce', 'Delicious meat stewed in homemade sauce.'],
            'Croquetas Caseras' => ['Homemade Croquettes', 'Traditional croquettes made in-house.'],
            'Croquetas de Coliflor y Chocolate Blanco' => ['Cauliflower & White Chocolate Croquettes', 'Our specialty: cauliflower croquettes with a hint of white chocolate.'],
            'Solomillo Trinchado' => ['Grilled Sirloin Steak', 'Sliced beef sirloin steak grilled to perfection.'],
            'Secreto Trinchado' => ['Grilled Iberian Secret', 'Sliced Iberian secret pork grilled to perfection.'],
            'Lomo con Ajos' => ['Pork Loin with Garlic', 'Pork loin with golden brown garlic.'],
            'Huevos Rotos con Patatas y Jamón' => ['Broken Eggs with Fries and Ham', 'Broken eggs over french fries with Spanish ham.'],
            'Cazón' => ['Marinated Dogfish', 'Andalusian style fried marinated dogfish.'],
            'Calamares' => ['Fried Squid', 'Romanian style fried squid.'],
            'Fritura de Pescado' => ['Assorted Fried Fish', 'Assorted fried fish: anchovies, squid, shrimp and more.'],
            'Combo Carne Kebab con Patatas' => ['Kebab Meat Combo with Fries', 'Kebab meat served with french fries.'],
            'Combo Carne en Salsa con Patatas' => ['Meat in Sauce Combo with Fries', 'Meat in homemade sauce served with french fries.'],
            'Combo Nuggets con Patatas' => ['Chicken Nuggets Combo with Fries', 'Chicken nuggets served with french fries.'],
            'Pizza York y Queso' => ['Ham and Cheese Pizza', 'Ham, cheese, mozzarella and oregano.'],
            'Pizza Barbacoa' => ['BBQ Pizza', 'Minced meat, bacon and BBQ sauce.'],
            'Pizza 4 Quesos' => ['4 Cheese Pizza', 'Assorted cheeses including Roquefort and oregano.'],
            'Pizza Kebab' => ['Kebab Pizza', 'Kebab meat, mozzarella, oregano, onion and kebab sauce.'],
            'Pizza Atún' => ['Tuna Pizza', 'Mozzarella, oregano, green pepper and tuna.'],
            'Pizza Carbonara' => ['Carbonara Pizza', 'Mozzarella, oregano, bacon, onion, mushrooms and cream.'],
            'Pizza Vegetal' => ['Veggie Pizza', 'Mozzarella, oregano, peppers, onion, corn, asparagus and mushrooms.'],
            'Pizza Hamburguesa' => ['Cheeseburger Pizza', 'Tomato, cheese, mini burger and burger sauce.'],
            'Bocata XXL' => ['XXL Sandwich', 'Pork loin, cheese, egg, bacon, tomato and lettuce.'],
            'Bocadillo Normal' => ['Regular Sandwich', 'Choice of: pork loin, meat in sauce, omelet, ham or tuna.'],
            'Bocadillo Completo' => ['Deluxe Sandwich', 'Choice of: pork loin, meat in sauce, omelet, ham or tuna. With extras.'],
            'Sándwich Mixto' => ['Ham and Cheese Sandwich', 'Ham and cheese toasted sandwich.'],
            'Sándwich Completo' => ['Deluxe Sandwich (Toasted)', 'Ham, cheese, egg, tomato and lettuce.'],
            'Sándwich Vegetal' => ['Veggie Sandwich', 'Lettuce, tomato, egg, asparagus and tuna.'],
            'Kebab' => ['Kebab', 'Tomato, lettuce, egg, cheese, kebab meat and kebab sauce.'],
            'Hamburguesa Normal' => ['Regular Burger', 'Beef, tomato, cheese and lettuce.'],
            'Hamburguesa Completa' => ['Deluxe Burger', 'Beef, tomato, cheese, lettuce, egg and bacon.'],
            'Hamburguesa Casa Encarni' => ['Casa Encarni Special Burger', '180g beef, caramelized onion, cheddar cheese, bacon, egg and cheddar sauce.'],
            'Coca-Cola' => ['Coke', '330ml soft drink.'],
            'Fanta Naranja' => ['Orange Fanta', '330ml orange soft drink.'],
            'Agua Mineral' => ['Mineral Water', '500ml natural mineral water.'],
            'Cerveza' => ['Beer', 'Draft or bottled beer.'],
            'Tinto de Verano' => ['Red Wine Spritzer', 'Red wine mixed with lemon soda.'],
            'Café' => ['Coffee', 'Black, macchiato or white coffee.'],
        ];

        foreach ($productos as $producto) {
            foreach ($map as $es => $enData) {
                if (str_contains(strtolower($producto->getNombre()), strtolower($es)) || str_contains(strtolower($es), strtolower($producto->getNombre()))) {
                    $producto->setNombreEn($enData[0]);
                    $producto->setDescripcionEn($enData[1]);
                    break;
                }
            }
        }

        $this->entityManager->flush();

        return new JsonResponse(['success' => true, 'message' => 'Traducciones aplicadas correctamente']);
    }

    // --- API MESAS ---

    #[Route('/api/mesas', name: 'admin_api_mesas', methods: ['GET'])]
    public function getMesas(): JsonResponse
    {
        $mesas = $this->mesaRepository->findAll();
        $data = array_map(function(Mesa $m) {
            return [
                'id' => $m->getId(),
                'numero' => $m->getNumero(),
                'token' => $m->getTokenQr(),
                'activa' => $m->isActiva(),
                'llamando' => $m->isLlamaCamarero(),
                'pideCuenta' => $m->isPideCuenta()
            ];
        }, $mesas);

        return new JsonResponse($data);
    }

    // --- API EQUIPO (USERS) ---

    #[Route('/api/equipo', name: 'admin_api_equipo', methods: ['GET'])]
    public function getEquipo(): JsonResponse
    {
        $users = $this->userRepository->findAll();
        $data = array_map(function(User $u) {
            return [
                'id' => $u->getId(),
                'email' => $u->getEmail(),
                'rol' => $u->getRol()
            ];
        }, $users);

        return new JsonResponse($data);
    }

    // --- API ANALYTICS ---

    #[Route('/api/analytics', name: 'admin_api_analytics', methods: ['GET'])]
    public function getAnalytics(): JsonResponse
    {
        return new JsonResponse([
            'topProductos' => $this->pedidoRepository->getTopProductos(),
            'ventasPorHora' => $this->pedidoRepository->getVentasPorHora(),
            'ventasSemanales' => $this->pedidoRepository->getVentasUltimos7Dias(),
            'resumenHoy' => $this->pedidoRepository->getResumenVentasHoy()
        ]);
    }
}
