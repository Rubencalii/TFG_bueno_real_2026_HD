<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260202092953 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE reserva (id INT AUTO_INCREMENT NOT NULL, nombre_cliente VARCHAR(100) NOT NULL, telefono VARCHAR(20) NOT NULL, email VARCHAR(100) DEFAULT NULL, fecha DATE NOT NULL, hora TIME NOT NULL, num_personas INT NOT NULL, notas LONGTEXT DEFAULT NULL, estado VARCHAR(20) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, mesa_id INT DEFAULT NULL, INDEX IDX_188D2E3B8BDC7AE9 (mesa_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE reserva ADD CONSTRAINT FK_188D2E3B8BDC7AE9 FOREIGN KEY (mesa_id) REFERENCES mesa (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE reserva DROP FOREIGN KEY FK_188D2E3B8BDC7AE9');
        $this->addSql('DROP TABLE reserva');
    }
}
