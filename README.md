# Naroyu calendar

## Start guide

Create account at google cloud and add

- OAuth2.0 Client ID
- Consent screen with following scopes:
"<https://www.googleapis.com/auth/userinfo.email>",
"<https://www.googleapis.com/auth/userinfo.profile>",
"<https://www.googleapis.com/auth/calendar>",
- Enable Google Calendar API

Create AWS account and add

- Access tokens
- S3 bucket

Update `.env` with your credentials

Execute `sudo docker compose up`

For production build edit backend build target in `docker-compose.yml`

## Useful commands

Manual migrations start

```sh
sudo docker exec calendar-backend yarn typeorm migration:run
```

Generate updated migrations queries in console

```sh
sudo docker exec calendar-backend yarn typeorm migration:generate migration_name --dr
```
