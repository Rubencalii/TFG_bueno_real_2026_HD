<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpKernel\Event\ResponseEvent;

#[AsEventListener(event: 'kernel.response')]
class SecurityHeadersListener
{
    public function __invoke(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $response = $event->getResponse();

        // 🛡️ Content-Security-Policy
        // Nota: En desarrollo se permite un poco más para los scripts de React/Vite
        $csp = "default-src 'self'; " .
               "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; " .
               "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; " .
               "img-src 'self' data: https://images.unsplash.com https://*.stripe.com; " .
               "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com; " .
               "frame-src 'self' https://js.stripe.com; " .
               "connect-src 'self' ws: http: https:;";

        $response->headers->set('Content-Security-Policy', $csp);

        // 🛡️ Prevenir Clickjacking
        $response->headers->set('X-Frame-Options', 'DENY');

        // 🛡️ Prevenir MIME-Type Sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // 🛡️ Prevenir filtrado de Referrer
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // 🛡️ HSTS (Strict Transport Security) - Solo si es HTTPS
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
}
