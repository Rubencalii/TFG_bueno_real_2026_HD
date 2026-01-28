<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;

class AppCustomAuthenticator extends AbstractAuthenticator
{

    public function supports(Request $request): ?bool
    {
        // Solo soporta el login por formulario POST en /login
        return $request->attributes->get('_route') === 'login' && $request->isMethod('POST');
    }


    public function authenticate(Request $request): Passport
    {
        $email = $request->request->get('email', '');
        $password = $request->request->get('password', '');
        $csrfToken = $request->request->get('_csrf_token');

        return new Passport(
            new \Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge($email),
            new \Symfony\Component\Security\Http\Authenticator\Passport\Credentials\PasswordCredentials($password),
            [
                new \Symfony\Component\Security\Http\Authenticator\Passport\Badge\CsrfTokenBadge('authenticate', $csrfToken),
            ]
        );
    }


    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        // Redirige al panel principal tras login
        return new \Symfony\Component\HttpFoundation\RedirectResponse('/panel');
    }


    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        // Redirige al login con mensaje de error
        $request->getSession()->set('_security.last_error', $exception->getMessageKey());
        return new \Symfony\Component\HttpFoundation\RedirectResponse('/login');
    }

    //    public function start(Request $request, ?AuthenticationException $authException = null): Response
    //    {
    //        /*
    //         * If you would like this class to control what happens when an anonymous user accesses a
    //         * protected page (e.g. redirect to /login), uncomment this method and make this class
    //         * implement Symfony\Component\Security\Http\EntryPoint\AuthenticationEntryPointInterface.
    //         *
    //         * For more details, see https://symfony.com/doc/current/security/experimental_authenticators.html#configuring-the-authentication-entry-point
    //         */
    //    }
}
