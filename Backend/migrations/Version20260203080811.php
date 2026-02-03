<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260203080811 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Agregar sistema multiidioma (ES, FR, EN) con tablas idioma, producto_traduccion y categoria_traduccion';
    }

    public function up(Schema $schema): void
    {
        // Tabla idioma
        $this->addSql('CREATE TABLE idioma (
            id INT AUTO_INCREMENT NOT NULL, 
            codigo VARCHAR(2) NOT NULL, 
            nombre VARCHAR(50) NOT NULL, 
            bandera VARCHAR(10) NOT NULL, 
            activo TINYINT(1) NOT NULL DEFAULT 1, 
            UNIQUE INDEX UNIQ_9D4F7D93E02D2CC2 (codigo), 
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Tabla producto_traduccion
        $this->addSql('CREATE TABLE producto_traduccion (
            id INT AUTO_INCREMENT NOT NULL, 
            producto_id INT NOT NULL, 
            idioma_id INT NOT NULL, 
            nombre VARCHAR(150) NOT NULL, 
            descripcion LONGTEXT DEFAULT NULL, 
            INDEX IDX_6A7FA7A7F92F3E70 (producto_id), 
            INDEX IDX_6A7FA7A7F975BF7E (idioma_id), 
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Tabla categoria_traduccion
        $this->addSql('CREATE TABLE categoria_traduccion (
            id INT AUTO_INCREMENT NOT NULL, 
            categoria_id INT NOT NULL, 
            idioma_id INT NOT NULL, 
            nombre VARCHAR(100) NOT NULL, 
            INDEX IDX_B7A4C4973397707A (categoria_id), 
            INDEX IDX_B7A4C497F975BF7E (idioma_id), 
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Claves foráneas
        $this->addSql('ALTER TABLE producto_traduccion ADD CONSTRAINT FK_6A7FA7A7F92F3E70 FOREIGN KEY (producto_id) REFERENCES producto (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE producto_traduccion ADD CONSTRAINT FK_6A7FA7A7F975BF7E FOREIGN KEY (idioma_id) REFERENCES idioma (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE categoria_traduccion ADD CONSTRAINT FK_B7A4C4973397707A FOREIGN KEY (categoria_id) REFERENCES categoria (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE categoria_traduccion ADD CONSTRAINT FK_B7A4C497F975BF7E FOREIGN KEY (idioma_id) REFERENCES idioma (id) ON DELETE CASCADE');

        // Datos iniciales de idiomas
        $this->addSql("INSERT INTO idioma (codigo, nombre, bandera, activo) VALUES 
            ('es', 'Español', '🇪🇸', 1),
            ('fr', 'Français', '🇫🇷', 1),
            ('en', 'English', '🇬🇧', 1)");
    }

    public function down(Schema $schema): void
    {
        // Eliminar claves foráneas
        $this->addSql('ALTER TABLE producto_traduccion DROP FOREIGN KEY FK_6A7FA7A7F92F3E70');
        $this->addSql('ALTER TABLE producto_traduccion DROP FOREIGN KEY FK_6A7FA7A7F975BF7E');
        $this->addSql('ALTER TABLE categoria_traduccion DROP FOREIGN KEY FK_B7A4C4973397707A');
        $this->addSql('ALTER TABLE categoria_traduccion DROP FOREIGN KEY FK_B7A4C497F975BF7E');

        // Eliminar tablas
        $this->addSql('DROP TABLE categoria_traduccion');
        $this->addSql('DROP TABLE producto_traduccion');
        $this->addSql('DROP TABLE idioma');
    }
}
