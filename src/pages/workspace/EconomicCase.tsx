import { useState } from 'react'
import CasePage from './CasePage'
import { TrendingUp } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import OptionsMatrix from '@/components/registers/OptionsMatrix'

export default function EconomicCase() {
  const [tab, setTab] = useState('case')

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="px-6 pt-4 pb-0 border-b border-slate-200 bg-white sticky top-0 z-10">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-0">
            <TabsTrigger value="case">Case sections</TabsTrigger>
            <TabsTrigger value="options">Options Framework matrix</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {tab === 'case' && (
        <div className="flex-1 overflow-auto">
          <CasePage caseType="economic" headerColor="text-purple-600" HeaderIcon={TrendingUp} />
        </div>
      )}
      {tab === 'options' && (
        <div className="flex-1 overflow-auto p-6">
          <OptionsMatrix />
        </div>
      )}
    </div>
  )
}
