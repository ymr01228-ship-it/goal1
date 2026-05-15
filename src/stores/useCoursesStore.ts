import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Course, YouTubePlaylist } from '@/types/course.types';
import { generateId } from '@/lib/utils';

interface CoursesStore {
  courses: Course[];
  playlists: YouTubePlaylist[];
  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'lastStudied' | 'studyHours' | 'completedLessons'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  incrementLesson: (id: string) => void;
  decrementLesson: (id: string) => void;
  addPlaylist: (playlist: Omit<YouTubePlaylist, 'id' | 'createdAt'>) => void;
  toggleVideoComplete: (playlistId: string, videoId: string) => void;
  deletePlaylist: (id: string) => void;
  getOverallProgress: () => number;
}

export const useCoursesStore = create<CoursesStore>()(
  persist(
    (set, get) => ({
      courses: [],
      playlists: [],

      addCourse: (courseData) => {
        const course: Course = {
          ...courseData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          lastStudied: new Date().toISOString(),
          studyHours: 0,
          completedLessons: 0,
        };
        set((state) => ({ courses: [...state.courses, course] }));
      },

      updateCourse: (id, updates) => {
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      deleteCourse: (id) => {
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== id),
        }));
      },

      incrementLesson: (id) => {
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === id && c.completedLessons < c.totalLessons
              ? { ...c, completedLessons: c.completedLessons + 1, lastStudied: new Date().toISOString() }
              : c
          ),
        }));
      },

      decrementLesson: (id) => {
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === id && c.completedLessons > 0
              ? { ...c, completedLessons: c.completedLessons - 1 }
              : c
          ),
        }));
      },

      addPlaylist: (playlistData) => {
        const playlist: YouTubePlaylist = {
          ...playlistData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ playlists: [...state.playlists, playlist] }));
      },

      toggleVideoComplete: (playlistId, videoId) => {
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === playlistId
              ? {
                  ...p,
                  videos: p.videos.map((v) =>
                    v.id === videoId ? { ...v, isCompleted: !v.isCompleted } : v
                  ),
                }
              : p
          ),
        }));
      },

      deletePlaylist: (id) => {
        set((state) => ({
          playlists: state.playlists.filter((p) => p.id !== id),
        }));
      },

      getOverallProgress: () => {
        const { courses } = get();
        if (courses.length === 0) return 0;
        const totalLessons = courses.reduce((sum, c) => sum + c.totalLessons, 0);
        const completedLessons = courses.reduce((sum, c) => sum + c.completedLessons, 0);
        return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      },
    }),
    {
      name: 'focusos-courses',
    }
  )
);
