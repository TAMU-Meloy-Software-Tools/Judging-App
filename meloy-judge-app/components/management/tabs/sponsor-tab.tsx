"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TabsContent } from "@/components/ui/tabs"
import { Building2, Palette, Upload, Save } from "lucide-react"

interface SponsorTabProps {
  sponsorName: string
  setSponsorName: (value: string) => void
  sponsorLogo: string | null
  primaryColor: string
  setPrimaryColor: (value: string) => void
  secondaryColor: string
  setSecondaryColor: (value: string) => void
  textColor: string
  setTextColor: (value: string) => void
  saving: boolean
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSave: () => Promise<void>
}

export function SponsorTab({
  sponsorName,
  setSponsorName,
  sponsorLogo,
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  textColor,
  setTextColor,
  saving,
  onLogoUpload,
  onSave,
}: SponsorTabProps) {
  return (
    <TabsContent value="sponsor" className="space-y-6">
      <Card className="overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-b from-white to-slate-50 shadow-2xl p-0">
        <CardHeader className="relative overflow-hidden border-b-2 border-slate-100 bg-gradient-to-b from-primary to-[#3d0000] p-8 m-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
          <div className="relative">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              Title Sponsor
            </CardTitle>
            <CardDescription className="text-base text-white/80 mt-2">
              Manage sponsor branding and appearance
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          <div className="space-y-3">
            <Label htmlFor="sponsor-name" className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700">
              Sponsor Name
            </Label>
            <Input
              id="sponsor-name"
              value={sponsorName}
              onChange={(e) => setSponsorName(e.target.value)}
              className="h-14 rounded-2xl border-2 border-slate-200 px-5 text-lg shadow-inner focus:border-primary/40 transition-colors"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              Sponsor Logo
            </Label>
            <div className="flex items-center gap-6">
              {sponsorLogo && (
                <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 shadow-lg">
                  <Image src={sponsorLogo} alt="Sponsor Logo" width={128} height={128} className="h-full w-full object-contain" />
                </div>
              )}
              <Label
                htmlFor="logo-upload"
                className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-8 py-6 transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-md"
              >
                <Upload className="h-6 w-6 text-primary" />
                <span className="text-base font-bold text-slate-700">
                  {sponsorLogo ? "Change Logo" : "Upload Logo"}
                </span>
                <Input id="logo-upload" type="file" accept="image/*" onChange={onLogoUpload} className="hidden" />
              </Label>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <Label htmlFor="primary-color" className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Primary Color
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="primary-color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-14 w-20 cursor-pointer rounded-2xl border-2 border-slate-200 p-1 shadow-inner"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-14 flex-1 rounded-2xl border-2 border-slate-200 px-4 text-base font-mono shadow-inner focus:border-primary/40 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="secondary-color" className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Secondary Color
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="secondary-color"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-14 w-20 cursor-pointer rounded-2xl border-2 border-slate-200 p-1 shadow-inner"
                />
                <Input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-14 flex-1 rounded-2xl border-2 border-slate-200 px-4 text-base font-mono shadow-inner focus:border-primary/40 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="text-color" className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Text Color
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="text-color"
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-14 w-20 cursor-pointer rounded-2xl border-2 border-slate-200 p-1 shadow-inner"
                />
                <Input
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-14 flex-1 rounded-2xl border-2 border-slate-200 px-4 text-base font-mono shadow-inner focus:border-primary/40 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border-2 border-slate-200 bg-slate-50/70 p-8 shadow-inner">
            <div className="mb-6 text-sm font-bold uppercase tracking-[0.15em] text-slate-500 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Live Preview
            </div>
            <div className="relative overflow-hidden rounded-3xl border-2 border-red-950 shadow-2xl">
              <div 
                className="relative rounded-[22px] py-6 px-8"
                style={{
                  background: `linear-gradient(to bottom, ${primaryColor}, ${secondaryColor})`,
                }}
              >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
                
                <div className="relative flex items-center justify-between">
                  <div className="group relative flex items-center gap-6">
                    <div className="relative flex shrink-0 items-center justify-center rounded-2xl py-4 px-8 shadow-2xl backdrop-blur-xl bg-white/70 border-2 border-white/80">
                      {sponsorLogo ? (
                        <Image
                          src={sponsorLogo}
                          alt={sponsorName}
                          width={120}
                          height={60}
                          className="relative h-16 w-auto max-w-[180px] object-contain"
                        />
                      ) : (
                        <div className="h-16 w-36 flex items-center justify-center text-slate-400 text-sm font-semibold">No logo</div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] font-semibold" style={{ color: `${textColor}CC` }}>Presented by</p>
                      <p className="text-2xl font-bold leading-tight drop-shadow-sm" style={{ color: textColor }}>{sponsorName || 'Sponsor Name'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-full border-2 border-white/70 bg-white/70 backdrop-blur-xl px-5 py-2.5 shadow-xl">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-bold text-emerald-700">Judging in Progress</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-6 border-t-2 border-slate-100">
            <Button
              onClick={onSave}
              disabled={saving}
              className="h-14 rounded-2xl bg-gradient-to-b from-primary to-[#3d0000] px-10 text-base font-bold text-white shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <Save className="mr-2 h-5 w-5" />
              {saving ? 'Saving...' : 'Save Sponsor'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}
