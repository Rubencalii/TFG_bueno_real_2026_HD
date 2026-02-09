<?php

namespace App\Controller\Admin;

use App\Entity\Categoria;
use App\Repository\CategoriaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin/api')]
class CategoriaController extends AbstractController
{
    public function __construct(
        private CategoriaRepository $categoriaRepository,
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('/categoria', name: 'admin_api_crear_categoria', methods: ['POST'])]
    public function crear(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $categoria = new Categoria();
        $categoria->setNombre($data['nombre'] ?? '');
        $categoria->setTipo($data['tipo'] ?? 'cocina');
        $categoria->setActiva($data['activa'] ?? true);
        $categoria->setOrden($data['orden'] ?? 0);

        $this->entityManager->persist($categoria);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'id' => $categoria->getId(),
            'mensaje' => 'Categoría creada correctamente'
        ]);
    }

    #[Route('/categoria/{id}', name: 'admin_api_editar_categoria', methods: ['PUT'])]
    public function editar(int $id, Request $request): JsonResponse
    {
        $categoria = $this->categoriaRepository->find($id);
        if (!$categoria) {
            return $this->json(['error' => 'Categoría no encontrada'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['nombre'])) $categoria->setNombre($data['nombre']);
        if (isset($data['tipo'])) $categoria->setTipo($data['tipo']);
        if (isset($data['activa'])) $categoria->setActiva($data['activa']);
        if (isset($data['orden'])) $categoria->setOrden($data['orden']);

        $this->entityManager->flush();

        return $this->json(['success' => true, 'mensaje' => 'Categoría actualizada']);
    }

    #[Route('/categoria/{id}', name: 'admin_api_eliminar_categoria', methods: ['DELETE'])]
    public function eliminar(int $id): JsonResponse
    {
        $categoria = $this->categoriaRepository->find($id);
        if (!$categoria) {
            return $this->json(['error' => 'Categoría no encontrada'], 404);
        }

        // Verificar que no tenga productos asociados
        if ($categoria->getProductos()->count() > 0) {
            return $this->json(['error' => 'No se puede eliminar: tiene productos asociados'], 400);
        }

        $this->entityManager->remove($categoria);
        $this->entityManager->flush();

        return $this->json(['success' => true, 'mensaje' => 'Categoría eliminada']);
    }
}
