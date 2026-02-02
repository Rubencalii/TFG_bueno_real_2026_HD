<?php

namespace App\Controller;

use App\Entity\Pedido;
use App\Repository\PedidoRepository;
use App\Repository\MesaRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/barra')]
class BarraController extends AbstractController
{
    public function __construct(
        private PedidoRepository $pedidoRepository,
        private MesaRepository $mesaRepository
    ) {}

    #[Route('/', name: 'barra_panel')]
    public function index(): Response
    {
        // Obtener pedidos para barra
        $pedidosEntities = $this->pedidoRepository->findParaBarra();

        // Serializar para React
        $pedidos = array_map(function(Pedido $pedido) {
            $detallesBarra = array_values(array_filter($pedido->getDetalles()->toArray(), function($d) {
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
                'detalles' => array_map(function($detalle) {
                    return [
                        'id' => $detalle->getId(),
                        'producto' => $detalle->getProducto()->getNombre(),
                        'cantidad' => $detalle->getCantidad(),
                        'notas' => $detalle->getNotas(),
                    ];
                }, $detallesBarra)
            ];
        }, $pedidosEntities);

        // Notificaciones (llamadas y cuenta) - Solo efectivo/tarjeta para barra
        $mesas = $this->mesaRepository->findBy(['activa' => true]);
        $notificaciones = [];
        foreach ($mesas as $mesa) {
            if ($mesa->isLlamaCamarero() || 
                ($mesa->isPideCuenta() && in_array($mesa->getMetodoPagoPreferido(), ['efectivo', 'tarjeta']))) {
                $notificaciones[] = [
                    'mesaId' => $mesa->getId(),
                    'numero' => $mesa->getNumero(),
                    'llamaCamarero' => $mesa->isLlamaCamarero(),
                    'pideCuenta' => $mesa->isPideCuenta() && in_array($mesa->getMetodoPagoPreferido(), ['efectivo', 'tarjeta']),
                    'metodoPago' => $mesa->getMetodoPagoPreferido(),
                    'totalCuenta' => $this->pedidoRepository->calcularTotalMesa($mesa)
                ];
            }
        }

        return $this->render('barra/panel.html.twig', [
            'pedidos' => $pedidos,
            'notificaciones' => $notificaciones
        ]);
    }
}
