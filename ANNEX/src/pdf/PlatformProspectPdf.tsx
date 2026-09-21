import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import {
  prospectBenefits,
  prospectBrand,
  prospectIntro,
  prospectModules,
  prospectNext,
  prospectRoles,
  prospectStack,
  prospectValue,
} from "@/lib/platform-prospect-content";

export function registerPlatformProspectFonts(
  regularPath: string,
  boldPath: string,
) {
  Font.register({
    family: "SourceSans3",
    fonts: [
      { src: regularPath, fontWeight: 400 },
      { src: boldPath, fontWeight: 700 },
    ],
  });
}

const colors = {
  black: "#0B0B0C",
  panel: "#141416",
  red: "#C8102E",
  cream: "#F4F1EC",
  stone: "#B8B2A8",
  muted: "#8A8580",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.black,
    color: colors.cream,
    fontFamily: "SourceSans3",
    paddingBottom: 44,
  },
  cover: { flex: 1, position: "relative" },
  coverImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    objectFit: "cover",
  },
  coverScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(11,11,12,0.78)",
  },
  coverAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 14,
    height: "100%",
    backgroundColor: colors.red,
  },
  coverInner: {
    flex: 1,
    justifyContent: "space-between",
    padding: 42,
  },
  coverLogo: { width: 88, height: 88, objectFit: "contain" },
  coverEyebrow: {
    color: colors.red,
    fontWeight: 700,
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  coverTitle: {
    color: colors.white,
    fontWeight: 700,
    fontSize: 34,
    lineHeight: 1.08,
  },
  coverRule: {
    width: 72,
    height: 3,
    backgroundColor: colors.red,
    marginTop: 14,
    marginBottom: 14,
  },
  coverSub: {
    color: colors.stone,
    fontSize: 11,
    lineHeight: 1.55,
    maxWidth: 360,
  },
  coverFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
    paddingTop: 14,
  },
  coverTag: {
    color: colors.white,
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  coverMeta: { color: colors.muted, fontSize: 9, textAlign: "right", marginBottom: 2 },
  content: { paddingHorizontal: 40, paddingTop: 34 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.red,
  },
  headerBrand: {
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.white,
  },
  headerPage: { fontSize: 9, color: colors.muted },
  kicker: {
    color: colors.red,
    fontWeight: 700,
    fontSize: 9,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: 0.4,
    color: colors.white,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  body: {
    fontSize: 10,
    lineHeight: 1.55,
    color: colors.stone,
    marginBottom: 8,
  },
  highlightBox: {
    backgroundColor: colors.panel,
    borderLeftWidth: 3,
    borderLeftColor: colors.red,
    padding: 12,
    marginVertical: 10,
  },
  highlightText: { color: colors.cream, fontSize: 10, lineHeight: 1.5 },
  listItem: { flexDirection: "row", gap: 8, marginBottom: 5 },
  bullet: { width: 5, height: 5, marginTop: 4, backgroundColor: colors.red },
  listText: { flex: 1, fontSize: 9.5, lineHeight: 1.45, color: colors.stone },
  grid2: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  card: {
    width: "48.5%",
    backgroundColor: colors.panel,
    borderTopWidth: 2,
    borderTopColor: colors.red,
    padding: 10,
    marginBottom: 4,
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: 10,
    color: colors.white,
    marginBottom: 4,
  },
  cardText: { fontSize: 8.5, lineHeight: 1.4, color: colors.stone },
  roleCard: {
    width: "48.5%",
    backgroundColor: colors.panel,
    padding: 10,
    marginBottom: 8,
  },
  roleTitle: {
    fontWeight: 700,
    fontSize: 11,
    color: colors.red,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  footer: {
    position: "absolute",
    left: 40,
    right: 40,
    bottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#2A2A2E",
    paddingTop: 8,
  },
  footerText: { fontSize: 8, color: colors.muted },
  photo: { width: "100%", height: 150, objectFit: "cover", marginBottom: 10 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  chip: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: "#2A2A2E",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  chipText: { fontSize: 8, color: colors.cream },
});

function PageHeader({ page, total }: { page: number; total: number }) {
  return (
    <View style={styles.header} fixed>
      <Text style={styles.headerBrand}>
        {prospectBrand.name} · {prospectBrand.product}
      </Text>
      <Text style={styles.headerPage}>
        {page} / {total}
      </Text>
    </View>
  );
}

function PageFooter() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        {prospectBrand.tagline} · Dossier prospection plateforme
      </Text>
      <Text style={styles.footerText}>{prospectBrand.location}</Text>
    </View>
  );
}

function Bullet({ children }: { children: string }) {
  return (
    <View style={styles.listItem}>
      <View style={styles.bullet} />
      <Text style={styles.listText}>{children}</Text>
    </View>
  );
}

type Props = {
  logoSrc: string;
  heroSrc: string;
  secondarySrc: string;
};

export function PlatformProspectPdf({ logoSrc, heroSrc, secondarySrc }: Props) {
  const total = 5;

  return (
    <Document
      title={`${prospectBrand.name} — ${prospectBrand.product}`}
      author={prospectBrand.name}
      subject="Dossier descriptif plateforme — prospection"
    >
      {/* COVER */}
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <Image src={heroSrc} style={styles.coverImage} />
          <View style={styles.coverScrim} />
          <View style={styles.coverAccent} />
          <View style={styles.coverInner}>
            <View>
              <Image src={logoSrc} style={styles.coverLogo} />
            </View>
            <View>
              <Text style={styles.coverEyebrow}>Dossier prospection</Text>
              <Text style={styles.coverTitle}>{prospectBrand.product}</Text>
              <View style={styles.coverRule} />
              <Text style={styles.coverSub}>{prospectBrand.subtitle}</Text>
              <Text style={[styles.coverSub, { marginTop: 10 }]}>
                Logiciel de gestion salle · Kickboxing · MMA · Fitness
              </Text>
            </View>
            <View style={styles.coverFooter}>
              <Text style={styles.coverTag}>{prospectBrand.tagline}</Text>
              <View>
                <Text style={styles.coverMeta}>{prospectBrand.name}</Text>
                <Text style={styles.coverMeta}>{prospectBrand.location}</Text>
                <Text style={styles.coverMeta}>{prospectBrand.contactEmail}</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>

      {/* INTRO + VALUE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <PageHeader page={2} total={total} />
          <Text style={styles.kicker}>Pourquoi cette plateforme</Text>
          <Text style={styles.sectionTitle}>{prospectIntro.title}</Text>
          {prospectIntro.paragraphs.map((p) => (
            <Text key={p.slice(0, 24)} style={styles.body}>
              {p}
            </Text>
          ))}
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              Un seul outil pour l’accueil, le coach, l’adhérent et la direction —
              du premier contact au check-out QR, jusqu’au calcul du salaire coach.
            </Text>
          </View>
          <Text style={[styles.sectionTitle, { marginTop: 14 }]}>
            Bénéfices business
          </Text>
          <View style={styles.grid2}>
            {prospectValue.map((v) => (
              <View key={v.title} style={styles.card}>
                <Text style={styles.cardTitle}>{v.title}</Text>
                <Text style={styles.cardText}>{v.text}</Text>
              </View>
            ))}
          </View>
          <Image src={secondarySrc} style={[styles.photo, { marginTop: 14 }]} />
        </View>
        <PageFooter />
      </Page>

      {/* ROLES */}
      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <PageHeader page={3} total={total} />
          <Text style={styles.kicker}>Expérience multi-rôles</Text>
          <Text style={styles.sectionTitle}>Qui fait quoi</Text>
          <Text style={styles.body}>
            Quatre espaces distincts, un même système. Chaque profil voit uniquement
            ce dont il a besoin — avec des droits contrôlés par l’admin.
          </Text>
          <View style={styles.grid2}>
            {prospectRoles.map((r) => (
              <View key={r.role} style={styles.roleCard}>
                <Text style={styles.roleTitle}>{r.role}</Text>
                {r.items.map((item) => (
                  <Bullet key={item}>{item}</Bullet>
                ))}
              </View>
            ))}
          </View>
        </View>
        <PageFooter />
      </Page>

      {/* MODULES */}
      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <PageHeader page={4} total={total} />
          <Text style={styles.kicker}>Fonctionnalités</Text>
          <Text style={styles.sectionTitle}>Modules livrés</Text>
          <View style={styles.grid2}>
            {prospectModules.map((m) => (
              <View key={m.title} style={styles.card}>
                <Text style={styles.cardTitle}>{m.title}</Text>
                {m.items.map((item) => (
                  <Text key={item} style={styles.cardText}>
                    · {item}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </View>
        <PageFooter />
      </Page>

      {/* STACK + NEXT */}
      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <PageHeader page={5} total={total} />
          <Text style={styles.kicker}>Technique & suite</Text>
          <Text style={styles.sectionTitle}>Stack & architecture</Text>
          <Text style={styles.body}>Backend</Text>
          <View style={styles.chipRow}>
            {prospectStack.backend.map((t) => (
              <View key={t} style={styles.chip}>
                <Text style={styles.chipText}>{t}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.body, { marginTop: 10 }]}>Frontend</Text>
          <View style={styles.chipRow}>
            {prospectStack.frontend.map((t) => (
              <View key={t} style={styles.chip}>
                <Text style={styles.chipText}>{t}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.body, { marginTop: 10 }]}>Ops & sécurité</Text>
          <View style={styles.chipRow}>
            {prospectStack.ops.map((t) => (
              <View key={t} style={styles.chip}>
                <Text style={styles.chipText}>{t}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 22 }]}>
            Arguments prospection
          </Text>
          {prospectBenefits.map((b) => (
            <Bullet key={b}>{b}</Bullet>
          ))}

          <Text style={[styles.sectionTitle, { marginTop: 18 }]}>
            Prochaines étapes
          </Text>
          {prospectNext.map((s, i) => (
            <Bullet key={s}>{`${i + 1}. ${s}`}</Bullet>
          ))}

          <View style={[styles.highlightBox, { marginTop: 16 }]}>
            <Text style={styles.highlightText}>
              Contact démo : {prospectBrand.contactEmail} · {prospectBrand.location}
              {"\n"}
              Comptes démo : admin@ / reception@ / coach@ / member@ — mot de passe
              password
            </Text>
          </View>
        </View>
        <PageFooter />
      </Page>
    </Document>
  );
}
