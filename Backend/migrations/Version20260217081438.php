<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260217081438 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE dispositivo (id INT AUTO_INCREMENT NOT NULL, token VARCHAR(255) NOT NULL, plataforma VARCHAR(20) NOT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, INDEX IDX_A05F26EEA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE pago (id INT AUTO_INCREMENT NOT NULL, monto NUMERIC(10, 2) NOT NULL, metodo_pago VARCHAR(20) NOT NULL, transaction_id VARCHAR(100) DEFAULT NULL, estado VARCHAR(20) NOT NULL, created_at DATETIME NOT NULL, ticket_id INT NOT NULL, INDEX IDX_F4DF5F3E700047D2 (ticket_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE dispositivo ADD CONSTRAINT FK_A05F26EEA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE pago ADD CONSTRAINT FK_F4DF5F3E700047D2 FOREIGN KEY (ticket_id) REFERENCES ticket (id)');
        $this->addSql('ALTER TABLE mesa ADD camarero_asignado_id INT DEFAULT NULL, CHANGE solicita_pin solicita_pin TINYINT NOT NULL');
        $this->addSql('ALTER TABLE mesa ADD CONSTRAINT FK_98B382F2BE3B5FA7 FOREIGN KEY (camarero_asignado_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_98B382F2BE3B5FA7 ON mesa (camarero_asignado_id)');
        $this->addSql('ALTER TABLE pedido ADD impreso TINYINT NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE dispositivo DROP FOREIGN KEY FK_A05F26EEA76ED395');
        $this->addSql('ALTER TABLE pago DROP FOREIGN KEY FK_F4DF5F3E700047D2');
        $this->addSql('DROP TABLE dispositivo');
        $this->addSql('DROP TABLE pago');
        $this->addSql('ALTER TABLE mesa DROP FOREIGN KEY FK_98B382F2BE3B5FA7');
        $this->addSql('DROP INDEX IDX_98B382F2BE3B5FA7 ON mesa');
        $this->addSql('ALTER TABLE mesa DROP camarero_asignado_id, CHANGE solicita_pin solicita_pin TINYINT DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE pedido DROP impreso');
    }
}
