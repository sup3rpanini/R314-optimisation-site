# Optimisation SlowSite — audit, problèmes, corrections

- Dépôt (fork) : https://github.com/sup3rpanini/R314-optimisation-site
- Site publié : https://sup3rpanini.github.io/R314-optimisation-site/
- Corrections : branche `optimisations`, un commit par optimisation.

## 1. Audit initial

### Conditions de mesure

| Source | Conditions |
|---|---|
| PageSpeed Insights | Site déployé (GitHub Pages), Lighthouse 13.5.0, profils Mobile et Ordinateur |
| Réseau | Site déployé, `curl --compressed` sur chaque ressource demandée par `index.html` (poids réellement transférés, gzip compris) |
| Exécution JS | Chromium, serveur local `python -m http.server`, fenêtre 1350×940 (> 1024 px, voir P19), 30 s d'enregistrement avec défilement |

**Limites.** Pas de données de terrain (CrUX) : le site n'a pas assez de trafic, donc tout l'audit repose sur des données de laboratoire. Le quota de l'API PageSpeed était épuisé, donc les chiffres PSI ci-dessous viennent d'**un seul passage**. Il faut les relancer 3 fois et garder la médiane, d'autant que la méthodologie du TP signale un TBT bimodal sur ce site. Les mesures JS locales sont faites **sans** ralentissement CPU : les durées seraient environ ×4 sur le profil « mobile » de Lighthouse.

### PageSpeed Insights (avant)

| Profil | Score | FCP | LCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|
| Mobile | **63** | 2,4 s | **12,1 s** | 160 ms | 0 | 7,3 s |
| Ordinateur | **61** | 1,0 s | 3,1 s | **360 ms** | 0 | 2,1 s |

Ce que disent les audits du rapport :
- **Élément LCP : `<div class="hero">`**, c'est-à-dire sa texture `::before` (`hero-bg.jpg`, 3,4 Mo, affichée à 4 % d'opacité). Sur Ordinateur, le délai d'affichage de l'élément atteint 2 130 ms.
- **Requêtes bloquant le rendu** : `polyfills.js` (404), `ui-kit.min.js`, `app.js`, `styles.css` et `extra.css`. Économie estimée : 1 630 ms en mobile.
- **Ajustement forcé de la mise en page** : 163 ms sur `app.js:185` et 168 ms au total pour `app.js`.
- **Tâches longues** : `ui-kit.min.js` 832 ms au chargement.
- **Arborescence réseau** : `styles.css` → `extra.css` → `theme-legacy.css` → Google Fonts → woff2, soit une chaîne d'au moins 4 niveaux.
- Images sans `width`/`height`, images trop grandes (1,5 Mo d'économie estimée), erreurs dans la console (404 et preload refusé).
- Remarque : PSI n'indique que 3,1 Mo de « charge utile ». Le transfert réel mesuré est de 16,8 Mo (voir ci-dessous), car la trace Lighthouse s'arrête avant la fin du téléchargement des images. Le poids se lit dans l'onglet Réseau, pas dans PSI.

### Réseau (avant), site déployé

**21 requêtes, 16,77 Mo transférés** (sans compter le favicon de 787 Ko). Les plus lourdes :

| Ressource | Poids | Remarque |
|---|---|---|
| img/img6.jpg | 3 390 Ko | |
| img/img6.jpg?v=2 | 3 390 Ko | **doublon** (preload) |
| img/hero-bg.jpg | 3 390 Ko | **le même fichier**, affiché à 4 % d'opacité |
| img/img1.jpg | 2 524 Ko | 3968 px pour un affichage d'environ 388 px |
| img/img4.jpg | 1 232 Ko | |
| img/img2.jpg | 1 044 Ko | |
| img/img5.jpg | 959 Ko | |
| img/favicon.png | 787 Ko | 512×512 pour un affichage en 16 px |
| img/img3.jpg | 772 Ko | |
| js/legacy/polyfills.js | **404** | bloquant dans le `<head>` |

### Exécution (avant), Chromium 1350×940, sans ralentissement CPU

| Instant | Blocage | Origine |
|---|---|---|
| 0,1 s | **687 ms** | `ui-kit.min.js` : boucle active de 620 ms + 240 000 objets |
| 0,7 s | **290 ms** | DOMContentLoaded : index des mots-clés, calendrier, `_sync` |
| 12,7 s | 59 ms | `analytics.js` (minuteur) |
| 15,3 s | 76 ms | idem |
| 17,9 s | 97 ms | idem |
| 20,5 s | 124 ms | idem |
| 23,1 s | 161 ms | idem |
| 25,7 s | 204 ms | idem |
| 28,3 s | 262 ms | idem, et la durée continue de croître jusqu'à 430 ms |

Chaque événement de défilement coûte en plus 15 à 42 ms, sans aucune limitation de fréquence.

## 2. Problèmes identifiés

Les numéros de ligne renvoient aux fichiers **d'origine**.

### Niveau 1 : réseau et images

| # | Fichier et ligne | Nature | Preuve | Coût | Correction |
|---|---|---|---|---|---|
| P1 | `index.html:75-90` | Les vignettes affichées à ~388 px chargent des JPEG de 2040 à 3968 px | PSI « Améliorer l'affichage des images » (663×374 affiché contre 3968×2240) | 9,9 Mo pour 6 vignettes | WebP 400/800/1200 + `srcset`/`sizes` calqués sur les media queries |
| P2 | `index.html:75-90` | `<img>` sans `width`/`height` | PSI « éléments d'image sans width/height » | Risque de CLS | `width`/`height` (le ratio réel) |
| P3 | `index.html:75-90` | Aucun chargement différé sous la ligne de flottaison | Code | Images 4 à 6 chargées d'emblée | `loading="lazy"` sur la 2ᵉ rangée, `decoding="async"` |
| P4 | `index.html:12` | `preload` de `img6.jpg?v=2` : le query string en fait une 2ᵉ ressource | Réseau : deux lignes img6 | 3,4 Mo en double, en priorité haute | Suppression |
| P5 | `css/theme-legacy.css:11` | Texture `hero-bg.jpg` 3968 px / 3,4 Mo à 4 % d'opacité, et **élément LCP** | PSI « Détection de la requête LCP » → `div.hero` | LCP 12,1 s en mobile | WebP 960 px q40 (45 Ko), rendu indiscernable |
| P6 | `img/favicon.png` | Dégradé uni stocké en PNG 512 px bruité | Réseau | 787 Ko | SVG `linearGradient` de 244 octets + repli PNG 32 px (736 o) |
| P7 | `index.html:16` | `js/legacy/polyfills.js` n'existe pas, script bloquant | Console : 404 | Un aller-retour bloquant | Suppression |
| P8 | `index.html:9` | `dns-prefetch` vers cdn.jsdelivr.net, jamais contacté | Réseau : aucun appel | Résolution DNS inutile | Suppression |
| P9 | `css/styles.css:2` | Google Fonts en `display=block` (texte invisible jusqu'à la police) + graisse 300 jamais utilisée | Graisses calculées sur la page : 400 et 700 uniquement | FOIT, 2 domaines tiers | Poppins auto-hébergée (400/600), `font-display:swap` |
| P10 | `index.html:10-11` | `preload` de police **sans `crossorigin`**, et sur la graisse 300 inutilisée | Console : « credentials mode does not match » | Téléchargement perdu | Preload des 2 fichiers utilisés, avec `crossorigin` |
| P11 | `css/styles.css:1`, `extra.css:1`, `theme-legacy.css:3` | Chaîne d'`@import` en série (styles → extra → theme-legacy → Google) | PSI « Arborescence du réseau » | 4 allers-retours avant le premier rendu | Une seule feuille |
| P12 | `styles.css:28-1226`, `extra.css:8-806`, `theme-legacy.css:18-28` | 1 199 `.redundant-*`, 799 `.extra-*`, `.legacy-*`, `.tile*` et Playfair Display : utilisés dans aucune page | Recherche dans tous les HTML et JS | 124 Ko de CSS (10,5 Ko gzip) | Suppression. Feuille finale : 6 Ko |
| P13 | `index.html:17-18` | `ui-kit.min.js` et `app.js` synchrones dans le `<head>` | PSI « Requêtes de blocage du rendu » | Parsing bloqué | UIKit supprimé (P15), `app.js` en `defer` |
| P14 | `img1.html` à `img6.html` | L'image s'affiche à sa largeur native : défilement horizontal | Page de 2055 px de large sur un écran de 375 px | Défaut d'affichage + 0,8 à 3,4 Mo | `max-width:100%` + `srcset` (800/1200/plein format ≤ 2400) |

### Niveau 2 : profil d'exécution

| # | Fichier et ligne | Nature | Preuve | Coût | Correction |
|---|---|---|---|---|---|
| P15 | `js/vendor/ui-kit.min.js:2` | Une fois déplié : (a) `_cal` tourne en boucle active 620 ms au parsing ; (b) `_pool` alloue 240 000 objets jamais lus ; (c) un `MutationObserver` sur tout le document (`subtree` + `attributes`) appelle `getComputedStyle` sur **tous** les éléments à chaque mutation | Long task de 832 ms (PSI) / 687 ms (local) | TBT, mémoire, et chaque écriture de style au scroll relance un recalcul complet sur ~800 nœuds | `app.js` n'utilisait que `qs`, `qsa`, `cls`, `ready` : remplacés par le DOM natif, UIKit supprimé |
| P16 | `js/app.js:81` | `list.innerHTML +=` dans une boucle de 320 mots-clés : la liste est reparsée à chaque tour | Code + tâche de 290 ms au DOMContentLoaded | Quadratique | `DocumentFragment`, une seule insertion |
| P17 | `js/app.js:161-172` | Pour chaque carte : `querySelectorAll('.card')` + lecture de `offsetHeight` de toutes les cartes juste après l'écriture d'un `min-height` | PSI « Ajustement forcé », `app.js:162/174` | n² + reflow forcé, à chaque scroll | Calcul seulement au chargement et au redimensionnement : lectures, puis écritures |
| P18 | `js/app.js:183-188` + `:213-215` | Pour les 371 cases du calendrier : `getBoundingClientRect()` puis `style.opacity` en alternance, à chaque événement scroll non limité | PSI : 163 ms sur `app.js:185` | 371 reflows forcés par événement, amplifiés par P15 (c) | Les 7 rangées sont mesurées une fois, une seule lecture par image, `requestAnimationFrame`, écouteur `passive` |

### Niveau 3 : conditionnel et différé

| # | Fichier et ligne | Nature | Preuve | Coût | Correction |
|---|---|---|---|---|---|
| P19 | `js/analytics.js:19-29` | Code obscurci (`atob` → `innerWidth`, `performance`, `now`, `hidden`). Il démarre 6,5 s après le `load`, puis s'exécute toutes les 2,6 s, **seulement si la fenêtre fait plus de 1024 px et que l'onglet est visible**. Il sérialise tout le DOM puis tourne en boucle active : 46 ms ×1,28 à chaque passage, jusqu'à 430 ms | Mesure locale à 1350 px : 59 → 262 ms en 30 s, rien à 1024 px. Explique l'écart Mobile/Ordinateur et les mesures non reproductibles | Le site rame après quelques secondes sur ordinateur portable : c'est la plainte du client | Suppression. Il n'envoie rien (aucune requête, résultat rangé dans `window.__au`, lu nulle part) : aucune fonctionnalité perdue |

## 3. Résultats (après)

| Indicateur | Avant | Après | Comment c'est mesuré |
|---|---|---|---|
| Poids total | 16,77 Mo | **0,18 Mo** (ordinateur) / 0,47 Mo (mobile) | Avant : curl sur le site déployé. Après : fichiers + gzip -9, **à confirmer dans DevTools après déploiement** |
| Requêtes | 21 (+ favicon) | **12** (+ favicon) | idem |
| Tâches > 50 ms (30 s, scroll, 1350 px) | 9 (de 59 à 687 ms) | **0** (max 12 ms) | Chromium local, même protocole |
| CSS | 124 Ko en 3 fichiers + 2 CSS tierces | 6 Ko, 1 fichier | |
| JS | 3 fichiers + 1 404 | 1 fichier en `defer` | |
| FCP / LCP / TBT / CLS / SI | voir §1 | **à relever sur PSI après déploiement** (3 passages, médiane) | |

### Vérification de l'iso-rendu

- Fenêtre 1350×940 : position et taille de **tous** les éléments de la page (plus de 100), ombres, graisses et opacités **identiques** entre l'original et la version corrigée.
- Opacités des 371 cases du calendrier après défilement : identiques à 6 décimales près.
- Mobile 375 px : filtre (« heure dorée » → « 1 visuel sur 6 », recherche sans résultat), ancre « Voir les défis », état des cartes et `min-height` : identiques.
- **Seul changement visible voulu** : sur les pages `imgN.html`, l'image est désormais bornée à la largeur de la page au lieu de déborder (défaut A1 du guide).

## 4. Hors de portée sur GitHub Pages (avec un vrai serveur)

- **Cache** : GitHub impose `Cache-Control: max-age=600`, ce qui explique l'audit PSI « durées de mise en cache » toujours en échec. Je mettrais `max-age=31536000, immutable` sur les images, polices, CSS et JS versionnés par une empreinte dans le nom (`styles.a3f9c1.css`, ce qu'un outil de build fait proprement), et une revalidation courte sur le HTML.
- **Compression** : Brotli plutôt que gzip pour le HTML, le CSS et le JS (environ 15 à 20 % de mieux). Inutile sur WebP et woff2.
- **Indice de chargement** : en-tête `Link: rel=preload` pour la feuille de style, ou `103 Early Hints`.
- **Ce qui n'a pas été fait volontairement** : précharger `hero-bg.webp` améliorerait le LCP mesuré, mais cela donnerait la priorité à une texture quasi invisible. Le `backdrop-filter` du bandeau est conservé (iso-rendu).
