<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

#[Route('/barra')]
#[IsGranted('ROLE_BARRA')]
class BarraController extends AbstractController
{
    #[Route('/', name: 'barra_panel')]
    public function index(): Response
    {
        return $this->render('barra/panel.html.twig');
    }
}
