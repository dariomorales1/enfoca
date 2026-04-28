# discovery-service

Servidor Eureka que actúa como registro central de microservicios para la plataforma Enfoca.

## Puerto

`8761`

## Arranque local

```bash
./mvnw spring-boot:run
```

Luego abrir `http://localhost:8761` en el navegador. La consola Eureka debe cargar con la sección **Instances currently registered with Eureka** vacía hasta que arranquen otros microservicios.

## Arranque con Docker

```bash
docker build -t enfoca/discovery-service .
docker run -p 8761:8761 -e EUREKA_HOSTNAME=localhost enfoca/discovery-service
```

## Variables de entorno

| Variable          | Valor por defecto | Descripción                                   |
|-------------------|-------------------|-----------------------------------------------|
| `EUREKA_HOSTNAME` | `localhost`       | Hostname que Eureka usa para anunciarse       |

En despliegue Docker Compose usar `EUREKA_HOSTNAME=discovery-service`.

## Perfiles

| Perfil   | Uso                        |
|----------|----------------------------|
| `local`  | Desarrollo en máquina local |
| `docker` | Contenedores / Docker Compose |

## Ejecutar pruebas

```bash
./mvnw test
```
