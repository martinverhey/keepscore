export interface IMatchInfo {
	created_at?: string;
	key: string;
	owner?: {
		id: string;
		username: string;
	}
	points?: {
		team1: number;
		team2: number;
	}
	scores?: {
		team1: string; // TODO: shouldn't this be a number?
		team2: string;
	}
	teams?: any[];
}
