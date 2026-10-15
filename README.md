# HMZ Crud

## Executar Aplicação

### Docker

```bash
docker compose up -d --build
```

- Front-end: <http://localhost:8085>
- Back-end (API): <http://localhost:3300>
- Mailpit: <http://localhost:8025>

### Local

#### Banco

```bash
psql -U postgres -d postgres -c "CREATE ROLE hmz WITH LOGIN PASSWORD 'hmz';"
psql -U postgres -d postgres -c "CREATE DATABASE hmz OWNER hmz;"
```

#### Back-end

```bash
cd backend
cp .env.example .env
npm install
npm run migrate
npm run dev
```

> O seed roda automaticamente na primeira chamada à API que acessa o banco, a partir de `backend/users.json`.

#### Front-end

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

> Necessário [instalar o Mailpit](https://mailpit.axllent.org/docs/install/) para a funcionalidade de recuperar senha.

## Credenciais

| E-mail                   | Senha    |
| ------------------------ | -------- |
| `george.bluth@reqres.in` | `123456` |

## API

O login aceita **HTTP Basic Auth** (`Authorization: Basic base64(email:password)`) ou um body JSON (`{ email, password }`). As rotas do dashboard exigem o header `Authorization: Bearer <token>`.

| Método   | Rota                    | Body                                                             | Retorno                                                 |
| -------- | ----------------------- | ---------------------------------------------------------------- | ------------------------------------------------------- |
| `GET`    | `/`                     | –                                                                | `{ message }`                                           |
| `GET`    | `/health`               | –                                                                | `{ status }`                                            |
| `POST`   | `/api/login`            | Basic auth (`email`, `password`) ou `{ email, password }`        | `{ token, id }`                                         |
| `POST`   | `/api/forgot-password`  | `{ email }`                                                      | `{ ok }`                                                |
| `POST`   | `/api/reset-password`   | `{ token, password }`                                            | `{ ok }`                                                |
| `GET`    | `/api/users`            | `?page=&per_page=`                                               | `{ page, per_page, total, total_pages, data: User[] }`  |
| `GET`    | `/api/users/:id\|:slug` | –                                                                | `{ data: User }`                                        |
| `POST`   | `/api/users`            | `{ email, first_name, last_name, avatar?, slug?, password? }`    | `{ data: User }` (201)                                  |
| `PUT`    | `/api/users/:id`        | `{ email?, first_name?, last_name?, avatar?, slug?, password? }` | `{ data: User }`                                        |
| `DELETE` | `/api/users/:id`        | –                                                                | 204                                                     |

`User`: `{ id, email, first_name, last_name, avatar, slug, created_at, updated_at }`.

## Detalhes da Stack

```
backend/  -> Hono API + Prisma 8
frontend/ -> Vite + React + Shadcn UI
```