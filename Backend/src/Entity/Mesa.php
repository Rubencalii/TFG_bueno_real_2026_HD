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

    #[ORM\Column(type: 'string', length: 12, unique: true)]
    private string $tokenQr;

    #[ORM\Column(type: 'string', length: 10)]
    private string $securityPin;

    #[ORM\Column(type: 'boolean')]
    private bool $activa = true;

    #[ORM\Column(type: 'boolean')]
    private bool $llamaCamarero = false;

    #[ORM\Column(type: 'boolean')]
    private bool $pideCuenta = false;

    #[ORM\Column(type: 'string', length: 20, nullable: true)]
    private ?string $metodoPagoPreferido = null;

    #[ORM\Column(type: 'boolean')]
    private bool $pagoOnlinePendiente = false;

    #[ORM\Column(type: 'boolean')]
    private bool $solicitaPin = false;

    #[ORM\OneToMany(mappedBy: 'mesa', targetEntity: Pedido::class)]
    private Collection $pedidos;

    private const TOKEN_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    public function __construct()
    {
        $this->pedidos = new ArrayCollection();
        $this->regenerateToken();
    }

    public function regenerateToken(): void
    {
        $this->tokenQr = $this->generateShortToken();
        $this->securityPin = str_pad((string)random_int(0, 99999999), 8, '0', STR_PAD_LEFT);
    }

    public function regeneratePin(): void
    {
        $this->securityPin = str_pad((string)random_int(0, 99999999), 8, '0', STR_PAD_LEFT);
    }

    private function generateShortToken(int $length = 8): string
    {
        $chars = self::TOKEN_CHARS;
        $token = '';
        for ($i = 0; $i < $length; $i++) {
            $token .= $chars[random_int(0, strlen($chars) - 1)];
        }
        return $token;
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

    public function getSecurityPin(): string
    {
        return $this->securityPin;
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

    public function getMetodoPagoPreferido(): ?string
    {
        return $this->metodoPagoPreferido;
    }

    public function setMetodoPagoPreferido(?string $metodoPagoPreferido): self
    {
        $this->metodoPagoPreferido = $metodoPagoPreferido;
        return $this;
    }

    public function isPagoOnlinePendiente(): bool
    {
        return $this->pagoOnlinePendiente;
    }

    public function setPagoOnlinePendiente(bool $pagoOnlinePendiente): self
    {
        $this->pagoOnlinePendiente = $pagoOnlinePendiente;
        return $this;
    }

    public function isSolicitaPin(): bool
    {
        return $this->solicitaPin;
    }

    public function setSolicitaPin(bool $solicitaPin): self
    {
        $this->solicitaPin = $solicitaPin;
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
