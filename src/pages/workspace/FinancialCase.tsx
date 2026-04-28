import CasePage from './CasePage'
import { PoundSterling } from 'lucide-react'

export default function FinancialCase() {
  return <CasePage caseType="financial" headerColor="text-green-600" HeaderIcon={PoundSterling} />
}
