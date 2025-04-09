declare namespace ClubRegistration {
	interface Role {
		id: number;
		name: string;
	}

	interface CandidateRegistration {
		id: number;
		fullName: string;
		email: string;
		role: Role;
		reasonToApply: string;
		status: Status;
		note: string;
		createdAt?: Date;
		actionLog?: string;
	}
}
