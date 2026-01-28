<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260128115734 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE detalle_pedido (id INT AUTO_INCREMENT NOT NULL, cantidad INT NOT NULL, notas LONGTEXT DEFAULT NULL, precio_unitario NUMERIC(6, 2) NOT NULL, pedido_id INT NOT NULL, producto_id INT NOT NULL, INDEX IDX_A834F5694854653A (pedido_id), INDEX IDX_A834F5697645698E (producto_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE mesa (id INT AUTO_INCREMENT NOT NULL, numero INT NOT NULL, token_qr VARCHAR(64) NOT NULL, activa TINYINT NOT NULL, UNIQUE INDEX UNIQ_98B382F23711CAB1 (token_qr), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE pedido (id INT AUTO_INCREMENT NOT NULL, estado VARCHAR(20) NOT NULL, created_at DATETIME NOT NULL, total_calculado NUMERIC(8, 2) DEFAULT NULL, mesa_id INT NOT NULL, INDEX IDX_C4EC16CE8BDC7AE9 (mesa_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE detalle_pedido ADD CONSTRAINT FK_A834F5694854653A FOREIGN KEY (pedido_id) REFERENCES pedido (id)');
        $this->addSql('ALTER TABLE detalle_pedido ADD CONSTRAINT FK_A834F5697645698E FOREIGN KEY (producto_id) REFERENCES producto (id)');
        $this->addSql('ALTER TABLE pedido ADD CONSTRAINT FK_C4EC16CE8BDC7AE9 FOREIGN KEY (mesa_id) REFERENCES mesa (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE detalle_pedido DROP FOREIGN KEY FK_A834F5694854653A');
        $this->addSql('ALTER TABLE detalle_pedido DROP FOREIGN KEY FK_A834F5697645698E');
        $this->addSql('ALTER TABLE pedido DROP FOREIGN KEY FK_C4EC16CE8BDC7AE9');
        $this->addSql('DROP TABLE detalle_pedido');
        $this->addSql('DROP TABLE mesa');
        $this->addSql('DROP TABLE pedido');
    }
}
