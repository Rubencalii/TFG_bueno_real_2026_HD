<?php

namespace App\Controller\Admin;

use App\Entity\Reserva;
use App\Repository\MesaRepository;
use App\Repository\ReservaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin/api')]
class ReservaController extends AbstractController
{
    public function __construct(
        private ReservaRepository $reservaRepository,
        private MesaRepository $mesaRepository,
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('/reservas', name: 'admin_api_listar_reservas', methods: ['GET'])]
    public function listar(Request $request): JsonResponse
    {
        $filtro = $request->query->get('filtro', 'proximas');
        
        $reservas = match($filtro) {
            'hoy' => $this->reservaRepository->findHoy(),
            'proximas' => $this->reservaRepository->findFuturas(),
            default => $this->reservaRepository->findBy([], ['fecha' => 'DESC', 'hora' => 'ASC']),
        };

        $data = array_map(fn(Reserva $r) => [
            'id' => $r->getId(),
            'nombreCliente' => $r->getNombreCliente(),
            'telefono' => $r->getTelefono(),
            'email' => $r->getEmail(),
            'fecha' => $r->getFecha()->format('Y-m-d'),
            'fechaFormateada' => $r->getFecha()->format('d/m/Y'),
            'hora' => $r->getHora()->format('H:i'),
            'numPersonas' => $r->getNumPersonas(),
            'notas' => $r->getNotas(),
            'estado' => $r->getEstado(),
            'mesaId' => $r->getMesa()?->getId(),
            'mesaNumero' => $r->getMesa()?->getNumero(),
            'createdAt' => $r->getCreatedAt()?->format('d/m/Y H:i'),
        ], $reservas);

        return $this->json($data);
    }

    #[Route('/reserva', name: 'admin_api_crear_reserva', methods: ['POST'])]
    public function crear(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['nombreCliente']) || empty($data['telefono']) || empty($data['fecha']) || empty($data['hora']) || empty($data['numPersonas'])) {
            return $this->json(['error' => 'Faltan campos obligatorios'], 400);
        }

        $hora = \DateTime::createFromFormat('H:i', $data['hora']);
        if (!$hora) {
            return $this->json(['error' => 'Formato de hora inválido. Use HH:MM'], 400);
        }

        $fecha = new \DateTime($data['fecha']);
        $hoy = new \DateTime('today');
        if ($fecha < $hoy) {
            return $this->json(['error' => 'No se pueden crear reservas para fechas pasadas'], 400);
        }

        $reserva = new Reserva();
        $reserva->setNombreCliente($data['nombreCliente']);
        $reserva->setTelefono($data['telefono']);
        $reserva->setEmail($data['email'] ?? null);
        $reserva->setFecha($fecha);
        $reserva->setHora($hora);
        $reserva->setNumPersonas((int)$data['numPersonas']);
        $reserva->setNotas($data['notas'] ?? null);
        $reserva->setEstado($data['estado'] ?? Reserva::ESTADO_PENDIENTE);

        if (!empty($data['mesaId'])) {
            $mesa = $this->mesaRepository->find($data['mesaId']);
            if ($mesa) {
                $reserva->setMesa($mesa);
            }
        }

        $this->entityManager->persist($reserva);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'id' => $reserva->getId(),
            'mensaje' => 'Reserva creada correctamente'
        ]);
    }

    #[Route('/reserva/{id}', name: 'admin_api_ver_reserva', methods: ['GET'])]
    public function ver(int $id): JsonResponse
    {
        $reserva = $this->reservaRepository->find($id);
        if (!$reserva) {
            return $this->json(['error' => 'Reserva no encontrada'], 404);
        }

        return $this->json([
            'id' => $reserva->getId(),
            'nombreCliente' => $reserva->getNombreCliente(),
            'telefono' => $reserva->getTelefono(),
            'email' => $reserva->getEmail(),
            'fecha' => $reserva->getFecha()->format('Y-m-d'),
            'hora' => $reserva->getHora()->format('H:i'),
            'numPersonas' => $reserva->getNumPersonas(),
            'notas' => $reserva->getNotas(),
            'estado' => $reserva->getEstado(),
            'mesaId' => $reserva->getMesa()?->getId(),
            'mesaNumero' => $reserva->getMesa()?->getNumero(),
            'createdAt' => $reserva->getCreatedAt()?->format('d/m/Y H:i'),
        ]);
    }

    #[Route('/reserva/{id}', name: 'admin_api_editar_reserva', methods: ['PUT'])]
    public function editar(int $id, Request $request): JsonResponse
    {
        $reserva = $this->reservaRepository->find($id);
        if (!$reserva) {
            return $this->json(['error' => 'Reserva no encontrada'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['nombreCliente'])) $reserva->setNombreCliente($data['nombreCliente']);
        if (isset($data['telefono'])) $reserva->setTelefono($data['telefono']);
        if (isset($data['email'])) $reserva->setEmail($data['email']);
        if (isset($data['fecha'])) $reserva->setFecha(new \DateTime($data['fecha']));
        if (isset($data['hora'])) {
            $hora = \DateTime::createFromFormat('H:i', $data['hora']);
            if (!$hora) {
                return $this->json(['error' => 'Formato de hora inválido. Use HH:MM'], 400);
            }
            $reserva->setHora($hora);
        }
        if (isset($data['numPersonas'])) $reserva->setNumPersonas((int)$data['numPersonas']);
        if (isset($data['notas'])) $reserva->setNotas($data['notas']);
        if (isset($data['estado'])) $reserva->setEstado($data['estado']);

        if (array_key_exists('mesaId', $data)) {
            if ($data['mesaId']) {
                $mesa = $this->mesaRepository->find($data['mesaId']);
                $reserva->setMesa($mesa);
            } else {
                $reserva->setMesa(null);
            }
        }

        $this->entityManager->flush();

        return $this->json(['success' => true, 'mensaje' => 'Reserva actualizada']);
    }

    #[Route('/reserva/{id}', name: 'admin_api_eliminar_reserva', methods: ['DELETE'])]
    public function eliminar(int $id): JsonResponse
    {
        $reserva = $this->reservaRepository->find($id);
        if (!$reserva) {
            return $this->json(['error' => 'Reserva no encontrada'], 404);
        }

        $this->entityManager->remove($reserva);
        $this->entityManager->flush();

        return $this->json(['success' => true, 'mensaje' => 'Reserva eliminada']);
    }

    #[Route('/reserva/{id}/estado', name: 'admin_api_cambiar_estado_reserva', methods: ['POST'])]
    public function cambiarEstado(int $id, Request $request): JsonResponse
    {
        $reserva = $this->reservaRepository->find($id);
        if (!$reserva) {
            return $this->json(['error' => 'Reserva no encontrada'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $nuevoEstado = $data['estado'] ?? null;

        $estadosValidos = [
            Reserva::ESTADO_PENDIENTE,
            Reserva::ESTADO_CONFIRMADA,
            Reserva::ESTADO_CANCELADA,
            Reserva::ESTADO_COMPLETADA,
            Reserva::ESTADO_NO_SHOW,
        ];

        if (!in_array($nuevoEstado, $estadosValidos)) {
            return $this->json(['error' => 'Estado no válido'], 400);
        }

        $reserva->setEstado($nuevoEstado);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'estado' => $reserva->getEstado(),
            'mensaje' => 'Estado de reserva actualizado'
        ]);
    }

    #[Route('/reservas/estadisticas', name: 'admin_api_estadisticas_reservas', methods: ['GET'])]
    public function estadisticas(): JsonResponse
    {
        $conteo = $this->reservaRepository->contarPorEstado();
        $reservasHoy = $this->reservaRepository->findHoy();

        return $this->json([
            'porEstado' => $conteo,
            'totalHoy' => count($reservasHoy),
            'personasHoy' => array_sum(array_map(fn($r) => $r->getNumPersonas(), $reservasHoy)),
        ]);
    }
}
