import Link from 'next/link'
import { ArrowLeft, BookCopy, ExternalLink, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { StudyPageHero } from '@/components/study/StudyPageHero'
import { DiscoverCanadaPdfViewer } from '@/components/study/DiscoverCanadaPdfViewer'

/** Official IRCC study guide (HTML). */
const IRCC_STUDY_GUIDE_HTML =
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/study-guide.html'

/** Canonical Discover Canada PDF (English) on Canada.ca — source for the mirrored copy below. */
const DISCOVER_CANADA_PDF_EN_CANONICAL =
  'https://www.canada.ca/content/dam/ircc/migration/ircc/english/pdf/pub/discover.pdf'

/** Local mirror (same file) so the browser can embed it; remote Canada.ca URLs block iframe embedding. */
const DISCOVER_CANADA_PDF_EN_LOCAL = '/study/discover-canada-en.pdf'

/** Official Discover Canada PDF (French). */
const DISCOVER_CANADA_PDF_FR =
  'https://www.canada.ca/content/dam/ircc/migration/ircc/french/pdf/pub/decouvrir.pdf'

export default function DiscoverCanadaHandbookPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-8">
      <Button variant="ghost" size="sm" className="-ml-3 w-fit gap-2 text-muted-foreground" asChild>
        <Link href="/dashboard/study">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to study centre
        </Link>
      </Button>

      <StudyPageHero
        icon={BookCopy}
        eyebrow="Official study material"
        title="Discover Canada handbook"
        description="Read the government study guide used for the citizenship test — rights and responsibilities of citizenship, history, institutions, symbols, and more."
      />

      <Alert className="border-brand-navy/15 bg-muted/40">
        <Info className="size-4 text-brand-navy" aria-hidden />
        <AlertTitle>Disclaimer</AlertTitle>
        <AlertDescription className="space-y-2 text-muted-foreground">
          <p>
            CitizenReady is not affiliated with Immigration, Refugees and Citizenship Canada (IRCC) or the Government of Canada. This page
            serves a local copy of IRCC’s English Discover Canada PDF for in-app viewing, with links to official IRCC sources — for personal
            study only.
          </p>
          <p>
            Eligibility rules, test formats, and official wording can change — always confirm details with{' '}
            <a href={IRCC_STUDY_GUIDE_HTML} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground">
              IRCC’s Discover Canada pages
            </a>{' '}
            before your appointment.
          </p>
        </AlertDescription>
      </Alert>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Attribution — Discover Canada</CardTitle>
          <CardDescription className="space-y-3 leading-relaxed [&_strong]:text-foreground">
            <p>
              The publication shown below is{' '}
              <strong className="font-medium">
                Discover Canada: The Rights and Responsibilities of Citizenship
              </strong>
              , prepared by Immigration, Refugees and Citizenship Canada.
            </p>
            <p className="text-xs sm:text-sm">
              © His Majesty the King in Right of Canada, represented by the Minister of Immigration, Refugees and Citizenship,{' '}
              {new Date().getFullYear()}. The English PDF shown below is mirrored from IRCC’s publication on Canada.ca solely so it
              can be embedded in this app; CitizenReady does not claim ownership of this content.
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button variant="outline" className="justify-start gap-2 border-brand-navy/20" asChild>
            <a href={IRCC_STUDY_GUIDE_HTML} target="_blank" rel="noopener noreferrer">
              IRCC study guide (web)
              <ExternalLink className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
            </a>
          </Button>
          <Button variant="outline" className="justify-start gap-2 border-brand-navy/20" asChild>
            <a href={DISCOVER_CANADA_PDF_EN_LOCAL} target="_blank" rel="noopener noreferrer">
              Open PDF (English, this site)
              <ExternalLink className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
            </a>
          </Button>
          <Button variant="outline" className="justify-start gap-2 border-brand-navy/20" asChild>
            <a href={DISCOVER_CANADA_PDF_EN_CANONICAL} target="_blank" rel="noopener noreferrer">
              Official PDF on Canada.ca
              <ExternalLink className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
            </a>
          </Button>
          <Button variant="outline" className="justify-start gap-2 border-brand-navy/20" asChild>
            <a href={DISCOVER_CANADA_PDF_FR} target="_blank" rel="noopener noreferrer">
              Open PDF (French)
              <ExternalLink className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
            </a>
          </Button>
        </CardContent>
      </Card>

      <section aria-label="Discover Canada PDF viewer" className="space-y-3">
        <h2 className="text-lg font-semibold text-brand-navy">Handbook (English PDF)</h2>
        <p className="text-sm text-muted-foreground">
          Served from this site as a mirror of IRCC’s file. Pages scale to fit the viewer; use Previous / Next or arrow keys.
          For the authoritative hosted copy, use{' '}
          <a
            className="font-medium text-foreground underline underline-offset-2"
            href={DISCOVER_CANADA_PDF_EN_CANONICAL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Official PDF on Canada.ca
          </a>
          .
        </p>
        <DiscoverCanadaPdfViewer fileUrl={DISCOVER_CANADA_PDF_EN_LOCAL} />
      </section>
    </div>
  )
}
