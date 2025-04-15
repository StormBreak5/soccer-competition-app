"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, HelpCircle, Shuffle, UserPlus, Users } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { useLanguage } from "@/lib/i18n/language-context"
import { LanguageSelector } from "@/components/language-selector"
import DragDropPlayer from "@/components/drag-drop-player"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function CreateCompetitionPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [step, setStep] = useState(1)
  const [competition, setCompetition] = useState({
    id: uuidv4(),
    name: "",
    createdAt: new Date().toISOString(),
    status: "active",
    teams: [],
    matches: [],
    players: [],
  })
  const [playerName, setPlayerName] = useState("")
  const [teamName, setTeamName] = useState("")
  const [teamAssignmentMethod, setTeamAssignmentMethod] = useState("manual")
  const [maxPlayersPerTeam, setMaxPlayersPerTeam] = useState(0) 

  const addPlayer = () => {
    if (playerName.trim()) {
      setCompetition({
        ...competition,
        players: [...competition.players, { id: uuidv4(), name: playerName.trim() }],
      })
      setPlayerName("")
    }
  }

  const addTeam = () => {
    if (teamName.trim()) {
      setCompetition({
        ...competition,
        teams: [...competition.teams, { id: uuidv4(), name: teamName.trim(), players: [] }],
      })
      setTeamName("")
    }
  }

  const handleTeamsChange = (updatedTeams) => {
    setCompetition({
      ...competition,
      teams: updatedTeams,
    })
  }

  const assignPlayersToTeams = () => {
    let teamsWithPlayers = [...competition.teams]

    if (teamAssignmentMethod === "random") {
      const shuffledPlayers = [...competition.players].sort(() => Math.random() - 0.5)
      teamsWithPlayers = competition.teams.map((team) => ({
        ...team,
        players: [],
      }))

      if (maxPlayersPerTeam > 0) {
        const totalPlayers = shuffledPlayers.length
        const totalTeams = teamsWithPlayers.length

        const remainingPlayers = [...shuffledPlayers]

        teamsWithPlayers.forEach((team) => {
          const playersToAssign = Math.min(maxPlayersPerTeam, Math.ceil(totalPlayers / totalTeams))
          team.players = remainingPlayers.splice(0, playersToAssign)
        })
      } else {
        shuffledPlayers.forEach((player, index) => {
          const teamIndex = index % teamsWithPlayers.length
          teamsWithPlayers[teamIndex].players.push(player)
        })
      }
    }

    const matches = []
    const teams = teamsWithPlayers

    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matches.push({
          id: uuidv4(),
          team1Id: teams[i].id,
          team2Id: teams[j].id,
          score1: null,
          score2: null,
          played: false,
          date: null,
        })
      }
    }

    const finalCompetition = {
      ...competition,
      teams: teamsWithPlayers,
      matches,
    }

    const competitions = JSON.parse(localStorage.getItem("competitions") || "[]")
    localStorage.setItem("competitions", JSON.stringify([...competitions, finalCompetition]))

    router.push(`/competition/${competition.id}`)
  }

  const removePlayer = (playerId) => {
    setCompetition({
      ...competition,
      players: competition.players.filter((player) => player.id !== playerId),
    })
  }

  const removeTeam = (teamId) => {
    setCompetition({
      ...competition,
      teams: competition.teams.filter((team) => team.id !== teamId),
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <Button variant="ghost" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>
        <div className="flex gap-2">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("createNewCompetition")}</CardTitle>
          <CardDescription>{t("setupSteps")}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="competition-name">{t("competitionName")}</Label>
                <Input
                  id="competition-name"
                  placeholder={t("enterCompetitionName")}
                  value={competition.name}
                  onChange={(e) => setCompetition({ ...competition, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("addPlayers")}</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder={t("playerName")}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                    className="flex-1"
                  />
                  <Button onClick={addPlayer} type="button" className="w-full sm:w-auto">
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t("add")}
                  </Button>
                </div>
              </div>

              {competition.players.length > 0 && (
                <div className="border rounded-md p-3">
                  <h3 className="font-medium mb-2">
                    {t("players")} ({competition.players.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {competition.players.map((player) => (
                      <div key={player.id} className="flex justify-between items-center bg-muted/50 rounded p-2">
                        <span>{player.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePlayer(player.id)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Tabs defaultValue="manual" onValueChange={setTeamAssignmentMethod}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">{t("manualTeams")}</TabsTrigger>
                  <TabsTrigger value="random">{t("randomTeams")}</TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("createTeams")}</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder={t("teamName")}
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addTeam()}
                        className="flex-1"
                      />
                      <Button onClick={addTeam} type="button" className="w-full sm:w-auto">
                        <Users className="mr-2 h-4 w-4" />
                        {t("add")}
                      </Button>
                    </div>
                  </div>

                  {competition.teams.length > 0 && (
                    <>
                      <div className="border rounded-md p-3">
                        <h3 className="font-medium mb-2">
                          {t("teams")} ({competition.teams.length})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {competition.teams.map((team) => (
                            <div key={team.id} className="flex justify-between items-center bg-muted/50 rounded p-2">
                              <span>{team.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTeam(team.id)}
                                className="h-6 w-6 p-0"
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Drag and Drop Player Assignment */}
                      <DragDropPlayer
                        players={competition.players}
                        teams={competition.teams}
                        onTeamsChange={handleTeamsChange}
                      />
                    </>
                  )}
                </TabsContent>

                <TabsContent value="random" className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("teamsForRandomAssignment")}</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder={t("teamName")}
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addTeam()}
                        className="flex-1"
                      />
                      <Button onClick={addTeam} type="button" className="w-full sm:w-auto">
                        <Users className="mr-2 h-4 w-4" />
                        {t("add")}
                      </Button>
                    </div>
                  </div>

                  {competition.teams.length > 0 && (
                    <div className="border rounded-md p-3">
                      <h3 className="font-medium mb-2">
                        {t("teamsForRandomAssignment")} ({competition.teams.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {competition.teams.map((team) => (
                          <div key={team.id} className="flex justify-between items-center bg-muted/50 rounded p-2">
                            <span>{team.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTeam(team.id)}
                              className="h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="max-players">{t("maxPlayersPerTeam")}</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("playersPerTeamInfo")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="max-players"
                      type="number"
                      min="0"
                      value={maxPlayersPerTeam}
                      onChange={(e) => setMaxPlayersPerTeam(Number.parseInt(e.target.value) || 0)}
                      placeholder="0 = no limit"
                    />
                    <p className="text-xs text-muted-foreground">
                      {maxPlayersPerTeam === 0
                        ? t("distributeEvenlyInfo")
                        : `${t("maxPlayersPerTeam")}: ${maxPlayersPerTeam}`}
                    </p>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <Shuffle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">{t("randomAssignmentInfo")}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="w-full sm:w-auto">
              {t("previous")}
            </Button>
          )}
          {step < 2 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!competition.name || competition.players.length < 2}
              className={`${step > 1 ? "" : "ml-auto"} w-full sm:w-auto`}
            >
              {t("next")}
            </Button>
          ) : (
            <Button
              onClick={assignPlayersToTeams}
              disabled={
                competition.teams.length < 2 ||
                (teamAssignmentMethod === "manual" && competition.teams.some((team) => team.players.length === 0))
              }
              className="w-full sm:w-auto"
            >
              {t("createCompetition")}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
