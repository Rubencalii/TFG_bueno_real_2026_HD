<?php

namespace App\Repository;

use App\Entity\Ticket;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Ticket>
 */
class TicketRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Ticket::class);
    }

    /**
     * Tickets del día actual
     * @return Ticket[]
     */
    public function findHoy(): array
    {
        $hoy = new \DateTime('today');
        $manana = new \DateTime('tomorrow');

        return $this->createQueryBuilder('t')
            ->andWhere('t.createdAt >= :hoy')
            ->andWhere('t.createdAt < :manana')
            ->setParameter('hoy', $hoy)
            ->setParameter('manana', $manana)
            ->orderBy('t.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Resumen de caja del día
     */
    public function getResumenCajaHoy(): array
    {
        $ticketsHoy = $this->findHoy();

        $resumen = [
            'totalEfectivo' => 0.0,
            'totalTarjeta' => 0.0,
            'totalTPV' => 0.0,
            'totalVentas' => 0.0,
            'totalIVA' => 0.0,
            'totalBase' => 0.0,
            'numTicketsPagados' => 0,
            'numTicketsPendientes' => 0,
            'numTicketsAnulados' => 0,
        ];

        foreach ($ticketsHoy as $ticket) {
            $estado = $ticket->getEstado();
            
            if ($estado === Ticket::ESTADO_PAGADO) {
                $resumen['numTicketsPagados']++;
                $resumen['totalVentas'] += (float)$ticket->getTotal();
                $resumen['totalIVA'] += (float)$ticket->getIva();
                $resumen['totalBase'] += (float)$ticket->getBaseImponible();

                switch ($ticket->getMetodoPago()) {
                    case Ticket::METODO_EFECTIVO:
                        $resumen['totalEfectivo'] += (float)$ticket->getTotal();
                        break;
                    case Ticket::METODO_TARJETA:
                        $resumen['totalTarjeta'] += (float)$ticket->getTotal();
                        break;
                    case Ticket::METODO_TPV:
                        $resumen['totalTPV'] += (float)$ticket->getTotal();
                        break;
                }
            } elseif ($estado === Ticket::ESTADO_PENDIENTE) {
                $resumen['numTicketsPendientes']++;
            } elseif ($estado === Ticket::ESTADO_ANULADO) {
                $resumen['numTicketsAnulados']++;
            }
        }

        return $resumen;
    }

    /**
     * Obtener último ID para generar número correlativo
     */
    public function getUltimoIdDelAño(): int
    {
        $anio = new \DateTime('first day of January this year');
        $anioSiguiente = new \DateTime('first day of January next year');

        $result = $this->createQueryBuilder('t')
            ->select('MAX(t.id)')
            ->andWhere('t.createdAt >= :anio')
            ->andWhere('t.createdAt < :anioSiguiente')
            ->setParameter('anio', $anio)
            ->setParameter('anioSiguiente', $anioSiguiente)
            ->getQuery()
            ->getSingleScalarResult();

        return (int)($result ?? 0);
    }

    /**
     * Tickets entre fechas para exportación
     * @return Ticket[]
     */
    public function findEntreFechas(\DateTime $desde, \DateTime $hasta): array
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.createdAt >= :desde')
            ->andWhere('t.createdAt <= :hasta')
            ->setParameter('desde', $desde)
            ->setParameter('hasta', $hasta)
            ->orderBy('t.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
