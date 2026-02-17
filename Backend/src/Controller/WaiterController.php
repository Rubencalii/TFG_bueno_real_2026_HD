<?php

namespace App\Controller;

use App\Entity\Mesa;
use App\Entity\User;
use App\Repository\MesaRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\CategoriaRepository;
use App\Repository\ProductoRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\ExpressionLanguage\Expression;

#[Route('/camarero')]
class WaiterController extends AbstractController
{
    #[Route('', name: 'app_waiter_dashboard')]
    public function index(MesaRepository $mesaRepository): Response
    {
        // Simple view to assign self to tables
        $mesas = $mesaRepository->findAll();
        
        return $this->render('camarero/index.html.twig', [
            'mesas' => $mesas,
        ]);
    }

    #[Route('/mesa/{id}/asignar', name: 'app_waiter_assign_table', methods: ['POST'])]
    public function assignTable(Mesa $mesa, EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $mesa->setCamareroAsignado($user);
        $em->flush();

        return new JsonResponse(['status' => 'success', 'message' => 'Mesa asignada correctamente']);
    }

    #[Route('/mesa/{id}/desasignar', name: 'app_waiter_unassign_table', methods: ['POST'])]
    public function unassignTable(Mesa $mesa, EntityManagerInterface $em): JsonResponse
    {
        $mesa->setCamareroAsignado(null);
        $em->flush();

        return new JsonResponse(['status' => 'success', 'message' => 'Mesa desasignada correctamente']);
    }

    #[Route('/mesa/{token}/gestionar', name: 'app_waiter_manage_mesa')]
    public function manageMesa(
        string $token, 
        Request $request, 
        MesaRepository $mesaRepository,
        CategoriaRepository $categoriaRepository,
        ProductoRepository $productoRepository,
        TranslatorInterface $translator
    ): Response {
        $mesa = $mesaRepository->findOneBy(['tokenQr' => $token, 'activa' => true]);
        if (!$mesa) throw $this->createNotFoundException('Mesa no encontrada');

        $locale = $request->query->get('lang', 'es');
        $categoriasEntities = $categoriaRepository->findAllActivas();
        $productosEntities = $productoRepository->findActivos();

        $categorias = array_map(fn($cat) => [
            'id' => $cat->getId(),
            'nombre' => $translator->trans($cat->getNombre(), [], 'messages', $locale),
        ], $categoriasEntities);

        $productos = array_map(fn($prod) => [
            'id' => $prod->getId(),
            'nombre' => $translator->trans($prod->getNombre(), [], 'messages', $locale),
            'descripcion' => $prod->getDescripcion() ? $translator->trans($prod->getDescripcion(), [], 'messages', $locale) : null,
            'precio' => $prod->getPrecio(),
            'imagen' => $prod->getImagen(),
            'categoriaId' => $prod->getCategoria()->getId(),
            'alergenos' => array_map(fn($a) => strtolower($a->getNombre()), $prod->getAlergenos()->toArray()),
            'destacado' => $prod->isDestacado(),
            'vegetariano' => $prod->isVegetariano(),
        ], $productosEntities);

        $ui = [];
        if ($translator instanceof \Symfony\Component\Translation\TranslatorBagInterface) {
            $ui = $translator->getCatalogue($locale)->all('messages');
        }

        return $this->render('camarero/manage_mesa.html.twig', [
            'mesa' => [
                'id' => $mesa->getId(),
                'numero' => $mesa->getNumero(),
                'tokenQr' => $mesa->getTokenQr(),
            ],
            'categorias' => $categorias,
            'productos' => $productos,
            'alergenos' => ['gluten', 'huevo', 'lactosa', 'frutos secos', 'marisco', 'pescado', 'soja'],
            'idiomas' => [['codigo' => 'es', 'nombre' => 'Español', 'bandera' => '🇪🇸'], ['codigo' => 'en', 'nombre' => 'English', 'bandera' => '🇬🇧']],
            'idiomaActual' => ['codigo' => 'es', 'nombre' => 'Español', 'bandera' => '🇪🇸'],
            'ui' => $ui,
            'isStaff' => true // Flag to bypass PIN or show staff UI
        ]);
    }
}
