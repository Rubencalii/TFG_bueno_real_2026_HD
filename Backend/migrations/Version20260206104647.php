<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260206104647 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE ticket (id INT AUTO_INCREMENT NOT NULL, numero VARCHAR(20) NOT NULL, base_imponible NUMERIC(10, 2) NOT NULL, iva NUMERIC(10, 2) NOT NULL, total NUMERIC(10, 2) NOT NULL, metodo_pago VARCHAR(20) NOT NULL, estado VARCHAR(20) NOT NULL, created_at DATETIME NOT NULL, paid_at DATETIME DEFAULT NULL, detalle_json LONGTEXT DEFAULT NULL, ticket_rectificado_id INT DEFAULT NULL, mesa_id INT NOT NULL, UNIQUE INDEX UNIQ_97A0ADA3F55AE19E (numero), INDEX IDX_97A0ADA38BDC7AE9 (mesa_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE ticket ADD CONSTRAINT FK_97A0ADA38BDC7AE9 FOREIGN KEY (mesa_id) REFERENCES mesa (id)');
        $this->addSql('ALTER TABLE categoria ADD orden INT NOT NULL, ADD activa TINYINT NOT NULL');
        $this->addSql('ALTER TABLE categoria_traduccion DROP FOREIGN KEY `FK_B7A4C4973397707A`');
        $this->addSql('ALTER TABLE categoria_traduccion DROP FOREIGN KEY `FK_B7A4C497F975BF7E`');
        $this->addSql('ALTER TABLE categoria_traduccion ADD CONSTRAINT FK_9F8D9D5D3397707A FOREIGN KEY (categoria_id) REFERENCES categoria (id)');
        $this->addSql('ALTER TABLE categoria_traduccion ADD CONSTRAINT FK_9F8D9D5DDEDC0611 FOREIGN KEY (idioma_id) REFERENCES idioma (id)');
        $this->addSql('ALTER TABLE categoria_traduccion RENAME INDEX idx_b7a4c4973397707a TO IDX_9F8D9D5D3397707A');
        $this->addSql('ALTER TABLE categoria_traduccion RENAME INDEX idx_b7a4c497f975bf7e TO IDX_9F8D9D5DDEDC0611');
        $this->addSql('ALTER TABLE idioma CHANGE activo activo TINYINT NOT NULL');
        $this->addSql('ALTER TABLE idioma RENAME INDEX uniq_9d4f7d93e02d2cc2 TO UNIQ_1DC85E0C20332D99');
        $this->addSql('ALTER TABLE mesa CHANGE token_qr token_qr VARCHAR(12) NOT NULL');
        $this->addSql('ALTER TABLE producto ADD imagen VARCHAR(500) DEFAULT NULL, ADD activo TINYINT NOT NULL, ADD destacado TINYINT NOT NULL, ADD vegetariano TINYINT NOT NULL');
        $this->addSql('ALTER TABLE producto_traduccion DROP FOREIGN KEY `FK_6A7FA7A7F92F3E70`');
        $this->addSql('ALTER TABLE producto_traduccion DROP FOREIGN KEY `FK_6A7FA7A7F975BF7E`');
        $this->addSql('ALTER TABLE producto_traduccion ADD CONSTRAINT FK_D90F34ED7645698E FOREIGN KEY (producto_id) REFERENCES producto (id)');
        $this->addSql('ALTER TABLE producto_traduccion ADD CONSTRAINT FK_D90F34EDDEDC0611 FOREIGN KEY (idioma_id) REFERENCES idioma (id)');
        $this->addSql('ALTER TABLE producto_traduccion RENAME INDEX idx_6a7fa7a7f92f3e70 TO IDX_D90F34ED7645698E');
        $this->addSql('ALTER TABLE producto_traduccion RENAME INDEX idx_6a7fa7a7f975bf7e TO IDX_D90F34EDDEDC0611');
        $this->addSql('ALTER TABLE user CHANGE rol rol VARCHAR(50) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE ticket DROP FOREIGN KEY FK_97A0ADA38BDC7AE9');
        $this->addSql('DROP TABLE ticket');
        $this->addSql('ALTER TABLE categoria DROP orden, DROP activa');
        $this->addSql('ALTER TABLE categoria_traduccion DROP FOREIGN KEY FK_9F8D9D5D3397707A');
        $this->addSql('ALTER TABLE categoria_traduccion DROP FOREIGN KEY FK_9F8D9D5DDEDC0611');
        $this->addSql('ALTER TABLE categoria_traduccion ADD CONSTRAINT `FK_B7A4C4973397707A` FOREIGN KEY (categoria_id) REFERENCES categoria (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE categoria_traduccion ADD CONSTRAINT `FK_B7A4C497F975BF7E` FOREIGN KEY (idioma_id) REFERENCES idioma (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE categoria_traduccion RENAME INDEX idx_9f8d9d5d3397707a TO IDX_B7A4C4973397707A');
        $this->addSql('ALTER TABLE categoria_traduccion RENAME INDEX idx_9f8d9d5ddedc0611 TO IDX_B7A4C497F975BF7E');
        $this->addSql('ALTER TABLE idioma CHANGE activo activo TINYINT DEFAULT 1 NOT NULL');
        $this->addSql('ALTER TABLE idioma RENAME INDEX uniq_1dc85e0c20332d99 TO UNIQ_9D4F7D93E02D2CC2');
        $this->addSql('ALTER TABLE mesa CHANGE token_qr token_qr VARCHAR(64) NOT NULL');
        $this->addSql('ALTER TABLE producto DROP imagen, DROP activo, DROP destacado, DROP vegetariano');
        $this->addSql('ALTER TABLE producto_traduccion DROP FOREIGN KEY FK_D90F34ED7645698E');
        $this->addSql('ALTER TABLE producto_traduccion DROP FOREIGN KEY FK_D90F34EDDEDC0611');
        $this->addSql('ALTER TABLE producto_traduccion ADD CONSTRAINT `FK_6A7FA7A7F92F3E70` FOREIGN KEY (producto_id) REFERENCES producto (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE producto_traduccion ADD CONSTRAINT `FK_6A7FA7A7F975BF7E` FOREIGN KEY (idioma_id) REFERENCES idioma (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE producto_traduccion RENAME INDEX idx_d90f34ed7645698e TO IDX_6A7FA7A7F92F3E70');
        $this->addSql('ALTER TABLE producto_traduccion RENAME INDEX idx_d90f34eddedc0611 TO IDX_6A7FA7A7F975BF7E');
        $this->addSql('ALTER TABLE user CHANGE rol rol VARCHAR(50) DEFAULT \'camarero\' NOT NULL');
    }
}
