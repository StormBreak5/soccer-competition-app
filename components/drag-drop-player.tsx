"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserIcon, Users, SplitSquareHorizontal } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function DragDropPlayer({ players, teams, onTeamsChange }) {
  const { t } = useLanguage()
  const [availablePlayers, setAvailablePlayers] = useState([])
  const [teamPlayers, setTeamPlayers] = useState({})

  useEffect(() => {
    const initialTeamPlayers = {}
    teams.forEach((team) => {
      initialTeamPlayers[team.id] = team.players || []
    })

    const assignedPlayerIds = Object.values(initialTeamPlayers)
      .flat()
      .map((player) => player.id)

    const unassignedPlayers = players.filter((player) => !assignedPlayerIds.includes(player.id))

    setAvailablePlayers(unassignedPlayers)
    setTeamPlayers(initialTeamPlayers)
  }, [players, teams])

  const handleDragEnd = (result) => {
    const { source, destination } = result

    if (!destination) return

    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    if (source.droppableId === "available") {
      const player = availablePlayers[source.index]
      const newAvailablePlayers = [...availablePlayers]
      newAvailablePlayers.splice(source.index, 1)

      const newTeamPlayers = { ...teamPlayers }
      newTeamPlayers[destination.droppableId] = [...newTeamPlayers[destination.droppableId], player]

      setAvailablePlayers(newAvailablePlayers)
      setTeamPlayers(newTeamPlayers)
      updateTeams(newTeamPlayers)
    }
    else if (destination.droppableId === "available") {
      const sourceTeamPlayers = [...teamPlayers[source.droppableId]]
      const player = sourceTeamPlayers[source.index]
      sourceTeamPlayers.splice(source.index, 1)

      const newTeamPlayers = {
        ...teamPlayers,
        [source.droppableId]: sourceTeamPlayers,
      }

      setAvailablePlayers([...availablePlayers, player])
      setTeamPlayers(newTeamPlayers)
      updateTeams(newTeamPlayers)
    }
    else if (source.droppableId !== destination.droppableId) {
      const sourceTeamPlayers = [...teamPlayers[source.droppableId]]
      const destTeamPlayers = [...teamPlayers[destination.droppableId]]

      const player = sourceTeamPlayers[source.index]
      sourceTeamPlayers.splice(source.index, 1)
      destTeamPlayers.splice(destination.index, 0, player)

      const newTeamPlayers = {
        ...teamPlayers,
        [source.droppableId]: sourceTeamPlayers,
        [destination.droppableId]: destTeamPlayers,
      }

      setTeamPlayers(newTeamPlayers)
      updateTeams(newTeamPlayers)
    }
    else {
      const teamPlayersList = [...teamPlayers[source.droppableId]]
      const [removed] = teamPlayersList.splice(source.index, 1)
      teamPlayersList.splice(destination.index, 0, removed)

      const newTeamPlayers = {
        ...teamPlayers,
        [source.droppableId]: teamPlayersList,
      }

      setTeamPlayers(newTeamPlayers)
      updateTeams(newTeamPlayers)
    }
  }

  const updateTeams = (newTeamPlayers) => {
    const updatedTeams = teams.map((team) => ({
      ...team,
      players: newTeamPlayers[team.id] || [],
    }))

    onTeamsChange(updatedTeams)
  }

  const distributePlayersEvenly = () => {
    const allPlayers = [...availablePlayers, ...Object.values(teamPlayers).flat()]

    const shuffledPlayers = [...allPlayers].sort(() => Math.random() - 0.5)

    const newTeamPlayers = {}
    teams.forEach((team) => {
      newTeamPlayers[team.id] = []
    })

    shuffledPlayers.forEach((player, index) => {
      const teamIndex = index % teams.length
      const teamId = teams[teamIndex].id
      newTeamPlayers[teamId].push(player)
    })

    setTeamPlayers(newTeamPlayers)
    setAvailablePlayers([])
    updateTeams(newTeamPlayers)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg font-medium">{t("assignPlayers")}</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={distributePlayersEvenly} variant="outline" className="w-full sm:w-auto">
                <SplitSquareHorizontal className="mr-2 h-4 w-4" />
                {t("distributeEvenly")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("distributeEvenlyInfo")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <p className="text-sm text-muted-foreground">{t("dragPlayersInfo")}</p>

      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Available Players */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-md flex items-center">
              <UserIcon className="mr-2 h-4 w-4" />
              {t("availablePlayers")} ({availablePlayers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Droppable droppableId="available" direction="horizontal">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex flex-wrap gap-2 min-h-[80px] p-3 rounded-md ${
                    snapshot.isDraggingOver ? "bg-muted/80" : "bg-muted/30"
                  }`}
                >
                  {availablePlayers.length === 0 && (
                    <div className="flex items-center justify-center w-full h-16 text-muted-foreground text-sm">
                      {t("dragHere")}
                    </div>
                  )}

                  {availablePlayers.map((player, index) => (
                    <Draggable key={player.id} draggableId={player.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`px-3 py-2 rounded-md text-sm font-medium break-all ${
                            snapshot.isDragging
                              ? "bg-primary text-primary-foreground shadow-lg"
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {player.name}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </CardContent>
        </Card>

        {/* Teams */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-md flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    {team.name}
                  </div>
                  <span className="text-sm font-normal text-muted-foreground">
                    {teamPlayers[team.id]?.length || 0} {t("players")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Droppable droppableId={team.id} direction="horizontal">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex flex-wrap gap-2 min-h-[80px] p-3 rounded-md ${
                        snapshot.isDraggingOver ? "bg-muted/80" : "bg-muted/30"
                      }`}
                    >
                      {(!teamPlayers[team.id] || teamPlayers[team.id].length === 0) && (
                        <div className="flex items-center justify-center w-full h-16 text-muted-foreground text-sm">
                          {t("dragHere")}
                        </div>
                      )}

                      {teamPlayers[team.id]?.map((player, index) => (
                        <Draggable key={player.id} draggableId={player.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`px-3 py-2 rounded-md text-sm font-medium break-all ${
                                snapshot.isDragging
                                  ? "bg-primary text-primary-foreground shadow-lg"
                                  : "bg-accent text-accent-foreground"
                              }`}
                            >
                              {player.name}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
