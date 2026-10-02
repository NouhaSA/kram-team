# Monitoring — Kram Team

Sprint 4 du cahier de stage : monitoring basique.

## Option retenue : Uptime Kuma

Uptime Kuma est un outil de supervision auto-heberge, simple a deployer
en un conteneur, avec alertes email/Telegram integrees.

## Ajout a docker-compose.prod.yml (a faire sur le serveur)

```yaml
  uptime-kuma:
    image: louislam/uptime-kuma:1
    container_name: kram-uptime-kuma
    restart: unless-stopped
    volumes:
      - kram_uptime_kuma:/app/data
    ports:
      - "3001:3001"
    deploy:
      resources:
        limits:
          cpus: "0.3"
          memory: 128M
```

Et ajouter `kram_uptime_kuma:` a la liste des volumes.

## Configuration (apres premier demarrage)

1. Ouvrir `http://<IP_DU_VPS>:3001` et creer le compte admin.
2. Ajouter un moniteur HTTP(S) :
   - URL : `https://api.__DOMAIN__/api/health`
   - Intervalle : 60 secondes
   - Attendu : code 200 + contenu contient `"status":"ok"`
3. Ajouter un deuxieme moniteur pour le frontend :
   - URL : `https://app.__DOMAIN__`
4. Configurer une notification (email ou Telegram) sur chaque moniteur,
   declenchee apres 2 echecs consecutifs.

## Alternative simple sans conteneur supplementaire

Healthcheck cron + mail, sans Uptime Kuma :

```bash
*/5 * * * * curl -fsS https://api.__DOMAIN__/api/health > /dev/null || echo "Kram API down" | mail -s "ALERTE Kram API" admin@__DOMAIN__
```

## Etat de validation

Non teste : necessite le VPS et un domaine reel. Choix a confirmer avec
le tuteur (Uptime Kuma vs cron+mail) avant mise en place.
