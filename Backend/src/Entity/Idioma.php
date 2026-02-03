<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use App\Repository\IdiomaRepository;

#[ORM\Entity(repositoryClass: IdiomaRepository::class)]
class Idioma
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 2, unique: true)]
    private string $codigo;

    #[ORM\Column(type: 'string', length: 50)]
    private string $nombre;

    #[ORM\Column(type: 'string', length: 10)]
    private string $bandera;

    #[ORM\Column(type: 'boolean')]
    private bool $activo = true;

    #[ORM\OneToMany(mappedBy: 'idioma', targetEntity: ProductoTraduccion::class, cascade: ['persist', 'remove'])]
    private Collection $productoTraducciones;

    #[ORM\OneToMany(mappedBy: 'idioma', targetEntity: CategoriaTraduccion::class, cascade: ['persist', 'remove'])]
    private Collection $categoriaTraducciones;

    public function __construct()
    {
        $this->productoTraducciones = new ArrayCollection();
        $this->categoriaTraducciones = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCodigo(): string
    {
        return $this->codigo;
    }

    public function setCodigo(string $codigo): self
    {
        $this->codigo = $codigo;
        return $this;
    }

    public function getNombre(): string
    {
        return $this->nombre;
    }

    public function setNombre(string $nombre): self
    {
        $this->nombre = $nombre;
        return $this;
    }

    public function getBandera(): string
    {
        return $this->bandera;
    }

    public function setBandera(string $bandera): self
    {
        $this->bandera = $bandera;
        return $this;
    }

    public function isActivo(): bool
    {
        return $this->activo;
    }

    public function setActivo(bool $activo): self
    {
        $this->activo = $activo;
        return $this;
    }

    /**
     * @return Collection<int, ProductoTraduccion>
     */
    public function getProductoTraducciones(): Collection
    {
        return $this->productoTraducciones;
    }

    public function addProductoTraduccion(ProductoTraduccion $productoTraduccion): self
    {
        if (!$this->productoTraducciones->contains($productoTraduccion)) {
            $this->productoTraducciones->add($productoTraduccion);
            $productoTraduccion->setIdioma($this);
        }

        return $this;
    }

    public function removeProductoTraduccion(ProductoTraduccion $productoTraduccion): self
    {
        if ($this->productoTraducciones->removeElement($productoTraduccion)) {
            // set the owning side to null (unless already changed)
            if ($productoTraduccion->getIdioma() === $this) {
                $productoTraduccion->setIdioma(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, CategoriaTraduccion>
     */
    public function getCategoriaTraducciones(): Collection
    {
        return $this->categoriaTraducciones;
    }

    public function addCategoriaTraduccion(CategoriaTraduccion $categoriaTraduccion): self
    {
        if (!$this->categoriaTraducciones->contains($categoriaTraduccion)) {
            $this->categoriaTraducciones->add($categoriaTraduccion);
            $categoriaTraduccion->setIdioma($this);
        }

        return $this;
    }

    public function removeCategoriaTraduccion(CategoriaTraduccion $categoriaTraduccion): self
    {
        if ($this->categoriaTraducciones->removeElement($categoriaTraduccion)) {
            // set the owning side to null (unless already changed)
            if ($categoriaTraduccion->getIdioma() === $this) {
                $categoriaTraduccion->setIdioma(null);
            }
        }

        return $this;
    }
}