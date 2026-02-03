<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserFixtures extends Fixture
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher
    ) {}

    public function load(ObjectManager $manager): void
    {
        // Crear usuario admin
        $admin = new User();
        $admin->setEmail('admin@comanda.com');
        $admin->setRol('admin');
        $admin->setRoles(['ROLE_ADMIN']);
        $hashedPassword = $this->passwordHasher->hashPassword($admin, 'admin123');
        $admin->setPassword($hashedPassword);
        $manager->persist($admin);

        // Crear usuario gerente
        $gerente = new User();
        $gerente->setEmail('gerente@comanda.com');
        $gerente->setRol('gerente');
        $gerente->setRoles(['ROLE_GERENTE']);
        $hashedPassword = $this->passwordHasher->hashPassword($gerente, 'gerente123');
        $gerente->setPassword($hashedPassword);
        $manager->persist($gerente);

        // Crear usuario staff (cocinero)
        $cocinero = new User();
        $cocinero->setEmail('cocinero@comanda.com');
        $cocinero->setRol('cocinero');
        $cocinero->setRoles(['ROLE_COCINA']);
        $hashedPassword = $this->passwordHasher->hashPassword($cocinero, 'cocina123');
        $cocinero->setPassword($hashedPassword);
        $manager->persist($cocinero);

        // Crear usuario staff (barman)
        $barman = new User();
        $barman->setEmail('barman@comanda.com');
        $barman->setRol('barman');
        $barman->setRoles(['ROLE_BARRA']);
        $hashedPassword = $this->passwordHasher->hashPassword($barman, 'barra123');
        $barman->setPassword($hashedPassword);
        $manager->persist($barman);

        // Crear usuario camarero
        $camarero = new User();
        $camarero->setEmail('camarero@comanda.com');
        $camarero->setRol('camarero');
        $camarero->setRoles(['ROLE_CAMARERO']);
        $hashedPassword = $this->passwordHasher->hashPassword($camarero, 'camarero123');
        $camarero->setPassword($hashedPassword);
        $manager->persist($camarero);

        $manager->flush();
    }
}