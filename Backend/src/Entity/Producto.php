<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use App\Repository\ProductoRepository;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ProductoRepository::class)]
class Producto
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 150)]
    #[Assert\NotBlank(message: 'El nombre del producto no puede estar vacío')]
    #[Assert\Length(min: 2, max: 150, minMessage: 'El nombre debe tener al menos {{ limit }} caracteres', maxMessage: 'El nombre no puede superar {{ limit }} caracteres')]
    private string $nombre;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Assert\Length(max: 1000, maxMessage: 'La descripción no puede superar {{ limit }} caracteres')]
    private ?string $descripcion = null;

    #[ORM\Column(type: 'decimal', precision: 6, scale: 2)]
    #[Assert\NotBlank(message: 'El precio no puede estar vacío')]
    #[Assert\Positive(message: 'El precio debe ser un valor positivo')]
    #[Assert\LessThan(value: 10000, message: 'El precio no puede superar {{ compared_value }}€')]
    private string $precio;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    #[Assert\Length(max: 500, maxMessage: 'La URL de la imagen no puede superar {{ limit }} caracteres')]
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

    public function __construct()
    {
        $this->alergenos = new ArrayCollection();
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
}
