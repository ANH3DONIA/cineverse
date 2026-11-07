# CineVerse - Portal de Películas

Proyecto web para la Unidad 3 que incluye seguridad, web services y APIs.

## Pantallas
- Inicio - Películas en tendencia, mejor valoradas y estrenos
- Registro - Formulario con validación completa
- Catálogo - Búsqueda y exploración de películas con detalle

## Tecnologías
- HTML5, CSS3, JavaScript
- API externa: TMDB (The Movie Database)
- Backend proxy: Node.js y Express

## Seguridad implementada
- API keys protegidas en .env
- Backend proxy para ocultar claves del cliente
- Validación de formularios (cliente y servidor)
- Sanitización de inputs contra XSS
- Cabeceras de seguridad HTTP

## Instalación

1. Clona el repositorio
2. Copia .env.example a .env y agrega tu API key de TMDB
3. Instala dependencias:
   ```bash
   npm install
   ```
4. Ejecuta el servidor:
   ```bash
   npm start
   ```
5. Abre `http://localhost:3000` en tu navegador
