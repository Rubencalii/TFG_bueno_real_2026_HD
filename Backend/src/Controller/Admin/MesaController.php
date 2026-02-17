<?php

namespace App\Controller\Admin;

use App\Entity\Mesa;
use App\Repository\MesaRepository;
use App\Repository\PedidoRepository;
use App\Repository\TicketRepository;
use App\Entity\Ticket;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin/api')]
class MesaController extends AbstractController
{
    public function __construct(
        private MesaRepository $mesaRepository,
        private PedidoRepository $pedidoRepository,
        private TicketRepository $ticketRepository,
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('/mesas', name: 'admin_api_listar_mesas', methods: ['GET'])]
    public function listar(): JsonResponse
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
                'securityPin' => $m->getSecurityPin(),
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

    #[Route('/mesa', name: 'admin_api_crear_mesa', methods: ['POST'])]
    public function crear(Request $request): JsonResponse
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

    #[Route('/mesa/{id}', name: 'admin_api_editar_mesa', methods: ['PUT'])]
    public function editar(int $id, Request $request): JsonResponse
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

    #[Route('/mesa/{id}', name: 'admin_api_eliminar_mesa', methods: ['DELETE'])]
    public function eliminar(int $id): JsonResponse
    {
        $mesa = $this->mesaRepository->find($id);
        if (!$mesa) {
            return $this->json(['error' => 'Mesa no encontrada'], 404);
        }

        $this->entityManager->remove($mesa);
        $this->entityManager->flush();
        return $this->json(['success' => true]);
    }

    #[Route('/mesa/{id}/toggle', name: 'admin_api_toggle_mesa', methods: ['POST'])]
    public function toggle(int $id): JsonResponse
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

    #[Route('/mesa/{id}/regenerar-qr', name: 'admin_api_regenerar_qr', methods: ['POST'])]
    public function regenerarQR(int $id): JsonResponse
    {
        $mesa = $this->mesaRepository->find($id);
        if (!$mesa) {
            return $this->json(['error' => 'Mesa no encontrada'], 404);
        }

        // Regenerar token y PIN de seguridad
        $mesa->regenerateToken();

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'tokenQr' => $mesa->getTokenQr(),
            'securityPin' => $mesa->getSecurityPin(),
            'qrUrl' => '/mesa/' . $mesa->getTokenQr(),
        ]);
    }

    #[Route('/mesa/{id}/atender', name: 'admin_api_atender_mesa', methods: ['POST'])]
    public function atender(int $id): JsonResponse
    {
        $mesa = $this->mesaRepository->find($id);
        if (!$mesa) {
            return $this->json(['error' => 'Mesa no encontrada'], 404);
        }

        $mesa->setLlamaCamarero(false);
        $mesa->setSolicitaPin(false);
        $this->entityManager->flush();

        return $this->json(['success' => true]);
    }

    #[Route('/mesa/{id}/confirmar-pago-online', name: 'admin_api_confirmar_pago_online', methods: ['POST'])]
    public function confirmarPagoOnline(int $id): JsonResponse
    {
        // ... (existing code)
        return $this->json([
            'success' => true,
            'id' => $ticket->getId(),
            'numero' => $ticket->getNumero(),
            'total' => $ticket->getTotal(),
            'mensaje' => 'Pago online confirmado - Ticket generado'
        ]);
    }

    #[Route('/mesa/{id}/cobrar-staff', name: 'admin_api_cobrar_staff', methods: ['POST'])]
    public function cobrarStaff(int $id, Request $request): JsonResponse
    {
        $mesa = $this->mesaRepository->find($id);
        if (!$mesa) {
            return $this->json(['error' => 'Mesa no encontrada'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $metodoPago = $data['metodoPago'] ?? 'efectivo';

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
        $ticket->setMetodoPago($metodoPago);
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
        
        // Rotar el PIN de seguridad para invalidar sesiones anteriores
        $mesa->regeneratePin();
        
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'id' => $ticket->getId(),
            'numero' => $ticket->getNumero(),
            'total' => $ticket->getTotal(),
            'mensaje' => 'Mesa cobrada correctamente - Ticket generado'
        ]);
    }

    #[Route('/mesa/{id}/limpiar-alertas', name: 'admin_api_limpiar_alertas', methods: ['POST'])]
    public function limpiarAlertas(int $id): JsonResponse
    {
        $mesa = $this->mesaRepository->find($id);
        if (!$mesa) {
            return $this->json(['error' => 'Mesa no encontrada'], 404);
        }

        $mesa->setLlamaCamarero(false);
        $mesa->setPideCuenta(false);
        $mesa->setMetodoPagoPreferido(null);
        $mesa->setPagoOnlinePendiente(false);
        $mesa->setSolicitaPin(false);
        $mesa->regeneratePin();
        
        $this->entityManager->flush();

        return $this->json(['success' => true, 'mensaje' => 'Alertas eliminadas']);
    }
}
