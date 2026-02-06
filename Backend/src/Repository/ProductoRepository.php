<?php

namespace App\Repository;

use App\Entity\Producto;
use App\Entity\Categoria;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Producto>
 */
class ProductoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Producto::class);
    }

    /**
     * Devuelve todos los productos activos con sus traducciones
     * @return Producto[]
     */
    public function findActivos(): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.activo = :activo')
            ->setParameter('activo', true)
            ->join('p.categoria', 'c')
            ->andWhere('c.activa = :categoriaActiva')
            ->setParameter('categoriaActiva', true)
            ->orderBy('c.orden', 'ASC')
            ->addOrderBy('p.nombre', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Devuelve productos por categoría
     * @return Producto[]
     */
    public function findByCategoria(Categoria $categoria): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.categoria = :categoria')
            ->setParameter('categoria', $categoria)
            ->andWhere('p.activo = :activo')
            ->setParameter('activo', true)
            ->orderBy('p.nombre', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Devuelve productos destacados
     * @return Producto[]
     */
    public function findDestacados(): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.destacado = :destacado')
            ->setParameter('destacado', true)
            ->andWhere('p.activo = :activo')
            ->setParameter('activo', true)
            ->setMaxResults(6)
            ->getQuery()
            ->getResult();
    }
}
