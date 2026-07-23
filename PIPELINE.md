# PIPELINE.md — contrat d'intégration espace client ↔ pipeline

Référence : `C:\Users\natha\Claude Code\brief-espace-client.md`. Le pipeline
(`C:\Users\natha\Claude Code\vesta-pipeline`) communique avec l'espace client via une
API REST authentifiée par token. Ce document EST le contrat : le mock du site
(`src/lib/client/`) stocke déjà les jobs exactement dans ce format, le backend réel
devra servir les mêmes objets.

## État actuel

Le site est en export statique sur GitHub Pages : **l'API n'existe pas encore**.
L'espace client tourne en mock navigateur (localStorage), au schéma exact ci-dessous.
Le jour de l'hébergement réel (Supabase ou petit serveur Node), on implémente :
1. les 4 endpoints ci-dessous ;
2. un adaptateur `VestaBackend` réel (une ligne à changer dans `src/lib/client/backend.ts`) ;
3. les emails réels dans `src/lib/client/notify.ts` (Resend).

## Authentification

```
Authorization: Bearer <PIPELINE_TOKEN>
```

`PIPELINE_TOKEN` : variable d'environnement des deux côtés (backend + `.env` du
pipeline). Jamais commitée. URL de base de l'API : à documenter ici au déploiement
(placeholder ci-dessous : `https://api.vesta.example`).

## Endpoints

### Lister les demandes à traiter
```bash
curl -H "Authorization: Bearer $PIPELINE_TOKEN" \
  "https://api.vesta.example/api/pipeline/jobs?status=recu"
```
Réponse : tableau de jobs (schéma ci-dessous). `status` filtrable par n'importe
quelle valeur de statut.

### Détail d'une demande
```bash
curl -H "Authorization: Bearer $PIPELINE_TOKEN" \
  "https://api.vesta.example/api/pipeline/jobs/job_xxx"
```

### Changer le statut
```bash
curl -X POST -H "Authorization: Bearer $PIPELINE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "status": "en_production" }' \
  "https://api.vesta.example/api/pipeline/jobs/job_xxx/status"
```
`message` optionnel — obligatoire en pratique pour `attention_requise` (affiché au
client, qui peut répondre avec texte + photos ; la réponse repasse le job en
`analyse` et le pipeline relit le job entier, champ `reponses`).
Le passage à `attention_requise` déclenche l'email « précision nécessaire » ;
le passage à `livre` déclenche l'email « Votre film est prêt » (lien vers l'espace,
jamais de pièce jointe).

### Pousser les livrables
```bash
curl -X POST -H "Authorization: Bearer $PIPELINE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "deliverables": [
        { "kind": "film_16x9", "url": "https://storage.../job_xxx-16x9.mp4" },
        { "kind": "film_9x16", "url": "https://storage.../job_xxx-9x16.mp4" },
        { "kind": "staging_avant_apres", "room": "chambre1", "url": "https://storage.../chambre1.jpg" }
      ] }' \
  "https://api.vesta.example/api/pipeline/jobs/job_xxx/deliverables"
```
Passe le job à `livre` et déclenche l'email de livraison. L'upload des fichiers
eux-mêmes se fait vers le storage du backend (URL d'upload signée fournie par le
backend — mécanisme à documenter ici au déploiement).

## Statuts

| Affiché au client | `status` |
|---|---|
| Reçue | `recu` |
| Analyse de l'agencement | `analyse` |
| Production en cours | `en_production` |
| Contrôle qualité | `controle_qualite` |
| Livrée | `livre` |
| Complément demandé | `attention_requise` |

## Schéma JSON d'un job

```json
{
  "id": "job_xxx",
  "createdAt": "2026-07-23T10:00:00Z",
  "client": { "id": "cli_xxx", "agence": "Nom Agence", "email": "..." },
  "property": { "title": "T2 lumineux", "city": "Avignon" },
  "photos": [ { "room": "sejour1", "url": "https://... (URL signée, lisible par le pipeline)" } ],
  "floorplanUrl": null,
  "agencement": "texte markdown de la description client",
  "options": {
    "formats": ["16:9", "9:16"],
    "staging": [ { "room": "chambre1", "style": "bois clair & tons neutres" } ],
    "exclude": ["sdb1"]
  },
  "status": "recu",
  "statusMessage": null,
  "deliverables": [],
  "reponses": [ { "texte": "...", "photos": [ { "room": "...", "url": "..." } ], "le": "2026-07-23T11:00:00Z" } ]
}
```

- `client.id` : identifiant du **workspace agence** (plusieurs membres par agence ;
  le fondateur nomme son agence à la création de ses accès, ses collègues sont
  rattachés au même workspace). `client.email` : le membre qui a déposé la demande.
- `kind` ∈ `film_16x9` | `film_9x16` | `staging_avant_apres` (+ `room` pour le staging).
- `photos[].room` : clé d'entrée du pipeline — noms courts normalisés
  (`sejour1`, `cuisine1`…), garantis uniques par le formulaire.
- `reponses` : extension espace client (réponses aux compléments), le pipeline
  la lit mais ne l'écrit pas.
- Styles staging : `bois clair & tons neutres` | `contemporain contrasté` |
  `laisser Vesta choisir`.

## Règles transverses

- **Aucun montant nulle part.** Les formules ne portent qu'un nom + un quota
  films/mois (affiché au client : « N films restants ce mois-ci »).
- Photos clients = données privées : URLs signées, jamais publiques devinables.
- Comptes créés par Vesta uniquement (admin `/vesta-studio`, onglet Comptes →
  lien d'invitation `/creer-acces?invite=…`).
- Mention sous tout visuel de staging : « Visuels virtuellement aménagés, non
  contractuels. »
