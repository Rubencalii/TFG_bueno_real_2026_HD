<?php

namespace App\Repository;

use App\Entity\ProductoTraduccion;
use App\Entity\Producto;
use App\Entity\Idioma;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ProductoTraduccion>
 */
class ProductoTraduccionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ProductoTraduccion::class);
    }

    /**
     * Obtiene la traducción de un producto en un idioma específico
     */
    public function findByProductoAndIdioma(Producto $producto, Idioma $idioma): ?ProductoTraduccion
    {
        return $this->createQueryBuilder('pt')
            ->where('pt.producto = :producto')
            ->andWhere('pt.idioma = :idioma')
            ->setParameter('producto', $producto)
            ->setParameter('idioma', $idioma)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Obtiene todas las traducciones de productos para un idioma
     */
    public function findByIdioma(Idioma $idioma): array
    {
        return $this->createQueryBuilder('pt')
            ->where('pt.idioma = :idioma')
            ->setParameter('idioma', $idioma)
            ->getQuery()
            ->getResult();
    }

    /**
     * Obtiene todas las traducciones de un producto
     */
    public function findByProducto(Producto $producto): array
    {
        return $this->createQueryBuilder('pt')
            ->where('pt.producto = :producto')
            ->setParameter('producto', $producto)
            ->getQuery()
            ->getResult();
    }
}