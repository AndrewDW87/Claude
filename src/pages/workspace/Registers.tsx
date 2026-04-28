import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import OptionsMatrix from '@/components/registers/OptionsMatrix'
import RisksTable from '@/components/registers/RisksTable'
import BenefitsTable from '@/components/registers/BenefitsTable'
import CostsTable from '@/components/registers/CostsTable'
import { useCaseStore } from '@/store/caseStore'
import { List } from 'lucide-react'

export default function Registers() {
  const { currentCase, options, risks, benefits, costs } = useCaseStore()
  const [tab, setTab] = useState('options')

  if (!currentCase) return null

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <List className="h-5 w-5 text-slate-400" />
          <h1 className="text-lg font-bold text-navy">Registers</h1>
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="options">
              Options ({options.length})
            </TabsTrigger>
            <TabsTrigger value="risks">
              Risks ({risks.length})
            </TabsTrigger>
            <TabsTrigger value="benefits">
              Benefits ({benefits.length})
            </TabsTrigger>
            <TabsTrigger value="costs">
              Costs ({costs.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {tab === 'options' && <OptionsMatrix />}
        {tab === 'risks' && <RisksTable />}
        {tab === 'benefits' && <BenefitsTable />}
        {tab === 'costs' && <CostsTable />}
      </div>
    </div>
  )
}
