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
     * Crear un nuevo pedido desde el carrito del cliente
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

            // Crear el pedido
            $pedido = new Pedido();
            $pedido->setMesa($mesa);
            $pedido->setEstado(Pedido::ESTADO_PENDIENTE);

            // Añadir los detalles
            foreach ($data['items'] as $item) {
                $producto = $this->productoRepository->find($item['productoId']);
                
                if (!$producto) {
                    continue; // Saltar productos no encontrados
                }

                $detalle = new DetallePedido();
                $detalle->setProducto($producto);
                $detalle->setCantidad($item['cantidad'] ?? 1);
                $detalle->setNotas($item['notas'] ?? null);
                
                $pedido->addDetalle($detalle);
            }

            // Calcular total
            $pedido->calcularTotal();

            // Persistir
            $this->entityManager->persist($pedido);
            $this->entityManager->flush();

            return $this->json([
                'success' => true,
                'pedidoId' => $pedido->getId(),
                'total' => $pedido->getTotalCalculado(),
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
    public function pedirCuenta(string $token): JsonResponse
    {
        $mesa = $this->mesaRepository->findOneBy(['tokenQr' => $token]);
        if (!$mesa) return $this->json(['error' => 'Mesa no encontrada'], 404);

        $mesa->setPideCuenta(true);
        $this->entityManager->flush();

        return $this->json(['success' => true]);
    }

    /**
     * Obtener notificaciones para barra
     */
    #[Route('/barra/notificaciones', name: 'api_barra_notificaciones', methods: ['GET'])]
    public function getNotificaciones(): JsonResponse
    {
        $mesas = $this->mesaRepository->findBy(['activa' => true]);
        $notificaciones = [];

        foreach ($mesas as $mesa) {
            if ($mesa->isLlamaCamarero() || $mesa->isPideCuenta()) {
                $notificaciones[] = [
                    'mesaId' => $mesa->getId(),
                    'numero' => $mesa->getNumero(),
                    'llamaCamarero' => $mesa->isLlamaCamarero(),
                    'pideCuenta' => $mesa->isPideCuenta(),
                    'totalCuenta' => $this->pedidoRepository->calcularTotalMesa($mesa)
                ];
            }
        }

        return $this->json($notificaciones);
    }

    /**
     * Cerrar mesa (desde barra)
     */
    #[Route('/barra/mesa/{id}/cerrar', name: 'api_barra_mesa_cerrar', methods: ['POST'])]
    public function cerrarMesa(int $id): JsonResponse
    {
        $mesa = $this->mesaRepository->find($id);
        if (!$mesa) return $this->json(['error' => 'Mesa no encontrada'], 404);

        // Resetear avisos
        $mesa->setLlamaCamarero(false);
        $mesa->setPideCuenta(false);

        // Marcar todos los pedidos como entregados para limpiar la sesión
        $pedidos = $this->pedidoRepository->findActivosByMesa($mesa);
        foreach ($pedidos as $pedido) {
            $pedido->setEstado(Pedido::ESTADO_ENTREGADO);
        }

        $this->entityManager->flush();

        return $this->json(['success' => true]);
    }
}
