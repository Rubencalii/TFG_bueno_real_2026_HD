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
            ->innerJoin('p.detalles', 'd')
            ->innerJoin('d.producto', 'prod')
            ->innerJoin('prod.categoria', 'cat')
            ->andWhere('p.estado IN (:estados)')
            ->andWhere('cat.tipo = :tipo')
            ->setParameter('estados', [Pedido::ESTADO_PENDIENTE, Pedido::ESTADO_EN_PREPARACION])
            ->setParameter('tipo', 'cocina')
            ->distinct()
            ->orderBy('p.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Devuelve pedidos pendientes y en preparación (para barra)
     * @return Pedido[]
     */
    public function findParaBarra(): array
    {
        return $this->createQueryBuilder('p')
            ->innerJoin('p.detalles', 'd')
            ->innerJoin('d.producto', 'prod')
            ->innerJoin('prod.categoria', 'cat')
            ->andWhere('p.estado IN (:estados)')
            ->andWhere('cat.tipo = :tipo')
            ->setParameter('estados', [Pedido::ESTADO_PENDIENTE, Pedido::ESTADO_EN_PREPARACION])
            ->setParameter('tipo', 'barra')
            ->distinct()
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
     * Devuelve el total acumulado de ventas en un rango de fechas por método de pago
     */
    public function getResumenVentasRange(\DateTimeInterface $inicio, \DateTimeInterface $fin): array
    {
        $qb = $this->createQueryBuilder('p')
            ->select('p.metodoPago, SUM(p.totalCalculado) as total')
            ->where('p.createdAt >= :inicio')
            ->andWhere('p.createdAt < :fin')
            ->andWhere('p.estadoPago = :pagado')
            ->setParameter('inicio', $inicio)
            ->setParameter('fin', $fin)
            ->setParameter('pagado', Pedido::PAGO_PAGADO)
            ->groupBy('p.metodoPago');

        return $qb->getQuery()->getResult();
    }

    /**
     * Devuelve el total acumulado de ventas de hoy por método de pago
     */
    public function getResumenVentasHoy(): array
    {
        return $this->getResumenVentasRange(new \DateTime('today'), new \DateTime('tomorrow'));
    }

    /**
     * Devuelve todos los pedidos (tickets) en un rango de fechas para el panel de administración
     */
    public function findTicketsRange(\DateTimeInterface $inicio, \DateTimeInterface $fin): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.createdAt >= :inicio')
            ->andWhere('p.createdAt < :fin')
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Devuelve todos los pedidos (tickets) de hoy para el panel de administración
     */
    public function findTicketsHoy(): array
    {
        return $this->findTicketsRange(new \DateTime('today'), new \DateTime('tomorrow'));
    }

    public function getTopProductos(int $limit = 5): array
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('pr.nombre, SUM(dp.cantidad) as total')
            ->from(\App\Entity\DetallePedido::class, 'dp')
            ->join('dp.producto', 'pr')
            ->groupBy('pr.id')
            ->orderBy('total', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function getVentasPorHora(): array
    {
        $conn = $this->getEntityManager()->getConnection();
        $sql = '
            SELECT HOUR(created_at) as hora, SUM(total_calculado) as total
            FROM pedido
            WHERE estado_pago = "PAGADO" AND created_at >= CURDATE()
            GROUP BY HOUR(created_at)
            ORDER BY hora ASC
        ';
        return $conn->executeQuery($sql)->fetchAllAssociative();
    }

    public function getVentasUltimos7Dias(): array
    {
        $conn = $this->getEntityManager()->getConnection();
        $sql = '
            SELECT DATE(created_at) as fecha, SUM(total_calculado) as total
            FROM pedido
            WHERE estado_pago = "PAGADO" AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY fecha ASC
        ';
        return $conn->executeQuery($sql)->fetchAllAssociative();
    }

    /**
     * Calcula el total de todos los pedidos de una mesa (para la cuenta)
     */
    public function calcularTotalMesa(Mesa $mesa): string
    {
        $pedidos = $this->findActivosByMesa($mesa);
        $total = 0.0;
        
        foreach ($pedidos as $pedido) {
            $total += (float)$pedido->calcularTotal();
        }
        
        return number_format($total, 2, '.', '');
    }
}
