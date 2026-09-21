import { brand, finances } from "@/lib/franchise-content";

export const contractMeta = {
  title: "Contrat de Franchise",
  subtitle: "Exploitation d'un centre Kram Team — Kickboxing & Fitness",
  version: "Modèle type — à personnaliser avant signature",
  law: "Droit tunisien",
  city: "Tunis",
};

export const contractParties = {
  franchisor: {
    label: "LE FRANCHISEUR",
    name: `${brand.name}`,
    form: "Société exploitant la marque et le concept Kram Team",
    address: "Tunisie",
    contact: `${brand.email} · ${brand.phone}`,
    hereinafter: "ci-après dénommé « le Franchiseur »",
  },
  franchisee: {
    label: "LE FRANCHISÉ",
    name: "________________________________",
    form: "Personne physique / morale : _______________________________",
    cin: "CIN / RC n° : _______________________________",
    address: "Adresse : _______________________________________________",
    contact: "Tél. : ____________________  Email : ____________________",
    hereinafter: "ci-après dénommé « le Franchisé »",
  },
};

export const contractArticles = [
  {
    number: "1",
    title: "Objet du contrat",
    paragraphs: [
      `Le présent contrat a pour objet de définir les conditions dans lesquelles le Franchiseur concède au Franchisé le droit d'exploiter, sous la marque « ${brand.name} », un centre de kickboxing, fitness et arts martiaux selon le concept, les méthodes, les standards de qualité et le savoir-faire du Franchiseur.`,
      `Ce droit d'exploitation s'exerce dans le cadre d'une franchise commerciale, sans transfert de propriété de la marque, des signes distinctifs, ni du savoir-faire.`,
    ],
  },
  {
    number: "2",
    title: "Territoire et exclusivité",
    paragraphs: [
      `Le Franchisé est autorisé à exploiter un centre ${brand.name} sur le territoire suivant : ________________________________ (ville / zone), République Tunisienne.`,
      `Sous réserve du respect des obligations du présent contrat, le Franchiseur s'engage à ne pas autoriser l'ouverture d'un autre centre ${brand.name} dans un rayon de ______ km autour du local du Franchisé, sauf accord écrit contraire.`,
    ],
  },
  {
    number: "3",
    title: "Durée",
    paragraphs: [
      `Le présent contrat est conclu pour une durée de cinq (5) ans à compter de la date de signature, renouvelable par tacite reconduction pour des périodes de trois (3) ans, sauf dénonciation par l'une des parties moyennant un préavis écrit de six (6) mois avant l'échéance.`,
    ],
  },
  {
    number: "4",
    title: "Conditions financières",
    paragraphs: [
      `Droit d'entrée : ${finances.entry.value} (trente mille dinars tunisiens), payable à la signature du présent contrat. Ce montant couvre notamment la formation initiale, le manuel opérationnel, le matériel de démarrage et l'assistance à l'ouverture.`,
      `Royalties : ${finances.monthly[0].value} du chiffre d'affaires mensuel hors taxes, payables au plus tard le 10 de chaque mois pour le mois précédent.`,
      `Contribution publicitaire : ${finances.monthly[1].value} du chiffre d'affaires mensuel hors taxes, destinée aux campagnes de communication nationale et locale de la marque.`,
      `Investissement d'aménagement estimé : ${finances.setup.value}, à la charge exclusive du Franchisé (équipements, aménagement des espaces de cours, systèmes informatiques).`,
    ],
  },
  {
    number: "5",
    title: "Obligations du Franchiseur",
    paragraphs: [
      `Le Franchiseur s'engage à :`,
    ],
    bullets: [
      `Transmettre le savoir-faire et le manuel opérationnel ${brand.name} ;`,
      `Assurer la formation initiale du Franchisé et de ses coachs (technique kickboxing, pédagogie, sécurité, standards marque) ;`,
      `Fournir une assistance continue : audits, conseils stratégiques, support marketing ;`,
      `Mettre à disposition les éléments de marque, chartes graphiques et supports de communication validés ;`,
      `Accompagner le Franchisé lors de la sélection du site, de l'aménagement et du lancement.`,
    ],
  },
  {
    number: "6",
    title: "Obligations du Franchisé",
    paragraphs: [
      `Le Franchisé s'engage à :`,
    ],
    bullets: [
      `Exploiter le centre conformément aux standards ${brand.name} (qualité des cours, sécurité, inclusion, expérience client) ;`,
      `Respecter la charte graphique, les tarifs de référence et les procédures opérationnelles ;`,
      `Employer uniquement des coachs formés ou validés selon le programme de formation ${brand.name} ;`,
      `Maintenir le local en conformité avec les normes de sécurité et d'accessibilité définies ;`,
      `Verser ponctuellement le droit d'entrée, les royalties et la contribution publicitaire ;`,
      `Transmettre mensuellement les indicateurs d'activité demandés par le Franchiseur ;`,
      `Ne pas céder le contrat ni le fonds sans accord écrit préalable du Franchiseur.`,
    ],
  },
  {
    number: "7",
    title: "Formation et qualité coach",
    paragraphs: [
      `La formation initiale obligatoire porte notamment sur : technique et tactique kickboxing, coaching privé et semi-privé, conditionnement physique, gestion de groupe, premiers secours et sécurité salle, standards de marque ${brand.name}.`,
      `Le Franchisé garantit le maintien du niveau de compétence de ses équipes via les sessions de recyclage proposées par le Franchiseur.`,
    ],
  },
  {
    number: "8",
    title: "Propriété intellectuelle",
    paragraphs: [
      `La marque « ${brand.name} », le slogan « ${brand.tagline} », les logos, manuels, programmes d'entraînement, contenus pédagogiques et tous éléments de savoir-faire demeurent la propriété exclusive du Franchiseur.`,
      `Le Franchisé bénéficie d'une licence d'utilisation non exclusive, non cessible, limitée à la durée et au territoire du présent contrat.`,
      `À la fin du contrat, le Franchisé cesse immédiatement toute utilisation des signes distinctifs et restitue ou détruit les supports confidentiels.`,
    ],
  },
  {
    number: "9",
    title: "Confidentialité",
    paragraphs: [
      `Le Franchisé s'interdit de divulguer à des tiers le savoir-faire, les manuels, les données financières, commerciales ou techniques communiquées par le Franchiseur, pendant la durée du contrat et pendant cinq (5) ans après son expiration.`,
    ],
  },
  {
    number: "10",
    title: "Non-concurrence",
    paragraphs: [
      `Pendant la durée du contrat et pendant une durée de deux (2) ans après sa cessation, le Franchisé s'interdit d'exploiter, directement ou indirectement, un centre concurrent de kickboxing / fitness sous une autre enseigne dans le territoire défini à l'article 2, sauf autorisation écrite du Franchiseur.`,
    ],
  },
  {
    number: "11",
    title: "Résiliation",
    paragraphs: [
      `En cas de manquement grave (non-paiement, atteinte à la marque, non-respect des standards de sécurité ou de qualité), le Franchiseur pourra résilier le contrat de plein droit après mise en demeure restée sans effet pendant quinze (15) jours.`,
      `Le Franchisé pourra résilier le contrat en cas de manquement grave du Franchiseur à ses obligations essentielles, dans les mêmes conditions de mise en demeure.`,
    ],
  },
  {
    number: "12",
    title: "Droit applicable et litiges",
    paragraphs: [
      `Le présent contrat est régi par le droit tunisien.`,
      `En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, les tribunaux compétents de ${contractMeta.city} seront seuls compétents.`,
    ],
  },
  {
    number: "13",
    title: "Dispositions finales",
    paragraphs: [
      `Le présent contrat constitue l'intégralité de l'accord entre les parties. Toute modification devra faire l'objet d'un avenant écrit signé.`,
      `Il est établi en deux (2) exemplaires originaux, dont un pour chaque partie.`,
    ],
  },
];
