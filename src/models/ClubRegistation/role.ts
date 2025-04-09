import { ROLES } from '@/services/ClubRegistration/constants';
import { useEffect, useState } from 'react';

export default () => {
	const [roles, setRoles] = useState<ClubRegistration.Role[]>(ROLES);
	const [loading, setLoading] = useState<boolean>(false);

	const loadRoles = () => {
		setLoading(true);
		try {
			setRoles(ROLES);
			setLoading(false);
		} catch (error) {
			console.error('Error loading roles:', error);
			setLoading(false);
		}
	};

	const getRoleName = (roleId: number): string => {
		const role = roles.find((r) => r.id === roleId);
		return role ? role.name : 'Unknown';
	};

	useEffect(() => {
		loadRoles();
	}, []);

	return {
		roles,
		loading,
		getRoleName,
		loadRoles,
	};
};
