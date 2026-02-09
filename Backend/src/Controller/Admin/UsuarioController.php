<?php

namespace App\Controller\Admin;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[Route('/admin/api')]
class UsuarioController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher
    ) {}

    #[Route('/usuarios', name: 'admin_api_usuarios', methods: ['GET'])]
    public function listar(): JsonResponse
    {
        $usuarios = $this->userRepository->findAll();
        return $this->json(array_map(fn(User $u) => [
            'id' => $u->getId(),
            'email' => $u->getEmail(),
            'rol' => $u->getRol(),
            'roles' => $u->getRoles(),
        ], $usuarios));
    }

    #[Route('/usuario', name: 'admin_api_crear_usuario', methods: ['POST'])]
    public function crear(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $user = new User();
        $user->setEmail($data['email'] ?? '');
        
        $rol = $data['rol'] ?? 'camarero';
        $user->setRol($rol);
        
        $roles = match($rol) {
            'admin' => ['ROLE_ADMIN'],
            'gerente' => ['ROLE_GERENTE'],
            'cocinero' => ['ROLE_COCINA'],
            'barman' => ['ROLE_BARRA'],
            default => ['ROLE_CAMARERO'],
        };
        $user->setRoles($roles);

        if (empty($data['password'])) {
            return $this->json(['error' => 'La contraseña es obligatoria'], 400);
        }
        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $this->json(['success' => true, 'id' => $user->getId()]);
    }

    #[Route('/usuario/{id}', name: 'admin_api_editar_usuario', methods: ['PUT'])]
    public function editar(int $id, Request $request): JsonResponse
    {
        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'Usuario no encontrado'], 404);
        }

        $data = json_decode($request->getContent(), true);
        
        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }
        if (isset($data['rol'])) {
            $user->setRol($data['rol']);
            $roles = match($data['rol']) {
                'admin' => ['ROLE_ADMIN'],
                'gerente' => ['ROLE_GERENTE'],
                'cocinero' => ['ROLE_COCINA'],
                'barman' => ['ROLE_BARRA'],
                default => ['ROLE_CAMARERO'],
            };
            $user->setRoles($roles);
        }
        if (!empty($data['password'])) {
            $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
            $user->setPassword($hashedPassword);
        }

        $this->entityManager->flush();
        return $this->json(['success' => true]);
    }

    #[Route('/usuario/{id}', name: 'admin_api_eliminar_usuario', methods: ['DELETE'])]
    public function eliminar(int $id): JsonResponse
    {
        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'Usuario no encontrado'], 404);
        }

        $this->entityManager->remove($user);
        $this->entityManager->flush();
        return $this->json(['success' => true]);
    }
}
