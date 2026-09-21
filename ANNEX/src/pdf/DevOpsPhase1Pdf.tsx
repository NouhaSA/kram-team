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
  phase1Brand,
  phase1Done,
  phase1Intro,
  phase1Missions,
  phase1Rules,
} from "../lib/devops-phase1-content";

export function registerDevOpsPhase1Fonts(regularPath: string, boldPath: string) {
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
    fontSize: 28,
    lineHeight: 1.12,
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
    marginBottom: 16,
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
    fontSize: 14,
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
  missionBox: {
    backgroundColor: colors.panel,
    padding: 10,
    marginBottom: 9,
  },
  missionTitle: {
    color: colors.white,
    fontWeight: 700,
    fontSize: 11,
    marginBottom: 4,
  },
  missionStar: { color: colors.red, fontSize: 9, fontWeight: 700, marginBottom: 5 },
  deliverable: {
    marginTop: 6,
    color: colors.cream,
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
  twoCol: { flexDirection: "row", gap: 16 },
  col: { flex: 1 },
});

function PageHeader({ page, total }: { page: number; total: number }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerBrand}>{phase1Brand.name.toUpperCase()}</Text>
      <Text style={styles.headerPage}>
        {page} / {total}
      </Text>
    </View>
  );
}

function PageFooter() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>Confidentiel · Mission DevOps Phase 1</Text>
      <Text style={styles.footerText}>{phase1Brand.tagline}</Text>
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

export function DevOpsPhase1Pdf({ logoSrc, heroSrc }: Props) {
  const total = 5;

  return (
    <Document
      title={phase1Brand.title}
      author={phase1Brand.name}
      subject="Mission stagiaire DevOps Phase 1 — Kram Team"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <Image src={heroSrc} style={styles.coverImage} />
          <View style={styles.coverScrim} />
          <View style={styles.coverAccent} />
          <View style={styles.coverInner}>
            <Image src={logoSrc} style={styles.coverLogo} />
            <View>
              <Text style={styles.coverEyebrow}>Document à envoyer au stagiaire</Text>
              <Text style={styles.coverTitle}>{phase1Brand.title}</Text>
              <View style={styles.coverRule} />
              <Text style={styles.coverSub}>{phase1Brand.subtitle}</Text>
              <Text style={[styles.coverSub, { marginTop: 10 }]}>
                Comprendre le projet → Git → local → SaaS tenant → automatisation locale.
              </Text>
            </View>
            <View style={styles.coverFooter}>
              <Text style={styles.coverTag}>{phase1Brand.duration}</Text>
              <View>
                <Text style={styles.coverMeta}>{phase1Brand.audience}</Text>
                <Text style={styles.coverMeta}>{phase1Brand.location}</Text>
                <Text style={styles.coverMeta}>{phase1Brand.name}</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <PageHeader page={2} total={total} />
          <Text style={styles.kicker}>Projet</Text>
          <Text style={styles.sectionTitle}>Kram Team — contexte</Text>
          <Text style={styles.body}>{phase1Intro.project}</Text>
          <Text style={styles.sectionTitle}>Stack</Text>
          {phase1Intro.stack.map((s) => (
            <Bullet key={s}>{s}</Bullet>
          ))}
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Modules</Text>
              {phase1Intro.modules.map((s) => (
                <Bullet key={s}>{s}</Bullet>
              ))}
            </View>
            <View style={styles.col}>
              <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Rôles</Text>
              {phase1Intro.roles.map((s) => (
                <Bullet key={s}>{s}</Bullet>
              ))}
            </View>
          </View>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>{phase1Intro.goal}</Text>
          </View>
        </View>
        <PageFooter />
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <PageHeader page={3} total={total} />
          <Text style={styles.kicker}>Missions</Text>
          <Text style={styles.sectionTitle}>1 · Comprendre le projet</Text>
          {phase1Missions.slice(0, 1).map((m) => (
            <View key={m.num} style={styles.missionBox}>
              {m.star ? <Text style={styles.missionStar}>Priorité ★</Text> : null}
              {m.tasks.map((t) => (
                <Bullet key={t}>{t}</Bullet>
              ))}
              <Text style={styles.deliverable}>Livrable : {m.deliverable}</Text>
            </View>
          ))}
          <Text style={[styles.sectionTitle, { marginTop: 6 }]}>2 · Git / GitHub</Text>
          {phase1Missions.slice(1, 2).map((m) => (
            <View key={m.num} style={styles.missionBox}>
              {m.tasks.map((t) => (
                <Bullet key={t}>{t}</Bullet>
              ))}
              <Text style={styles.deliverable}>Livrable : {m.deliverable}</Text>
            </View>
          ))}
        </View>
        <PageFooter />
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <PageHeader page={4} total={total} />
          <Text style={styles.kicker}>Missions</Text>
          <Text style={styles.sectionTitle}>3 · Environnement local</Text>
          {phase1Missions.slice(2, 3).map((m) => (
            <View key={m.num} style={styles.missionBox}>
              {m.tasks.map((t) => (
                <Bullet key={t}>{t}</Bullet>
              ))}
              <Text style={styles.deliverable}>Livrable : {m.deliverable}</Text>
            </View>
          ))}
          <Text style={[styles.sectionTitle, { marginTop: 4 }]}>4 · Préparation SaaS</Text>
          {phase1Missions.slice(3, 4).map((m) => (
            <View key={m.num} style={styles.missionBox}>
              {m.tasks.map((t) => (
                <Bullet key={t}>{t}</Bullet>
              ))}
              <Text style={styles.deliverable}>Livrable : {m.deliverable}</Text>
            </View>
          ))}
        </View>
        <PageFooter />
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <PageHeader page={5} total={total} />
          <Text style={styles.kicker}>Missions & clôture</Text>
          <Text style={styles.sectionTitle}>5 · Automatisation locale</Text>
          {phase1Missions.slice(4).map((m) => (
            <View key={m.num} style={styles.missionBox}>
              {m.tasks.map((t) => (
                <Bullet key={t}>{t}</Bullet>
              ))}
              <Text style={styles.deliverable}>Livrable : {m.deliverable}</Text>
            </View>
          ))}
          <Text style={[styles.sectionTitle, { marginTop: 6 }]}>Règles</Text>
          {phase1Rules.map((s) => (
            <Bullet key={s}>{s}</Bullet>
          ))}
          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
            Critères de fin de Phase 1
          </Text>
          {phase1Done.map((s) => (
            <Bullet key={s}>{s}</Bullet>
          ))}
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              Scénario de validation : Nouveau client → nouveau tenant → configuration →
              compte admin salle — testé et documenté en local.
            </Text>
          </View>
        </View>
        <PageFooter />
      </Page>
    </Document>
  );
}
