<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class SecurityControllerTest extends WebTestCase
{
    // TEST-01: Corregido — la ruta de login es /login, no /security
    public function testLoginPageIsAccessible(): void
    {
        $client = static::createClient();
        $client->request('GET', '/login');

        self::assertResponseIsSuccessful();
    }

    public function testLoginPageContainsForm(): void
    {
        $client = static::createClient();
        $crawler = $client->request('GET', '/login');

        self::assertResponseIsSuccessful();
        self::assertSelectorExists('form');
    }

    public function testLogoutRedirectsToLogin(): void
    {
        $client = static::createClient();
        $client->request('GET', '/logout');

        // Logout sin sesión activa redirige a login
        self::assertResponseRedirects();
    }
}
