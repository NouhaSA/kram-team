*# Provisionnement du serveur — Ansible*



*Playbook de provisionnement initial du VPS de production Kram Team.*

*Sprint 2 du cahier de stage.*



*## Ce que fait le playbook*



*- Met a jour le systeme (apt update/upgrade)*

*- Cree un utilisateur `deploy` (sudo, sans mot de passe pour sudo)*

*- Copie la cle SSH publique locale vers `deploy`*

*- Desactive l'authentification SSH par mot de passe et la connexion root*

*- Installe Docker Engine et le plugin Docker Compose*

*- Ajoute `deploy` au groupe `docker`*

*- Installe et active UFW (pare-feu) : seuls les ports 22, 80 et 443 sont ouverts*



*## Prerequis (sur la machine qui lance Ansible)*



*- Ansible installe (`pip install ansible` ou `apt install ansible`)*

*- Collection `community.general` (`ansible-galaxy collection install community.general`)*

*- Une paire de cles SSH locale (`\~/.ssh/id\_ed25519` / `id\_ed25519.pub`)*

*- Un acces SSH root (ou sudo) initial au VPS, pour la premiere execution*



*## Utilisation*



*1. Modifier `inventory.ini` : remplacer `CHANGE\_ME` par l'adresse IP reelle du VPS.*

*2. Lancer :*



*```bash*

*ansible-playbook -i inventory.ini playbook.yml*

*```*



*3. Verifier la connexion avec le nouvel utilisateur :*



*```bash*

*ssh deploy@<IP\_DU\_VPS>*

*```*



*4. Verifier Docker :*



*```bash*

*docker --version*

*docker compose version*

*```*



*## Etat de validation*



*Ce playbook n'a pas encore ete execute sur un serveur reel : aucun VPS n'est*

*disponible pour l'instant. Il est ecrit et pret a etre applique des que*

*l'acces au serveur sera fourni. A valider et corriger si besoin lors du*

*premier deploiement reel.*



*## Securite*



*- Ports ouverts : 22 (SSH), 80 (HTTP), 443 (HTTPS) uniquement.*

*- Aucun port de base de donnees (5432) ni de cache (6379) n'est expose au*

&#x20; *pare-feu : ces services restent accessibles uniquement entre conteneurs,*

&#x20; *via le reseau Docker interne (voir docker-compose.prod.yml).*

*- Connexion SSH par cle uniquement, connexion root desactivee.*

