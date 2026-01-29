<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class DetallePedido
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Pedido::class, inversedBy: 'detalles')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Pedido $pedido = null;

    #[ORM\ManyToOne(targetEntity: Producto::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Producto $producto = null;

    #[ORM\Column(type: 'integer')]
    private int $cantidad = 1;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $notas = null;

    #[ORM\Column(type: 'decimal', precision: 6, scale: 2)]
    private string $precioUnitario;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPedido(): ?Pedido
    {
        return $this->pedido;
    }

    public function setPedido(?Pedido $pedido): self
    {
        $this->pedido = $pedido;
        return $this;
    }

    public function getProducto(): ?Producto
    {
        return $this->producto;
    }

    public function setProducto(?Producto $producto): self
    {
        $this->producto = $producto;
        // Copiar el precio del producto al momento de añadir al pedido
        if ($producto !== null) {
            $this->precioUnitario = $producto->getPrecio();
        }
        return $this;
    }

    public function getCantidad(): int
    {
        return $this->cantidad;
    }

    public function setCantidad(int $cantidad): self
    {
        $this->cantidad = $cantidad;
        return $this;
    }

    public function getNotas(): ?string
    {
        return $this->notas;
    }

    public function setNotas(?string $notas): self
    {
        $this->notas = $notas;
        return $this;
    }

    public function getPrecioUnitario(): string
    {
        return $this->precioUnitario;
    }

    public function setPrecioUnitario(string $precioUnitario): self
    {
        $this->precioUnitario = $precioUnitario;
        return $this;
    }

    /**
     * Calcula el subtotal de este detalle
     */
    public function getSubtotal(): string
    {
        $subtotal = (float) $this->precioUnitario * $this->cantidad;
        return number_format($subtotal, 2, '.', '');
    }
}
