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
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin/api')]
class TicketController extends AbstractController
{
    public function __construct(
        private MesaRepository $mesaRepository,
        private PedidoRepository $pedidoRepository,
        private TicketRepository $ticketRepository,
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('/ticket', name: 'admin_api_crear_ticket', methods: ['POST'])]
    public function crear(Request $request): JsonResponse
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
        
        // Limpiar pedidos de la mesa al crear el ticket desde admin
        $this->pedidoRepository->limpiarPedidosMesa($mesa);
        
        // Resetear flags de la mesa
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
            'metodoPago' => $ticket->getMetodoPago(),
            'mensaje' => 'Ticket creado - Mesa liberada'
        ]);
    }

    #[Route('/ticket/{id}/cobrar', name: 'admin_api_cobrar_ticket', methods: ['POST'])]
    public function cobrar(int $id, Request $request): JsonResponse
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

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'mensaje' => 'Ticket cobrado correctamente',
            'paidAt' => $ticket->getPaidAt()->format('H:i')
        ]);
    }

    #[Route('/ticket/{id}/anular', name: 'admin_api_anular_ticket', methods: ['POST'])]
    public function anular(int $id): JsonResponse
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

    #[Route('/ticket/{id}', name: 'admin_api_eliminar_ticket', methods: ['DELETE'])]
    public function eliminar(int $id): JsonResponse
    {
        $ticket = $this->ticketRepository->find($id);
        if (!$ticket) {
            return $this->json(['error' => 'Ticket no encontrado'], 404);
        }

        // Solo permitir eliminar tickets anulados
        if ($ticket->getEstado() !== Ticket::ESTADO_ANULADO) {
            return $this->json(['error' => 'Solo se pueden eliminar tickets anulados'], 400);
        }

        $this->entityManager->remove($ticket);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'mensaje' => 'Ticket eliminado correctamente'
        ]);
    }

    #[Route('/ticket/{id}', name: 'admin_api_ver_ticket', methods: ['GET'])]
    public function ver(int $id): JsonResponse
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

    #[Route('/ticket/{id}/imprimir', name: 'admin_api_imprimir_ticket', methods: ['GET'])]
    public function imprimir(int $id): Response
    {
        $ticket = $this->ticketRepository->find($id);
        if (!$ticket) {
            throw $this->createNotFoundException('Ticket no encontrado');
        }

        $detalles = json_decode($ticket->getDetalleJson() ?? '[]', true);

        return $this->render('admin/ticket_print.html.twig', [
            'ticket' => $ticket,
            'detalles' => $detalles,
        ]);
    }

    #[Route('/tickets/resumen', name: 'admin_api_resumen_caja', methods: ['GET'])]
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

    #[Route('/exportar/tickets', name: 'admin_api_exportar_tickets', methods: ['GET'])]
    public function exportar(Request $request): Response
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
}
