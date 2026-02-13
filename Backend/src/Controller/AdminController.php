<?php

namespace App\Controller;

use App\Entity\Producto;
use App\Entity\Categoria;
use App\Entity\Ticket;
use App\Entity\User;
use App\Entity\Alergeno;
use App\Entity\Reserva;
use App\Repository\ProductoRepository;
use App\Repository\CategoriaRepository;
use App\Repository\MesaRepository;
use App\Repository\PedidoRepository;
use App\Repository\TicketRepository;
use App\Repository\UserRepository;
use App\Repository\ReservaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * AdminController - Panel de administración principal
 * 
 * Este controlador solo maneja el dashboard principal.
 * Las APIs están distribuidas en controladores específicos:
 * - Admin\ProductoController - CRUD productos
 * - Admin\CategoriaController - CRUD categorías
 * - Admin\AlergenoController - CRUD alérgenos
 * - Admin\UsuarioController - CRUD usuarios
 * - Admin\MesaController - CRUD mesas y alertas
 * - Admin\TicketController - Facturación y tickets
 * - Admin\ReservaController - CRUD reservas
 * - Admin\ReporteController - Reportes y estadísticas
 */
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
        private ReservaRepository $reservaRepository,
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
                'securityPin' => $m->getSecurityPin(),
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
            'roles' => $u->getRoles(),
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
            if ($mesa->isPagoOnlinePendiente()) {
                $notificaciones[] = [
                    'tipo' => 'pago_online',
                    'mensaje' => "Mesa {$mesa->getNumero()} - Verificar pago online",
                    'mesaId' => $mesa->getId(),
                    'prioridad' => 'alta',
                    'totalCuenta' => $this->pedidoRepository->calcularTotalMesa($mesa)
                ];
            }
        }

        // Reservas de hoy y próximas
        $reservasHoy = $this->reservaRepository->findHoy();
        $reservasProximas = $this->reservaRepository->findFuturas();
        
        $reservasHoyData = array_map(fn(Reserva $r) => [
            'id' => $r->getId(),
            'nombreCliente' => $r->getNombreCliente(),
            'telefono' => $r->getTelefono(),
            'email' => $r->getEmail(),
            'fecha' => $r->getFecha()->format('Y-m-d'),
            'hora' => $r->getHora()->format('H:i'),
            'numPersonas' => $r->getNumPersonas(),
            'notas' => $r->getNotas(),
            'estado' => $r->getEstado(),
            'mesaId' => $r->getMesa()?->getId(),
            'mesaNumero' => $r->getMesa()?->getNumero(),
        ], $reservasHoy);

        $reservasProximasData = array_map(fn(Reserva $r) => [
            'id' => $r->getId(),
            'nombreCliente' => $r->getNombreCliente(),
            'telefono' => $r->getTelefono(),
            'email' => $r->getEmail(),
            'fecha' => $r->getFecha()->format('Y-m-d'),
            'hora' => $r->getHora()->format('H:i'),
            'numPersonas' => $r->getNumPersonas(),
            'notas' => $r->getNotas(),
            'estado' => $r->getEstado(),
            'mesaId' => $r->getMesa()?->getId(),
            'mesaNumero' => $r->getMesa()?->getNumero(),
        ], $reservasProximas);

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
            'reservasHoy' => $reservasHoyData,
            'reservasProximas' => $reservasProximasData,
        ]);
    }
}
