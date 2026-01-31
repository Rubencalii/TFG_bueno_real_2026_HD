<?php

namespace App\Service;

use App\Entity\AuditLog;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\RequestStack;

class AuditLogService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private Security $security,
        private RequestStack $requestStack
    ) {}

    public function log(string $accion, ?string $detalles = null): void
    {
        $user = $this->security->getUser();
        $request = $this->requestStack->getCurrentRequest();

        $log = new AuditLog();
        $log->setAccion($accion);
        $log->setDetalles($detalles);
        $log->setUsuario($user ? $user->getUserIdentifier() : 'Anónimo');
        $log->setIp($request ? $request->getClientIp() : '0.0.0.0');

        $this->entityManager->persist($log);
        $this->entityManager->flush();
    }
}
