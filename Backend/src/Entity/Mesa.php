<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

use App\Repository\MesaRepository;

#[ORM\Entity(repositoryClass: MesaRepository::class)]
class Mesa
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'integer')]
    private int $numero;

    #[ORM\Column(type: 'string', length: 64, unique: true)]
    private string $tokenQr;

    #[ORM\Column(type: 'boolean')]
    private bool $activa = true;

    #[ORM\Column(type: 'boolean')]
    private bool $llamaCamarero = false;

    #[ORM\Column(type: 'boolean')]
    private bool $pideCuenta = false;

    #[ORM\OneToMany(mappedBy: 'mesa', targetEntity: Pedido::class)]
    private Collection $pedidos;

    public function __construct()
    {
        $this->pedidos = new ArrayCollection();
        $this->tokenQr = bin2hex(random_bytes(32));
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNumero(): int
    {
        return $this->numero;
    }

    public function setNumero(int $numero): self
    {
        $this->numero = $numero;
        return $this;
    }

    public function getTokenQr(): string
    {
        return $this->tokenQr;
    }

    public function setTokenQr(string $tokenQr): self
    {
        $this->tokenQr = $tokenQr;
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

    public function isLlamaCamarero(): bool
    {
        return $this->llamaCamarero;
    }

    public function setLlamaCamarero(bool $llamaCamarero): self
    {
        $this->llamaCamarero = $llamaCamarero;
        return $this;
    }

    public function isPideCuenta(): bool
    {
        return $this->pideCuenta;
    }

    public function setPideCuenta(bool $pideCuenta): self
    {
        $this->pideCuenta = $pideCuenta;
        return $this;
    }

    /**
     * @return Collection<int, Pedido>
     */
    public function getPedidos(): Collection
    {
        return $this->pedidos;
    }

    public function addPedido(Pedido $pedido): self
    {
        if (!$this->pedidos->contains($pedido)) {
            $this->pedidos[] = $pedido;
            $pedido->setMesa($this);
        }
        return $this;
    }

    public function removePedido(Pedido $pedido): self
    {
        if ($this->pedidos->removeElement($pedido)) {
            if ($pedido->getMesa() === $this) {
                $pedido->setMesa(null);
            }
        }
        return $this;
    }
}
