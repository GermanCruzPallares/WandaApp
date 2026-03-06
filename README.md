# Wanda App

![Wanda App Logo](./frontend/src/images/OscuroPrincipal.png)

Wanda App es una aplicación web integral para la gestión de finanzas personales y compartidas. Permite a los usuarios administrar sus cuentas, establecer objetivos de ahorro, registrar transacciones (ingresos, gastos y ahorros) y gestionar deudas o gastos compartidos con otros usuarios.

## Arquitectura

El proyecto está compuesto por tres componentes principales:

1. **Frontend**: Desarrollado en **Vue 3** con **Vite**, **TypeScript** y **Vuetify**. Compilado estáticamente y servido a través de un servidor Nginx en producción.
2. **Backend**: Desarrollado en **C# .NET 8** (ASP.NET Core Web API). Maneja la lógica de negocio, autenticación con JWT y proporciona una API REST.
3. **Base de Datos**: Motor **Microsoft SQL Server 2022**. Alojada y gestionada de forma externa mediante **AWS RDS**.

Por tanto, el orquestador (`docker-compose.yml`) se encarga únicamente de levantar los servicios del backend y frontend, dejándolos listos para conectarse a tu base de datos remota.

## Requisitos Previos

- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/) instalados en tu sistema.
- Puertos disponibles en tu máquina anfitriona: `80` (Frontend) y `8080` (Backend API).
- Conexión a Internet para que el backend pueda acceder a la instancia de AWS RDS.

## 🚀 Despliegue Rápido (Backend y Frontend)

La forma más sencilla de levantar la aplicación es utilizando el archivo `docker-compose.yml` que se encuentra en la raíz del proyecto.

1. Abre una terminal en la raíz del proyecto (`WandaApp`).
2. Ejecuta el siguiente comando:

```bash
docker-compose up -d --build
```

### ¿Qué ocurre internamente?

- **Backend (`wanda_backend`)**: Se compila el proyecto `.NET 8`, se despliega y queda expuesto en `http://localhost:8080`. Este contenedor estará conectado automáticamente a la BBDD RDS de Amazon configurada previamente.
- **Frontend (`wanda_frontend`)**: Se instalan las dependencias de Vue, se ejecuta la _build_ de Vite y los archivos resultantes son servidos mediante un servidor **Nginx** expuesto en el puerto `80`.

### Accesos

Una vez levantados los contenedores, tendrás disponible:

- **Interfaz de Usuario Web (Frontend)**: [http://localhost](http://localhost)
- **API Backend**: [http://localhost:8080](http://localhost:8080)

## 🛑 Detener la Aplicación

Para detener todos los servicios y contenedores, ejecuta en la misma ruta:

```bash
docker-compose down
```

---

## Estructura de Carpetas

```plaintext
WandaApp/
├── backend/                  # Proyecto ASP.NET Core (API)
│   ├── Controllers/          # Controladores que exponen los endpoints REST
│   ├── Models/               # Definición de entidades de la base de datos
│   ├── Services/ & Repos/    # Lógica de negocio y acceso a datos
│   └── Dockerfile            # Dockerfile para la build del backend
├── frontend/                 # Proyecto Vue 3 / Vite
│   ├── src/                  # Código fuente (Componentes, Views, Router, Pinia)
│   ├── public/               # Assets públicos
│   └── Dockerfile            # Dockerfile para compilar y servir el frontend con Nginx
├── docker-compose.yml        # Orquestador principal de la infraestructura
└── README.md                 # Archivo actual
```

## Desarrollo Local Manual

Si deseas arrancar los proyectos para realizar desarrollo activo en local sin usar los contenedores Docker:

### 1. Backend (Modo Desarrollo)

Ve al directorio `backend/` y ejecuta:

```bash
dotnet restore
dotnet run
```

_(Asegúrate de configurar los strings de conexión en `appsettings.Development.json` apuntando a RDS si los necesitas cambiar)._

### 2. Frontend (Modo Desarrollo con Hot-Reload)

Ve al directorio `frontend/` y ejecuta:

```bash
npm install
npm run dev
```

---

## Usuarios Iniciales de Prueba (Desde RDS)

Si la base de datos de producción / RDS tiene la data inicial, deberías poder probar la aplicación usando:

| Rol   | Email           | Contraseña |
| ----- | --------------- | ---------- |
| Admin | admin@gmail.com | Wanda123!  |

_(Para más detalles sobre endpoints y entidades puedes revisar `backend/README.md`)_
