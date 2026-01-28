<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
#[Route('/cocina')]
class CocinaController extends AbstractController
{
    #[Route('/', name: 'cocina_panel')]
    public function index(): Response
    {
        return $this->render('cocina/panel.html.twig');
    }
}
