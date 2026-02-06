<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

class TestTranslationsController extends AbstractController
{
    #[Route('/test/translations/{locale}', name: 'test_translations')]
    public function testTranslations(string $locale, TranslatorInterface $translator): JsonResponse
    {
        $ui = [];
        if ($translator instanceof \Symfony\Component\Translation\TranslatorBagInterface) {
            $ui = $translator->getCatalogue($locale)->all('messages');
        }

        // Añadir claves críticas manualmente
        $uiKeys = [
            'Menú', 'Mis Pedidos', 'Llamar camarero', 'Pedir cuenta', 'Cambiar tema',
            'Pedir la cuenta', '¿Cómo deseas pagar?', 'Efectivo', 'Tarjeta (Datáfono)', 'Pagar ahora',
        ];

        $manual = [];
        foreach ($uiKeys as $key) {
            $manual[$key] = $translator->trans($key, [], 'messages', $locale);
        }

        return $this->json([
            'locale' => $locale,
            'ui_catalogue_count' => count($ui),
            'ui_sample_keys' => array_slice(array_keys($ui), 0, 10),
            'manual_translations' => $manual,
            'translator_class' => get_class($translator),
        ]);
    }
}
