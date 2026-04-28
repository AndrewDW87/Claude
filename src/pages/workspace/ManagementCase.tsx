import CasePage from './CasePage'
import { ClipboardList } from 'lucide-react'

export default function ManagementCase() {
  return <CasePage caseType="management" headerColor="text-rose-600" HeaderIcon={ClipboardList} />
}
