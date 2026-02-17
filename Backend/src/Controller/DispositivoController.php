<?php

namespace App\Controller;

use App\Entity\Dispositivo;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/dispositivo')]
#[IsGranted('ROLE_USER')]
class DispositivoController extends AbstractController
{
    #[Route('/registrar', name: 'api_dispositivo_registrar', methods: ['POST'])]
    public function registrar(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (empty($data['token']) || empty($data['plataforma'])) {
            return $this->json(['error' => 'Token y plataforma son requeridos'], 400);
        }

        /** @var User $user */
        $user = $this->getUser();

        $dispositivo = new Dispositivo();
        $dispositivo->setUser($user);
        $dispositivo->setToken($data['token']);
        $dispositivo->setPlataforma($data['plataforma']);

        $em->persist($dispositivo);
        $em->flush();

        return $this->json([
            'success' => true,
            'mensaje' => 'Dispositivo registrado correctamente'
        ]);
    }
}
