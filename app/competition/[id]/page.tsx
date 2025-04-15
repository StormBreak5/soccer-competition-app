"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Calendar, CheckCircle, Trash2, Trophy, Users } from "lucide-react"
import { format } from "date-fns"
import { useLanguage } from "@/lib/i18n/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"

export default function CompetitionPage({ params }) {
  const router = useRouter()
  const { t } = useLanguage()
  const [competition, setCompetition] = useState(null)
  const [scores, setScores] = useState({})
  const [selectedTeam, setSelectedTeam] = useState(null)

  useEffect(() => {
    const competitions = JSON.parse(localStorage.getItem("competitions") || "[]")
    const comp = competitions.find((c) => c.id === params.id)
    if (comp) {
      setCompetition(comp)
    } else {
      router.push("/")
    }
  }, [params.id, router])

  if (!competition) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  const handleScoreChange = (matchId, team, value) => {
    setScores({
      ...scores,
      [matchId]: {
        ...(scores[matchId] || {}),
        [team]: value === "" ? null : Number.parseInt(value, 10),
      },
    })
  }

  const saveMatchResult = (match) => {
    const matchScores = scores[match.id] || {}
    const score1 = matchScores.team1 !== undefined ? matchScores.team1 : match.score1
    const score2 = matchScores.team2 !== undefined ? matchScores.team2 : match.score2

    if (score1 === null || score2 === null) return

    const updatedMatch = {
      ...match,
      score1,
      score2,
      played: true,
      date: new Date().toISOString(),
    }

    const updatedMatches = competition.matches.map((m) => (m.id === match.id ? updatedMatch : m))

    const updatedCompetition = {
      ...competition,
      matches: updatedMatches,
    }

    setCompetition(updatedCompetition)

    const competitions = JSON.parse(localStorage.getItem("competitions") || "[]")
    const updatedCompetitions = competitions.map((c) => (c.id === competition.id ? updatedCompetition : c))
    localStorage.setItem("competitions", JSON.stringify(updatedCompetitions))

    const newScores = { ...scores }
    delete newScores[match.id]
    setScores(newScores)
  }

  const completeCompetition = () => {
    const updatedCompetition = {
      ...competition,
      status: "completed",
    }

    setCompetition(updatedCompetition)

    const competitions = JSON.parse(localStorage.getItem("competitions") || "[]")
    const updatedCompetitions = competitions.map((c) => (c.id === competition.id ? updatedCompetition : c))
    localStorage.setItem("competitions", JSON.stringify(updatedCompetitions))
  }

  const deleteCompetition = () => {
    const competitions = JSON.parse(localStorage.getItem("competitions") || "[]")
    const updatedCompetitions = competitions.filter((c) => c.id !== competition.id)
    localStorage.setItem("competitions", JSON.stringify(updatedCompetitions))

    router.push("/")
  }

  const standings = competition.teams.map((team) => {
    const teamMatches = competition.matches.filter(
      (match) => (match.team1Id === team.id || match.team2Id === team.id) && match.played,
    )

    let wins = 0
    let draws = 0
    let losses = 0
    let goalsFor = 0
    let goalsAgainst = 0

    teamMatches.forEach((match) => {
      const isTeam1 = match.team1Id === team.id
      const teamScore = isTeam1 ? match.score1 : match.score2
      const opponentScore = isTeam1 ? match.score2 : match.score1

      goalsFor += teamScore
      goalsAgainst += opponentScore

      if (teamScore > opponentScore) wins++
      else if (teamScore === opponentScore) draws++
      else losses++
    })

    return {
      team,
      played: teamMatches.length,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst,
      points: wins * 3 + draws,
    }
  })

  standings.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points
    if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference
    return b.goalsFor - a.goalsFor
  })

  const upcomingMatches = competition.matches.filter((match) => !match.played)
  const completedMatches = competition.matches.filter((match) => match.played)

  const getTeamById = (id) => competition.teams.find((team) => team.id === id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <Button variant="ghost" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>
        <div className="flex gap-2">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{competition.name}</h1>
          <p className="text-muted-foreground">
            {t("createdOn")} {format(new Date(competition.createdAt), "PPP")}
          </p>
        </div>
        <div className="flex gap-2">
          {competition.status === "active" && (
            <Button variant="outline" onClick={completeCompetition}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {t("complete")}
            </Button>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("delete")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("deleteCompetition")}</DialogTitle>
                <DialogDescription>{t("deleteConfirmation")}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => document.querySelector("dialog")?.close()}>
                  {t("cancel")}
                </Button>
                <Button variant="destructive" onClick={deleteCompetition}>
                  {t("delete")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="standings">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="standings">
            <Trophy className="mr-2 h-4 w-4" />
            {t("standings")}
          </TabsTrigger>
          <TabsTrigger value="teams">
            <Users className="mr-2 h-4 w-4" />
            {t("teams")}
          </TabsTrigger>
          <TabsTrigger value="matches">
            <Calendar className="mr-2 h-4 w-4" />
            {t("matches")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standings">
          <Card>
            <CardHeader>
              <CardTitle>{t("standings")}</CardTitle>
              <CardDescription>{t("currentRankings")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">{t("pos")}</th>
                      <th className="text-left py-2">{t("team")}</th>
                      <th className="text-center py-2">{t("p")}</th>
                      <th className="text-center py-2">{t("w")}</th>
                      <th className="text-center py-2">{t("d")}</th>
                      <th className="text-center py-2">{t("l")}</th>
                      <th className="text-center py-2">{t("gf")}</th>
                      <th className="text-center py-2">{t("ga")}</th>
                      <th className="text-center py-2">{t("gd")}</th>
                      <th className="text-center py-2">{t("pts")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((standing, index) => (
                      <tr key={standing.team.id} className="border-b">
                        <td className="py-2">{index + 1}</td>
                        <td className="py-2">{standing.team.name}</td>
                        <td className="text-center py-2">{standing.played}</td>
                        <td className="text-center py-2">{standing.wins}</td>
                        <td className="text-center py-2">{standing.draws}</td>
                        <td className="text-center py-2">{standing.losses}</td>
                        <td className="text-center py-2">{standing.goalsFor}</td>
                        <td className="text-center py-2">{standing.goalsAgainst}</td>
                        <td className="text-center py-2">{standing.goalDifference}</td>
                        <td className="text-center py-2 font-bold">{standing.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>{t("teams")}</CardTitle>
              <CardDescription>
                {competition.teams.length} {t("teams")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {competition.teams.map((team) => {
                  const teamPlayers = team.players || []
                  return (
                    <Collapsible key={team.id} className="border rounded-lg">
                      <CollapsibleTrigger className="flex justify-between items-center w-full p-4 hover:bg-muted/50 rounded-t-lg">
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          <span className="font-medium">{team.name}</span>
                        </div>
                        <Badge variant="outline">
                          {teamPlayers.length} {t("players")}
                        </Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 pt-0 border-t">
                        {teamPlayers.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-2">{t("noPlayers")}</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {teamPlayers.map((player) => (
                              <div key={player.id} className="bg-muted/30 rounded p-2 text-sm">
                                {player.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches">
          <div className="space-y-6">
            {upcomingMatches.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("upcomingMatches")}</CardTitle>
                  <CardDescription>{t("matchesYetToPlay")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingMatches.map((match) => {
                      const team1 = getTeamById(match.team1Id)
                      const team2 = getTeamById(match.team2Id)
                      return (
                        <div key={match.id} className="border rounded-lg p-4">
                          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-2 flex-1 justify-end text-center md:text-right">
                              <span className="font-medium">{team1.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                className="w-16 text-center"
                                value={
                                  scores[match.id]?.team1 !== undefined
                                    ? scores[match.id].team1
                                    : match.score1 !== null
                                      ? match.score1
                                      : ""
                                }
                                onChange={(e) => handleScoreChange(match.id, "team1", e.target.value)}
                              />
                              <span className="text-muted-foreground">{t("vs")}</span>
                              <Input
                                type="number"
                                min="0"
                                className="w-16 text-center"
                                value={
                                  scores[match.id]?.team2 !== undefined
                                    ? scores[match.id].team2
                                    : match.score2 !== null
                                      ? match.score2
                                      : ""
                                }
                                onChange={(e) => handleScoreChange(match.id, "team2", e.target.value)}
                              />
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                              <span className="font-medium">{team2.name}</span>
                            </div>
                          </div>
                          <div className="flex justify-center mt-4">
                            <Button
                              onClick={() => saveMatchResult(match)}
                              disabled={
                                (scores[match.id]?.team1 === undefined || scores[match.id]?.team1 === null) &&
                                (scores[match.id]?.team2 === undefined || scores[match.id]?.team2 === null)
                              }
                            >
                              {t("saveResult")}
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {completedMatches.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("completedMatches")}</CardTitle>
                  <CardDescription>{t("matchResults")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {completedMatches.map((match) => {
                      const team1 = getTeamById(match.team1Id)
                      const team2 = getTeamById(match.team2Id)
                      return (
                        <div key={match.id} className="border rounded-lg p-4">
                          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-2 flex-1 justify-end text-center md:text-right">
                              <span className="font-medium">{team1.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">{match.score1}</span>
                              <span className="text-muted-foreground">-</span>
                              <span className="font-bold text-lg">{match.score2}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                              <span className="font-medium">{team2.name}</span>
                            </div>
                          </div>
                          <div className="flex justify-center mt-2">
                            <span className="text-sm text-muted-foreground">
                              {t("playedOn")} {format(new Date(match.date), "PPP")}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
