<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use App\Repository\PedidoRepository;

#[ORM\Entity(repositoryClass: PedidoRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Pedido
{
    public const ESTADO_PENDIENTE = 'pendiente';
    public const ESTADO_EN_PREPARACION = 'en_preparacion';
    public const ESTADO_LISTO = 'listo';
    public const ESTADO_ENTREGADO = 'entregado';

    public const METODO_PAGO_EFECTIVO = 'efectivo';
    public const METODO_PAGO_STRIPE = 'stripe';
    public const METODO_PAGO_TPV = 'tpv';

    public const PAGO_PENDIENTE = 'pendiente';
    public const PAGO_PAGADO = 'pagado';
    public const PAGO_ANULADO = 'anulado';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Mesa::class, inversedBy: 'pedidos')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Mesa $mesa = null;

    #[ORM\Column(type: 'string', length: 20)]
    private string $estado = self::ESTADO_PENDIENTE;

    #[ORM\Column(type: 'datetime')]
    private \DateTimeInterface $createdAt;

    #[ORM\Column(type: 'decimal', precision: 8, scale: 2, nullable: true)]
    private ?string $totalCalculado = null;

    #[ORM\OneToMany(mappedBy: 'pedido', targetEntity: DetallePedido::class, cascade: ['persist', 'remove'])]
    private Collection $detalles;

    #[ORM\Column(type: 'string', length: 20, nullable: true)]
    private ?string $metodoPago = null;

    #[ORM\Column(type: 'string', length: 20)]
    private string $estadoPago = self::PAGO_PENDIENTE;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2, options: ['default' => '0.00'])]
    private string $baseImponible = '0.00';

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2, options: ['default' => '0.00'])]
    private string $iva = '0.00';

    #[ORM\Column(type: 'string', length: 50, nullable: true, unique: true)]
    private ?string $numeroFactura = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $isAnulado = false;

    public function __construct()
    {
        $this->detalles = new ArrayCollection();
        $this->createdAt = new \DateTime();
    }

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getTotalCalculado(): ?string
    {
        return $this->totalCalculado;
    }

    public function setTotalCalculado(?string $totalCalculado): self
    {
        $this->totalCalculado = $totalCalculado;
        return $this;
    }

    /**
     * Calcula el total del pedido sumando los detalles y desglosa IVA (10%)
     */
    public function calcularTotal(): string
    {
        $total = 0.0;
        foreach ($this->detalles as $detalle) {
            $subtotal = (float) $detalle->getPrecioUnitario() * $detalle->getCantidad();
            $total += $subtotal;
        }
        
        $this->totalCalculado = number_format($total, 2, '.', '');
        
        // Desglose IVA 10% (IVA incluido en PVP)
        // Base = Total / 1.10
        // IVA = Total - Base
        $base = $total / 1.10;
        $iva = $total - $base;
        
        $this->baseImponible = number_format($base, 2, '.', '');
        $this->iva = number_format($iva, 2, '.', '');
        
        return $this->totalCalculado;
    }

    public function getMetodoPago(): ?string
    {
        return $this->metodoPago;
    }

    public function setMetodoPago(?string $metodoPago): self
    {
        $this->metodoPago = $metodoPago;
        return $this;
    }

    public function getEstadoPago(): string
    {
        return $this->estadoPago;
    }

    public function setEstadoPago(string $estadoPago): self
    {
        $this->estadoPago = $estadoPago;
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

    public function getNumeroFactura(): ?string
    {
        return $this->numeroFactura;
    }

    public function setNumeroFactura(?string $numeroFactura): self
    {
        $this->numeroFactura = $numeroFactura;
        return $this;
    }

    public function isAnulado(): bool
    {
        return $this->isAnulado;
    }

    public function setIsAnulado(bool $isAnulado): self
    {
        $this->isAnulado = $isAnulado;
        return $this;
    }

    /**
     * @return Collection<int, DetallePedido>
     */
    public function getDetalles(): Collection
    {
        return $this->detalles;
    }

    public function addDetalle(DetallePedido $detalle): self
    {
        if (!$this->detalles->contains($detalle)) {
            $this->detalles[] = $detalle;
            $detalle->setPedido($this);
        }
        return $this;
    }

    public function removeDetalle(DetallePedido $detalle): self
    {
        if ($this->detalles->removeElement($detalle)) {
            if ($detalle->getPedido() === $this) {
                $detalle->setPedido(null);
            }
        }
        return $this;
    }

    /**
     * Devuelve los minutos transcurridos desde la creación (para el semáforo)
     */
    public function getMinutosEspera(): int
    {
        $now = new \DateTime();
        $diff = $now->diff($this->createdAt);
        return ($diff->days * 24 * 60) + ($diff->h * 60) + $diff->i;
    }

    /**
     * Devuelve el color del semáforo según el tiempo de espera
     */
    public function getColorSemaforo(): string
    {
        $minutos = $this->getMinutosEspera();
        
        if ($minutos < 5) {
            return 'verde';
        } elseif ($minutos < 10) {
            return 'amarillo';
        } else {
            return 'rojo';
        }
    }
}
