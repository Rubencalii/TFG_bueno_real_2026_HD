<?php

namespace App\Repository;

use App\Entity\Idioma;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Idioma>
 */
class IdiomaRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Idioma::class);
    }

    /**
     * Obtiene todos los idiomas activos ordenados por nombre
     */
    public function findAllActivos(): array
    {
        return $this->createQueryBuilder('i')
            ->where('i.activo = :activo')
            ->setParameter('activo', true)
            ->orderBy('i.nombre', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Busca un idioma por su código
     */
    public function findByCodigo(string $codigo): ?Idioma
    {
        return $this->createQueryBuilder('i')
            ->where('i.codigo = :codigo')
            ->andWhere('i.activo = :activo')
            ->setParameter('codigo', $codigo)
            ->setParameter('activo', true)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Obtiene el idioma por defecto (español)
     */
    public function findDefault(): ?Idioma
    {
        return $this->findByCodigo('es');
    }
}