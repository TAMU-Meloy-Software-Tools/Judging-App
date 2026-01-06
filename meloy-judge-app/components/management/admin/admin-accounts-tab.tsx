"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Users, Mail, Edit, Trash2 } from "lucide-react"

interface Account {
  id: string
  name: string
  email: string
  isJudge: boolean
  isAdmin: boolean
  isModerator: boolean
}

interface AdminAccountsTabProps {
  accounts: Account[]
}

export function AdminAccountsTab({ accounts }: AdminAccountsTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null)

  const filteredAccounts = accounts.filter((account) => 
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-6">
          <h3 className="text-3xl font-semibold text-slate-800">Account Permissions</h3>
          <p className="mt-2 text-base text-slate-600">Manage user roles and access levels across the platform</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search accounts by name or email..."
              className="h-14 rounded-2xl border-slate-200 bg-white pl-12 pr-4 text-base shadow-lg focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-linear-to-b from-primary to-[#3d0000]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
          
          <div className="relative max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-white/5">
            <div className="divide-y divide-white/10">
              {filteredAccounts.map((account) => (
                <div
                  key={account.id}
                  className="group relative p-6 transition-all hover:bg-white/5"
                >
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/20">
                          <Users className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white transition-colors">
                            {account.name}
                          </h4>
                          <p className="mt-0.5 flex items-center gap-2 text-sm text-white/70">
                            <Mail className="h-3.5 w-3.5" />
                            {account.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {editingAccountId === account.id ? (
                        <>
                          <div className="flex items-center gap-4">
                            <button
                              className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md ${
                                account.isJudge
                                  ? 'border-white/50 bg-white/95 hover:border-white/60 hover:bg-white'
                                  : 'border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/20'
                              }`}
                            >
                              <span className={`text-sm font-semibold ${
                                account.isJudge ? 'text-slate-800' : 'text-white/70'
                              }`}>
                                Judge
                              </span>
                            </button>

                            <button
                              className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md ${
                                account.isAdmin
                                  ? 'border-white/50 bg-white/95 hover:border-white/60 hover:bg-white'
                                  : 'border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/20'
                              }`}
                            >
                              <span className={`text-sm font-semibold ${
                                account.isAdmin ? 'text-slate-800' : 'text-white/70'
                              }`}>
                                Admin
                              </span>
                            </button>

                            <button
                              className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md ${
                                account.isModerator
                                  ? 'border-white/50 bg-white/95 hover:border-white/60 hover:bg-white'
                                  : 'border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/20'
                              }`}
                            >
                              <span className={`text-sm font-semibold ${
                                account.isModerator ? 'text-slate-800' : 'text-white/70'
                              }`}>
                                Moderator
                              </span>
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <Button
                              onClick={() => setEditingAccountId(null)}
                              className="h-10 rounded-xl border-2 border-white/30 bg-white/20 px-5 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition-all hover:bg-white/30 hover:shadow-md"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => {
                                // Save logic would go here
                                setEditingAccountId(null)
                              }}
                              className="h-10 rounded-xl border-2 border-white/30 bg-white/20 px-5 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition-all hover:bg-white/30 hover:shadow-md"
                            >
                              Save
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => setEditingAccountId(account.id)}
                            className="h-10 rounded-xl border-2 border-white/30 bg-white/10 px-5 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition-all hover:bg-white/20 hover:shadow-md"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>

                          <div className="flex items-center gap-4">
                            <div
                              className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 shadow-sm backdrop-blur-sm ${
                                account.isJudge
                                  ? 'border-white/50 bg-white/95'
                                  : 'border-white/20 bg-white/10'
                              }`}
                            >
                              <span className={`text-sm font-semibold ${
                                account.isJudge ? 'text-slate-800' : 'text-white/70'
                              }`}>
                                Judge
                              </span>
                            </div>

                            <div
                              className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 shadow-sm backdrop-blur-sm ${
                                account.isAdmin
                                  ? 'border-white/50 bg-white/95'
                                  : 'border-white/20 bg-white/10'
                              }`}
                            >
                              <span className={`text-sm font-semibold ${
                                account.isAdmin ? 'text-slate-800' : 'text-white/70'
                              }`}>
                                Admin
                              </span>
                            </div>

                            <div
                              className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 shadow-sm backdrop-blur-sm ${
                                account.isModerator
                                  ? 'border-white/50 bg-white/95'
                                  : 'border-white/20 bg-white/10'
                              }`}
                            >
                              <span className={`text-sm font-semibold ${
                                account.isModerator ? 'text-slate-800' : 'text-white/70'
                              }`}>
                                Moderator
                              </span>
                            </div>
                          </div>
                        </>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 rounded-xl p-0 text-white/60 transition-all hover:bg-red-500/20 hover:text-red-300 hover:shadow-md"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
