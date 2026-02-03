<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use App\Repository\ProductoRepository;

#[ORM\Entity(repositoryClass: ProductoRepository::class)]
class Producto
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 150)]
    private string $nombre;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $descripcion = null;

    #[ORM\Column(type: 'decimal', precision: 6, scale: 2)]
    private string $precio;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $imagen = null;

    #[ORM\Column(type: 'boolean')]
    private bool $activo = true;

    #[ORM\Column(type: 'boolean')]
    private bool $destacado = false;

    #[ORM\Column(type: 'boolean')]
    private bool $vegetariano = false;

    #[ORM\ManyToOne(targetEntity: Categoria::class, inversedBy: 'productos')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Categoria $categoria = null;

    #[ORM\ManyToMany(targetEntity: Alergeno::class, inversedBy: 'productos')]
    private Collection $alergenos;

    #[ORM\OneToMany(mappedBy: 'producto', targetEntity: ProductoTraduccion::class, cascade: ['persist', 'remove'])]
    private Collection $traducciones;

    public function __construct()
    {
        $this->alergenos = new ArrayCollection();
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

    public function getDescripcion(): ?string
    {
        return $this->descripcion;
    }

    public function setDescripcion(?string $descripcion): self
    {
        $this->descripcion = $descripcion;
        return $this;
    }

    public function getPrecio(): ?string
    {
        return $this->precio;
    }

    public function setPrecio(string $precio): self
    {
        $this->precio = $precio;
        return $this;
    }

    public function getImagen(): ?string
    {
        return $this->imagen;
    }

    public function setImagen(?string $imagen): self
    {
        $this->imagen = $imagen;
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

    public function isDestacado(): bool
    {
        return $this->destacado;
    }

    public function setDestacado(bool $destacado): self
    {
        $this->destacado = $destacado;
        return $this;
    }

    public function isVegetariano(): bool
    {
        return $this->vegetariano;
    }

    public function setVegetariano(bool $vegetariano): self
    {
        $this->vegetariano = $vegetariano;
        return $this;
    }

    public function getCategoria(): ?Categoria
    {
        return $this->categoria;
    }

    public function setCategoria(?Categoria $categoria): self
    {
        $this->categoria = $categoria;
        return $this;
    }

    /**
     * @return Collection<int, Alergeno>
     */
    public function getAlergenos(): Collection
    {
        return $this->alergenos;
    }

    public function addAlergeno(Alergeno $alergeno): self
    {
        if (!$this->alergenos->contains($alergeno)) {
            $this->alergenos[] = $alergeno;
        }
        return $this;
    }

    public function removeAlergeno(Alergeno $alergeno): self
    {
        $this->alergenos->removeElement($alergeno);
        return $this;
    }

    /**
     * @return Collection<int, ProductoTraduccion>
     */
    public function getTraducciones(): Collection
    {
        return $this->traducciones;
    }

    public function addTraduccion(ProductoTraduccion $traduccion): self
    {
        if (!$this->traducciones->contains($traduccion)) {
            $this->traducciones->add($traduccion);
            $traduccion->setProducto($this);
        }

        return $this;
    }

    public function removeTraduccion(ProductoTraduccion $traduccion): self
    {
        if ($this->traducciones->removeElement($traduccion)) {
            // set the owning side to null (unless already changed)
            if ($traduccion->getProducto() === $this) {
                $traduccion->setProducto(null);
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

    /**
     * Obtiene la descripción traducida para un idioma específico o la original si no existe
     */
    public function getDescripcionTraducida(?Idioma $idioma = null): ?string
    {
        if ($idioma === null || $idioma->getCodigo() === 'es') {
            return $this->descripcion;
        }

        foreach ($this->traducciones as $traduccion) {
            if ($traduccion->getIdioma()->getCodigo() === $idioma->getCodigo()) {
                return $traduccion->getDescripcion();
            }
        }

        return $this->descripcion; // Fallback al original
    }
}
