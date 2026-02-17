<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Pago
{
    public const METODO_EFECTIVO = 'efectivo';
    public const METODO_TARJETA = 'tarjeta';
    public const METODO_ONLINE = 'online';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Ticket::class, inversedBy: 'pagos')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Ticket $ticket = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private string $monto;

    #[ORM\Column(type: 'string', length: 20)]
    private string $metodoPago;

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    private ?string $transactionId = null;

    #[ORM\Column(type: 'string', length: 20)]
    private string $estado = 'completado';

    #[ORM\Column(type: 'datetime')]
    private \DateTimeInterface $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTicket(): ?Ticket
    {
        return $this->ticket;
    }

    public function setTicket(?Ticket $ticket): self
    {
        $this->ticket = $ticket;
        return $this;
    }

    public function getMonto(): string
    {
        return $this->monto;
    }

    public function setMonto(string $monto): self
    {
        $this->monto = $monto;
        return $this;
    }

    public function getMetodoPago(): string
    {
        return $this->metodoPago;
    }

    public function setMetodoPago(string $metodoPago): self
    {
        $this->metodoPago = $metodoPago;
        return $this;
    }

    public function getTransactionId(): ?string
    {
        return $this->transactionId;
    }

    public function setTransactionId(?string $transactionId): self
    {
        $this->transactionId = $transactionId;
        return $this;
    }

    public function getEstado(): string
    {
        return $this->estado;
    }

    public function setEstado(string $estado): self
    {
        $this->estado = $estado;
        return $this;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }
}
