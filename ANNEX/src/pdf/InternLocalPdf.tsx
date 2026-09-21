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
  localInternBrand,
  localInternContext,
  localInternDeliverables,
  localInternEval,
  localInternPhases,
  localInternRules,
} from "../lib/intern-local-content";

export function registerInternLocalFonts(regularPath: string, boldPath: string) {
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
    backgroundColor: "rgba(11,11,12,0.8)",
  },
  coverAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 14,
    height: "100%",
    backgroundColor: colors.red,
  },
  coverInner: { flex: 1, justifyContent: "space-between", padding: 42 },
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
    fontSize: 30,
    lineHeight: 1.1,
  },
  coverRule: {
    width: 72,
    height: 3,
    backgroundColor: colors.red,
    marginTop: 14,
    marginBottom: 14,
  },
  coverSub: { color: colors.stone, fontSize: 11, lineHeight: 1.55, maxWidth: 400 },
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
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  coverMeta: { color: colors.muted, fontSize: 9, textAlign: "right", marginBottom: 2 },
  content: { paddingHorizontal: 40, paddingTop: 34 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
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
    marginBottom: 8,
    textTransform: "uppercase",
  },
  body: { fontSize: 10, lineHeight: 1.5, color: colors.stone, marginBottom: 7 },
  highlightBox: {
    backgroundColor: colors.panel,
    borderLeftWidth: 3,
    borderLeftColor: colors.red,
    padding: 11,
    marginVertical: 8,
  },
  highlightText: { color: colors.cream, fontSize: 10, lineHeight: 1.45 },
  listItem: { flexDirection: "row", gap: 8, marginBottom: 4 },
  bullet: { width: 5, height: 5, marginTop: 4, backgroundColor: colors.red },
  listText: { flex: 1, fontSize: 9.2, lineHeight: 1.4, color: colors.stone },
  sprintBox: {
    backgroundColor: colors.panel,
    padding: 10,
    marginBottom: 10,
  },
  sprintWeek: {
    color: colors.red,
    fontWeight: 700,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  sprintTitle: {
    color: colors.cream,
    fontSize: 9.5,
    lineHeight: 1.4,
    marginBottom: 6,
  },
  done: {
    marginTop: 6,
    color: colors.white,
    fontSize: 8.5,
    fontWeight: 700,
    lineHeight: 1.35,
  },
  footer: {
    position: "absolute",
    left: 40,
    right: 40,
    bottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 8,
  },
  footerText: { fontSize: 8, color: colors.muted },
});

function PageHeader({ page, total }: { page: number; total: number }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerBrand}>{localInternBrand.name.toUpperCase()}</Text>
      <Text style={styles.headerPage}>
        {page} / {total}
      </Text>
    </View>
  );
}

function PageFooter() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>Confidentiel interne · Stage développement local</Text>
      <Text style={styles.footerText}>{localInternBrand.tagline}</Text>
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

type Props = { logoSrc: string; heroSrc: string };

export function InternLocalPdf({ logoSrc, heroSrc }: Props) {
  const total = 6;

  return (
    <Document
      title={localInternBrand.title}
      author={localInternBrand.name}
      subject="Cahier de stage — développement local (pas de VPS)"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <Image src={heroSrc} style={styles.coverImage} />
          <View style={styles.coverScrim} />
          <View style={styles.coverAccent} />
          <View style={styles.coverInner}>
            <Image src={logoSrc} style={styles.coverLogo} />
            <View>
              <Text style={styles.coverEyebrow}>Document interne</Text>
              <Text style={styles.coverTitle}>{localInternBrand.title}</Text>
              <View style={styles.coverRule} />
              <Text style={styles.coverSub}>{localInternBrand.subtitle}</Text>
              <Text style={[styles.coverSub, { marginTop: 10 }]}>
                Périmètre : travail en local uniquement (Laragon + Git). Pas de mise en ligne VPS.
              </Text>
            </View>
            <View style={styles.coverFooter}>
              <Text style={styles.coverTag}>{localInternBrand.duration}</Text>
              <View>
                <Text style={styles.coverMeta}>{localInternBrand.audience}</Text>
                <Text style={styles.coverMeta}>{localInternBrand.location}</Text>
                <Text style={styles.coverMeta}>{localInternBrand.name}</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <PageHeader page={2} total={total} />
          <Text style={styles.kicker}>Contexte</Text>
          <Text style={styles.sectionTitle}>Le produit</Text>
          <Text style={styles.body}>{localInternContext.product}</Text>
          <Text style={styles.sectionTitle}>Stack locale</Text>
          {localInternContext.stack.map((s) => (
            <Bullet key={s}>{s}</Bullet>
          ))}
          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Déjà en place</Text>
          {localInternContext.alreadyDone.map((s) => (
            <Bullet key={s}>{s}</Bullet>
          ))}
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>{localInternContext.goal}</Text>
          </View>
        </View>
        <PageFooter />
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <PageHeader page={3} total={total} />
          <Text style={styles.kicker}>Règles</Text>
          <Text style={styles.sectionTitle}>Méthode de travail</Text>
          {localInternRules.map((s) => (
            <Bullet key={s}>{s}</Bullet>
          ))}
        </View>
        <PageFooter />
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <PageHeader page={4} total={total} />
          <Text style={styles.kicker}>Tâches</Text>
          <Text style={styles.sectionTitle}>Phases 1 & 2</Text>
          {localInternPhases.slice(0, 2).map((sp) => (
            <View key={sp.id} style={styles.sprintBox}>
              <Text style={styles.sprintWeek}>{sp.title}</Text>
              <Text style={styles.sprintTitle}>{sp.goal}</Text>
              {sp.tasks.map((t) => (
                <Bullet key={t}>{t}</Bullet>
              ))}
              <Text style={styles.done}>Fin : {sp.done}</Text>
            </View>
          ))}
        </View>
        <PageFooter />
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <PageHeader page={5} total={total} />
          <Text style={styles.kicker}>Tâches</Text>
          <Text style={styles.sectionTitle}>Phases 3 & 4</Text>
          {localInternPhases.slice(2, 4).map((sp) => (
            <View key={sp.id} style={styles.sprintBox}>
              <Text style={styles.sprintWeek}>{sp.title}</Text>
              <Text style={styles.sprintTitle}>{sp.goal}</Text>
              {sp.tasks.map((t) => (
                <Bullet key={t}>{t}</Bullet>
              ))}
              <Text style={styles.done}>Fin : {sp.done}</Text>
            </View>
          ))}
        </View>
        <PageFooter />
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <PageHeader page={6} total={total} />
          <Text style={styles.kicker}>Clôture</Text>
          <Text style={styles.sectionTitle}>Phase 5 + livrables</Text>
          {localInternPhases.slice(4).map((sp) => (
            <View key={sp.id} style={styles.sprintBox}>
              <Text style={styles.sprintWeek}>{sp.title}</Text>
              <Text style={styles.sprintTitle}>{sp.goal}</Text>
              {sp.tasks.map((t) => (
                <Bullet key={t}>{t}</Bullet>
              ))}
              <Text style={styles.done}>Fin : {sp.done}</Text>
            </View>
          ))}
          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Livrables</Text>
          {localInternDeliverables.map((s) => (
            <Bullet key={s}>{s}</Bullet>
          ))}
          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Évaluation</Text>
          {localInternEval.map((s) => (
            <Bullet key={s}>{s}</Bullet>
          ))}
        </View>
        <PageFooter />
      </Page>
    </Document>
  );
}
