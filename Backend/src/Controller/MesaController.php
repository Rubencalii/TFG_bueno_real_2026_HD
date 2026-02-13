<?php

namespace App\Controller;

use App\Repository\MesaRepository;
use App\Repository\CategoriaRepository;
use App\Repository\ProductoRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;
use Doctrine\ORM\EntityManagerInterface;

class MesaController extends AbstractController
{
    private array $idiomasDisponibles = [
        ['codigo' => 'es', 'nombre' => 'Español', 'bandera' => '🇪🇸'],
        ['codigo' => 'en', 'nombre' => 'English', 'bandera' => '🇬🇧'],
        ['codigo' => 'fr', 'nombre' => 'Français', 'bandera' => '🇫🇷'],
    ];

    public function __construct(
        private MesaRepository $mesaRepository,
        private CategoriaRepository $categoriaRepository,
        private ProductoRepository $productoRepository,
        private TranslatorInterface $translator,
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('/mesa/{token}', name: 'menu_mesa')]
    public function menuMesa(string $token, Request $request): Response
    {

        $mesa = $this->mesaRepository->findOneBy(['tokenQr' => $token, 'activa' => true]);
        


        if (!$mesa) {
            throw $this->createNotFoundException('Mesa no encontrada o no activa');
        }

        // Obtener idioma seleccionado
        $locale = $request->query->get('lang', 'es');
        if (!in_array($locale, ['es', 'en', 'fr'])) {
            $locale = 'es';
        }

        // Obtener categorías activas
        $categoriasEntities = $this->categoriaRepository->findAllActivas();
        
        // Obtener productos activos
        $productosEntities = $this->productoRepository->findActivos();

        // Serializar categorías con traducciones
        $categorias = array_map(function($cat) use ($locale) {
            return [
                'id' => $cat->getId(),
                'nombre' => $this->translator->trans($cat->getNombre(), [], 'messages', $locale),
            ];
        }, $categoriasEntities);

        // Serializar productos con traducciones
        $productos = array_map(function($prod) use ($locale) {
            return [
                'id' => $prod->getId(),
                'nombre' => $this->translator->trans($prod->getNombre(), [], 'messages', $locale),
                'descripcion' => $prod->getDescripcion() ? $this->translator->trans($prod->getDescripcion(), [], 'messages', $locale) : null,
                'precio' => $prod->getPrecio(),
                'imagen' => $prod->getImagen(),
                'categoriaId' => $prod->getCategoria()->getId(),
                'alergenos' => array_map(fn($a) => strtolower($a->getNombre()), $prod->getAlergenos()->toArray()),
                'destacado' => $prod->isDestacado(),
                'vegetariano' => $prod->isVegetariano(),
            ];
        }, $productosEntities);

        // Idioma actual
        $idiomaActual = current(array_filter($this->idiomasDisponibles, fn($i) => $i['codigo'] === $locale));

        // Lista de alérgenos para el filtro (traducibles si fuera necesario)
        $alergenos = ['gluten', 'huevo', 'lactosa', 'frutos secos', 'marisco', 'pescado', 'soja'];

        // Obtener todas las traducciones del dominio messages para el frontend
        $ui = [];
        if ($this->translator instanceof \Symfony\Component\Translation\TranslatorBagInterface) {
            $ui = $this->translator->getCatalogue($locale)->all('messages');
        }

        // Asegurar que las claves críticas de la UI estén presentes (por si el catálogo no las pilló automáticamente)
        $uiKeys = [
            'Menú', 'Mis Pedidos', 'Llamar camarero', 'Pedir cuenta', 'Cambiar tema',
            'Pedir la cuenta', '¿Cómo deseas pagar?', 'Efectivo', 'Tarjeta (Datáfono)', 'Pagar ahora',
            'Cancelar', 'Añadir', 'Pagar', 'Volver', 'Total', 'Mi Carrito', 'Tu carrito está vacío',
            'comandaDigital', 'liveSession', 'buscarPlatos', 'Filtros', 'opciones'
        ];

        foreach ($uiKeys as $key) {
            if (!isset($ui[$key])) {
                $ui[$key] = $this->translator->trans($key, [], 'messages', $locale);
            }
        }

        return $this->render('mesa/menu.html.twig', [
            'mesa' => [
                'id' => $mesa->getId(),
                'numero' => $mesa->getNumero(),
                'tokenQr' => $mesa->getTokenQr(),
            ],
            'categorias' => $categorias,
            'productos' => $productos,
            'alergenos' => $alergenos,
            'idiomas' => $this->idiomasDisponibles,
            'idiomaActual' => $idiomaActual,
            'ui' => $ui
        ]);
    }

    #[Route('/api/idiomas', name: 'api_idiomas', methods: ['GET'])]
    public function getIdiomas(): JsonResponse
    {
        return $this->json($this->idiomasDisponibles);
    }

    #[Route('/pedido/mesa/{identificador}', name: 'pedido_mesa')]
    public function pedidoMesa(string $identificador): Response
    {
        // Redirect to new route
        return $this->redirectToRoute('menu_mesa', ['token' => $identificador]);
    }

    #[Route('/api/mesa/{token}/status', name: 'api_mesa_status', methods: ['GET'])]
    public function checkStatus(string $token): JsonResponse
    {
        $mesa = $this->mesaRepository->findOneBy(['tokenQr' => $token]);
        
        if (!$mesa) {
            return $this->json(['active' => false, 'error' => 'Mesa no encontrada'], 404);
        }

        return $this->json([
            'active' => $mesa->isActiva(),
            'id' => $mesa->getId(),
            'numero' => $mesa->getNumero()
        ]);
    }

    #[Route('/api/mesa/{token}/verify-pin', name: 'api_mesa_verify_pin', methods: ['POST'])]
    public function verifyPin(string $token, Request $request): JsonResponse
    {
        $mesa = $this->mesaRepository->findOneBy(['tokenQr' => $token]);
        
        if (!$mesa) {
            return $this->json(['error' => 'Mesa no encontrada'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $pin = $data['pin'] ?? '';

        if ($mesa->getSecurityPin() === $pin) {
            // Auto-clear the PIN request notification when successfully verified
            if ($mesa->isSolicitaPin()) {
                $mesa->setSolicitaPin(false);
                $this->entityManager->flush();
            }
            return $this->json(['success' => true]);
        }

        return $this->json(['success' => false, 'error' => 'PIN incorrecto'], 401);
    }

    #[Route('/api/mesa/{token}/solicitar-pin', name: 'api_mesa_solicitar_pin', methods: ['POST'])]
    public function solicitarPin(string $token): JsonResponse
    {
        $mesa = $this->mesaRepository->findOneBy(['tokenQr' => $token, 'activa' => true]);
        
        if (!$mesa) {
            return $this->json(['error' => 'Mesa no encontrada'], 404);
        }

        $mesa->setSolicitaPin(true);
        $this->entityManager->flush();

        return $this->json(['success' => true, 'message' => 'PIN solicitado, el camarero vendrá enseguida']);
    }
}
