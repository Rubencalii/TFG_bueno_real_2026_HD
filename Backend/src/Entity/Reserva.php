<?php

namespace App\Entity;

use App\Repository\ReservaRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ReservaRepository::class)]
#[ORM\Table(name: 'reserva')]
#[ORM\HasLifecycleCallbacks]
class Reserva
{
    public const ESTADO_PENDIENTE = 'pendiente';
    public const ESTADO_CONFIRMADA = 'confirmada';
    public const ESTADO_CANCELADA = 'cancelada';
    public const ESTADO_COMPLETADA = 'completada';
    public const ESTADO_NO_SHOW = 'no_show'; // Cliente no se presentó

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $nombreCliente = null;

    #[ORM\Column(length: 20)]
    private ?string $telefono = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $email = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $fecha = null;

    #[ORM\Column(type: Types::TIME_MUTABLE)]
    private ?\DateTimeInterface $hora = null;

    #[ORM\Column]
    private ?int $numPersonas = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $notas = null;

    #[ORM\Column(length: 20)]
    private ?string $estado = self::ESTADO_PENDIENTE;

    #[ORM\ManyToOne(targetEntity: Mesa::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?Mesa $mesa = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\PrePersist]
    public function setCreatedAtValue(): void
    {
        $this->createdAt = new \DateTime();
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNombreCliente(): ?string
    {
        return $this->nombreCliente;
    }

    public function setNombreCliente(string $nombreCliente): static
    {
        $this->nombreCliente = $nombreCliente;
        return $this;
    }

    public function getTelefono(): ?string
    {
        return $this->telefono;
    }

    public function setTelefono(string $telefono): static
    {
        $this->telefono = $telefono;
        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getFecha(): ?\DateTimeInterface
    {
        return $this->fecha;
    }

    public function setFecha(\DateTimeInterface $fecha): static
    {
        $this->fecha = $fecha;
        return $this;
    }

    public function getHora(): ?\DateTimeInterface
    {
        return $this->hora;
    }

    public function setHora(\DateTimeInterface $hora): static
    {
        $this->hora = $hora;
        return $this;
    }

    public function getNumPersonas(): ?int
    {
        return $this->numPersonas;
    }

    public function setNumPersonas(int $numPersonas): static
    {
        $this->numPersonas = $numPersonas;
        return $this;
    }

    public function getNotas(): ?string
    {
        return $this->notas;
    }

    public function setNotas(?string $notas): static
    {
        $this->notas = $notas;
        return $this;
    }

    public function getEstado(): ?string
    {
        return $this->estado;
    }

    public function setEstado(string $estado): static
    {
        $this->estado = $estado;
        return $this;
    }

    public function getMesa(): ?Mesa
    {
        return $this->mesa;
    }

    public function setMesa(?Mesa $mesa): static
    {
        $this->mesa = $mesa;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeInterface $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    /**
     * Verifica si la reserva es para hoy
     */
    public function isHoy(): bool
    {
        return $this->fecha->format('Y-m-d') === (new \DateTime())->format('Y-m-d');
    }

    /**
     * Verifica si la reserva es futura
     */
    public function isFutura(): bool
    {
        $ahora = new \DateTime();
        $fechaHoraReserva = \DateTime::createFromFormat(
            'Y-m-d H:i',
            $this->fecha->format('Y-m-d') . ' ' . $this->hora->format('H:i')
        );
        return $fechaHoraReserva > $ahora;
    }
}
