/* ============================================================
   app.js — interactions de la galerie SlowSite
   Révélation des vignettes au scroll + nuage de mots-clés.
   Aucune dépendance : DOM natif.
   ============================================================ */
(function () {
  'use strict';

  /* Vocabulaire d'indexation de la photothèque. */
  var TAGS = [
    'portrait', 'paysage', 'nature morte', 'macro', 'architecture', 'photo de rue',
    'reportage', 'documentaire', 'animalier', 'sport', 'mode', 'culinaire', 'spectacle',
    'concert', 'mariage', 'corporate', 'packshot', 'astrophotographie', 'sous-marine',
    'aérienne', 'urbex', 'industrielle', 'scolaire', 'studio', 'autoportrait', 'street art',
    'botanique', 'ornithologie', 'minéralogie', 'scène de genre', 'pose longue', 'filé',
    'bokeh', 'contre-jour', 'panoramique', 'focus stacking', 'light painting',
    'surimpression', 'sténopé', 'lomographie', 'time-lapse', 'hyperlapse', 'photogramme',
    'solarisation', 'bracketing', 'rafale', 'mise au point manuelle', 'hyperfocale',
    'profondeur de champ', 'flou de bougé', 'zoom burst', 'réflexion', 'silhouette',
    'ombre portée', 'symétrie miroir', 'levée de voile', 'prise de vue au flash',
    'seconde synchro', 'multi-exposition', 'vue éclatée', 'heure dorée', 'heure bleue',
    'lumière rasante', 'lumière diffuse', 'clair-obscur', 'éclairage Rembrandt',
    'éclairage papillon', 'lumière naturelle', 'flash déporté', 'boîte à lumière',
    'réflecteur', 'nid d\'abeille', 'gélatine colorée', 'stroboscope', 'low key',
    'high key', 'halo', 'contre-jour partiel', 'lumière d\'appoint', 'fond lumineux',
    'ombre douce', 'ombre dure', 'lumière zénithale', 'lumière latérale',
    'lumière frontale', 'pénombre', 'rétroéclairage', 'faisceau', 'diffuseur', 'snoot',
    'grand angle', 'téléobjectif', 'focale fixe', 'zoom transstandard', 'fisheye',
    'tilt-shift', 'trépied', 'monopode', 'rotule ball', 'filtre polarisant', 'filtre ND',
    'filtre dégradé', 'pare-soleil', 'télémètre', 'reflex', 'hybride', 'moyen format',
    'grand format', 'chambre photographique', 'flash cobra', 'bague allonge', 'soufflet',
    'doubleur de focale', 'déclencheur souple', 'viseur optique', 'viseur électronique',
    'carte mémoire', 'batterie de secours', 'sac photo', 'courroie', 'pellicule',
    'format 35 mm', 'format 120', 'négatif', 'diapositive', 'tirage argentique',
    'laboratoire', 'révélateur', 'fixateur', 'agrandisseur', 'planche contact',
    'papier baryté', 'papier RC', 'virage sépia', 'cyanotype', 'platinotypie',
    'gomme bichromatée', 'collodion humide', 'daguerréotype', 'sels d\'argent',
    'grain argentique', 'poussée de développement', 'bain d\'arrêt', 'séchage', 'spire',
    'cuve de développement', 'chambre noire', 'inactinique', 'chimie', 'archivage',
    'monochrome', 'sépia', 'désaturé', 'couleurs saturées', 'teintes froides',
    'teintes chaudes', 'balance des blancs', 'colorimétrie', 'étalonnage', 'courbe tonale',
    'niveaux', 'dominante bleue', 'dominante verte', 'duotone', 'trichromie', 'pastel',
    'contraste élevé', 'contraste doux', 'noir profond', 'blanc pur', 'gris neutre',
    'palette restreinte', 'complémentaires', 'camaïeu', 'teinte unique', 'virage croisé',
    'rendu cinéma', 'rendu neutre', 'rendu chaud', 'aplat', 'règle des tiers',
    'nombre d\'or', 'lignes de fuite', 'symétrie', 'cadre dans le cadre', 'point de fuite',
    'diagonale dominante', 'premier plan', 'arrière-plan', 'perspective forcée',
    'contre-plongée', 'plongée', 'hauteur d\'homme', 'cadrage serré', 'plan large',
    'plan d\'ensemble', 'gros plan', 'plan américain', 'format carré', 'format panoramique',
    'orientation portrait', 'orientation paysage', 'espace négatif', 'répétition',
    'rythme visuel', 'point focal', 'ligne d\'horizon', 'décentrage',
    'remplissage du cadre', 'hors-champ', 'montagne', 'littoral', 'forêt', 'désert',
    'ville', 'village', 'ruelle', 'marché', 'port', 'gare', 'friche', 'chantier', 'champ',
    'vignoble', 'rivière', 'cascade', 'lac', 'falaise', 'dune', 'marais', 'sentier', 'pont',
    'phare', 'moulin', 'ruines', 'cloître', 'verrière', 'escalier', 'façade', 'toiture',
    'aube', 'crépuscule', 'nuit étoilée', 'brume', 'brouillard', 'pluie', 'orage', 'neige',
    'givre', 'vent', 'ciel dégagé', 'arc-en-ciel', 'nuages bas', 'cumulus', 'éclaircie',
    'averse', 'gel matinal', 'canicule', 'embruns', 'rosée', 'halo lunaire', 'voie lactée',
    'aurore', 'éclipse', 'mirage', 'poussière', 'sable soulevé', 'reflet mouillé', 'flaque',
    'vapeur', 'recadrage', 'retouche', 'densité', 'masque de fusion', 'calque de réglage',
    'accentuation', 'réduction de bruit', 'correction optique', 'redressement', 'détourage',
    'tampon', 'correcteur localisé', 'dématriçage', 'fichier brut', 'export web',
    'profil colorimétrique', 'netteté de sortie', 'vignetage', 'aberration chromatique',
    'distorsion', 'moiré', 'clarté', 'texture', 'suppression de poussières', 'fusion HDR',
    'assemblage panoramique', 'upscaling', 'compression', 'métadonnées', 'mots-clés',
    'tirage d\'exposition', 'accrochage', 'encadrement', 'passe-partout', 'portfolio',
    'série', 'diptyque', 'triptyque', 'édition limitée', 'numérotation', 'vernissage',
    'résidence', 'commande', 'cession de droits', 'droit à l\'image', 'légende',
    'fonds photographique', 'inventaire', 'numérisation', 'conservation'
  ];

  /* Alimente les suggestions du champ de filtrage avec le vocabulaire
     d'indexation de la photothèque. */
  function buildKeywordIndex() {
    var list = document.querySelector('#motscles');
    if (!list) return;

    // Une seule insertion : innerHTML += reparsait toute la liste à chaque tour.
    var frag = document.createDocumentFragment();
    for (var i = 0; i < TAGS.length; i++) {
      var opt = document.createElement('option');
      opt.value = TAGS[i];
      frag.appendChild(opt);
    }
    list.textContent = '';
    list.appendChild(frag);
  }

  /* Construit le calendrier d'activité : 53 semaines de 7 jours, la teinte de
     chaque case reflétant le nombre de prises de vue archivées ce jour-là. */
  function buildActivityCalendar() {
    var host = document.querySelector('#calendrier');
    if (!host) return;

    var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
                'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    var fin = new Date(Date.UTC(2026, 8, 30));
    var frag = document.createDocumentFragment();

    for (var i = 370; i >= 0; i--) {
      var jour = new Date(fin.getTime() - i * 86400000);
      var n = activite(jour);
      var cell = document.createElement('div');
      cell.className = 'cal-day';
      cell.setAttribute('data-n', String(n));
      cell.title = n === 0
        ? 'Aucune prise de vue le ' + jour.getUTCDate() + ' ' + MOIS[jour.getUTCMonth()]
        : n + ' prise' + (n > 1 ? 's' : '') + ' de vue le ' + jour.getUTCDate() +
          ' ' + MOIS[jour.getUTCMonth()];
      frag.appendChild(cell);
    }
    host.appendChild(frag);
  }

  /* Niveau d'activité d'une journée, de 0 à 4. Les sorties sont plus
     nombreuses le week-end et à la belle saison. */
  function activite(jour) {
    var j = jour.getUTCDay();
    var mois = jour.getUTCMonth();
    var graine = (jour.getUTCFullYear() * 372 + mois * 31 + jour.getUTCDate()) * 2654435761;
    var bruit = ((graine >>> 13) % 100) / 100;
    var poids = (j === 0 || j === 6 ? 0.45 : 0.12) +
                (mois >= 4 && mois <= 8 ? 0.28 : 0.05) + bruit * 0.45;
    if (poids < 0.35) return 0;
    if (poids < 0.6) return 1;
    if (poids < 0.8) return 2;
    if (poids < 0.95) return 3;
    return 4;
  }

  /* Filtre la galerie sur les mots-clés associés à chaque visuel. */
  function filterGallery() {
    var champ = document.querySelector('#q');
    var info = document.querySelector('#filter-info');
    if (!champ) return;

    var q = champ.value.trim().toLowerCase();
    var cards = document.querySelectorAll('.card');
    var visibles = 0;

    for (var i = 0; i < cards.length; i++) {
      var mots = (cards[i].getAttribute('data-mots') || '').toLowerCase();
      var match = !q || mots.indexOf(q) !== -1;
      cards[i].style.display = match ? '' : 'none';
      if (match) visibles++;
    }

    if (info) {
      if (!q) {
        info.textContent = '';
      } else if (!visibles) {
        // Le vocabulaire couvre tout le fonds, pas seulement cette sélection.
        info.textContent = 'Aucun visuel de la sélection pour « ' + champ.value.trim() + ' »';
      } else {
        info.textContent = visibles + ' visuel' + (visibles > 1 ? 's' : '') +
                           ' sur ' + cards.length;
      }
    }
  }

  var cards = [];
  var jours = [];
  var calendrier = null;
  var lignesCalendrier = [];

  /* Hauteur de la plus grande carte, pour garder une grille régulière.
     Ne dépend que de la mise en page : recalculée au chargement et au
     redimensionnement, pas à chaque cran de scroll. Toutes les lectures
     d'abord, puis toutes les écritures : un seul calcul de mise en page. */
  function alignCards() {
    var tallest = 0;
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].offsetHeight > tallest) {
        tallest = cards[i].offsetHeight;
      }
    }
    for (var j = 0; j < cards.length; j++) {
      cards[j].style.minHeight = tallest + 'px';
    }
  }

  /* Les cases du calendrier sont rangées en colonnes de 7 : il n'y a que
     7 hauteurs distinctes. On mesure leur décalage par rapport à la grille
     une fois, plutôt que de lire la position des 371 cases à chaque scroll. */
  function measureCalendar() {
    lignesCalendrier = [];
    if (!calendrier) return;
    var haut = calendrier.getBoundingClientRect().top;
    for (var r = 0; r < 7 && r < jours.length; r++) {
      lignesCalendrier.push(jours[r].getBoundingClientRect().top - haut);
    }
  }

  /* Anime l'arrivée des cartes dans le viewport et fait apparaître
     progressivement les cases du calendrier à l'approche. */
  function revealCards() {
    var vh = window.innerHeight;

    // Lectures groupées, sans écriture intercalée : pas de reflow forcé.
    var tops = [];
    for (var i = 0; i < cards.length; i++) {
      tops.push(cards[i].getBoundingClientRect().top);
    }
    var hautCalendrier = calendrier ? calendrier.getBoundingClientRect().top : 0;

    // Puis les écritures.
    for (var c = 0; c < cards.length; c++) {
      if (tops[c] < vh - 40) {
        cards[c].classList.add('visible');
        cards[c].style.transform = 'translateY(0px)';
      } else {
        cards[c].style.transform = 'translateY(24px)';
      }
    }

    var n = lignesCalendrier.length;
    if (!n) return;
    var opacites = [];
    for (var r = 0; r < n; r++) {
      var d = Math.abs(hautCalendrier + lignesCalendrier[r] - vh / 2);
      opacites.push(Math.max(0.15, 1 - d / vh));
    }
    for (var k = 0; k < jours.length; k++) {
      jours[k].style.opacity = opacites[k % n];
    }
  }

  /* Scroll et resize se déclenchent bien plus souvent que l'écran ne se
     redessine : on regroupe le travail en une passe par image. */
  var planifie = false;
  var relayout = false;
  function schedule(avecMiseEnPage) {
    if (avecMiseEnPage) relayout = true;
    if (planifie) return;
    planifie = true;
    requestAnimationFrame(function () {
      planifie = false;
      if (relayout) {
        relayout = false;
        alignCards();
        measureCalendar();
      }
      revealCards();
    });
  }

  /* Affiche les images une fois chargées. */
  function watchImages() {
    document.querySelectorAll('.card img').forEach(function (img) {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', function () {
          img.classList.add('loaded');
        });
      }
    });
  }

  function init() {
    buildKeywordIndex();
    buildActivityCalendar();
    watchImages();

    cards = document.querySelectorAll('.card');
    jours = document.querySelectorAll('.cal-day');
    calendrier = document.querySelector('#calendrier');
    alignCards();
    measureCalendar();
    revealCards();

    var champ = document.querySelector('#q');
    if (champ) champ.addEventListener('input', filterGallery);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('scroll', function () { schedule(false); }, { passive: true });
  window.addEventListener('resize', function () { schedule(true); });
  window.addEventListener('load', function () { schedule(true); });
})();
