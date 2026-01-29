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
                }, $pedido->getDetalles()->toArray())
            ];
        }, $pedidos);

        return $this->json($data);
    }
}
