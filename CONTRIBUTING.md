# Contributing to Comanda Digital 🍽️

First of all, thank you for considering contributing to this Project!

## 🛣️ Development Workflow

1.  **Fork the repo** and create your branch from `main`.
2.  **Install dependencies** using Docker: `./Iniciar_proyecto.sh`.
3.  **Implement your changes**:
    - Backend: Symfony 8 (PHP 8.3+)
    - Frontend: React via Symfony UX (located in `assets/react/controllers`)
4.  **Verify your code**:
    - Run tests: `docker compose exec app php bin/phpunit`.
    - Linting: `php bin/console lint:container`.
5.  **Documentation**: If you add a new API endpoint, update `docs/api_reference.md`. If you modify the DB, update `docs/database_schema.md`.

## 🎨 Coding Standards

- **PHP:** Follow PSR-12 and use strict types.
- **Javascript:** Use functional React components and Tailwind CSS for styling.
- **Commits:** Use descriptive commit messages (e.g., `feat: add allergy filters to menu`, `fix: kitchen panel polling interval`).

## 📁 Structure Reminder

- `/Backend/src`: Symfony core logic.
- `/Backend/assets/react`: React components and logic.
- `/Backend/templates`: Twig templates and base layouts.
- `/docs`: Project documentation and specifications.

---

_Happy Coding!_ 🚀
