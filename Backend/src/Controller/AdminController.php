<?php

namespace App\Controller;

use App\Entity\Producto;
use App\Entity\Categoria;
use App\Entity\Ticket;
use App\Entity\User;
use App\Entity\Alergeno;
use App\Entity\Mesa;
use App\Repository\ProductoRepository;
use App\Repository\CategoriaRepository;
use App\Repository\MesaRepository;
use App\Repository\PedidoRepository;
use App\Repository\TicketRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[Route('/admin')]
class AdminController extends AbstractController
{
    public function __construct(
        private ProductoRepository $productoRepository,
        private CategoriaRepository $categoriaRepository,
        private MesaRepository $mesaRepository,
        private PedidoRepository $pedidoRepository,
        private TicketRepository $ticketRepository,
        private UserRepository $userRepository,
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher
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
            // Para facturación: incluir TODOS los pedidos (también entregados)
            $pedidosFacturables = $this->pedidoRepository->findFacturablesByMesa($m);
            $total = 0;
            foreach ($pedidosFacturables as $pedido) {
                foreach ($pedido->getDetalles() as $detalle) {
                    $total += (float)$detalle->getPrecioUnitario() * $detalle->getCantidad();
                }
            }
            return [
                'id' => $m->getId(),
                'numero' => $m->getNumero(),
                'tokenQr' => $m->getTokenQr(),
                'activa' => $m->isActiva(),
                'ocupada' => count($pedidosFacturables) > 0,
                'llamaCamarero' => $m->isLlamaCamarero(),
                'pideCuenta' => $m->isPideCuenta(),
                'metodoPagoPreferido' => $m->getMetodoPagoPreferido(),
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

        // Usuarios
        $usuarios = $this->userRepository->findAll();
        $usuariosData = array_map(fn(User $u) => [
            'id' => $u->getId(),
            'email' => $u->getEmail(),
            'rol' => $u->getRol(),
        ], $usuarios);

        // Alérgenos
        $alergenos = $this->entityManager->getRepository(Alergeno::class)->findAll();
        $alergenosData = array_map(fn(Alergeno $a) => [
            'id' => $a->getId(),
            'nombre' => $a->getNombre(),
        ], $alergenos);

        // Pedidos activos
        $pedidosActivos = $this->pedidoRepository->findBy(
            ['estado' => ['pendiente', 'en_preparacion', 'listo']]
        );
        $pedidosData = [];
        foreach ($pedidosActivos as $pedido) {
            $detalles = [];
            foreach ($pedido->getDetalles() as $d) {
                $detalles[] = [
                    'producto' => $d->getProducto()->getNombre(),
                    'cantidad' => $d->getCantidad(),
                    'notas' => $d->getNotas(),
                ];
            }
            $pedidosData[] = [
                'id' => $pedido->getId(),
                'mesa' => $pedido->getMesa()->getNumero(),
                'estado' => $pedido->getEstado(),
                'createdAt' => $pedido->getCreatedAt()->format('H:i'),
                'minutosEspera' => $pedido->getMinutosEspera(),
                'colorSemaforo' => $pedido->getColorSemaforo(),
                'detalles' => $detalles,
            ];
        }

        // Notificaciones
        $notificaciones = [];
        foreach ($mesas as $mesa) {
            if ($mesa->isLlamaCamarero()) {
                $notificaciones[] = [
                    'tipo' => 'camarero',
                    'mensaje' => "Mesa {$mesa->getNumero()} llama al camarero",
                    'mesaId' => $mesa->getId(),
                    'prioridad' => 'alta',
                ];
            }
            if ($mesa->isPideCuenta()) {
                $notificaciones[] = [
                    'tipo' => 'cuenta',
                    'mensaje' => "Mesa {$mesa->getNumero()} pide la cuenta",
                    'mesaId' => $mesa->getId(),
                    'prioridad' => 'media',
                ];
            }
        }

        return $this->render('admin/panel.html.twig', [
            'productos' => $productosData,
            'categorias' => $categoriasData,
            'mesas' => $mesasData,
            'tickets' => $ticketsData,
            'resumenCaja' => $resumenCaja,
            'usuarios' => $usuariosData,
            'alergenos' => $alergenosData,
            'pedidosActivos' => $pedidosData,
            'notificaciones' => $notificaciones,
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

        // Calcular total de la mesa (incluye todos los pedidos, también entregados)
        $totalMesa = $this->pedidoRepository->calcularTotalMesa($mesa);
        if ((float)$totalMesa <= 0) {
            return $this->json(['error' => 'La mesa no tiene pedidos para facturar'], 400);
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

        // Guardar detalle de pedidos (TODOS los facturables)
        $pedidos = $this->pedidoRepository->findFacturablesByMesa($mesa);
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
        
        // Limpiar pedidos de la mesa y resetear flags
        $this->pedidoRepository->limpiarPedidosMesa($mesa);
        $mesa->setLlamaCamarero(false);
        $mesa->setPideCuenta(false);
        $mesa->setMetodoPagoPreferido(null);
        
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
        $mesa->setMetodoPagoPreferido(null);

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

    // ============ API REPORTES Y ESTADÍSTICAS ============

    #[Route('/api/reportes/ventas', name: 'admin_api_reportes_ventas', methods: ['GET'])]
    public function reporteVentas(Request $request): JsonResponse
    {
        $periodo = $request->query->get('periodo', 'semana'); // dia, semana, mes
        $datos = [];
        
        $fechaFin = new \DateTime('today');
        $fechaInicio = match($periodo) {
            'dia' => new \DateTime('today'),
            'semana' => (new \DateTime())->modify('-7 days'),
            'mes' => (new \DateTime())->modify('-30 days'),
            default => (new \DateTime())->modify('-7 days'),
        };

        // Ventas por día
        $tickets = $this->ticketRepository->findEntreFechas($fechaInicio, $fechaFin);
        $ventasPorDia = [];
        foreach ($tickets as $ticket) {
            if ($ticket->getEstado() === Ticket::ESTADO_PAGADO) {
                $dia = $ticket->getCreatedAt()->format('Y-m-d');
                if (!isset($ventasPorDia[$dia])) {
                    $ventasPorDia[$dia] = ['fecha' => $dia, 'total' => 0, 'count' => 0];
                }
                $ventasPorDia[$dia]['total'] += (float)$ticket->getTotal();
                $ventasPorDia[$dia]['count']++;
            }
        }

        // Productos más vendidos
        $productoStats = [];
        foreach ($tickets as $ticket) {
            if ($ticket->getEstado() === Ticket::ESTADO_PAGADO) {
                $detalles = json_decode($ticket->getDetalleJson() ?? '[]', true);
                foreach ($detalles as $det) {
                    $nombre = $det['producto'] ?? 'Desconocido';
                    if (!isset($productoStats[$nombre])) {
                        $productoStats[$nombre] = ['nombre' => $nombre, 'cantidad' => 0, 'total' => 0];
                    }
                    $productoStats[$nombre]['cantidad'] += $det['cantidad'] ?? 1;
                    $productoStats[$nombre]['total'] += ($det['precio'] ?? 0) * ($det['cantidad'] ?? 1);
                }
            }
        }
        usort($productoStats, fn($a, $b) => $b['cantidad'] - $a['cantidad']);

        // Horas punta
        $horasPunta = array_fill(0, 24, 0);
        foreach ($tickets as $ticket) {
            if ($ticket->getEstado() === Ticket::ESTADO_PAGADO) {
                $hora = (int)$ticket->getCreatedAt()->format('H');
                $horasPunta[$hora] += (float)$ticket->getTotal();
            }
        }

        return $this->json([
            'ventasPorDia' => array_values($ventasPorDia),
            'productosTop' => array_slice($productoStats, 0, 10),
            'horasPunta' => $horasPunta,
            'totalPeriodo' => array_sum(array_column($ventasPorDia, 'total')),
            'ticketsPeriodo' => array_sum(array_column($ventasPorDia, 'count')),
        ]);
    }

    // ============ API USUARIOS/EMPLEADOS ============

    #[Route('/api/usuarios', name: 'admin_api_usuarios', methods: ['GET'])]
    public function listarUsuarios(): JsonResponse
    {
        $usuarios = $this->userRepository->findAll();
        return $this->json(array_map(fn(User $u) => [
            'id' => $u->getId(),
            'email' => $u->getEmail(),
            'rol' => $u->getRol(),
            'roles' => $u->getRoles(),
        ], $usuarios));
    }

    #[Route('/api/usuario', name: 'admin_api_crear_usuario', methods: ['POST'])]
    public function crearUsuario(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $user = new User();
        $user->setEmail($data['email'] ?? '');
        $user->setRol($data['rol'] ?? 'camarero');
        
        $roles = match($data['rol'] ?? 'camarero') {
            'admin' => ['ROLE_ADMIN'],
            'gerente' => ['ROLE_GERENTE'],
            'cocinero' => ['ROLE_COCINA'],
            'barman' => ['ROLE_BARRA'],
            default => ['ROLE_CAMARERO'],
        };
        $user->setRoles($roles);

        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password'] ?? '123456');
        $user->setPassword($hashedPassword);

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $this->json(['success' => true, 'id' => $user->getId()]);
    }

    #[Route('/api/usuario/{id}', name: 'admin_api_editar_usuario', methods: ['PUT'])]
    public function editarUsuario(int $id, Request $request): JsonResponse
    {
        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'Usuario no encontrado'], 404);
        }

        $data = json_decode($request->getContent(), true);
        
        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }
        if (isset($data['rol'])) {
            $user->setRol($data['rol']);
            $roles = match($data['rol']) {
                'admin' => ['ROLE_ADMIN'],
                'gerente' => ['ROLE_GERENTE'],
                'cocinero' => ['ROLE_COCINA'],
                'barman' => ['ROLE_BARRA'],
                default => ['ROLE_CAMARERO'],
            };
            $user->setRoles($roles);
        }
        if (!empty($data['password'])) {
            $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
            $user->setPassword($hashedPassword);
        }

        $this->entityManager->flush();
        return $this->json(['success' => true]);
    }

    #[Route('/api/usuario/{id}', name: 'admin_api_eliminar_usuario', methods: ['DELETE'])]
    public function eliminarUsuario(int $id): JsonResponse
    {
        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'Usuario no encontrado'], 404);
        }

        $this->entityManager->remove($user);
        $this->entityManager->flush();
        return $this->json(['success' => true]);
    }

    // ============ API ALÉRGENOS ============

    #[Route('/api/alergenos', name: 'admin_api_alergenos', methods: ['GET'])]
    public function listarAlergenos(): JsonResponse
    {
        $alergenos = $this->entityManager->getRepository(Alergeno::class)->findAll();
        return $this->json(array_map(fn(Alergeno $a) => [
            'id' => $a->getId(),
            'nombre' => $a->getNombre(),
        ], $alergenos));
    }

    #[Route('/api/alergeno', name: 'admin_api_crear_alergeno', methods: ['POST'])]
    public function crearAlergeno(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $alergeno = new Alergeno();
        $alergeno->setNombre($data['nombre'] ?? '');

        $this->entityManager->persist($alergeno);
        $this->entityManager->flush();

        return $this->json(['success' => true, 'id' => $alergeno->getId()]);
    }

    #[Route('/api/alergeno/{id}', name: 'admin_api_eliminar_alergeno', methods: ['DELETE'])]
    public function eliminarAlergeno(int $id): JsonResponse
    {
        $alergeno = $this->entityManager->getRepository(Alergeno::class)->find($id);
        if (!$alergeno) {
            return $this->json(['error' => 'Alérgeno no encontrado'], 404);
        }

        $this->entityManager->remove($alergeno);
        $this->entityManager->flush();
        return $this->json(['success' => true]);
    }

    // ============ API MESAS (QR) ============

    #[Route('/api/mesas', name: 'admin_api_listar_mesas', methods: ['GET'])]
    public function listarMesas(): JsonResponse
    {
        $mesas = $this->mesaRepository->findBy([], ['numero' => 'ASC']);
        
        $mesasData = array_map(function($m) {
            $pedidosFacturables = $this->pedidoRepository->findFacturablesByMesa($m);
            $total = 0;
            foreach ($pedidosFacturables as $pedido) {
                foreach ($pedido->getDetalles() as $detalle) {
                    $total += (float)$detalle->getPrecioUnitario() * $detalle->getCantidad();
                }
            }
            return [
                'id' => $m->getId(),
                'numero' => $m->getNumero(),
                'tokenQr' => $m->getTokenQr(),
                'activa' => $m->isActiva(),
                'ocupada' => count($pedidosFacturables) > 0,
                'llamaCamarero' => $m->isLlamaCamarero(),
                'pideCuenta' => $m->isPideCuenta(),
                'metodoPagoPreferido' => $m->getMetodoPagoPreferido(),
                'pagoOnlinePendiente' => $m->isPagoOnlinePendiente(),
                'total' => $total,
            ];
        }, $mesas);

        return $this->json($mesasData);
    }

    #[Route('/api/mesa/{id}/regenerar-qr', name: 'admin_api_regenerar_qr', methods: ['POST'])]
    public function regenerarQR(int $id): JsonResponse
    {
        $mesa = $this->mesaRepository->find($id);
        if (!$mesa) {
            return $this->json(['error' => 'Mesa no encontrada'], 404);
        }

        // Generar nuevo token
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        $token = '';
        for ($i = 0; $i < 8; $i++) {
            $token .= $chars[random_int(0, strlen($chars) - 1)];
        }
        $mesa->setTokenQr($token);

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'tokenQr' => $token,
            'qrUrl' => '/mesa/' . $token,
        ]);
    }

    #[Route('/api/mesa', name: 'admin_api_crear_mesa', methods: ['POST'])]
    public function crearMesa(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $mesa = new Mesa();
        $mesa->setNumero($data['numero'] ?? 1);
        $mesa->setActiva($data['activa'] ?? true);

        $this->entityManager->persist($mesa);
        $this->entityManager->flush();

        return $this->json([
            'success' => true, 
            'id' => $mesa->getId(),
            'tokenQr' => $mesa->getTokenQr(),
        ]);
    }

    #[Route('/api/mesa/{id}', name: 'admin_api_editar_mesa', methods: ['PUT'])]
    public function editarMesa(int $id, Request $request): JsonResponse
    {
        $mesa = $this->mesaRepository->find($id);
        if (!$mesa) {
            return $this->json(['error' => 'Mesa no encontrada'], 404);
        }

        $data = json_decode($request->getContent(), true);
        
        if (isset($data['numero'])) {
            $mesa->setNumero($data['numero']);
        }
        if (isset($data['activa'])) {
            $mesa->setActiva($data['activa']);
        }

        $this->entityManager->flush();
        return $this->json(['success' => true]);
    }

    #[Route('/api/mesa/{id}', name: 'admin_api_eliminar_mesa', methods: ['DELETE'])]
    public function eliminarMesa(int $id): JsonResponse
    {
        $mesa = $this->mesaRepository->find($id);
        if (!$mesa) {
            return $this->json(['error' => 'Mesa no encontrada'], 404);
        }

        $this->entityManager->remove($mesa);
        $this->entityManager->flush();
        return $this->json(['success' => true]);
    }

    // ============ API PEDIDOS EN TIEMPO REAL ============

    #[Route('/api/pedidos/activos', name: 'admin_api_pedidos_activos', methods: ['GET'])]
    public function pedidosActivos(): JsonResponse
    {
        $pedidos = $this->pedidoRepository->findBy(
            ['estado' => ['pendiente', 'en_preparacion', 'listo']],
            ['createdAt' => 'ASC']
        );

        $data = [];
        foreach ($pedidos as $pedido) {
            $detalles = [];
            foreach ($pedido->getDetalles() as $d) {
                $detalles[] = [
                    'producto' => $d->getProducto()->getNombre(),
                    'cantidad' => $d->getCantidad(),
                    'notas' => $d->getNotas(),
                ];
            }
            $data[] = [
                'id' => $pedido->getId(),
                'mesa' => $pedido->getMesa()->getNumero(),
                'estado' => $pedido->getEstado(),
                'createdAt' => $pedido->getCreatedAt()->format('H:i'),
                'minutosEspera' => $pedido->getMinutosEspera(),
                'colorSemaforo' => $pedido->getColorSemaforo(),
                'detalles' => $detalles,
            ];
        }

        return $this->json($data);
    }

    #[Route('/api/pedido/{id}/estado', name: 'admin_api_cambiar_estado_pedido', methods: ['POST'])]
    public function cambiarEstadoPedido(int $id, Request $request): JsonResponse
    {
        $pedido = $this->pedidoRepository->find($id);
        if (!$pedido) {
            return $this->json(['error' => 'Pedido no encontrado'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $pedido->setEstado($data['estado'] ?? 'pendiente');

        $this->entityManager->flush();
        return $this->json(['success' => true]);
    }

    // ============ API EXPORTACIÓN ============

    #[Route('/api/exportar/tickets', name: 'admin_api_exportar_tickets', methods: ['GET'])]
    public function exportarTickets(Request $request): Response
    {
        $desde = new \DateTime($request->query->get('desde', 'first day of this month'));
        $hasta = new \DateTime($request->query->get('hasta', 'today'));

        $tickets = $this->ticketRepository->findEntreFechas($desde, $hasta);

        // Generar CSV
        $csv = "Numero;Fecha;Mesa;Metodo;Estado;Base;IVA;Total\n";
        foreach ($tickets as $t) {
            $csv .= sprintf(
                "%s;%s;%d;%s;%s;%.2f;%.2f;%.2f\n",
                $t->getNumero(),
                $t->getCreatedAt()->format('d/m/Y H:i'),
                $t->getMesa()->getNumero(),
                $t->getMetodoPago(),
                $t->getEstado(),
                (float)$t->getBaseImponible(),
                (float)$t->getIva(),
                (float)$t->getTotal()
            );
        }

        $response = new Response($csv);
        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set('Content-Disposition', 'attachment; filename="tickets_' . $desde->format('Ymd') . '_' . $hasta->format('Ymd') . '.csv"');

        return $response;
    }

    // ============ API NOTIFICACIONES ============

    #[Route('/api/notificaciones', name: 'admin_api_notificaciones', methods: ['GET'])]
    public function notificaciones(): JsonResponse
    {
        $notificaciones = [];

        // Mesas que llaman al camarero
        $mesasLlaman = $this->mesaRepository->findBy(['llamaCamarero' => true]);
        foreach ($mesasLlaman as $mesa) {
            $notificaciones[] = [
                'tipo' => 'camarero',
                'mensaje' => "Mesa {$mesa->getNumero()} llama al camarero",
                'mesaId' => $mesa->getId(),
                'prioridad' => 'alta',
            ];
        }

        // Mesas que piden cuenta o tienen pago online pendiente
        $mesasCuenta = $this->mesaRepository->findBy(['pideCuenta' => true]);
        foreach ($mesasCuenta as $mesa) {
            if ($mesa->isPagoOnlinePendiente()) {
                // Pago online pendiente de confirmación - URGENTE para gerente
                $notificaciones[] = [
                    'tipo' => 'pago_online',
                    'mensaje' => "Mesa {$mesa->getNumero()} - PAGO ONLINE RECIBIDO",
                    'mesaId' => $mesa->getId(),
                    'prioridad' => 'alta',
                    'total' => $this->pedidoRepository->calcularTotalMesa($mesa),
                ];
            } else {
                // Pago efectivo/tarjeta - para camarero
                $metodoPago = $mesa->getMetodoPagoPreferido();
                $metodoLabel = $metodoPago === 'tarjeta' ? '💳 Tarjeta' : '💵 Efectivo';
                $notificaciones[] = [
                    'tipo' => 'cuenta',
                    'mensaje' => "Mesa {$mesa->getNumero()} pide la cuenta ({$metodoLabel})",
                    'mesaId' => $mesa->getId(),
                    'prioridad' => 'media',
                    'metodoPago' => $metodoPago,
                ];
            }
        }

        // Pedidos retrasados (más de 10 min)
        $pedidos = $this->pedidoRepository->findBy(['estado' => ['pendiente', 'en_preparacion']]);
        foreach ($pedidos as $pedido) {
            if ($pedido->getMinutosEspera() > 10) {
                $notificaciones[] = [
                    'tipo' => 'retraso',
                    'mensaje' => "Pedido de Mesa {$pedido->getMesa()->getNumero()} lleva {$pedido->getMinutosEspera()} min",
                    'pedidoId' => $pedido->getId(),
                    'prioridad' => $pedido->getMinutosEspera() > 15 ? 'alta' : 'media',
                ];
            }
        }

        return $this->json($notificaciones);
    }

    #[Route('/api/mesa/{id}/atender', name: 'admin_api_atender_mesa', methods: ['POST'])]
    public function atenderMesa(int $id): JsonResponse
    {
        $mesa = $this->mesaRepository->find($id);
        if (!$mesa) {
            return $this->json(['error' => 'Mesa no encontrada'], 404);
        }

        $mesa->setLlamaCamarero(false);
        $this->entityManager->flush();

        return $this->json(['success' => true]);
    }

    /**
     * Confirmar pago online y generar ticket (solo gerente)
     */
    #[Route('/api/mesa/{id}/confirmar-pago-online', name: 'admin_api_confirmar_pago_online', methods: ['POST'])]
    public function confirmarPagoOnline(int $id): JsonResponse
    {
        $mesa = $this->mesaRepository->find($id);
        if (!$mesa) {
            return $this->json(['error' => 'Mesa no encontrada'], 404);
        }

        if (!$mesa->isPagoOnlinePendiente()) {
            return $this->json(['error' => 'Esta mesa no tiene pago online pendiente'], 400);
        }

        // Calcular total de la mesa
        $totalMesa = $this->pedidoRepository->calcularTotalMesa($mesa);
        if ((float)$totalMesa <= 0) {
            return $this->json(['error' => 'La mesa no tiene pedidos para facturar'], 400);
        }

        // Generar número correlativo
        $ultimoId = $this->ticketRepository->getUltimoIdDelAño();
        $numero = Ticket::generarNumero($ultimoId);

        // Crear ticket como PAGADO
        $ticket = new Ticket();
        $ticket->setNumero($numero);
        $ticket->setMesa($mesa);
        $ticket->setMetodoPago('online');
        $ticket->setEstado(Ticket::ESTADO_PAGADO);
        $ticket->setPaidAt(new \DateTime());
        $ticket->calcularDesgloseIVA($totalMesa);

        // Guardar detalle de pedidos
        $pedidos = $this->pedidoRepository->findFacturablesByMesa($mesa);
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
        
        // Limpiar pedidos de la mesa y resetear flags
        $this->pedidoRepository->limpiarPedidosMesa($mesa);
        $mesa->setLlamaCamarero(false);
        $mesa->setPideCuenta(false);
        $mesa->setMetodoPagoPreferido(null);
        $mesa->setPagoOnlinePendiente(false);
        
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'id' => $ticket->getId(),
            'numero' => $ticket->getNumero(),
            'total' => $ticket->getTotal(),
            'mensaje' => 'Pago online confirmado - Ticket generado'
        ]);
    }

    // ============ API CONFIGURACIÓN ============

    #[Route('/api/config', name: 'admin_api_config', methods: ['GET'])]
    public function getConfig(): JsonResponse
    {
        // Por ahora valores por defecto, se puede extender con una tabla Config
        return $this->json([
            'nombreRestaurante' => 'Comanda Digital',
            'direccion' => '',
            'telefono' => '',
            'iva' => 10,
            'moneda' => 'EUR',
        ]);
    }
}
