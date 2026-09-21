# Franchise Kram Team

Site Next.js de l'offre de franchise **Kram Team**, avec téléchargement PDF moderne.

## Démarrer

```bash
cd web
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Fonctionnalités

- Page franchise basée sur `Offre de Franchise Kram Team.txt`
- Design sombre rouge/noir aligné sur la marque
- Bouton **Télécharger l'offre PDF** → `/api/franchise-pdf`
- PDF généré avec `@react-pdf/renderer` (couverture + 4 pages)

## Scripts

- `npm run dev` — développement
- `npm run build` — build production
- `npm start` — serveur production
