import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecognitionReaction {
  employeeId: string;
  userName: string;
  emoji: string;
  label: string;
  timestamp: string;
}

export interface RecognitionComment {
  id: string;
  author: string;
  employeeId: string;
  text: string;
  time: string;
  timestamp: string;
}

export interface RecognitionViewDetail {
  employeeId: string;
  userName: string;
  timestamp: string;
}

export interface RecognitionPost {
  id: string;
  type: 'birthday' | 'anniversary';
  employeeName: string;
  title: string;
  message: string;
  layoutType: string;
  subLayout: string;
  bannerImage: string | null;
  category: string;
  isPinned: boolean;
  needsAcknowledgement: boolean;
  expiresIn: string;
  publishType: 'now' | 'later';
  scheduleDate: string;
  scheduleTime: string;
  audience: 'all' | 'departments';
  selectedAudienceDepts: string[];
  notifyByEmail: boolean;
  // Birthday specific
  birthdayDate?: string;
  // Anniversary specific
  joiningDate?: string;
  yearsOfService?: number | '';
  milestone?: string;
  // Published info
  publishedBy: string;
  publishedAt: string;
  status: 'published' | 'scheduled';
  // Engagement analytics
  likes: number;
  likedBy: string[];
  reactions: RecognitionReaction[];
  comments: RecognitionComment[];
  views: number;
  viewDetails: RecognitionViewDetail[];
}

interface RecognitionPostState {
  posts: RecognitionPost[];
  addPost: (post: Omit<RecognitionPost, 'id' | 'publishedAt' | 'likes' | 'likedBy' | 'reactions' | 'comments' | 'views' | 'viewDetails'>) => void;
  removePost: (id: string) => void;
  toggleLike: (id: string, employeeId: string) => void;
  addReaction: (id: string, employeeId: string, userName: string, emoji: string, label: string) => void;
  addComment: (id: string, author: string, employeeId: string, text: string) => void;
  trackView: (id: string, employeeId: string, userName: string) => void;
}

export const useRecognitionPostStore = create<RecognitionPostState>()(
  persist(
    (set) => ({
      posts: [],
      addPost: (post) =>
        set((state) => ({
          posts: [
            {
              ...post,
              id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              publishedAt: new Date().toISOString(),
              likes: 0,
              likedBy: [],
              reactions: [],
              comments: [],
              views: 0,
              viewDetails: [],
            },
            ...state.posts,
          ],
        })),
      removePost: (id) =>
        set((state) => ({ posts: state.posts.filter((p) => p.id !== id) })),
      toggleLike: (id, employeeId) =>
        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id !== id) return p;
            const likedBy = p.likedBy || [];
            const liked = likedBy.includes(employeeId);
            return {
              ...p,
              likes: liked ? (p.likes || 1) - 1 : (p.likes || 0) + 1,
              likedBy: liked
                ? likedBy.filter((eid) => eid !== employeeId)
                : [...likedBy, employeeId],
            };
          }),
        })),
      addReaction: (id, employeeId, userName, emoji, label) =>
        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id !== id) return p;
            // Remove existing reaction from this user then add new one
            const filtered = (p.reactions || []).filter((r) => r.employeeId !== employeeId);
            return {
              ...p,
              reactions: [...filtered, { employeeId, userName, emoji, label, timestamp: new Date().toISOString() }],
            };
          }),
        })),
      addComment: (id, author, employeeId, text) =>
        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id !== id) return p;
            const newComment: RecognitionComment = {
              id: `cmt-${Date.now()}`,
              author,
              employeeId,
              text,
              time: 'Just now',
              timestamp: new Date().toISOString(),
            };
            return { ...p, comments: [...(p.comments || []), newComment] };
          }),
        })),
      trackView: (id, employeeId, userName) =>
        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id !== id) return p;
            const alreadyViewed = (p.viewDetails || []).some((v) => v.employeeId === employeeId);
            if (alreadyViewed) return p;
            return {
              ...p,
              views: (p.views || 0) + 1,
              viewDetails: [
                ...(p.viewDetails || []),
                { employeeId, userName, timestamp: new Date().toISOString() },
              ],
            };
          }),
        })),
    }),
    { name: 'recognition-posts' }
  )
);
