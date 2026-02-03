<?php

namespace App\Repository;

use App\Entity\CategoriaTraduccion;
use App\Entity\Categoria;
use App\Entity\Idioma;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<CategoriaTraduccion>
 */
class CategoriaTraduccionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CategoriaTraduccion::class);
    }

    /**
     * Obtiene la traducción de una categoría en un idioma específico
     */
    public function findByCategoriaAndIdioma(Categoria $categoria, Idioma $idioma): ?CategoriaTraduccion
    {
        return $this->createQueryBuilder('ct')
            ->where('ct.categoria = :categoria')
            ->andWhere('ct.idioma = :idioma')
            ->setParameter('categoria', $categoria)
            ->setParameter('idioma', $idioma)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Obtiene todas las traducciones de categorías para un idioma
     */
    public function findByIdioma(Idioma $idioma): array
    {
        return $this->createQueryBuilder('ct')
            ->where('ct.idioma = :idioma')
            ->setParameter('idioma', $idioma)
            ->getQuery()
            ->getResult();
    }

    /**
     * Obtiene todas las traducciones de una categoría
     */
    public function findByCategoria(Categoria $categoria): array
    {
        return $this->createQueryBuilder('ct')
            ->where('ct.categoria = :categoria')
            ->setParameter('categoria', $categoria)
            ->getQuery()
            ->getResult();
    }
}