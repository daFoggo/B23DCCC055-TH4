import { useState, useEffect } from 'react';
import { Status, ROLES } from '@/services/ClubRegistration/constants';
import type { ClubRegistration } from '@/services/ClubRegistration/types';

export interface Member extends ClubRegistration.CandidateRegistration {
  team?: string;
}

export default () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  // Lấy tên vai trò từ ID
  const getRoleName = (roleId: any) => {
    // Kiểm tra nếu roleId là object
    if (typeof roleId === 'object' && roleId !== null && roleId.id) {
      roleId = roleId.id;
    }
    
    const role = ROLES.find(r => r.id === roleId);
    return role ? role.name : 'Không xác định';
  };

  // Lấy danh sách thành viên từ localStorage
  const getMembers = () => {
    setLoading(true);
    try {
      // Lấy danh sách ứng viên đã được duyệt
      const candidates = JSON.parse(localStorage.getItem('candidates') || '[]');
      const approvedMembers = candidates.filter(
        (candidate: ClubRegistration.CandidateRegistration) => candidate.status === Status.APPROVED,
      );
      
      // Lấy danh sách thành viên đã được phân nhóm
      const storedMembers = JSON.parse(localStorage.getItem('members') || '[]');
      
      // Kết hợp dữ liệu
      const memberMap = new Map();
      
      // Thêm các thành viên đã có nhóm vào Map
      storedMembers.forEach((member: Member) => {
        memberMap.set(member.id, member);
      });
      
      // Thêm các ứng viên đã duyệt nhưng chưa có trong danh sách thành viên
      approvedMembers.forEach((candidate: ClubRegistration.CandidateRegistration) => {
        if (!memberMap.has(candidate.id)) {
          // Lấy tên vai trò
          const roleName = getRoleName(candidate.role);
          
          memberMap.set(candidate.id, { 
            ...candidate, 
            team: `Team ${roleName}` // Mặc định team theo vai trò
          });
        }
      });
      
      const combinedMembers = Array.from(memberMap.values());
      
      // Lưu lại danh sách thành viên vào localStorage
      localStorage.setItem('members', JSON.stringify(combinedMembers));
      
      setMembers(combinedMembers);
      setTotal(combinedMembers.length);
      
      return combinedMembers;
    } catch (error) {
      console.error('Error getting members:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật nhóm cho thành viên
  const updateMemberTeam = (id: number, team: string) => {
    setLoading(true);
    try {
      const updatedMembers = members.map((member) => {
        if (member.id === id) {
          return { ...member, team };
        }
        return member;
      });
      
      localStorage.setItem('members', JSON.stringify(updatedMembers));
      setMembers(updatedMembers);
      return true;
    } catch (error) {
      console.error('Error updating member team:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Export danh sách thành viên ra file XLSX
  const exportMembersToXLSX = async () => {
    try {
      const XLSX = await import('xlsx');
      
      const data = members.map((member) => {
        return {
          'Họ tên': member.fullName,
          'Email': member.email,
          'Nhóm': member.team || `Team ${getRoleName(member.role)}`,
          'Ngày tạo': new Date(member.createdAt).toLocaleString(),
        };
      });
      
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Thành viên');
      
      XLSX.writeFile(workbook, 'danh_sach_thanh_vien.xlsx');
      return true;
    } catch (error) {
      console.error('Error exporting members:', error);
      return false;
    }
  };

  useEffect(() => {
    getMembers();
  }, []);

  return {
    members,
    loading,
    page,
    setPage,
    limit,
    setLimit,
    total,
    getMembers,
    updateMemberTeam,
    exportMembersToXLSX,
    getRoleName,
  };
}; 