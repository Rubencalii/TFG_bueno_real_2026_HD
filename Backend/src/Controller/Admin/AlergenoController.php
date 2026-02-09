<?php

namespace App\Controller\Admin;

use App\Entity\Alergeno;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin/api')]
class AlergenoController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('/alergenos', name: 'admin_api_alergenos', methods: ['GET'])]
    public function listar(): JsonResponse
    {
        $alergenos = $this->entityManager->getRepository(Alergeno::class)->findAll();
        return $this->json(array_map(fn(Alergeno $a) => [
            'id' => $a->getId(),
            'nombre' => $a->getNombre(),
        ], $alergenos));
    }

    #[Route('/alergeno', name: 'admin_api_crear_alergeno', methods: ['POST'])]
    public function crear(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $alergeno = new Alergeno();
        $alergeno->setNombre($data['nombre'] ?? '');

        $this->entityManager->persist($alergeno);
        $this->entityManager->flush();

        return $this->json(['success' => true, 'id' => $alergeno->getId()]);
    }

    #[Route('/alergeno/{id}', name: 'admin_api_eliminar_alergeno', methods: ['DELETE'])]
    public function eliminar(int $id): JsonResponse
    {
        $alergeno = $this->entityManager->getRepository(Alergeno::class)->find($id);
        if (!$alergeno) {
            return $this->json(['error' => 'Alérgeno no encontrado'], 404);
        }

        $this->entityManager->remove($alergeno);
        $this->entityManager->flush();
        return $this->json(['success' => true]);
    }
}
