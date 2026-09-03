# Portfolio synchronisé avec Discord

Un portfolio 100 % gratuit, hébergé sur GitHub Pages. Poste une image dans un salon Discord dédié, et elle apparaît automatiquement sur ton site en quelques minutes — pas besoin d'ordinateur ou de terminal une fois que c'est en place.

## Comment ça marche

1. Tu postes une image dans un salon Discord privé (visible seulement par toi et ton bot).
2. Toutes les 20 minutes, GitHub exécute un petit script (`scripts/sync-discord.js`) qui va chercher les nouvelles images du salon.
3. Le script les ajoute au dossier `images/` et au fichier `data/images.json`, puis publie automatiquement le changement.
4. Ton site (`index.html`) lit ce fichier JSON et affiche la galerie.

Tout est gratuit : GitHub (hébergement + automatisation) et Discord (bot).

---

## Étape 1 — Créer le bot Discord

1. Va sur https://discord.com/developers/applications et clique sur **New Application**. Donne-lui un nom (ex: `portfolio-sync`).
2. Dans le menu de gauche, va dans **Bot** → clique sur **Reset Token** (ou **Add Bot**) → copie le **token**. Garde-le secret, ne le partage jamais publiquement.
3. Toujours dans l'onglet **Bot**, active l'option **Message Content Intent** (dans "Privileged Gateway Intents"). C'est nécessaire pour que le bot puisse lire le contenu des messages et les images.
4. Va dans **OAuth2 → URL Generator** :
   - Coche `bot` dans "Scopes"
   - Coche `View Channel` et `Read Message History` dans "Bot Permissions"
   - Copie l'URL générée en bas, ouvre-la dans ton navigateur, et invite le bot sur ton serveur Discord (crée-en un juste pour toi si besoin).

## Étape 2 — Créer le salon dédié

1. Sur ton serveur Discord, crée un salon texte, par exemple `#portfolio-upload`.
2. Assure-toi que le bot a bien accès à ce salon.
3. Récupère l'**ID du salon** : active le mode développeur Discord (Réglages → Avancés → Mode développeur), puis clic droit sur le salon → **Copier l'identifiant**.

## Étape 3 — Mettre le projet sur GitHub

1. Crée un compte gratuit sur https://github.com si tu n'en as pas.
2. Crée un nouveau dépôt (repository) **public**, par exemple `mon-portfolio`.
3. Mets tous les fichiers de ce projet dedans (via l'interface web "Upload files", ou avec `git` si tu es à l'aise) :
   ```
   git init
   git add .
   git commit -m "Premier envoi du portfolio"
   git branch -M main
   git remote add origin https://github.com/TON-PSEUDO/mon-portfolio.git
   git push -u origin main
   ```

## Étape 4 — Ajouter les secrets

Dans ton dépôt GitHub : **Settings → Secrets and variables → Actions → New repository secret**. Ajoute :

| Nom du secret | Valeur |
|---|---|
| `DISCORD_BOT_TOKEN` | le token copié à l'étape 1 |
| `DISCORD_CHANNEL_ID` | l'identifiant du salon copié à l'étape 2 |

## Étape 5 — Activer GitHub Pages

**Settings → Pages** → dans "Build and deployment", choisis **Deploy from a branch**, branche `main`, dossier `/ (root)`. Sauvegarde.

Ton site sera visible à `https://TON-PSEUDO.github.io/mon-portfolio/` (ça peut prendre 1–2 minutes la première fois).

## Étape 6 — Tester

1. Poste une image dans `#portfolio-upload` sur Discord, avec un petit texte en légende si tu veux (ex: `Affiche pour le festival #illustration`).
2. Va dans l'onglet **Actions** de ton dépôt GitHub, et lance manuellement le workflow **Synchro Discord vers le portfolio** (bouton "Run workflow") pour ne pas attendre les 20 minutes.
3. Rafraîchis ton site : l'image doit apparaître.

---

## Astuces

- **Tags / filtres** : ajoute un mot-clé précédé de `#` dans la légende du message Discord (ex: `#logo`, `#affiche`, `#illustration`). Le site crée automatiquement un bouton de filtre pour chaque tag utilisé.
- **Changer le nom / le texte d'intro** : modifie directement `index.html` (les champs `Ton Nom` et la légende sous ton nom).
- **Fréquence de synchro** : modifie la ligne `cron` dans `.github/workflows/sync-discord.yml` si tu veux que ce soit plus ou moins fréquent (minimum recommandé : 5-10 minutes).
- Le script ne regarde que les 100 derniers messages du salon à chaque passage — largement suffisant pour un usage perso.

## Structure du projet

```
index.html              → la page du portfolio
style.css               → le design
script.js                → construit la galerie à partir du JSON
data/images.json        → liste des images (rempli automatiquement)
images/                 → les images téléchargées depuis Discord
scripts/sync-discord.js → le script qui va chercher les images sur Discord
.github/workflows/      → l'automatisation GitHub Actions
```
