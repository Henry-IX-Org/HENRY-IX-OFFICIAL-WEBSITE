import { InstagramPost } from '@/store/studioStore';

export type { InstagramPost };

export interface SocialSubViewProps {
  onNavigate?: (view: string) => void;
}
