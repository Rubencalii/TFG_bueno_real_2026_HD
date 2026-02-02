<?php

namespace App\Repository;

use App\Entity\Reserva;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Reserva>
 */
class ReservaRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Reserva::class);
    }

    /**
     * Encuentra reservas de hoy
     */
    public function findHoy(): array
    {
        $hoy = new \DateTime('today');
        $manana = new \DateTime('tomorrow');

        return $this->createQueryBuilder('r')
            ->where('r.fecha >= :hoy')
            ->andWhere('r.fecha < :manana')
            ->setParameter('hoy', $hoy)
            ->setParameter('manana', $manana)
            ->orderBy('r.hora', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Encuentra reservas futuras (desde hoy en adelante)
     */
    public function findFuturas(): array
    {
        $hoy = new \DateTime('today');

        return $this->createQueryBuilder('r')
            ->where('r.fecha >= :hoy')
            ->andWhere('r.estado IN (:estados)')
            ->setParameter('hoy', $hoy)
            ->setParameter('estados', [Reserva::ESTADO_PENDIENTE, Reserva::ESTADO_CONFIRMADA])
            ->orderBy('r.fecha', 'ASC')
            ->addOrderBy('r.hora', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Encuentra reservas por rango de fechas
     */
    public function findEntreFechas(\DateTimeInterface $desde, \DateTimeInterface $hasta): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.fecha >= :desde')
            ->andWhere('r.fecha <= :hasta')
            ->setParameter('desde', $desde)
            ->setParameter('hasta', $hasta)
            ->orderBy('r.fecha', 'ASC')
            ->addOrderBy('r.hora', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Encuentra reservas pendientes para hoy (próximas horas)
     */
    public function findProximasHoy(): array
    {
        $ahora = new \DateTime();
        $hoy = new \DateTime('today');
        $finDia = new \DateTime('tomorrow');

        return $this->createQueryBuilder('r')
            ->where('r.fecha >= :hoy')
            ->andWhere('r.fecha < :finDia')
            ->andWhere('r.estado IN (:estados)')
            ->setParameter('hoy', $hoy)
            ->setParameter('finDia', $finDia)
            ->setParameter('estados', [Reserva::ESTADO_PENDIENTE, Reserva::ESTADO_CONFIRMADA])
            ->orderBy('r.hora', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Busca disponibilidad de mesa para una fecha y hora
     */
    public function findReservasEnHorario(\DateTimeInterface $fecha, \DateTimeInterface $hora, int $duracionMinutos = 90): array
    {
        // Buscar reservas que se solapan (asumiendo duración de 90 min por reserva)
        $horaBase = $hora->format('H:i:s');
        $horaInicio = (new \DateTime($horaBase))->sub(new \DateInterval("PT{$duracionMinutos}M"));
        $horaFin = (new \DateTime($horaBase))->add(new \DateInterval("PT{$duracionMinutos}M"));

        return $this->createQueryBuilder('r')
            ->where('r.fecha = :fecha')
            ->andWhere('r.hora >= :horaInicio')
            ->andWhere('r.hora <= :horaFin')
            ->andWhere('r.estado IN (:estados)')
            ->setParameter('fecha', $fecha->format('Y-m-d'))
            ->setParameter('horaInicio', $horaInicio->format('H:i:s'))
            ->setParameter('horaFin', $horaFin->format('H:i:s'))
            ->setParameter('estados', [Reserva::ESTADO_PENDIENTE, Reserva::ESTADO_CONFIRMADA])
            ->getQuery()
            ->getResult();
    }

    /**
     * Cuenta reservas por estado
     */
    public function contarPorEstado(): array
    {
        $hoy = new \DateTime('today');
        
        $result = $this->createQueryBuilder('r')
            ->select('r.estado, COUNT(r.id) as total')
            ->where('r.fecha >= :hoy')
            ->setParameter('hoy', $hoy)
            ->groupBy('r.estado')
            ->getQuery()
            ->getResult();

        $conteo = [];
        foreach ($result as $row) {
            $conteo[$row['estado']] = (int)$row['total'];
        }

        return $conteo;
    }
}
