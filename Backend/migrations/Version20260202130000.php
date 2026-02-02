<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Agregar campo 'rol' a la tabla user y eliminar tablas no usadas
 */
final class Version20260202130000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Agregar campo rol a user, eliminar tablas bebida y demo';
    }

    public function up(Schema $schema): void
    {
        // Agregar columna rol a user
        $this->addSql('ALTER TABLE user ADD rol VARCHAR(50) DEFAULT \'camarero\' NOT NULL');
        
        // Eliminar tablas no usadas si existen
        $this->addSql('DROP TABLE IF EXISTS bebida');
        $this->addSql('DROP TABLE IF EXISTS demo');
    }

    public function down(Schema $schema): void
    {
        // Eliminar columna rol
        $this->addSql('ALTER TABLE user DROP COLUMN rol');
        
        // Recrear tabla bebida
        $this->addSql('CREATE TABLE bebida (
            id INT AUTO_INCREMENT NOT NULL,
            nombre VARCHAR(100) NOT NULL,
            precio NUMERIC(6, 2) NOT NULL,
            tipo VARCHAR(50) DEFAULT NULL,
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        
        // Recrear tabla demo
        $this->addSql('CREATE TABLE demo (
            id INT AUTO_INCREMENT NOT NULL,
            name VARCHAR(255) NOT NULL,
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }
}
