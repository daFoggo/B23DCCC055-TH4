import { useState, useEffect } from 'react';
import { Status, ROLES } from '@/services/ClubRegistration/constants';
import type { ClubRegistration } from '@/services/ClubRegistration/types';

interface RoleStatistics {
  role: string;
  total: number;
  approved: number;
  rejected: number;
  pending: number;
}

interface TeamStatistics {
  team: string;
  count: number;
  percentage: number;
}

export default () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [roleStats, setRoleStats] = useState<RoleStatistics[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStatistics[]>([]);
  const [totalApplications, setTotalApplications] = useState<number>(0);
  const [approvedRate, setApprovedRate] = useState<number>(0);
  const [rejectedRate, setRejectedRate] = useState<number>(0);
  const [pendingRate, setPendingRate] = useState<number>(0);

  // Lấy tên vai trò từ ID
  const getRoleName = (roleId: any) => {
    // Kiểm tra nếu roleId là object
    if (typeof roleId === 'object' && roleId !== null && roleId.id) {
      roleId = roleId.id;
    }
    
    const role = ROLES.find(r => r.id === roleId);
    return role ? role.name : 'Không xác định';
  };

  const getStatistics = () => {
    setLoading(true);
    try {
      // Lấy danh sách ứng viên
      const candidates = JSON.parse(localStorage.getItem('candidates') || '[]');
      
      // Lấy danh sách thành viên
      const members = JSON.parse(localStorage.getItem('members') || '[]');
      
      // Tính tổng số đơn và tỉ lệ
      const total = candidates.length;
      const approved = candidates.filter((c: any) => c.status === Status.APPROVED).length;
      const rejected = candidates.filter((c: any) => c.status === Status.REJECTED).length;
      const pending = candidates.filter((c: any) => c.status === Status.PENDING).length;
      
      setTotalApplications(total);
      setApprovedRate(total > 0 ? Math.round((approved / total) * 100) : 0);
      setRejectedRate(total > 0 ? Math.round((rejected / total) * 100) : 0);
      setPendingRate(total > 0 ? Math.round((pending / total) * 100) : 0);
      
      // Thống kê theo vai trò
      const roleCounts = new Map<string, { total: number, approved: number, rejected: number, pending: number }>();
      
      // Khởi tạo thống kê cho mỗi vai trò
      ROLES.forEach(role => {
        roleCounts.set(role.name, { total: 0, approved: 0, rejected: 0, pending: 0 });
      });
      
      // Đếm số lượng ứng viên theo vai trò và trạng thái
      candidates.forEach((candidate: any) => {
        const roleName = getRoleName(candidate.role);
        
        let stats = roleCounts.get(roleName);
        if (!stats) {
          stats = { total: 0, approved: 0, rejected: 0, pending: 0 };
          roleCounts.set(roleName, stats);
        }
        
        stats.total += 1;
        
        switch (candidate.status) {
          case Status.APPROVED:
            stats.approved += 1;
            break;
          case Status.REJECTED:
            stats.rejected += 1;
            break;
          case Status.PENDING:
            stats.pending += 1;
            break;
        }
      });
      
      // Chuyển đổi Map thành mảng để hiển thị
      const roleStatistics: RoleStatistics[] = [];
      roleCounts.forEach((stats, role) => {
        roleStatistics.push({
          role,
          total: stats.total,
          approved: stats.approved,
          rejected: stats.rejected,
          pending: stats.pending,
        });
      });
      
      setRoleStats(roleStatistics);
      
      // Thống kê theo nhóm
      const teamCounts = new Map<string, number>();
      teamCounts.set('Chưa phân nhóm', 0);
      
      // Tạo các nhóm từ vai trò
      ROLES.forEach(role => {
        teamCounts.set(`Team ${role.name}`, 0);
      });
      
      members.forEach((member: any) => {
        const team = member.team || `Team ${getRoleName(member.role)}`;
        teamCounts.set(team, (teamCounts.get(team) || 0) + 1);
      });
      
      const teamStatistics: TeamStatistics[] = [];
      teamCounts.forEach((count, team) => {
        teamStatistics.push({
          team,
          count,
          percentage: members.length > 0 ? Math.round((count / members.length) * 100) : 0,
        });
      });
      
      setTeamStats(teamStatistics);
      
      return {
        roleStats: roleStatistics,
        teamStats: teamStatistics,
        totalApplications: candidates.length,
        approvedRate: approved / candidates.length * 100,
        rejectedRate: rejected / candidates.length * 100,
        pendingRate: pending / candidates.length * 100,
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStatistics();
  }, []);

  return {
    loading,
    roleStats,
    teamStats,
    totalApplications,
    approvedRate,
    rejectedRate,
    pendingRate,
    getStatistics,
  };
}; 