<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260128110948 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE alergeno (id INT AUTO_INCREMENT NOT NULL, nombre VARCHAR(100) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE bebida (id INT AUTO_INCREMENT NOT NULL, nombre VARCHAR(100) NOT NULL, precio NUMERIC(6, 2) NOT NULL, tipo VARCHAR(50) DEFAULT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE categoria (id INT AUTO_INCREMENT NOT NULL, nombre VARCHAR(100) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE demo (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE producto (id INT AUTO_INCREMENT NOT NULL, nombre VARCHAR(150) NOT NULL, descripcion LONGTEXT DEFAULT NULL, precio NUMERIC(6, 2) NOT NULL, categoria_id INT NOT NULL, INDEX IDX_A7BB06153397707A (categoria_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE producto_alergeno (producto_id INT NOT NULL, alergeno_id INT NOT NULL, INDEX IDX_853F9DF7645698E (producto_id), INDEX IDX_853F9DF3E89035 (alergeno_id), PRIMARY KEY (producto_id, alergeno_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE messenger_messages (id BIGINT AUTO_INCREMENT NOT NULL, body LONGTEXT NOT NULL, headers LONGTEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL, available_at DATETIME NOT NULL, delivered_at DATETIME DEFAULT NULL, INDEX IDX_75EA56E0FB7336F0E3BD61CE16BA31DBBF396750 (queue_name, available_at, delivered_at, id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE producto ADD CONSTRAINT FK_A7BB06153397707A FOREIGN KEY (categoria_id) REFERENCES categoria (id)');
        $this->addSql('ALTER TABLE producto_alergeno ADD CONSTRAINT FK_853F9DF7645698E FOREIGN KEY (producto_id) REFERENCES producto (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE producto_alergeno ADD CONSTRAINT FK_853F9DF3E89035 FOREIGN KEY (alergeno_id) REFERENCES alergeno (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE producto DROP FOREIGN KEY FK_A7BB06153397707A');
        $this->addSql('ALTER TABLE producto_alergeno DROP FOREIGN KEY FK_853F9DF7645698E');
        $this->addSql('ALTER TABLE producto_alergeno DROP FOREIGN KEY FK_853F9DF3E89035');
        $this->addSql('DROP TABLE alergeno');
        $this->addSql('DROP TABLE bebida');
        $this->addSql('DROP TABLE categoria');
        $this->addSql('DROP TABLE demo');
        $this->addSql('DROP TABLE producto');
        $this->addSql('DROP TABLE producto_alergeno');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
