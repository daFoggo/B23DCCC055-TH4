export enum Status {
	PENDING = 'PENDING',
	APPROVED = 'APPROVED',
	REJECTED = 'REJECTED',
}

export const ROLES: ClubRegistration.Role[] = [
	{ id: 1, name: 'Design' },
	{ id: 2, name: 'Development' },
	{ id: 3, name: 'Media' },
	{ id: 4, name: 'Marketing' },
	{ id: 5, name: 'Event' },
];
