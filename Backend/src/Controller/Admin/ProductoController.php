<?php

namespace App\Controller\Admin;

use App\Entity\Producto;
use App\Repository\ProductoRepository;
use App\Repository\CategoriaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin/api')]
class ProductoController extends AbstractController
{
    public function __construct(
        private ProductoRepository $productoRepository,
        private CategoriaRepository $categoriaRepository,
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('/producto', name: 'admin_api_crear_producto', methods: ['POST'])]
    public function crear(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $categoria = $this->categoriaRepository->find($data['categoriaId'] ?? 0);
        if (!$categoria) {
            return $this->json(['error' => 'Categoría no encontrada'], 400);
        }

        $producto = new Producto();
        $producto->setNombre($data['nombre'] ?? '');
        $producto->setDescripcion($data['descripcion'] ?? '');
        $producto->setPrecio($data['precio'] ?? '0.00');
        $producto->setImagen($data['imagen'] ?? null);
        $producto->setActivo($data['activo'] ?? true);
        $producto->setDestacado($data['destacado'] ?? false);
        $producto->setCategoria($categoria);

        $this->entityManager->persist($producto);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'id' => $producto->getId(),
            'mensaje' => 'Producto creado correctamente'
        ]);
    }

    #[Route('/producto/{id}', name: 'admin_api_editar_producto', methods: ['PUT'])]
    public function editar(int $id, Request $request): JsonResponse
    {
        $producto = $this->productoRepository->find($id);
        if (!$producto) {
            return $this->json(['error' => 'Producto no encontrado'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['nombre'])) $producto->setNombre($data['nombre']);
        if (isset($data['descripcion'])) $producto->setDescripcion($data['descripcion']);
        if (isset($data['precio'])) $producto->setPrecio($data['precio']);
        if (isset($data['imagen'])) $producto->setImagen($data['imagen']);
        if (isset($data['activo'])) $producto->setActivo($data['activo']);
        if (isset($data['destacado'])) $producto->setDestacado($data['destacado']);
        
        if (isset($data['categoriaId'])) {
            $categoria = $this->categoriaRepository->find($data['categoriaId']);
            if ($categoria) $producto->setCategoria($categoria);
        }

        $this->entityManager->flush();

        return $this->json(['success' => true, 'mensaje' => 'Producto actualizado']);
    }

    #[Route('/producto/{id}', name: 'admin_api_eliminar_producto', methods: ['DELETE'])]
    public function eliminar(int $id): JsonResponse
    {
        $producto = $this->productoRepository->find($id);
        if (!$producto) {
            return $this->json(['error' => 'Producto no encontrado'], 404);
        }

        $this->entityManager->remove($producto);
        $this->entityManager->flush();

        return $this->json(['success' => true, 'mensaje' => 'Producto eliminado']);
    }
}
