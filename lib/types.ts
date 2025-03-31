export interface Player {
    id: string;
    name: string;
}

export interface Team {
    id: string;
    name: string;
    players: Player[];
}

export interface Match {
    id: string;
    team1Id: string;
    team2Id: string;
    score1: number|null;
    score2: number|null;
    played: boolean;
    date: string|null;
}

export interface Competition {
    id: string;
    name: string;
    createdAt: string;
    status: "active" | "completed";
    teams: Team[];
    matches: Match[];
    players: Player[];
}