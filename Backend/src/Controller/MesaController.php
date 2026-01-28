<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class MesaController extends AbstractController
{
    #[Route('/pedido/mesa/{identificador}', name: 'pedido_mesa')]
    public function pedidoMesa(string $identificador): Response
    {
        // Aquí puedes buscar la mesa por identificador y mostrar la carta/pedido
        return $this->render('mesa/pedido.html.twig', [
            'identificador' => $identificador,
        ]);
    }
}
