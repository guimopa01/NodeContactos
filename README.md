# Node Contactos

## Tecnologías

- **JavaScript**: Lenguaje utilizado.
- **Node.js**: Entorno que de ejecución de JavaScript.
- **Express.js**: Framework principal de la app.
- **Prisma**: ORM que permite consultar PostgreSQL desde JavaScript usando models.
- **PostgreSQL**: Base de datos.
- **EJS**: Motor de plantillas que permite meter código JavaScript dentro de archivos HTML.

## Cómo funciona la app

La aplicación está hecha con express. Cuando se abre la agenda, express recibe la petición, busca la ruta y prepara la página que se devuelve al navegador. Para mostrar los contactos, consulta postgresql a través de prisma y pasa los resultados a una plantilla ejs y se genera el html.

Al crear o editar un contacto el formulario envía sus datos al servidor, la ruta los dirige al controlador y este comprueba la información antes de guardarla con prisma. Las páginas de gestión de contactos solo están disponibles al iniciar sesión y se no esta iniciada se envia al login. Las rutas están en `routes/` y la lógica de cada petición está en `controllers/`. Express se encarga de recibir y responder peticiones y prisma de comunicarse con la base de datos.

## Funcionalidades

- Consultar la agenda de contactos.
- Crear una cuenta, iniciar sesión y cerrar sesión.
- Ver, añadir, editar y eliminar contactos después de iniciar sesión.
- Guardar para cada contacto su nombre, teléfono, correo electrónico y provincia.
- Mostrar páginas html en la app para que el usuario las pueda ver.
- Guardar las contraseñas y comprobar al iniciar sesión si coinciden.

## Requisitos

Para este proyecto necesitas:

- Node.js.
- PostgreSQL.
- Base de datos para la app configurada en `node_contactos/.env`.
- Una provincia y paises guardados para que no de ningun error.

Cuando se ejecuta la app prisma sincroniza las tablas desde `schema.prisma`.

## Configuración

Instalar las dependencias:

```bash
npm --prefix node_contactos install
```

Crea `node_contactos/.env` e inserta los datos para la base de datos:

```dotenv
PORT= ??
DB_USER= ??
DB_HOST= ??
DB_NAME= ??
DB_PASSWORD= ??
DB_PORT= ??
```

Antes de registrar usuarios o crear contactos, añade en la base de datos los paises y provincias. La app no esta configurada para insertar datos iniciales.

## Ejecución

Puedes iniciar la app con el siguiente comando desde el terminal:

```bash
npm start
```

El servidor usa el puerto 3000 de forma predeterminada. Al usar el comando, se sincroniza el esquema de prisma con la base de datos y después el servidor comprueba la conexión a postgresql.

## Comandos 

Puedes utilizar los siguiente comandos de prisma:

```bash
npm run db:push      # Sincronización prisma -> postgresql
npm run db:generate  # Genera el cliente prisma
npm run studio       # Abre prisma en el puerto 5555
```


## Estructura principal

- `node_contactos/app.js`: configura express, middleware, sesiones, vistas y rutas.
- `node_contactos/routes/`: define las direcciones htp y acciones.
- `node_contactos/controllers/`: implementa la lógica de las peticiones.
- `node_contactos/middlewares/`: incluye comprobaciones de autenticación.
- `node_contactos/config/`: configura la conexión y el inicio de prisma.
- `node_contactos/prisma/schema.prisma`: define los modelos y relaciones de postgresql.
- `node_contactos/views/`: contiene las plantillas ejs.
- `node_contactos/public/`: contiene archivos css.


## Enlace 

[IA utilizada](./IA.md)
