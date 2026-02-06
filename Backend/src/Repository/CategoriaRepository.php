<?php

namespace App\Repository;

use App\Entity\Categoria;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Categoria>
 */
class CategoriaRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Categoria::class);
    }

    /**
     * Devuelve todas las categorías activas ordenadas con sus traducciones
     * @return Categoria[]
     */
    public function findAllActivas(): array
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.activa = :activa')
            ->setParameter('activa', true)
            ->orderBy('c.orden', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
