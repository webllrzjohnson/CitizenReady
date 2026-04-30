import type { LucideIcon } from 'lucide-react'
import {
  BookCopy,
  CalendarDays,
  History,
  Landmark,
  Flag,
  Users,
  Scale,
} from 'lucide-react'
import { STUDY_SHEETS } from '@/lib/study/study-sheets-meta'

const SHEET_ICONS: LucideIcon[] = [
  BookCopy,
  CalendarDays,
  History,
  Landmark,
  Flag,
  Users,
  Scale,
]

export function studySheetIconAt(index: number): LucideIcon {
  return SHEET_ICONS[index] ?? CalendarDays
}

export function studySheetsWithIcons() {
  return STUDY_SHEETS.map((sheet, i) => ({
    ...sheet,
    Icon: studySheetIconAt(i),
  }))
}
