import { CalendarClock, ExternalLink, MapPin } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FEDERAL_OFFICEHOLDER_ROWS,
  GOVERNMENT_OFFICEHOLDERS_AS_OF,
  PROVINCIAL_OFFICEHOLDER_ROWS,
  STUDY_GOVERNMENT_OFFICEHOLDER_LINKS,
  TERRITORIAL_OFFICEHOLDER_ROWS,
} from '@/lib/data/study-government-officeholders'

export function GovernmentOfficeholdersSection() {
  return (
    <Card className="border-brand-red/25 shadow-md">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
            <CalendarClock className="h-3 w-3" aria-hidden />
            Quick reference • as of{' '}
            <time dateTime={GOVERNMENT_OFFICEHOLDERS_AS_OF}>{GOVERNMENT_OFFICEHOLDERS_AS_OF}</time>
          </span>
        </div>
        <CardTitle className="text-xl">Who holds office right now?</CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          For interviews and oath preparation, newcomers often memorize the Sovereign&apos;s representatives, heads of government, and ruling
          parties. Roles and names change frequently — verify with provincial, territorial, and federal portals below before your ceremony.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-10">
        <section aria-labelledby="federal-officeholders-heading">
          <h2 id="federal-officeholders-heading" className="mb-3 text-base font-semibold text-foreground">
            Federal Parliament
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[8rem]">Role</TableHead>
                <TableHead className="whitespace-normal">Currently</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FEDERAL_OFFICEHOLDER_ROWS.map((row) => (
                <TableRow key={row.role}>
                  <TableCell className="whitespace-normal font-medium text-foreground">{row.role}</TableCell>
                  <TableCell className="max-w-xl whitespace-normal text-muted-foreground">
                    {row.answer}
                    {row.note ? (
                      <span className="mt-1 block text-xs italic text-muted-foreground/90">{row.note}</span>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section aria-labelledby="provincial-officeholders-heading">
          <h2 id="provincial-officeholders-heading" className="mb-3 text-base font-semibold text-foreground">
            Provincial governments
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[5.5rem]">Province</TableHead>
                <TableHead className="whitespace-normal">Lieutenant governor</TableHead>
                <TableHead className="whitespace-normal">Premier</TableHead>
                <TableHead className="min-w-[6rem] whitespace-normal">Government / party leading</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PROVINCIAL_OFFICEHOLDER_ROWS.map((row) => (
                <TableRow key={row.jurisdiction}>
                  <TableCell className="whitespace-normal font-medium text-foreground">{row.jurisdiction}</TableCell>
                  <TableCell className="max-w-[14rem] whitespace-normal text-muted-foreground">{row.crownOrFederalRep}</TableCell>
                  <TableCell className="max-w-[14rem] whitespace-normal text-muted-foreground">{row.headOfGovernment}</TableCell>
                  <TableCell className="max-w-[12rem] whitespace-normal text-muted-foreground">{row.government}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section aria-labelledby="territorial-officeholders-heading">
          <h2 id="territorial-officeholders-heading" className="mb-3 text-base font-semibold text-foreground">
            Territorial governments
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            Commissioners formally represent Ottawa in each territory (except Yukon day-to-day is similar to provinces). Consensus governments
            in Nunavut and the N.W.T. do not endorse party banners in elections the same way as provinces—premiers are selected by MLAs after
            the vote.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[7rem]">Territory</TableHead>
                <TableHead className="whitespace-normal">Commissioner</TableHead>
                <TableHead className="whitespace-normal">Premier</TableHead>
                <TableHead className="min-w-[6rem] whitespace-normal">Government</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TERRITORIAL_OFFICEHOLDER_ROWS.map((row) => (
                <TableRow key={row.jurisdiction}>
                  <TableCell className="whitespace-normal font-medium text-foreground">{row.jurisdiction}</TableCell>
                  <TableCell className="max-w-[14rem] whitespace-normal text-muted-foreground">{row.crownOrFederalRep}</TableCell>
                  <TableCell className="max-w-[14rem] whitespace-normal text-muted-foreground">{row.headOfGovernment}</TableCell>
                  <TableCell className="max-w-[12rem] whitespace-normal text-muted-foreground">{row.government}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section
          aria-labelledby="municipal-note-heading"
          className="rounded-lg border border-dashed bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground"
        >
          <h2 id="municipal-note-heading" className="mb-2 flex items-center gap-2 font-semibold text-foreground">
            <MapPin className="h-4 w-4 text-brand-red" aria-hidden />
            Municipal layer
          </h2>
          <p className="m-0">
            Your municipality, mayor or reeve, band council if applicable, and school trustees are uniquely local—not listed here. Municipal
            websites publish the authoritative names once you enter your postal code.
          </p>
        </section>

        <section aria-labelledby="officeholder-sources-heading">
          <h2 id="officeholder-sources-heading" className="sr-only">
            Confirm on official websites
          </h2>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {STUDY_GOVERNMENT_OFFICEHOLDER_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline underline-offset-2 hover:text-brand-red"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </CardContent>
    </Card>
  )
}
