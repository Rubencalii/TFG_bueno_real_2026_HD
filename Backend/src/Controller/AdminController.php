<?php

namespace App\Controller;

use App\Entity\Producto;
use App\Entity\Categoria;
use App\Entity\Ticket;
use App\Repository\ProductoRepository;
use App\Repository\CategoriaRepository;
use App\Repository\MesaRepository;
use App\Repository\PedidoRepository;
use App\Repository\TicketRepository;
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
        private ProductoRepository $productoRepository,
        private CategoriaRepository $categoriaRepository,
        private MesaRepository $mesaRepository,
        private PedidoRepository $pedidoRepository,
        private TicketRepository $ticketRepository,
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('/', name: 'admin_panel')]
    public function index(): Response
    {
        $productos = $this->productoRepository->findAll();
        $categorias = $this->categoriaRepository->findAll();
        $mesas = $this->mesaRepository->findAll();

        // Serializar productos
        $productosData = array_map(function(Producto $p) {
            return [
                'id' => $p->getId(),
                'nombre' => $p->getNombre(),
                'descripcion' => $p->getDescripcion(),
                'precio' => $p->getPrecio(),
                'imagen' => $p->getImagen(),
                'activo' => $p->isActivo(),
                'destacado' => $p->isDestacado(),
                'categoriaId' => $p->getCategoria()?->getId(),
                'categoriaNombre' => $p->getCategoria()?->getNombre(),
            ];
        }, $productos);

        // Serializar categorías
        $categoriasData = array_map(function(Categoria $c) {
            return [
                'id' => $c->getId(),
                'nombre' => $c->getNombre(),
                'tipo' => $c->getTipo(),
                'activa' => $c->isActiva(),
                'orden' => $c->getOrden(),
            ];
        }, $categorias);

        // Serializar mesas
        $mesasData = array_map(function($m) {
            $pedidosActivos = $this->pedidoRepository->findActivosByMesa($m);
            $total = 0;
            foreach ($pedidosActivos as $pedido) {
                foreach ($pedido->getDetalles() as $detalle) {
                    $total += (float)$detalle->getPrecioUnitario() * $detalle->getCantidad();
                }
            }
            return [
                'id' => $m->getId(),
                'numero' => $m->getNumero(),
                'tokenQr' => $m->getTokenQr(),
                'activa' => $m->isActiva(),
                'ocupada' => count($pedidosActivos) > 0,
                'llamaCamarero' => $m->isLlamaCamarero(),
                'pideCuenta' => $m->isPideCuenta(),
                'total' => $total,
            ];
        }, $mesas);

        // Obtener tickets de hoy y resumen de caja
        $ticketsHoy = $this->ticketRepository->findHoy();
        $resumenCaja = $this->ticketRepository->getResumenCajaHoy();

        // Serializar tickets
        $ticketsData = array_map(function(Ticket $t) {
            return [
                'id' => $t->getId(),
                'numero' => $t->getNumero(),
                'mesa' => $t->getMesa()->getNumero(),
                'mesaId' => $t->getMesa()->getId(),
                'baseImponible' => $t->getBaseImponible(),
                'iva' => $t->getIva(),
                'total' => $t->getTotal(),
                'metodoPago' => $t->getMetodoPago(),
                'estado' => $t->getEstado(),
                'createdAt' => $t->getCreatedAt()->format('H:i'),
                'fecha' => $t->getCreatedAt()->format('d/m/Y'),
                'paidAt' => $t->getPaidAt()?->format('H:i'),
                'ticketRectificadoId' => $t->getTicketRectificadoId(),
            ];
        }, $ticketsHoy);

        return $this->render('admin/panel.html.twig', [
            'productos' => $productosData,
            'categorias' => $categoriasData,
            'mesas' => $mesasData,
            'tickets' => $ticketsData,
            'resumenCaja' => $resumenCaja,
        ]);
    }

    // ============ API PRODUCTOS ============

    #[Route('/api/producto', name: 'admin_api_crear_producto', methods: ['POST'])]
    public function crearProducto(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $categoria = $this->categoriaRepository->find($data['categoriaId'] ?? 0);
        if (!$categoria) {
            return $this->json(['error' => 'Categoría no encontrada'], 400);
        }

        $producto = new Producto();
        $producto->setNombre($data['nombre'] ?? '');
        $producto->setDescripcion($data['descripcion'] ?? '');
        $producto->setPrecio($data['precio'] ?? '0.00');
        $producto->setImagen($data['imagen'] ?? null);
        $producto->setActivo($data['activo'] ?? true);
        $producto->setDestacado($data['destacado'] ?? false);
        $producto->setCategoria($categoria);

        $this->entityManager->persist($producto);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'id' => $producto->getId(),
            'mensaje' => 'Producto creado correctamente'
        ]);
    }

    #[Route('/api/producto/{id}', name: 'admin_api_editar_producto', methods: ['PUT'])]
    public function editarProducto(int $id, Request $request): JsonResponse
    {
        $producto = $this->productoRepository->find($id);
        if (!$producto) {
            return $this->json(['error' => 'Producto no encontrado'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['nombre'])) $producto->setNombre($data['nombre']);
        if (isset($data['descripcion'])) $producto->setDescripcion($data['descripcion']);
        if (isset($data['precio'])) $producto->setPrecio($data['precio']);
        if (isset($data['imagen'])) $producto->setImagen($data['imagen']);
        if (isset($data['activo'])) $producto->setActivo($data['activo']);
        if (isset($data['destacado'])) $producto->setDestacado($data['destacado']);
        
        if (isset($data['categoriaId'])) {
            $categoria = $this->categoriaRepository->find($data['categoriaId']);
            if ($categoria) $producto->setCategoria($categoria);
        }

        $this->entityManager->flush();

        return $this->json(['success' => true, 'mensaje' => 'Producto actualizado']);
    }

    #[Route('/api/producto/{id}', name: 'admin_api_eliminar_producto', methods: ['DELETE'])]
    public function eliminarProducto(int $id): JsonResponse
    {
        $producto = $this->productoRepository->find($id);
        if (!$producto) {
            return $this->json(['error' => 'Producto no encontrado'], 404);
        }

        $this->entityManager->remove($producto);
        $this->entityManager->flush();

        return $this->json(['success' => true, 'mensaje' => 'Producto eliminado']);
    }

    // ============ API CATEGORÍAS ============

    #[Route('/api/categoria', name: 'admin_api_crear_categoria', methods: ['POST'])]
    public function crearCategoria(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $categoria = new Categoria();
        $categoria->setNombre($data['nombre'] ?? '');
        $categoria->setTipo($data['tipo'] ?? 'cocina');
        $categoria->setActiva($data['activa'] ?? true);
        $categoria->setOrden($data['orden'] ?? 0);

        $this->entityManager->persist($categoria);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'id' => $categoria->getId(),
            'mensaje' => 'Categoría creada correctamente'
        ]);
    }

    #[Route('/api/categoria/{id}', name: 'admin_api_editar_categoria', methods: ['PUT'])]
    public function editarCategoria(int $id, Request $request): JsonResponse
    {
        $categoria = $this->categoriaRepository->find($id);
        if (!$categoria) {
            return $this->json(['error' => 'Categoría no encontrada'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['nombre'])) $categoria->setNombre($data['nombre']);
        if (isset($data['tipo'])) $categoria->setTipo($data['tipo']);
        if (isset($data['activa'])) $categoria->setActiva($data['activa']);
        if (isset($data['orden'])) $categoria->setOrden($data['orden']);

        $this->entityManager->flush();

        return $this->json(['success' => true, 'mensaje' => 'Categoría actualizada']);
    }

    #[Route('/api/categoria/{id}', name: 'admin_api_eliminar_categoria', methods: ['DELETE'])]
    public function eliminarCategoria(int $id): JsonResponse
    {
        $categoria = $this->categoriaRepository->find($id);
        if (!$categoria) {
            return $this->json(['error' => 'Categoría no encontrada'], 404);
        }

        // Verificar que no tenga productos asociados
        if ($categoria->getProductos()->count() > 0) {
            return $this->json(['error' => 'No se puede eliminar: tiene productos asociados'], 400);
        }

        $this->entityManager->remove($categoria);
        $this->entityManager->flush();

        return $this->json(['success' => true, 'mensaje' => 'Categoría eliminada']);
    }

    // ============ API MESAS ============

    #[Route('/api/mesa/{id}/toggle', name: 'admin_api_toggle_mesa', methods: ['POST'])]
    public function toggleMesa(int $id): JsonResponse
    {
        $mesa = $this->mesaRepository->find($id);
        if (!$mesa) {
            return $this->json(['error' => 'Mesa no encontrada'], 404);
        }

        $mesa->setActiva(!$mesa->isActiva());
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'activa' => $mesa->isActiva(),
            'mensaje' => $mesa->isActiva() ? 'Mesa activada' : 'Mesa desactivada'
        ]);
    }

    // ============ API TICKETS / FACTURACIÓN ============

    #[Route('/api/ticket', name: 'admin_api_crear_ticket', methods: ['POST'])]
    public function crearTicket(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $mesa = $this->mesaRepository->find($data['mesaId'] ?? 0);
        if (!$mesa) {
            return $this->json(['error' => 'Mesa no encontrada'], 400);
        }

        // Calcular total de la mesa
        $totalMesa = $this->pedidoRepository->calcularTotalMesa($mesa);
        if ((float)$totalMesa <= 0) {
            return $this->json(['error' => 'La mesa no tiene pedidos activos'], 400);
        }

        // Generar número correlativo
        $ultimoId = $this->ticketRepository->getUltimoIdDelAño();
        $numero = Ticket::generarNumero($ultimoId);

        // Crear ticket
        $ticket = new Ticket();
        $ticket->setNumero($numero);
        $ticket->setMesa($mesa);
        $ticket->setMetodoPago($data['metodoPago'] ?? Ticket::METODO_EFECTIVO);
        $ticket->setEstado(Ticket::ESTADO_PENDIENTE);
        $ticket->calcularDesgloseIVA($totalMesa);

        // Guardar detalle de pedidos
        $pedidos = $this->pedidoRepository->findActivosByMesa($mesa);
        $detalles = [];
        foreach ($pedidos as $pedido) {
            foreach ($pedido->getDetalles() as $d) {
                $detalles[] = [
                    'producto' => $d->getProducto()->getNombre(),
                    'cantidad' => $d->getCantidad(),
                    'precio' => $d->getPrecioUnitario(),
                    'notas' => $d->getNotas(),
                ];
            }
        }
        $ticket->setDetalleJson(json_encode($detalles));

        $this->entityManager->persist($ticket);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'id' => $ticket->getId(),
            'numero' => $ticket->getNumero(),
            'total' => $ticket->getTotal(),
            'mensaje' => 'Ticket creado correctamente'
        ]);
    }

    #[Route('/api/ticket/{id}/cobrar', name: 'admin_api_cobrar_ticket', methods: ['POST'])]
    public function cobrarTicket(int $id, Request $request): JsonResponse
    {
        $ticket = $this->ticketRepository->find($id);
        if (!$ticket) {
            return $this->json(['error' => 'Ticket no encontrado'], 404);
        }

        if ($ticket->getEstado() !== Ticket::ESTADO_PENDIENTE) {
            return $this->json(['error' => 'El ticket ya fue procesado'], 400);
        }

        $data = json_decode($request->getContent(), true);
        
        if (isset($data['metodoPago'])) {
            $ticket->setMetodoPago($data['metodoPago']);
        }

        $ticket->setEstado(Ticket::ESTADO_PAGADO);
        $ticket->setPaidAt(new \DateTime());

        // Cerrar mesa: marcar pedidos como entregados
        $mesa = $ticket->getMesa();
        $pedidos = $this->pedidoRepository->findActivosByMesa($mesa);
        foreach ($pedidos as $pedido) {
            $pedido->setEstado('entregado');
        }
        $mesa->setLlamaCamarero(false);
        $mesa->setPideCuenta(false);

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'mensaje' => 'Ticket cobrado correctamente',
            'paidAt' => $ticket->getPaidAt()->format('H:i')
        ]);
    }

    #[Route('/api/ticket/{id}/anular', name: 'admin_api_anular_ticket', methods: ['POST'])]
    public function anularTicket(int $id): JsonResponse
    {
        $ticket = $this->ticketRepository->find($id);
        if (!$ticket) {
            return $this->json(['error' => 'Ticket no encontrado'], 404);
        }

        if ($ticket->getEstado() === Ticket::ESTADO_ANULADO) {
            return $this->json(['error' => 'El ticket ya está anulado'], 400);
        }

        // Si estaba pagado, crear ticket rectificativo
        if ($ticket->getEstado() === Ticket::ESTADO_PAGADO) {
            $ultimoId = $this->ticketRepository->getUltimoIdDelAño();
            $numero = Ticket::generarNumero($ultimoId);

            $rectificativo = new Ticket();
            $rectificativo->setNumero($numero);
            $rectificativo->setMesa($ticket->getMesa());
            $rectificativo->setMetodoPago($ticket->getMetodoPago());
            $rectificativo->setEstado(Ticket::ESTADO_ANULADO);
            $rectificativo->setBaseImponible('-' . $ticket->getBaseImponible());
            $rectificativo->setIva('-' . $ticket->getIva());
            $rectificativo->setTotal('-' . $ticket->getTotal());
            $rectificativo->setTicketRectificadoId($ticket->getId());
            $rectificativo->setDetalleJson($ticket->getDetalleJson());

            $this->entityManager->persist($rectificativo);
        }

        $ticket->setEstado(Ticket::ESTADO_ANULADO);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'mensaje' => 'Ticket anulado correctamente'
        ]);
    }

    #[Route('/api/ticket/{id}', name: 'admin_api_ver_ticket', methods: ['GET'])]
    public function verTicket(int $id): JsonResponse
    {
        $ticket = $this->ticketRepository->find($id);
        if (!$ticket) {
            return $this->json(['error' => 'Ticket no encontrado'], 404);
        }

        return $this->json([
            'id' => $ticket->getId(),
            'numero' => $ticket->getNumero(),
            'mesa' => $ticket->getMesa()->getNumero(),
            'baseImponible' => $ticket->getBaseImponible(),
            'iva' => $ticket->getIva(),
            'total' => $ticket->getTotal(),
            'metodoPago' => $ticket->getMetodoPago(),
            'estado' => $ticket->getEstado(),
            'createdAt' => $ticket->getCreatedAt()->format('d/m/Y H:i'),
            'paidAt' => $ticket->getPaidAt()?->format('d/m/Y H:i'),
            'detalles' => json_decode($ticket->getDetalleJson() ?? '[]', true),
            'ticketRectificadoId' => $ticket->getTicketRectificadoId(),
        ]);
    }

    #[Route('/api/tickets/resumen', name: 'admin_api_resumen_caja', methods: ['GET'])]
    public function resumenCaja(): JsonResponse
    {
        $resumen = $this->ticketRepository->getResumenCajaHoy();
        $tickets = $this->ticketRepository->findHoy();

        $ticketsData = array_map(function(Ticket $t) {
            return [
                'id' => $t->getId(),
                'numero' => $t->getNumero(),
                'mesa' => $t->getMesa()->getNumero(),
                'total' => $t->getTotal(),
                'metodoPago' => $t->getMetodoPago(),
                'estado' => $t->getEstado(),
                'createdAt' => $t->getCreatedAt()->format('H:i'),
            ];
        }, $tickets);

        return $this->json([
            'resumen' => $resumen,
            'tickets' => $ticketsData,
        ]);
    }
}
