<?php

namespace App\Controller\Admin;

use App\Entity\Ticket;
use App\Repository\MesaRepository;
use App\Repository\PedidoRepository;
use App\Repository\TicketRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin/api')]
class ReporteController extends AbstractController
{
    public function __construct(
        private MesaRepository $mesaRepository,
        private PedidoRepository $pedidoRepository,
        private TicketRepository $ticketRepository,
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('/reportes/ventas', name: 'admin_api_reportes_ventas', methods: ['GET'])]
    public function reporteVentas(Request $request): JsonResponse
    {
        $periodo = $request->query->get('periodo', 'semana');
        
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

    #[Route('/pedidos/activos', name: 'admin_api_pedidos_activos', methods: ['GET'])]
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

    #[Route('/pedido/{id}/estado', name: 'admin_api_cambiar_estado_pedido', methods: ['POST'])]
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

    #[Route('/notificaciones', name: 'admin_api_notificaciones', methods: ['GET'])]
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
                $notificaciones[] = [
                    'tipo' => 'pago_online',
                    'mensaje' => "Mesa {$mesa->getNumero()} - PAGO ONLINE RECIBIDO",
                    'mesaId' => $mesa->getId(),
                    'prioridad' => 'alta',
                    'total' => $this->pedidoRepository->calcularTotalMesa($mesa),
                ];
            } else {
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

    #[Route('/config', name: 'admin_api_config', methods: ['GET'])]
    public function getConfig(): JsonResponse
    {
        return $this->json([
            'nombreRestaurante' => 'Comanda Digital',
            'direccion' => '',
            'telefono' => '',
            'iva' => 10,
            'moneda' => 'EUR',
        ]);
    }
}
