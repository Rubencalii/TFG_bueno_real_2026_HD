<?php

namespace App\Repository;

use App\Entity\Pedido;
use App\Entity\Mesa;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Pedido>
 */
class PedidoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Pedido::class);
    }

    /**
     * Devuelve pedidos pendientes y en preparación (para cocina)
     * Ordenados por fecha de creación (más antiguos primero)
     * @return Pedido[]
     */
    public function findParaCocina(): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.estado IN (:estados)')
            ->setParameter('estados', [Pedido::ESTADO_PENDIENTE, Pedido::ESTADO_EN_PREPARACION])
            ->orderBy('p.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Devuelve pedidos por estado
     * @return Pedido[]
     */
    public function findByEstado(string $estado): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.estado = :estado')
            ->setParameter('estado', $estado)
            ->orderBy('p.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Devuelve pedidos activos de una mesa (no entregados)
     * @return Pedido[]
     */
    public function findActivosByMesa(Mesa $mesa): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.mesa = :mesa')
            ->setParameter('mesa', $mesa)
            ->andWhere('p.estado != :entregado')
            ->setParameter('entregado', Pedido::ESTADO_ENTREGADO)
            ->orderBy('p.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Calcula el total de todos los pedidos de una mesa (para la cuenta)
     */
    public function calcularTotalMesa(Mesa $mesa): string
    {
        $pedidos = $this->findActivosByMesa($mesa);
        $total = '0.00';
        
        foreach ($pedidos as $pedido) {
            $pedido->calcularTotal();
            $total = bcadd($total, $pedido->getTotalCalculado(), 2);
        }
        
        return $total;
    }
}
