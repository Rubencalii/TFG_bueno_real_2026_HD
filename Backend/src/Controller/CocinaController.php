<?php

namespace App\Controller;

use App\Entity\Pedido;
use App\Repository\PedidoRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/cocina')]
class CocinaController extends AbstractController
{
    public function __construct(
        private PedidoRepository $pedidoRepository
    ) {}

    #[Route('/', name: 'cocina_panel')]
    public function index(): Response
    {
        // Obtener pedidos para cocina
        $pedidosEntities = $this->pedidoRepository->findParaCocina();

        // Serializar para React
        $pedidos = array_map(function(Pedido $pedido) {
            // Filtrar solo detalles de cocina
            $detallesCocina = array_values(array_filter($pedido->getDetalles()->toArray(), function($d) {
                return $d->getProducto()->getCategoria()->getTipo() === 'cocina';
            }));

            // Si el pedido tiene cosas de barra pero no de cocina (caso raro si la query ya filtra),
            // podría llegar vacío de detalles. La query findParaCocina asegura que AL MENOS uno hay.
            
            return [
                'id' => $pedido->getId(),
                'mesa' => $pedido->getMesa()->getNumero(),
                'estado' => $pedido->getEstado(),
                'createdAt' => $pedido->getCreatedAt()->format('H:i'),
                'minutosEspera' => $pedido->getMinutosEspera(),
                'colorSemaforo' => $pedido->getColorSemaforo(),
                'total' => $pedido->getTotalCalculado(),
                'detalles' => array_map(function($detalle) {
                    return [
                        'id' => $detalle->getId(),
                        'producto' => $detalle->getProducto()->getNombre(),
                        'cantidad' => $detalle->getCantidad(),
                        'notas' => $detalle->getNotas(),
                    ];
                }, $detallesCocina)
            ];
        }, $pedidosEntities);

        return $this->render('cocina/panel.html.twig', [
            'pedidos' => $pedidos,
        ]);
    }
}
