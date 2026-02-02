<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use App\Repository\TicketRepository;

#[ORM\Entity(repositoryClass: TicketRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Ticket
{
    public const METODO_EFECTIVO = 'efectivo';
    public const METODO_TARJETA = 'tarjeta';
    public const METODO_TPV = 'tpv';

    public const ESTADO_PENDIENTE = 'pendiente';
    public const ESTADO_PAGADO = 'pagado';
    public const ESTADO_ANULADO = 'anulado';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 20, unique: true)]
    private string $numero;

    #[ORM\ManyToOne(targetEntity: Mesa::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Mesa $mesa = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private string $baseImponible = '0.00';

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private string $iva = '0.00';

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private string $total = '0.00';

    #[ORM\Column(type: 'string', length: 20)]
    private string $metodoPago = self::METODO_EFECTIVO;

    #[ORM\Column(type: 'string', length: 20)]
    private string $estado = self::ESTADO_PENDIENTE;

    #[ORM\Column(type: 'datetime')]
    private \DateTimeInterface $createdAt;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $paidAt = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $detalleJson = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $ticketRectificadoId = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new \DateTime();
        if (empty($this->numero)) {
            $year = date('Y');
            $this->numero = $year . '-' . str_pad((string)random_int(1, 99999), 5, '0', STR_PAD_LEFT);
        }
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNumero(): string
    {
        return $this->numero;
    }

    public function setNumero(string $numero): self
    {
        $this->numero = $numero;
        return $this;
    }

    public function getMesa(): ?Mesa
    {
        return $this->mesa;
    }

    public function setMesa(?Mesa $mesa): self
    {
        $this->mesa = $mesa;
        return $this;
    }

    public function getBaseImponible(): string
    {
        return $this->baseImponible;
    }

    public function setBaseImponible(string $baseImponible): self
    {
        $this->baseImponible = $baseImponible;
        return $this;
    }

    public function getIva(): string
    {
        return $this->iva;
    }

    public function setIva(string $iva): self
    {
        $this->iva = $iva;
        return $this;
    }

    public function getTotal(): string
    {
        return $this->total;
    }

    public function setTotal(string $total): self
    {
        $this->total = $total;
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

    public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getPaidAt(): ?\DateTimeInterface
    {
        return $this->paidAt;
    }

    public function setPaidAt(?\DateTimeInterface $paidAt): self
    {
        $this->paidAt = $paidAt;
        return $this;
    }

    public function getDetalleJson(): ?string
    {
        return $this->detalleJson;
    }

    public function setDetalleJson(?string $detalleJson): self
    {
        $this->detalleJson = $detalleJson;
        return $this;
    }

    public function getTicketRectificadoId(): ?int
    {
        return $this->ticketRectificadoId;
    }

    public function setTicketRectificadoId(?int $ticketRectificadoId): self
    {
        $this->ticketRectificadoId = $ticketRectificadoId;
        return $this;
    }

    /**
     * Calcula base imponible e IVA a partir del total (IVA 10%)
     */
    public function calcularDesgloseIVA(string $totalConIva): self
    {
        $total = (float) $totalConIva;
        $base = $total / 1.10;
        $iva = $total - $base;

        $this->total = number_format($total, 2, '.', '');
        $this->baseImponible = number_format($base, 2, '.', '');
        $this->iva = number_format($iva, 2, '.', '');

        return $this;
    }

    /**
     * Genera número correlativo
     */
    public static function generarNumero(int $ultimoId): string
    {
        $year = date('Y');
        $correlativo = str_pad((string)($ultimoId + 1), 4, '0', STR_PAD_LEFT);
        return "{$year}-{$correlativo}";
    }
}
