"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trophy } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/i18n/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  const [competitions, setCompetitions] = useState([])
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    const storedCompetitions = localStorage.getItem("competitions")
    if (storedCompetitions) {
      setCompetitions(JSON.parse(storedCompetitions))
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">{t("appName")}</h1>
        <div className="flex flex-wrap gap-2">
          <LanguageSelector />
          <ThemeToggle />
          <Button onClick={() => router.push("/create-competition")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span className="whitespace-nowrap">{t("newCompetition")}</span>
          </Button>
        </div>
      </div>

      {competitions.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("noCompetitions")}</h2>
          <p className="text-muted-foreground mb-4">{t("createFirstCompetition")}</p>
          <Button onClick={() => router.push("/create-competition")}>{t("createCompetition")}</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitions.map((competition) => (
            <Link href={`/competition/${competition.id}`} key={competition.id} className="block">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold mb-2">{competition.name}</h2>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {competition.teams.length} {t("teams")}
                  </span>
                  <span>{new Date(competition.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      competition.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                    }`}
                  >
                    {competition.status === "active" ? t("active") : t("completed")}
                  </span>
                  <Button variant="outline" size="sm">
                    {t("viewDetails")}
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
