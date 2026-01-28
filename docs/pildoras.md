# Píldoras de Investigación - TFG

## MailHog en Symfony y Docker
MailHog es un servidor SMTP de desarrollo que captura los correos enviados por la app y los muestra en una interfaz web. Para usarlo:
- Añade el servicio MailHog en tu docker-compose.yaml.
- Configura la variable MAILER_DSN en .env:
  MAILER_DSN=smtp://mailhog:1025

## Relaciones Unidireccionales vs Bidireccionales en Doctrine
- **Unidireccional:** Solo una entidad conoce la relación. Más simple, menos control.
- **Bidireccional:** Ambas entidades conocen la relación. Permite navegar en ambos sentidos y sincronizar colecciones.

## orphanRemoval y cascade={"persist"} en Doctrine
- **orphanRemoval=true:** Si se elimina la relación, Doctrine borra el objeto huérfano de la base de datos.
- **cascade={"persist"}:** Al guardar la entidad principal, también se guardan las relacionadas automáticamente.

Más info: https://symfony.com/doc/current/doctrine/associations.html
