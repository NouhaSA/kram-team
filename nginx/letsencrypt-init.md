# Obtenir les certificats Let's Encrypt

Procedure a executer une seule fois sur le serveur de production, une fois
les domaines `app.__DOMAIN__` et `api.__DOMAIN__` pointes vers l'IP du VPS
(enregistrements DNS de type A).

## 1. Preparer les dossiers partages

```bash
mkdir -p certbot/www certbot/conf
```

## 2. Premiere demande de certificat

Nginx doit deja tourner (meme sans HTTPS actif) pour servir le challenge
`/.well-known/acme-challenge/`. Lancer :

```bash
docker run --rm \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  certbot/certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  --email admin@__DOMAIN__ --agree-tos --no-eff-email \
  -d app.__DOMAIN__ -d api.__DOMAIN__
```

## 3. Monter les certificats dans Nginx

Dans `docker-compose.prod.yml`, le service `nginx` doit monter :

```yaml
volumes:
  - ./nginx/nginx.prod.conf:/etc/nginx/conf.d/default.conf:ro
  - ./certbot/conf:/etc/letsencrypt:ro
  - ./certbot/www:/var/www/certbot:ro
```

## 4. Renouvellement automatique

Les certificats Let's Encrypt expirent tous les 90 jours. Ajouter une tache
cron sur le serveur (hors conteneur), par exemple tous les jours a 3h :

```text
0 3 * * * docker run --rm -v /chemin/vers/certbot/www:/var/www/certbot -v /chemin/vers/certbot/conf:/etc/letsencrypt certbot/certbot renew --webroot --webroot-path=/var/www/certbot && docker compose -f /chemin/vers/docker-compose.prod.yml restart nginx
```

## Etat de validation

Non teste : necessite un nom de domaine reel pointant vers le VPS. A
executer et valider lors du premier deploiement reel (voir README dans
ansible/ pour le provisionnement du serveur au prealable).
