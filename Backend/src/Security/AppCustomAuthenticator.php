<?php

namespace App\Security;

use App\Entity\User;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\CsrfTokenBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Credentials\PasswordCredentials;

class AppCustomAuthenticator extends AbstractAuthenticator
{
    public function __construct(
        private UrlGeneratorInterface $urlGenerator
    ) {}

    public function supports(Request $request): ?bool
    {
        return $request->attributes->get('_route') === 'login' && $request->isMethod('POST');
    }

    public function authenticate(Request $request): Passport
    {
        $email = $request->request->get('email', '');
        $password = $request->request->get('password', '');
        $csrfToken = $request->request->get('_csrf_token');

        return new Passport(
            new UserBadge($email),
            new PasswordCredentials($password),
            [
                new CsrfTokenBadge('authenticate', $csrfToken),
            ]
        );
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        /** @var User $user */
        $user = $token->getUser();
        $rol = $user->getRol();

        // Redirigir según el rol del usuario
        $targetRoute = match($rol) {
            'gerente' => 'admin_panel',
            'staff' => 'cocina_panel', // Staff empieza en cocina, puede navegar a barra
            default => 'cocina_panel',
        };

        return new RedirectResponse($this->urlGenerator->generate($targetRoute));
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        $request->getSession()->set('_security.last_error', $exception);
        return new RedirectResponse($this->urlGenerator->generate('login'));
    }
}
