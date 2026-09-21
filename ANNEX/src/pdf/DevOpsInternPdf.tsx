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
  internBrand,
  internContext,
  internDeliverables,
  internEval,
  internPhases,
  internRules,
  internTarget,
} from "@/lib/devops-intern-content";

export function registerDevOpsInternFonts(regularPath: string, boldPath: string) {
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
    fontSize: 32,
    lineHeight: 1.1,
  },
  coverRule: {
    width: 72,
    height: 3,
    backgroundColor: colors.red,
    marginTop: 14,
    marginBottom: 14,
  },
  coverSub: { color: colors.stone, fontSize: 11, lineHeight: 1.55, maxWidth: 380 },
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
    marginBottom: 9,
    borderTopWidth: 2,
    borderTopColor: colors.red,
  },
  sprintWeek: {
    color: colors.red,
    fontWeight: 700,
    fontSize: 8,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  sprintTitle: { fontWeight: 700, fontSize: 11, color: colors.white, marginBottom: 5 },
  done: { fontSize: 8.5, color: colors.cream, marginTop: 5, fontWeight: 700 },
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
});

function PageHeader({ page, total }: { page: number; total: number }) {
  return (
    <View style={styles.header} fixed>
      <Text style={styles.headerBrand}>
        {internBrand.name} · Stage DevOps
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
      <Text style={styles.footerText}>Confidentiel interne · Cahier de stage</Text>
      <Text style={styles.footerText}>{internBrand.tagline}</Text>
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

export function DevOpsInternPdf({ logoSrc, heroSrc }: Props) {
  const total = 7;

  return (
    <Document
      title={internBrand.title}
      author={internBrand.name}
      subject="Cahier de stage DevOps — PC → Git → VPS"
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
              <Text style={styles.coverTitle}>{internBrand.title}</Text>
              <View style={styles.coverRule} />
              <Text style={styles.coverSub}>{internBrand.subtitle}</Text>
              <Text style={[styles.coverSub, { marginTop: 10 }]}>
                Parcours : tout sur le PC → Git → VPS en ligne → push = déploiement auto.
              </Text>
            </View>
            <View style={styles.coverFooter}>
              <Text style={styles.coverTag}>{internBrand.duration}</Text>
              <View>
                <Text style={styles.coverMeta}>{internBrand.audience}</Text>
                <Text style={styles.coverMeta}>{internBrand.location}</Text>
                <Text style={styles.coverMeta}>{internBrand.name}</Text>
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
          <Text style={styles.body}>{internContext.product}</Text>
          <Text style={styles.sectionTitle}>Stack actuelle</Text>
          {internContext.stack.map((s) => (
            <Bullet key={s}>{s}</Bullet>
          ))}
          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>État aujourd’hui</Text>
          {internContext.today.map((s) => (
            <Bullet key={s}>{s}</Bullet>
          ))}
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>{internContext.goal}</Text>
          </View>
        </View>
        <PageFooter />
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <PageHeader page={3} total={total} />
          <Text style={styles.kicker}>Cible</Text>
          <Text style={styles.sectionTitle}>{internTarget.title}</Text>
          {internTarget.items.map((s) => (
            <Bullet key={s}>{s}</Bullet>
          ))}
          <Text style={[styles.sectionTitle, { marginTop: 14 }]}>Règles non négociables</Text>
          {internRules.map((s) => (
            <Bullet key={s}>{s}</Bullet>
          ))}
        </View>
        <PageFooter />
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <PageHeader page={4} total={total} />
          <Text style={styles.kicker}>PC → Git</Text>
          <Text style={styles.sectionTitle}>Phases A & B</Text>
          {internPhases.slice(0, 2).map((sp) => (
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
          <Text style={styles.kicker}>Git → VPS</Text>
          <Text style={styles.sectionTitle}>Phases C & D</Text>
          {internPhases.slice(2, 4).map((sp) => (
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
          <Text style={styles.kicker}>Automatisation</Text>
          <Text style={styles.sectionTitle}>Phase E</Text>
          {internPhases.slice(4).map((sp) => (
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
          <PageHeader page={7} total={total} />
          <Text style={styles.kicker}>Clôture</Text>
          <Text style={styles.sectionTitle}>Livrables attendus</Text>
          {internDeliverables.map((s) => (
            <Bullet key={s}>{s}</Bullet>
          ))}
          <Text style={[styles.sectionTitle, { marginTop: 14 }]}>
            Grille d’évaluation
          </Text>
          {internEval.map((s) => (
            <Bullet key={s}>{s}</Bullet>
          ))}
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              Definition of Done : un nouveau serveur se déploie tout seul, HTTPS
              marche, les queues et crons tournent, un backup existe, et un rollback
              a été démontré. La salle peut ouvrir sans Laragon.
            </Text>
          </View>
        </View>
        <PageFooter />
      </Page>
    </Document>
  );
}
