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
  advantages,
  brand,
  coachTraining,
  finances,
  intro,
  nextSteps,
  offer,
  opening,
  opportunity,
  profile,
} from "@/lib/franchise-content";

export function registerFranchisePdfFonts(regularPath: string, boldPath: string) {
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
  line: "#2A2A2E",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.black,
    color: colors.cream,
    fontFamily: "SourceSans3",
    paddingBottom: 44,
  },
  cover: {
    flex: 1,
    position: "relative",
  },
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
    backgroundColor: "rgba(11,11,12,0.72)",
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
  coverLogo: {
    width: 88,
    height: 88,
    objectFit: "contain",
  },
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
    fontSize: 38,
    lineHeight: 1.05,
    letterSpacing: 0.5,
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
    maxWidth: 340,
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
  coverMeta: {
    color: colors.muted,
    fontSize: 9,
    textAlign: "right",
    marginBottom: 2,
  },
  content: {
    paddingHorizontal: 40,
    paddingTop: 34,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
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
  headerPage: {
    fontSize: 9,
    color: colors.muted,
  },
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
    fontSize: 16,
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
  highlightText: {
    color: colors.cream,
    fontSize: 10,
    lineHeight: 1.5,
  },
  listItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  bullet: {
    width: 5,
    height: 5,
    marginTop: 4,
    backgroundColor: colors.red,
  },
  listText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.45,
    color: colors.stone,
  },
  dual: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  dualCol: {
    flex: 1,
  },
  photo: {
    width: "100%",
    height: 170,
    objectFit: "cover",
    marginBottom: 10,
  },
  photoSm: {
    width: "100%",
    height: 120,
    objectFit: "cover",
    marginBottom: 8,
  },
  grid2: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
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
    textTransform: "uppercase",
  },
  cardText: {
    fontSize: 8.5,
    lineHeight: 1.45,
    color: colors.stone,
  },
  financeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 7,
  },
  financeLabel: {
    fontSize: 9,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  financeValue: {
    fontWeight: 700,
    fontSize: 14,
    color: colors.white,
  },
  financeNote: {
    fontSize: 8,
    color: colors.muted,
    marginTop: 2,
    maxWidth: 280,
  },
  roiBox: {
    backgroundColor: colors.red,
    padding: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  roiLabel: {
    fontSize: 8,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  roiValue: {
    fontWeight: 700,
    fontSize: 18,
    color: colors.white,
  },
  stepRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    alignItems: "flex-start",
  },
  stepNum: {
    width: 20,
    height: 20,
    backgroundColor: colors.red,
    color: colors.white,
    fontWeight: 700,
    fontSize: 10,
    textAlign: "center",
    paddingTop: 3,
  },
  stepTitle: {
    fontWeight: 700,
    fontSize: 10,
    color: colors.white,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  footerBar: {
    position: "absolute",
    bottom: 18,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 7,
  },
  footerText: {
    fontSize: 7.5,
    color: colors.muted,
  },
  contactBlock: {
    marginTop: 16,
    backgroundColor: colors.panel,
    borderLeftWidth: 3,
    borderLeftColor: colors.red,
    padding: 14,
  },
  contactTitle: {
    fontWeight: 700,
    fontSize: 12,
    color: colors.white,
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  contactLine: {
    color: colors.stone,
    fontSize: 10,
    marginBottom: 3,
  },
  moduleChip: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 5,
    marginRight: 5,
  },
  moduleText: {
    fontSize: 8.5,
    color: colors.stone,
  },
  modulesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
});

function PageHeader({ label }: { label: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerBrand}>{brand.name.toUpperCase()}</Text>
      <Text style={styles.headerPage}>{label}</Text>
    </View>
  );
}

function PageFooter() {
  return (
    <View style={styles.footerBar} fixed>
      <Text style={styles.footerText}>
        {brand.name} — Offre de franchise · {brand.tagline}
      </Text>
      <Text
        style={styles.footerText}
        render={({ pageNumber, totalPages }) =>
          `${pageNumber} / ${totalPages}`
        }
      />
    </View>
  );
}

type FranchiseOfferPdfProps = {
  logoSrc?: string;
  images?: {
    hero?: string;
    coach?: string;
    sparring?: string;
    training?: string;
    pads?: string;
  };
};

export function FranchiseOfferPdf({ logoSrc, images = {} }: FranchiseOfferPdfProps) {
  return (
    <Document
      title={`Offre de Franchise — ${brand.name}`}
      author={brand.name}
      subject="Dossier franchise Kram Team"
    >
      {/* Cover — like web hero */}
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          {images.hero ? (
            <Image src={images.hero} style={styles.coverImage} />
          ) : null}
          <View style={styles.coverScrim} />
          <View style={styles.coverAccent} />
          <View style={styles.coverInner}>
            {logoSrc ? (
              <Image src={logoSrc} style={styles.coverLogo} />
            ) : (
              <View style={{ height: 40 }} />
            )}
            <View>
              <Text style={styles.coverEyebrow}>{brand.tagline}</Text>
              <Text style={styles.coverTitle}>Offre de{"\n"}Franchise</Text>
              <View style={styles.coverRule} />
              <Text style={styles.coverSub}>
                Kickboxing & fitness — un modèle entrepreneurial flexible,
                rentable et à fort impact social.
              </Text>
            </View>
            <View style={styles.coverFooter}>
              <Text style={styles.coverTag}>{brand.name}</Text>
              <View>
                <Text style={styles.coverMeta}>{brand.email}</Text>
                <Text style={styles.coverMeta}>{brand.phone}</Text>
                <Text style={styles.coverMeta}>{brand.website}</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>

      {/* Concept */}
      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <PageHeader label="Concept & opportunité" />
          <View style={styles.dual}>
            <View style={styles.dualCol}>
              <Text style={styles.kicker}>01 — Concept</Text>
              <Text style={styles.sectionTitle}>{intro.title}</Text>
              <Text style={styles.body}>{intro.body}</Text>
              <View style={styles.highlightBox}>
                <Text style={styles.highlightText}>{intro.highlight}</Text>
              </View>
            </View>
            <View style={[styles.dualCol, { maxWidth: 210 }]}>
              {images.training ? (
                <Image src={images.training} style={styles.photo} />
              ) : null}
            </View>
          </View>

          <Text style={[styles.kicker, { marginTop: 8 }]}>03 — Opportunité</Text>
          <Text style={styles.sectionTitle}>{opportunity.title}</Text>
          <Text style={styles.body}>{opportunity.body}</Text>
          <Text style={styles.body}>{opportunity.support}</Text>

          <Text style={[styles.sectionTitle, { marginTop: 8, fontSize: 13 }]}>
            {profile.title}
          </Text>
          {profile.items.map((item) => (
            <View key={item} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
          <PageFooter />
        </View>
      </Page>

      {/* Coach training */}
      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <PageHeader label="Qualité formation coach" />
          <Text style={styles.kicker}>02 — Excellence coach</Text>
          <Text style={styles.sectionTitle}>{coachTraining.title}</Text>
          <Text style={styles.body}>{coachTraining.subtitle}</Text>
          <Text style={styles.body}>{coachTraining.body}</Text>

          <View style={styles.dual}>
            <View style={styles.dualCol}>
              {images.coach ? (
                <Image src={images.coach} style={styles.photoSm} />
              ) : null}
              {images.sparring ? (
                <Image src={images.sparring} style={styles.photoSm} />
              ) : null}
            </View>
            <View style={styles.dualCol}>
              <View style={styles.grid2}>
                {coachTraining.pillars.map((p) => (
                  <View key={p.title} style={styles.card} wrap={false}>
                    <Text style={styles.cardTitle}>{p.title}</Text>
                    <Text style={styles.cardText}>{p.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <Text style={[styles.kicker, { marginTop: 12 }]}>Modules clés</Text>
          <View style={styles.modulesWrap}>
            {coachTraining.modules.map((m) => (
              <View key={m} style={styles.moduleChip}>
                <Text style={styles.moduleText}>{m}</Text>
              </View>
            ))}
          </View>
          <PageFooter />
        </View>
      </Page>

      {/* Offer + advantages */}
      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <PageHeader label="Offre franchisé" />
          <Text style={styles.kicker}>04 — Accompagnement</Text>
          <Text style={styles.sectionTitle}>{offer.title}</Text>
          <View style={styles.grid2}>
            {offer.items.map((item) => (
              <View key={item.title} style={styles.card} wrap={false}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardText}>{item.text}</Text>
              </View>
            ))}
          </View>

          {images.pads ? (
            <Image
              src={images.pads}
              style={[styles.photoSm, { marginTop: 12, height: 100 }]}
            />
          ) : null}

          <Text style={[styles.kicker, { marginTop: 10 }]}>07 — Avantages</Text>
          <Text style={styles.sectionTitle}>{advantages.title}</Text>
          <View style={styles.grid2}>
            {advantages.items.map((item) => (
              <View key={item.title} style={styles.card} wrap={false}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardText}>{item.text}</Text>
              </View>
            ))}
          </View>
          <PageFooter />
        </View>
      </Page>

      {/* Finances */}
      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <PageHeader label="Finances & ouverture" />
          <Text style={styles.kicker}>05 — Investissement</Text>
          <Text style={styles.sectionTitle}>{finances.title}</Text>

          <View style={styles.financeRow}>
            <View>
              <Text style={styles.financeLabel}>{finances.entry.label}</Text>
              <Text style={styles.financeNote}>{finances.entry.note}</Text>
            </View>
            <Text style={styles.financeValue}>{finances.entry.value}</Text>
          </View>
          {finances.monthly.map((row) => (
            <View key={row.label} style={styles.financeRow}>
              <View>
                <Text style={styles.financeLabel}>{row.label}</Text>
                <Text style={styles.financeNote}>{row.note}</Text>
              </View>
              <Text style={styles.financeValue}>{row.value}</Text>
            </View>
          ))}
          <View style={styles.financeRow}>
            <View>
              <Text style={styles.financeLabel}>{finances.setup.label}</Text>
              <Text style={styles.financeNote}>{finances.setup.note}</Text>
            </View>
            <Text style={styles.financeValue}>{finances.setup.value}</Text>
          </View>

          <View style={styles.roiBox}>
            <Text style={styles.roiLabel}>{finances.roi.label}</Text>
            <Text style={styles.roiValue}>{finances.roi.revenue}</Text>
            <Text
              style={{
                fontWeight: 700,
                fontSize: 11,
                color: colors.white,
                marginTop: 4,
              }}
            >
              Marge nette {finances.roi.margin}
            </Text>
            <Text
              style={{
                fontSize: 8,
                color: "rgba(255,255,255,0.8)",
                marginTop: 6,
              }}
            >
              {finances.roi.note}
            </Text>
          </View>

          <Text style={styles.kicker}>06 — Ouverture</Text>
          <Text style={styles.sectionTitle}>{opening.title}</Text>
          {opening.steps.map((step, i) => (
            <View key={step.title} style={styles.stepRow}>
              <Text style={styles.stepNum}>{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.body}>{step.text}</Text>
              </View>
            </View>
          ))}
          <PageFooter />
        </View>
      </Page>

      {/* Next steps + contact */}
      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <PageHeader label="Prochaines étapes" />
          <Text style={styles.kicker}>08 — Parcours</Text>
          <Text style={styles.sectionTitle}>{nextSteps.title}</Text>
          {nextSteps.steps.map((step, i) => (
            <View key={step} style={styles.stepRow}>
              <Text style={styles.stepNum}>{i + 1}</Text>
              <Text style={[styles.listText, { paddingTop: 3, color: colors.cream }]}>
                {step}
              </Text>
            </View>
          ))}

          <View style={styles.contactBlock}>
            <Text style={styles.contactTitle}>Contact franchise</Text>
            <Text style={styles.contactLine}>Email : {brand.email}</Text>
            <Text style={styles.contactLine}>Téléphone : {brand.phone}</Text>
            <Text style={styles.contactLine}>Web : {brand.website}</Text>
          </View>

          {logoSrc ? (
            <Image
              src={logoSrc}
              style={{
                width: 64,
                height: 64,
                objectFit: "contain",
                marginTop: 28,
                alignSelf: "center",
              }}
            />
          ) : null}
          <Text
            style={{
              textAlign: "center",
              marginTop: 10,
              fontWeight: 700,
              letterSpacing: 3,
              fontSize: 11,
              color: colors.red,
              textTransform: "uppercase",
            }}
          >
            {brand.tagline}
          </Text>
          <PageFooter />
        </View>
      </Page>
    </Document>
  );
}
