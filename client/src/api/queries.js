import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client.js';
import { useAuthStore } from '../store/authStore.js';

// Query Keys
export const queryKeys = {
  profile: ['profile'],
  history: ['profile', 'history'],
  internships: ['internships'],
  matches: ['matches'],
  skillGaps: (id) => ['skill-gaps', id],
  resumeVersions: ['resume-versions'],
  applications: ['applications'],
  notifications: ['notifications'],
  analytics: ['analytics'],
  health: ['health']
};

// Profile & Resume
export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      const res = await api.get('/profile');
      return res.data;
    }
  });
}

export function useResumeHistory() {
  return useQuery({
    queryKey: queryKeys.history,
    queryFn: async () => {
      const res = await api.get('/profile/history');
      return res.data;
    }
  });
}

export function useUploadResume() {
  const queryClient = useQueryClient();
  const setProfile = useAuthStore((s) => s.setProfile);

  return useMutation({
    mutationFn: async (formData) => {
      const res = await api.post('/profile/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.profile) {
        setProfile(data.profile);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      queryClient.invalidateQueries({ queryKey: queryKeys.history });
      queryClient.invalidateQueries({ queryKey: queryKeys.matches });
      queryClient.invalidateQueries({ queryKey: queryKeys.resumeVersions });
      queryClient.invalidateQueries({ queryKey: queryKeys.internships });
    }
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  const setProfile = useAuthStore((s) => s.setProfile);

  return useMutation({
    mutationFn: async (preferences) => {
      const res = await api.patch('/profile/preferences', preferences);
      return res.data;
    },
    onSuccess: (data) => {
      setProfile(data);
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    }
  });
}

// Internships
export function useInternships() {
  return useQuery({
    queryKey: queryKeys.internships,
    queryFn: async () => {
      const res = await api.get('/internships');
      return res.data;
    }
  });
}

export function useSyncInternships() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post('/internships/sync');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.internships });
      queryClient.invalidateQueries({ queryKey: queryKeys.matches });
    }
  });
}

// Matches
export function useMatches() {
  return useQuery({
    queryKey: queryKeys.matches,
    queryFn: async () => {
      const res = await api.get('/matches');
      return res.data;
    }
  });
}

export function useGenerateMatches() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post('/matches/generate');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches });
      queryClient.invalidateQueries({ queryKey: queryKeys.internships });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    }
  });
}

// Skill Gaps
export function useSkillGaps(internshipId) {
  return useQuery({
    queryKey: queryKeys.skillGaps(internshipId),
    queryFn: async () => {
      if (!internshipId) return null;
      const res = await api.get(`/skill-gaps/${internshipId}`);
      return res.data;
    },
    enabled: Boolean(internshipId)
  });
}

// Application Materials & Resume Versions
export function useResumeVersions() {
  return useQuery({
    queryKey: queryKeys.resumeVersions,
    queryFn: async () => {
      const res = await api.get('/application-materials');
      return res.data;
    }
  });
}

export function useGenerateResumeVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (internshipId) => {
      const res = await api.post('/application-materials/generate', { internshipId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumeVersions });
      queryClient.invalidateQueries({ queryKey: queryKeys.applications });
    }
  });
}

export function useApproveResumeVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await api.post('/application-materials/approve', { id });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumeVersions });
    }
  });
}

// Applications & Tracker
export function useApplications() {
  return useQuery({
    queryKey: queryKeys.applications,
    queryFn: async () => {
      const res = await api.get('/applications');
      return res.data;
    }
  });
}

export function useCreateOrProgressApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ internshipId, status, notes, nextActionDate }) => {
      const res = await api.post('/applications', { internshipId, status, notes, nextActionDate });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    }
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, notes, nextActionDate }) => {
      const res = await api.patch(`/applications/${id}`, { status, notes, nextActionDate });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    }
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/applications/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    }
  });
}

// Notifications
export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    }
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await api.patch(`/notifications/${id}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    }
  });
}

// Analytics
export function useAnalytics() {
  return useQuery({
    queryKey: queryKeys.analytics,
    queryFn: async () => {
      const res = await api.get('/analytics');
      return res.data;
    }
  });
}

// Health & System
export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: async () => {
      const res = await api.get('/health');
      return res.data;
    }
  });
}
