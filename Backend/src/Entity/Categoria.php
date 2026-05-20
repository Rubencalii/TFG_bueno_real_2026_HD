<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use App\Repository\CategoriaRepository;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: CategoriaRepository::class)]
class Categoria
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 100)]
    #[Assert\NotBlank(message: 'El nombre de la categoría no puede estar vacío')]
    #[Assert\Length(min: 2, max: 100, minMessage: 'El nombre debe tener al menos {{ limit }} caracteres', maxMessage: 'El nombre no puede superar {{ limit }} caracteres')]
    private string $nombre;

    #[ORM\Column(type: 'integer')]
    #[Assert\GreaterThanOrEqual(value: 0, message: 'El orden no puede ser negativo')]
    private int $orden = 0;

    #[ORM\Column(type: 'boolean')]
    private bool $activa = true;

    #[ORM\Column(type: 'string', length: 20)]
    #[Assert\NotBlank(message: 'El tipo de categoría no puede estar vacío')]
    #[Assert\Choice(choices: ['cocina', 'barra'], message: 'El tipo debe ser "cocina" o "barra"')]
    private string $tipo = 'cocina';

    #[ORM\OneToMany(mappedBy: 'categoria', targetEntity: Producto::class)]
    private Collection $productos;

    public function __construct()
    {
        $this->productos = new ArrayCollection();
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
}
