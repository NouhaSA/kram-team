import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { brand } from "@/lib/franchise-content";
import {
  contractArticles,
  contractMeta,
  contractParties,
} from "@/lib/contract-content";

export function registerContractPdfFonts(regularPath: string, boldPath: string) {
  Font.register({
    family: "SourceSans3",
    fonts: [
      { src: regularPath, fontWeight: 400 },
      { src: boldPath, fontWeight: 700 },
    ],
  });
}

const colors = {
  white: "#FFFFFF",
  ink: "#1A1A1A",
  muted: "#555555",
  line: "#CCCCCC",
  soft: "#F5F5F5",
  red: "#C8102E",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    color: colors.ink,
    fontFamily: "SourceSans3",
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 50,
    fontSize: 10,
    lineHeight: 1.45,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1.5,
    borderBottomColor: colors.ink,
    paddingBottom: 12,
    marginBottom: 18,
  },
  logo: {
    width: 52,
    height: 52,
    objectFit: "contain",
  },
  headerRight: {
    textAlign: "right",
    maxWidth: 280,
  },
  docTitle: {
    fontWeight: 700,
    fontSize: 16,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  docSub: {
    fontSize: 9,
    color: colors.muted,
    marginTop: 3,
  },
  badge: {
    marginTop: 6,
    fontSize: 8,
    color: colors.red,
    fontWeight: 700,
  },
  preamble: {
    fontSize: 9.5,
    marginBottom: 14,
    color: colors.ink,
  },
  partyBox: {
    borderWidth: 1,
    borderColor: colors.line,
    padding: 10,
    marginBottom: 10,
    backgroundColor: colors.soft,
  },
  partyLabel: {
    fontWeight: 700,
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 6,
    color: colors.red,
  },
  partyLine: {
    fontSize: 9.5,
    marginBottom: 3,
  },
  articleTitle: {
    fontWeight: 700,
    fontSize: 11,
    marginTop: 12,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  para: {
    fontSize: 9.5,
    marginBottom: 5,
    textAlign: "justify",
  },
  bulletRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 3,
    paddingLeft: 8,
  },
  bullet: {
    width: 4,
    height: 4,
    marginTop: 4,
    backgroundColor: colors.ink,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7.5,
    color: colors.muted,
  },
  signBlock: {
    marginTop: 24,
    flexDirection: "row",
    gap: 24,
  },
  signCol: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    minHeight: 120,
  },
  signTitle: {
    fontWeight: 700,
    fontSize: 10,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  signLine: {
    fontSize: 9,
    color: colors.muted,
    marginBottom: 18,
  },
  note: {
    marginTop: 16,
    fontSize: 8,
    color: colors.muted,
  },
});

function Header({ logoSrc }: { logoSrc?: string }) {
  return (
    <View style={styles.header} fixed>
      {logoSrc ? <Image src={logoSrc} style={styles.logo} /> : <View />}
      <View style={styles.headerRight}>
        <Text style={styles.docTitle}>{contractMeta.title}</Text>
        <Text style={styles.docSub}>{contractMeta.subtitle}</Text>
        <Text style={styles.badge}>{contractMeta.version}</Text>
      </View>
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        {brand.name} — Contrat de franchise confidentiel · {contractMeta.law}
      </Text>
      <Text
        style={styles.footerText}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} / ${totalPages}`
        }
      />
    </View>
  );
}

type Props = { logoSrc?: string };

export function FranchiseContractPdf({ logoSrc }: Props) {
  const mid = Math.ceil(contractArticles.length / 2);
  const first = contractArticles.slice(0, mid);
  const second = contractArticles.slice(mid);

  return (
    <Document
      title={`Contrat de Franchise — ${brand.name}`}
      author={brand.name}
      subject="Contrat de franchise Kram Team"
    >
      <Page size="A4" style={styles.page}>
        <Header logoSrc={logoSrc} />
        <Text style={styles.preamble}>
          Entre les soussignés, il a été convenu ce qui suit :
        </Text>

        <View style={styles.partyBox}>
          <Text style={styles.partyLabel}>
            {contractParties.franchisor.label}
          </Text>
          <Text style={styles.partyLine}>
            {contractParties.franchisor.name} —{" "}
            {contractParties.franchisor.form}
          </Text>
          <Text style={styles.partyLine}>
            Siège / pays : {contractParties.franchisor.address}
          </Text>
          <Text style={styles.partyLine}>
            Contact : {contractParties.franchisor.contact}
          </Text>
          <Text style={styles.partyLine}>
            {contractParties.franchisor.hereinafter}
          </Text>
        </View>

        <View style={styles.partyBox}>
          <Text style={styles.partyLabel}>
            {contractParties.franchisee.label}
          </Text>
          <Text style={styles.partyLine}>
            Nom / Raison sociale : {contractParties.franchisee.name}
          </Text>
          <Text style={styles.partyLine}>{contractParties.franchisee.form}</Text>
          <Text style={styles.partyLine}>{contractParties.franchisee.cin}</Text>
          <Text style={styles.partyLine}>
            {contractParties.franchisee.address}
          </Text>
          <Text style={styles.partyLine}>
            {contractParties.franchisee.contact}
          </Text>
          <Text style={styles.partyLine}>
            {contractParties.franchisee.hereinafter}
          </Text>
        </View>

        {first.map((article) => (
          <View key={article.number} wrap={false}>
            <Text style={styles.articleTitle}>
              Article {article.number} — {article.title}
            </Text>
            {article.paragraphs.map((p) => (
              <Text key={p.slice(0, 40)} style={styles.para}>
                {p}
              </Text>
            ))}
            {"bullets" in article &&
              article.bullets?.map((b) => (
                <View key={b} style={styles.bulletRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{b}</Text>
                </View>
              ))}
          </View>
        ))}
        <Footer />
      </Page>

      <Page size="A4" style={styles.page}>
        <Header logoSrc={logoSrc} />
        {second.map((article) => (
          <View key={article.number}>
            <Text style={styles.articleTitle}>
              Article {article.number} — {article.title}
            </Text>
            {article.paragraphs.map((p) => (
              <Text key={p.slice(0, 40)} style={styles.para}>
                {p}
              </Text>
            ))}
            {"bullets" in article &&
              article.bullets?.map((b) => (
                <View key={b} style={styles.bulletRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{b}</Text>
                </View>
              ))}
          </View>
        ))}

        <Text style={[styles.para, { marginTop: 16 }]}>
          Fait à {contractMeta.city}, le ____ / ____ / ________
        </Text>
        <Text style={styles.para}>En deux (2) exemplaires originaux.</Text>

        <View style={styles.signBlock}>
          <View style={styles.signCol}>
            <Text style={styles.signTitle}>Le Franchiseur</Text>
            <Text style={styles.signLine}>{brand.name}</Text>
            <Text style={styles.signLine}>Nom : ____________________</Text>
            <Text style={styles.signLine}>Qualité : _________________</Text>
            <Text style={styles.signLine}>Signature & cachet :</Text>
          </View>
          <View style={styles.signCol}>
            <Text style={styles.signTitle}>Le Franchisé</Text>
            <Text style={styles.signLine}>Nom : ____________________</Text>
            <Text style={styles.signLine}>Qualité : _________________</Text>
            <Text style={styles.signLine}>Signature & cachet :</Text>
          </View>
        </View>

        <Text style={styles.note}>
          Document modèle à titre informatif. À faire valider par un conseil
          juridique avant signature. Contact : {brand.email} · {brand.phone}
        </Text>
        <Footer />
      </Page>
    </Document>
  );
}
