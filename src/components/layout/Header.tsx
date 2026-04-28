import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { stageLabel } from '@/lib/utils'
import { useCaseStore } from '@/store/caseStore'
import { ChevronDown, LogOut, Settings, LayoutDashboard, Save } from 'lucide-react'
import type { Session } from '@supabase/supabase-js'

interface HeaderProps {
  session: Session
  isSaving?: boolean
}

export default function Header({ session, isSaving }: HeaderProps) {
  const navigate = useNavigate()
  const { currentCase } = useCaseStore()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    navigate('/')
  }

  const stageBadgeVariant = currentCase?.current_stage === 'SOC'
    ? 'soc' : currentCase?.current_stage === 'OBC' ? 'obc' : 'fbc'

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center px-4 gap-4 shrink-0">
      <Link to="/dashboard" className="flex items-center gap-2">
        <div className="w-7 h-7 bg-navy rounded flex items-center justify-center">
          <span className="text-cream text-xs font-bold">CW</span>
        </div>
        <span className="font-semibold text-navy text-sm hidden sm:block">CaseWorks</span>
      </Link>

      {currentCase && (
        <>
          <span className="text-slate-300 hidden sm:block">/</span>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm text-navy font-medium truncate max-w-[200px]">{currentCase.title}</span>
            <Badge variant={stageBadgeVariant}>{stageLabel(currentCase.current_stage)}</Badge>
          </div>
        </>
      )}

      <div className="ml-auto flex items-center gap-2">
        {isSaving && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Save className="h-3 w-3 animate-pulse" />
            <span className="hidden sm:block">Saving…</span>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1">
              <div className="w-6 h-6 rounded-full bg-navy text-cream text-xs flex items-center justify-center font-medium">
                {session.user.email?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium text-navy">{session.user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/dashboard')}>
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} disabled={signingOut} className="text-red-600 focus:text-red-600 focus:bg-red-50">
              <LogOut className="h-4 w-4 mr-2" />
              {signingOut ? 'Signing out…' : 'Sign out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
