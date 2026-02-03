<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use App\Repository\CategoriaRepository;

#[ORM\Entity(repositoryClass: CategoriaRepository::class)]
class Categoria
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 100)]
    private string $nombre;

    #[ORM\Column(type: 'integer')]
    private int $orden = 0;

    #[ORM\Column(type: 'boolean')]
    private bool $activa = true;

    #[ORM\Column(type: 'string', length: 20)]
    private string $tipo = 'cocina'; // 'cocina' o 'barra'

    #[ORM\OneToMany(mappedBy: 'categoria', targetEntity: Producto::class)]
    private Collection $productos;

    #[ORM\OneToMany(mappedBy: 'categoria', targetEntity: CategoriaTraduccion::class, cascade: ['persist', 'remove'])]
    private Collection $traducciones;

    public function __construct()
    {
        $this->productos = new ArrayCollection();
        $this->traducciones = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNombre(): ?string
    {
        return $this->nombre;
    }

    public function setNombre(string $nombre): self
    {
        $this->nombre = $nombre;
        return $this;
    }

    public function getOrden(): int
    {
        return $this->orden;
    }

    public function setOrden(int $orden): self
    {
        $this->orden = $orden;
        return $this;
    }

    public function isActiva(): bool
    {
        return $this->activa;
    }

    public function setActiva(bool $activa): self
    {
        $this->activa = $activa;
        return $this;
    }

    public function getTipo(): string
    {
        return $this->tipo;
    }

    public function setTipo(string $tipo): self
    {
        $this->tipo = $tipo;
        return $this;
    }

    /**
     * @return Collection<int, Producto>
     */
    public function getProductos(): Collection
    {
        return $this->productos;
    }

    /**
     * @return Collection<int, CategoriaTraduccion>
     */
    public function getTraducciones(): Collection
    {
        return $this->traducciones;
    }

    public function addTraduccion(CategoriaTraduccion $traduccion): self
    {
        if (!$this->traducciones->contains($traduccion)) {
            $this->traducciones->add($traduccion);
            $traduccion->setCategoria($this);
        }

        return $this;
    }

    public function removeTraduccion(CategoriaTraduccion $traduccion): self
    {
        if ($this->traducciones->removeElement($traduccion)) {
            // set the owning side to null (unless already changed)
            if ($traduccion->getCategoria() === $this) {
                $traduccion->setCategoria(null);
            }
        }

        return $this;
    }

    /**
     * Obtiene la traducción para un idioma específico o el nombre original si no existe
     */
    public function getNombreTraducido(?Idioma $idioma = null): string
    {
        if ($idioma === null || $idioma->getCodigo() === 'es') {
            return $this->nombre;
        }

        foreach ($this->traducciones as $traduccion) {
            if ($traduccion->getIdioma()->getCodigo() === $idioma->getCodigo()) {
                return $traduccion->getNombre();
            }
        }

        return $this->nombre; // Fallback al original
    }
}
