<?php

namespace App\Controller;

use App\Entity\Pedido;
use App\Entity\DetallePedido;
use App\Repository\MesaRepository;
use App\Repository\ProductoRepository;
use App\Repository\PedidoRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class PedidoController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private MesaRepository $mesaRepository,
        private ProductoRepository $productoRepository,
        private PedidoRepository $pedidoRepository
    ) {}

    /**
     * Crear un nuevo pedido desde el carrito del cliente.
     * Los items se separan automáticamente en pedidos independientes
     * por tipo de categoría (cocina / barra) para que cada panel
     * gestione su estado de forma independiente.
     */
    #[Route('/pedido', name: 'api_crear_pedido', methods: ['POST'])]
    public function crearPedido(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (!$data) {
                return $this->json(['error' => 'Datos inválidos'], Response::HTTP_BAD_REQUEST);
            }

            // Validar que existe mesaId e items
            if (!isset($data['mesaId']) || !isset($data['items']) || empty($data['items'])) {
                return $this->json(['error' => 'Faltan datos obligatorios'], Response::HTTP_BAD_REQUEST);
            }

            // Buscar la mesa
            $mesa = $this->mesaRepository->find($data['mesaId']);
            if (!$mesa) {
                return $this->json(['error' => 'Mesa no encontrada'], Response::HTTP_NOT_FOUND);
            }

            // SEGURIDAD: Validar PIN de la mesa
            $pinProporcionado = $data['pin'] ?? '';
            if ($mesa->getSecurityPin() !== $pinProporcionado) {
                return $this->json([
                    'error' => 'Sesión no autorizada o PIN incorrecto. Por favor, vuelve a escanear el QR o pide el PIN al camarero.',
                    'security_issue' => true
                ], Response::HTTP_UNAUTHORIZED);
            }

            // Agrupar items por tipo de categoría (cocina / barra)
            $grupos = []; // clave = tipo ('cocina' o 'barra'), valor = array de items
            foreach ($data['items'] as $item) {
                $producto = $this->productoRepository->find($item['productoId']);
                if (!$producto) {
                    continue;
                }

                $tipo = $producto->getCategoria()?->getTipo() ?? 'cocina';
                $grupos[$tipo][] = [
                    'producto' => $producto,
                    'cantidad' => $item['cantidad'] ?? 1,
                    'notas'    => $item['notas'] ?? null,
                ];
            }

            // Crear un Pedido independiente por cada grupo
            $pedidoIds = [];
            $totalGeneral = 0;

            foreach ($grupos as $tipo => $items) {
                $pedido = new Pedido();
                $pedido->setMesa($mesa);
                $pedido->setEstado(Pedido::ESTADO_PENDIENTE);

                foreach ($items as $item) {
                    $detalle = new DetallePedido();
                    $detalle->setProducto($item['producto']);
                    $detalle->setCantidad($item['cantidad']);
                    $detalle->setNotas($item['notas']);
                    $pedido->addDetalle($detalle);
                }

                $pedido->calcularTotal();
                $totalGeneral += (float) $pedido->getTotalCalculado();

                $this->entityManager->persist($pedido);
                $pedidoIds[] = $pedido->getId();
            }

            $this->entityManager->flush();

            return $this->json([
                'success' => true,
                'pedidoIds' => $pedidoIds,
                'total' => number_format($totalGeneral, 2, '.', ''),
                'message' => '¡Pedido recibido correctamente!'
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Error al procesar el pedido',
                'details' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Cambiar el estado de un pedido (para cocina)
     */
    #[Route('/pedido/{id}/estado', name: 'api_cambiar_estado_pedido', methods: ['PATCH'])]
    public function cambiarEstado(int $id, Request $request): JsonResponse
    {
        try {
            $pedido = $this->pedidoRepository->find($id);
            
            if (!$pedido) {
                return $this->json(['error' => 'Pedido no encontrado'], Response::HTTP_NOT_FOUND);
            }

            $data = json_decode($request->getContent(), true);
            
            if (!isset($data['estado'])) {
                return $this->json(['error' => 'Estado no proporcionado'], Response::HTTP_BAD_REQUEST);
            }

            // Validar estados permitidos
            $estadosValidos = [
                Pedido::ESTADO_PENDIENTE,
                Pedido::ESTADO_EN_PREPARACION,
                Pedido::ESTADO_LISTO,
                Pedido::ESTADO_ENTREGADO
            ];

            if (!in_array($data['estado'], $estadosValidos)) {
                return $this->json(['error' => 'Estado inválido'], Response::HTTP_BAD_REQUEST);
            }

            $pedido->setEstado($data['estado']);
            $this->entityManager->flush();

            return $this->json([
                'success' => true,
                'pedidoId' => $pedido->getId(),
                'nuevoEstado' => $pedido->getEstado()
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Error al cambiar estado',
                'details' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtener pedidos para la cocina
     */
    #[Route('/cocina/pedidos', name: 'api_cocina_pedidos', methods: ['GET'])]
    public function getPedidosCocina(): JsonResponse
    {
        $pedidos = $this->pedidoRepository->findParaCocina();
        
        $data = array_map(function(Pedido $pedido) {
            $detallesCocina = array_values(array_filter($pedido->getDetalles()->toArray(), function(DetallePedido $d) {
                return $d->getProducto()->getCategoria()->getTipo() === 'cocina';
            }));

            return [
                'id' => $pedido->getId(),
                'mesa' => $pedido->getMesa()->getNumero(),
                'estado' => $pedido->getEstado(),
                'createdAt' => $pedido->getCreatedAt()->format('H:i'),
                'minutosEspera' => $pedido->getMinutosEspera(),
                'colorSemaforo' => $pedido->getColorSemaforo(),
                'total' => $pedido->getTotalCalculado(),
                'detalles' => array_map(function(DetallePedido $detalle) {
                    return [
                        'id' => $detalle->getId(),
                        'producto' => $detalle->getProducto()->getNombre(),
                        'cantidad' => $detalle->getCantidad(),
                        'notas' => $detalle->getNotas(),
                    ];
                }, $detallesCocina)
            ];
        }, $pedidos);

        return $this->json($data);
    }

    /**
     * Obtener pedidos para la barra
     */
    #[Route('/barra/pedidos', name: 'api_barra_pedidos', methods: ['GET'])]
    public function getPedidosBarra(): JsonResponse
    {
        $pedidos = $this->pedidoRepository->findParaBarra();
        
        $data = array_map(function(Pedido $pedido) {
            $detallesBarra = array_values(array_filter($pedido->getDetalles()->toArray(), function(DetallePedido $d) {
                return $d->getProducto()->getCategoria()->getTipo() === 'barra';
            }));

            return [
                'id' => $pedido->getId(),
                'mesa' => $pedido->getMesa()->getNumero(),
                'estado' => $pedido->getEstado(),
                'createdAt' => $pedido->getCreatedAt()->format('H:i'),
                'minutosEspera' => $pedido->getMinutosEspera(),
                'colorSemaforo' => $pedido->getColorSemaforo(),
                'total' => $pedido->getTotalCalculado(),
                'detalles' => array_map(function(DetallePedido $detalle) {
                    return [
                        'id' => $detalle->getId(),
                        'producto' => $detalle->getProducto()->getNombre(),
                        'cantidad' => $detalle->getCantidad(),
                        'notas' => $detalle->getNotas(),
                    ];
                }, $detallesBarra)
            ];
        }, $pedidos);

        return $this->json($data);
    }

    /**
     * Obtener pedidos activos de una mesa (para el cliente)
     */
    #[Route('/mesa/{token}/pedidos', name: 'api_mesa_pedidos', methods: ['GET'])]
    public function getPedidosMesa(string $token): JsonResponse
    {
        $mesa = $this->mesaRepository->findOneBy(['tokenQr' => $token]);
        
        if (!$mesa) {
            return $this->json(['error' => 'Mesa no encontrada'], Response::HTTP_NOT_FOUND);
        }

        $pedidos = $this->pedidoRepository->findActivosByMesa($mesa);
        
        $data = array_map(function(Pedido $pedido) {
            return [
                'id' => $pedido->getId(),
                'estado' => $pedido->getEstado(),
                'createdAt' => $pedido->getCreatedAt()->format('H:i'),
                'minutosEspera' => $pedido->getMinutosEspera(),
                'total' => $pedido->getTotalCalculado(),
                'detalles' => array_map(function(DetallePedido $detalle) {
                    return [
                        'id' => $detalle->getId(),
                        'producto' => $detalle->getProducto()->getNombre(),
                        'cantidad' => $detalle->getCantidad(),
                        'notas' => $detalle->getNotas(),
                    ];
                }, $pedido->getDetalles()->toArray())
            ];
        }, $pedidos);

        return $this->json($data);
    }

    /**
     * Llamar al camarero
     */
    #[Route('/mesa/{token}/llamar', name: 'api_mesa_llamar', methods: ['POST'])]
    public function llamarCamarero(string $token): JsonResponse
    {
        $mesa = $this->mesaRepository->findOneBy(['tokenQr' => $token]);
        if (!$mesa) return $this->json(['error' => 'Mesa no encontrada'], 404);

        $mesa->setLlamaCamarero(true);
        $this->entityManager->flush();

        return $this->json(['success' => true]);
    }

    /**
     * Pedir la cuenta
     */
    #[Route('/mesa/{token}/pagar', name: 'api_mesa_pagar', methods: ['POST'])]
    public function pedirCuenta(string $token, Request $request): JsonResponse
    {
        $mesa = $this->mesaRepository->findOneBy(['tokenQr' => $token]);
        if (!$mesa) return $this->json(['error' => 'Mesa no encontrada'], 404);

        $data = json_decode($request->getContent(), true);
        $metodoPago = $data['metodoPago'] ?? null;
        
        $mesa->setPideCuenta(true);
        if ($metodoPago) {
            $mesa->setMetodoPagoPreferido($metodoPago);
            
            // Si es pago online, marcar como pendiente para admin
            if ($metodoPago === 'online') {
                $mesa->setPagoOnlinePendiente(true);
            }
        }
        $this->entityManager->flush();

        return $this->json(['success' => true, 'metodoPago' => $metodoPago]);
    }

    /**
     * Obtener el total de la cuenta de una mesa
     */
    #[Route('/mesa/{token}/total', name: 'api_mesa_total', methods: ['GET'])]
    public function getTotalMesa(string $token): JsonResponse
    {
        $mesa = $this->mesaRepository->findOneBy(['tokenQr' => $token]);
        if (!$mesa) return $this->json(['error' => 'Mesa no encontrada'], 404);

        $total = $this->pedidoRepository->calcularTotalMesa($mesa);

        return $this->json(['total' => (float)$total]);
    }

    /**
     * Procesar pago online desde el móvil del cliente
     * Solo marca el pago como pendiente de confirmación por el gerente
     */
    #[Route('/mesa/{token}/pagar-online', name: 'api_mesa_pagar_online', methods: ['POST'])]
    public function pagarOnline(string $token, Request $request): JsonResponse
    {
        $mesa = $this->mesaRepository->findOneBy(['tokenQr' => $token]);
        if (!$mesa) return $this->json(['error' => 'Mesa no encontrada'], 404);

        $data = json_decode($request->getContent(), true);
        
        // Calcular total
        $totalMesa = $this->pedidoRepository->calcularTotalMesa($mesa);
        if ((float)$totalMesa <= 0) {
            return $this->json(['error' => 'No hay nada que pagar'], 400);
        }

        // Marcar pago online como pendiente de confirmación del gerente
        $mesa->setPideCuenta(true);
        $mesa->setMetodoPagoPreferido('online');
        $mesa->setPagoOnlinePendiente(true);
        
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'mensaje' => 'Pago recibido. El gerente confirmará en breve.',
            'total' => $totalMesa,
        ]);
    }

    /**
     * Obtener notificaciones para barra
     * Solo muestra mesas con efectivo/tarjeta (el pago online va al gerente)
     */
    #[Route('/barra/notificaciones', name: 'api_barra_notificaciones', methods: ['GET'])]
    public function getNotificaciones(): JsonResponse
    {
        $mesas = $this->mesaRepository->findBy(['activa' => true]);
        $notificaciones = [];

        foreach ($mesas as $mesa) {
            // Solo mostrar si llama, pide cuenta, o solicita PIN
            $mostrar = $mesa->isLlamaCamarero() || 
                       $mesa->isSolicitaPin() ||
                       ($mesa->isPideCuenta() && !$mesa->isPagoOnlinePendiente());
            
            if ($mostrar) {
                $notificaciones[] = [
                    'mesaId' => $mesa->getId(),
                    'numero' => $mesa->getNumero(),
                    'llamaCamarero' => $mesa->isLlamaCamarero(),
                    'pideCuenta' => $mesa->isPideCuenta(),
                    'solicitaPin' => $mesa->isSolicitaPin(),
                    'securityPin' => $mesa->getSecurityPin(),
                    'metodoPago' => $mesa->getMetodoPagoPreferido(),
                    'totalCuenta' => $this->pedidoRepository->calcularTotalMesa($mesa)
                ];
            }
        }

        return $this->json($notificaciones);
    }

    /**
     * Cerrar mesa (desde barra) - GENERA EL TICKET
     */
    #[Route('/barra/mesa/{id}/cerrar', name: 'api_barra_mesa_cerrar', methods: ['POST'])]
    public function cerrarMesa(int $id, Request $request): JsonResponse
    {
        $mesa = $this->mesaRepository->find($id);
        if (!$mesa) return $this->json(['error' => 'Mesa no encontrada'], 404);

        $data = json_decode($request->getContent(), true);
        $metodoPago = $data['metodoPago'] ?? $mesa->getMetodoPagoPreferido() ?? 'efectivo';
        
        // Calcular total de la mesa
        $totalMesa = $this->pedidoRepository->calcularTotalMesa($mesa);
        
        if ((float)$totalMesa > 0) {
            // Crear ticket automáticamente
            $ticketRepo = $this->entityManager->getRepository(\App\Entity\Ticket::class);
            $ultimoId = $ticketRepo->getUltimoIdDelAño();
            $numero = \App\Entity\Ticket::generarNumero($ultimoId);

            $ticket = new \App\Entity\Ticket();
            $ticket->setNumero($numero);
            $ticket->setMesa($mesa);
            $ticket->setMetodoPago($metodoPago);
            $ticket->setEstado(\App\Entity\Ticket::ESTADO_PAGADO);
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
            
            // Limpiar pedidos de la mesa
            $this->pedidoRepository->limpiarPedidosMesa($mesa);
        }

        // Resetear avisos y flags
        $mesa->setLlamaCamarero(false);
        $mesa->setPideCuenta(false);
        $mesa->setMetodoPagoPreferido(null);
        $mesa->setPagoOnlinePendiente(false);
        $mesa->setSolicitaPin(false);
        $mesa->regeneratePin();

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'mensaje' => 'Mesa cerrada y ticket generado automáticamente',
            'ticket' => isset($ticket) ? $ticket->getNumero() : null,
            'ticketId' => isset($ticket) ? $ticket->getId() : null,
            'total' => $totalMesa ?? 0
        ]);
    }
}
