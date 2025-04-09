import { Status } from '@/services/ClubRegistration/constants';
import { useEffect, useState } from 'react';

export default () => {
	const [candidates, setCandidates] = useState<ClubRegistration.CandidateRegistration[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [selectedCandidate, setSelectedCandidate] = useState<ClubRegistration.CandidateRegistration | null>(null);

    // search filter
	const [searchText, setSearchText] = useState<string>('');
	const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL');
	const [roleFilter, setRoleFilter] = useState<number | 'ALL'>('ALL');
	const [filteredCandidates, setFilteredCandidates] = useState<ClubRegistration.CandidateRegistration[]>([]);

    // modal state
	const [isApproveModalVisible, setIsApproveModalVisible] = useState<boolean>(false);
	const [isRejectModalVisible, setIsRejectModalVisible] = useState<boolean>(false);
	const [isViewModalVisible, setIsViewModalVisible] = useState<boolean>(false);

	// load from local storage
	const loadCandidates = () => {
		setLoading(true);
		try {
			const storedCandidates = localStorage.getItem('candidates');
			if (storedCandidates) {
				setCandidates(JSON.parse(storedCandidates));
			}
		} catch (error) {
			console.error('Error loading candidates:', error);
		} finally {
			setLoading(false);
		}
	};

	// Add candidaate
	const addCandidate = (
		candidate: Omit<ClubRegistration.CandidateRegistration, 'id' | 'status' | 'note' | 'createdAt'>,
	) => {
		setLoading(true);
		try {
			const newCandidate: ClubRegistration.CandidateRegistration = {
				...candidate,
				id: Date.now(),
				status: Status.PENDING,
				note: '',
				createdAt: new Date(),
			};

			const updatedCandidates = [...candidates, newCandidate];
			localStorage.setItem('candidates', JSON.stringify(updatedCandidates));
			setCandidates(updatedCandidates);
			return true;
		} catch (error) {
			console.error('Error adding candidate:', error);
			return false;
		} finally {
			setLoading(false);
		}
	};

	// update candidate status
	const updateCandidateStatus = (id: number, status: Status, note = '', adminName = 'Admin') => {
		setLoading(true);
		try {
			const updatedCandidates = candidates.map((candidate) => {
				if (candidate.id === id) {
					const timestamp = new Date();
					const actionLog = `${adminName} đã ${
						status === Status.APPROVED ? 'Approved' : 'Rejected'
					} vào lúc ${timestamp.getHours()}h${timestamp.getMinutes()} ${timestamp.getDate()}/${
						timestamp.getMonth() + 1
					}/${timestamp.getFullYear()}${note ? ` với lý do: ${note}` : ''}`;

					return {
						...candidate,
						status,
						note: note || candidate.note,
						actionLog: candidate.actionLog ? `${candidate.actionLog}\n${actionLog}` : actionLog,
					};
				}
				return candidate;
			});

			localStorage.setItem('candidates', JSON.stringify(updatedCandidates));
			setCandidates(updatedCandidates);
			return true;
		} catch (error) {
			console.error('Error updating candidate status:', error);
			return false;
		} finally {
			setLoading(false);
		}
	};

	// apply filter
	const applyFilters = () => {
		let filtered = [...candidates];

		if (searchText) {
			const lowerCaseSearch = searchText.toLowerCase();
			filtered = filtered.filter(
				(candidate) =>
					candidate.fullName.toLowerCase().includes(lowerCaseSearch) ||
					candidate.email.toLowerCase().includes(lowerCaseSearch),
			);
		}

		if (statusFilter !== 'ALL') {
			filtered = filtered.filter((candidate) => candidate.status === statusFilter);
		}

		if (roleFilter !== 'ALL') {
			filtered = filtered.filter((candidate) => candidate.role.id === roleFilter);
		}

		setFilteredCandidates(filtered);
	};

	// approve candidaate
	const handleApprove = () => {
		if (selectedCandidate) {
			const success = updateCandidateStatus(selectedCandidate.id, Status.APPROVED);
			if (success) {
				setIsApproveModalVisible(false);
				return true;
			}
		}
		return false;
	};

	// reject candidaate
	const handleReject = (note: string) => {
		if (selectedCandidate) {
			const success = updateCandidateStatus(selectedCandidate.id, Status.REJECTED, note);
			if (success) {
				setIsRejectModalVisible(false);
				return true;
			}
		}
		return false;
	};

	const getApprovedMembers = () => {
		return candidates.filter(
			(candidate) => candidate.status === Status.APPROVED
		)
	}

	// apply filter if any filter change
	useEffect(() => {
		applyFilters();
	}, [candidates, searchText, statusFilter, roleFilter]);

	// Initial data
	useEffect(() => {
		loadCandidates();
	}, []);

	return {
		candidates,
		loading,
		selectedCandidate,
		filteredCandidates,
		searchText,
		statusFilter,
		roleFilter,
		isApproveModalVisible,
		isRejectModalVisible,
		isViewModalVisible,

		setCandidates,
		setSelectedCandidate,
		setSearchText,
		setStatusFilter,
		setRoleFilter,
		setIsApproveModalVisible,
		setIsRejectModalVisible,
		setIsViewModalVisible,

		loadCandidates,
		addCandidate,
		updateCandidateStatus,
		applyFilters,
		handleApprove,
		handleReject,
		getApprovedMembers
	};
};
