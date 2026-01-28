<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
#[Route('/barra')]
class BarraController extends AbstractController
{
    #[Route('/', name: 'barra_panel')]
    public function index(): Response
    {
        return $this->render('barra/panel.html.twig');
    }
}
