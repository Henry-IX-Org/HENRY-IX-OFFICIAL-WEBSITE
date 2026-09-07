'use client';

import React, { useState } from 'react';
import { Grid, Plus, RefreshCw, MoveUp, MoveDown, X } from 'lucide-react';
import { useStudioStore, InstagramPost } from '@/store/studioStore';

interface GridWorkbenchViewProps {
  onNavigate?: (view: string) => void;
}

export default function GridWorkbenchView({ onNavigate }: GridWorkbenchViewProps) {
  const instagramGrid = useStudioStore((s) => s.instagramGrid);
  const reorderInstagramGrid = useStudioStore((s) => s.reorderInstagramGrid);
  const addInstagramPost = useStudioStore((s) => s.addInstagramPost);
  const fetchContentPosts = useStudioStore((s) => s.fetchContentPosts);
  const isLoadingSocial = useStudioStore((s) => s.isLoadingSocial);
  const addToast = useStudioStore((s) => s.addToast);

  // Stage Post Form State
  const [showStageModal, setShowStageModal] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostType, setNewPostType] = useState<'Gig Flyer' | 'Video Clip' | 'Track Reveal' | 'Artwork'>('Video Clip');
  const [newPostDate, setNewPostDate] = useState(new Date().toISOString().slice(0, 10));
  const [newPostCampaign, setNewPostCampaign] = useState('');
  const [newPostNotes, setNewPostNotes] = useState('');

  const handleStagePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim()) {
      addToast({
        title: 'TITLE REQUIRED',
        message: 'Please enter a title or caption for the post.',
        type: 'warning',
      });
      return;
    }

    setIsSubmittingPost(true);
    try {
      const res = await fetch('/api/studio/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPostTitle.trim(),
          platform: 'Instagram',
          contentType: newPostType,
          publishDate: newPostDate,
          status: 'Scheduled',
          campaign: newPostCampaign.trim() || undefined,
          notes: newPostNotes.trim() || undefined,
        }),
      });

      const data: any = await res.json();
      if (res.ok && data.success) {
        addInstagramPost({
          title: newPostTitle.trim(),
          date: newPostDate,
          type: newPostType,
          scheduled: true,
          image: 'https://assets.henryix.com/Mixes/Knight%20Club/Mix%20Artwork/Session%204.png',
          caption: newPostNotes || newPostCampaign || '',
        });

        addToast({
          title: 'POST SAVED TO NOTION',
          message: `Staged "${newPostTitle}" in Notion Content Calendar.`,
          type: 'success',
        });

        setNewPostTitle('');
        setNewPostCampaign('');
        setNewPostNotes('');
        setShowStageModal(false);
        fetchContentPosts();
      } else {
        throw new Error(data.error || 'Failed to save to Notion');
      }
    } catch (err: any) {
      console.error('Error staging post:', err);
      addToast({
        title: 'STAGE ERROR',
        message: err.message || 'Could not reach Notion Content Calendar.',
        type: 'error',
      });
    } finally {
      setIsSubmittingPost(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-xs text-white uppercase tracking-wider">
              Instagram Profile 3x3 Feed Aesthetic
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-400 font-mono">
              NOTION: {instagramGrid.length} POSTS
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Plan visual contrast across drops. Move posts up/down to balance aesthetic flow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchContentPosts()}
            disabled={isLoadingSocial}
            className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Refresh from Notion Content Calendar"
          >
            <RefreshCw size={12} className={isLoadingSocial ? 'animate-spin text-[#E53558]' : ''} />
            <span>Sync Notion</span>
          </button>

          <button
            onClick={() => setShowStageModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#E53558] hover:bg-[#f43f5e] text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus size={13} />
            <span>+ Stage Post to Notion</span>
          </button>
        </div>
      </div>

      {/* Stage Post Modal */}
      {showStageModal && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#14151a] p-6 space-y-4 max-w-2xl mx-auto shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E53558]" />
              <span className="font-semibold text-xs text-white uppercase tracking-wider">
                Stage New Post // Notion Content Calendar
              </span>
            </div>
            <button
              onClick={() => setShowStageModal(false)}
              className="text-zinc-400 hover:text-white p-1 rounded hover:bg-white/[0.06]"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleStagePost} className="space-y-4 text-xs font-sans">
            <div>
              <label className="text-zinc-400 block mb-1 uppercase text-[10px] font-mono">Post Title / Hook:</label>
              <input
                type="text"
                required
                placeholder="e.g. Knight Club Vol 4 Lineup Reveal Video"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                className="w-full rounded-lg bg-[#0c0d10] border border-white/10 p-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E53558]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-zinc-400 block mb-1 uppercase text-[10px] font-mono">Content Type:</label>
                <select
                  value={newPostType}
                  onChange={(e) => setNewPostType(e.target.value as any)}
                  className="w-full rounded-lg bg-[#0c0d10] border border-white/10 p-2 text-white focus:outline-none focus:border-[#E53558]"
                >
                  <option value="Video Clip">Video Clip (Reel / Teaser)</option>
                  <option value="Gig Flyer">Gig Flyer (Lineup Poster)</option>
                  <option value="Track Reveal">Track Reveal (Dubplate Preview)</option>
                  <option value="Artwork">Artwork (Mix Cover)</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 uppercase text-[10px] font-mono">Publish Date:</label>
                <input
                  type="date"
                  value={newPostDate}
                  onChange={(e) => setNewPostDate(e.target.value)}
                  className="w-full rounded-lg bg-[#0c0d10] border border-white/10 p-2 text-white focus:outline-none focus:border-[#E53558]"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 uppercase text-[10px] font-mono">Campaign:</label>
                <input
                  type="text"
                  placeholder="e.g. Knight Club Vol 4"
                  value={newPostCampaign}
                  onChange={(e) => setNewPostCampaign(e.target.value)}
                  className="w-full rounded-lg bg-[#0c0d10] border border-white/10 p-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E53558]"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-400 block mb-1 uppercase text-[10px] font-mono">
                Caption / Notes / Hashtags:
              </label>
              <textarea
                rows={2}
                placeholder="Caption copy, hashtags, or drop details..."
                value={newPostNotes}
                onChange={(e) => setNewPostNotes(e.target.value)}
                className="w-full rounded-lg bg-[#0c0d10] border border-white/10 p-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E53558]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setShowStageModal(false)}
                className="px-4 py-2 rounded-lg bg-white/[0.06] text-zinc-300 hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingPost}
                className="px-5 py-2 rounded-lg bg-[#E53558] text-white font-medium text-xs hover:bg-[#f43f5e] transition-colors disabled:opacity-50 shadow-sm"
              >
                {isSubmittingPost ? 'Creating in Notion...' : 'Save to Notion Calendar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3x3 Profile Grid */}
      <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
        {instagramGrid.length === 0 ? (
          <div className="col-span-3 rounded-xl border border-dashed border-white/10 p-8 text-center bg-[#14151a]/40 space-y-3 shadow-sm">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#14151a] border border-white/10 flex items-center justify-center text-zinc-500">
              <Grid size={18} />
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs uppercase">No Staged Posts in Notion Calendar</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                Your Notion Content Calendar is currently clear. Stage a post to map out your upcoming 3x3 Instagram
                aesthetic.
              </p>
            </div>
            <button
              onClick={() => setShowStageModal(true)}
              className="px-4 py-2 rounded-lg bg-[#E53558] hover:bg-[#f43f5e] text-white text-xs font-medium inline-flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus size={13} />
              <span>+ Stage First Post to Notion</span>
            </button>
          </div>
        ) : (
          instagramGrid.map((post, idx) => (
            <div
              key={post.id}
              className="aspect-square rounded-xl bg-[#14151a] border border-white/[0.08] hover:border-white/20 p-3.5 flex flex-col justify-between group relative overflow-hidden transition-all shadow-sm"
            >
              <div className="flex justify-between items-start text-[10px] text-zinc-400 z-10">
                <span className="px-2 py-0.5 rounded-full bg-[#0c0d10] border border-white/10 text-white font-mono font-medium">
                  #{idx + 1}
                </span>
                <span className={post.scheduled ? 'text-emerald-400 font-mono' : 'text-zinc-500 font-mono'}>
                  {post.scheduled ? 'STAGED' : 'DRAFT'}
                </span>
              </div>

              <div className="text-center my-auto p-1">
                <div className="text-xs font-medium text-white line-clamp-2">{post.title}</div>
                <div className="text-[10px] text-zinc-400 mt-1">{post.type}</div>
              </div>

              {/* Hover Reorder Controls */}
              <div className="flex justify-between items-center border-t border-white/[0.06] pt-1.5 z-10">
                <button
                  disabled={idx === 0}
                  onClick={() => reorderInstagramGrid(idx, idx - 1)}
                  className="p-1 hover:text-white disabled:opacity-20 rounded hover:bg-white/[0.06]"
                  title="Move earlier"
                >
                  <MoveUp size={13} />
                </button>
                <span className="text-[10px] text-zinc-500 font-mono">{post.date}</span>
                <button
                  disabled={idx === instagramGrid.length - 1}
                  onClick={() => reorderInstagramGrid(idx, idx + 1)}
                  className="p-1 hover:text-white disabled:opacity-20 rounded hover:bg-white/[0.06]"
                  title="Move later"
                >
                  <MoveDown size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
