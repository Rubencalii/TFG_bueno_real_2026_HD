<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

final class SecurityController extends AbstractController
{
    #[Route('/login', name: 'login')]
    public function login(AuthenticationUtils $authenticationUtils, Request $request): Response
    {
        // Si el usuario ya está autenticado, redirigir al panel correspondiente
        if ($this->getUser()) {
            $user = $this->getUser();
            $rol = $user->getRol();
            
            return match($rol) {
                'gerente' => $this->redirectToRoute('admin_panel'),
                'staff' => $this->redirectToRoute('cocina_panel'),
                default => $this->redirectToRoute('cocina_panel'),
            };
        }

        // Obtener error de login si existe
        $error = $authenticationUtils->getLastAuthenticationError();
        $lastUsername = $authenticationUtils->getLastUsername();
        
        return $this->render('security/login.html.twig', [
            'last_username' => $lastUsername,
            'error' => $error,
        ]);
    }

    #[Route('/logout', name: 'logout')]
    public function logout(): void
    {
        // Symfony gestiona el logout automáticamente
        throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }
}
