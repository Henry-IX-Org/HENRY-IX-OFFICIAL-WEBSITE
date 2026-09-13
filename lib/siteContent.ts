/**
 * ============================================================================
 * HENRY IX DJ WEBSITE — CENTRAL COPY & CONTENT CONFIGURATION
 * ============================================================================
 * 
 * Edit any text in this file to update the copy across the website instantly!
 * All taglines, descriptions, headers, button labels, and section text are 
 * organized below so you can write in your authentic voice.
 * ============================================================================
 */

export const siteContent = {
  // --------------------------------------------------------------------------
  // 1. BRANDING & HERO SECTION
  // --------------------------------------------------------------------------
  hero: {
    title: "HENRY IX",
    subtitle: "ELECTRONIC MUSIC PRODUCER & DJ",
    tagline: "HYBRID LIVE SETS // ANALOG AUDIO DSP // ELECTRONIC MUSIC CULTIVATION",
    location: "LONDON, UK",
    statusBadge: "LIVE STREAM READY",
    deckStatus: "DECK 01 ONLINE",
  },

  // --------------------------------------------------------------------------
  // 2. MAIN NAVIGATION & HEADER
  // --------------------------------------------------------------------------
  navigation: {
    brandName: "HENRY IX",
    tabs: [
      { id: "mixes", label: "MIXES", href: "/mixes" },
      { id: "gallery", label: "GALLERY", href: "/gallery" },
      { id: "live", label: "LIVE", href: "/live" },
      { id: "events", label: "EVENTS", href: "/events" },
      { id: "contact", label: "CONTACT", href: "/contact" },
    ],
  },

  // --------------------------------------------------------------------------
  // 3. MIX ARCHIVE PAGE & SOUNDCLOUD STREAMING
  // --------------------------------------------------------------------------
  mixArchive: {
    sectionTitle: "01 / MIX ARCHIVE",
    description: "Explore live recordings, radio broadcasts, and curated DJ sets. Streaming in high-fidelity 3-band audio.",
    browserHeader: "DECK PLAYLIST BROWSER",
    nowPlayingPrefix: "NOW PLAYING",
    emptyState: "NO MIXES LOADED IN DECK",
    filters: {
      all: "ALL SETS",
      club: "CLUB SETS",
      radio: "RADIO SHOWS",
      live: "LIVE RECORDINGS",
    },
  },

  // --------------------------------------------------------------------------
  // 4. LIVE STREAMING & BROADCAST PAGE
  // --------------------------------------------------------------------------
  live: {
    title: "LIVE STREAM",
    badge: "LIVE BROADCAST",
    offlineMessage: "STUDIO OFFLINE — STANDBY FOR NEXT BROADCAST",
    onlineMessage: "LIVE STREAM ACTIVE — HIGH FIDELITY STEREO FEED",
    chatTitle: "LIVE CHAT",
    chatPlaceholder: "ENTER MESSAGE...",
    sendButton: "SEND",
  },

  // --------------------------------------------------------------------------
  // 5. EVENTS & TICKET BOOKING PAGE
  // --------------------------------------------------------------------------
  events: {
    sectionTitle: "UPCOMING DATES & SHOWS",
    description: "Catch upcoming live sets, club nights, and international tour dates.",
    ticketButton: "SECURE TICKET",
    soldOutButton: "CAPACITY REACHED",
    locationLabel: "VENUE / LOCATION",
    dateLabel: "DATE & TIME",
  },

  // --------------------------------------------------------------------------
  // 6. GALLERY & MEDIA PAGE
  // --------------------------------------------------------------------------
  gallery: {
    title: "GALLERY / VISUAL ARCHIVE",
    description: "Behind the scenes, live performances, analog equipment, and stage production snapshots.",
    filterAll: "ALL MEDIA",
    filterLive: "LIVE SHOWS",
    filterStudio: "STUDIO / GEAR",
  },

  // --------------------------------------------------------------------------
  // 7. CONTACT & BOOKING CONSOLE
  // --------------------------------------------------------------------------
  contact: {
    title: "BOOKINGS & INQUIRIES",
    description: "For gig bookings, press inquiries, management, or production collaborations.",
    form: {
      namePlaceholder: "YOUR NAME",
      emailPlaceholder: "YOUR EMAIL ADDRESS",
      subjectPlaceholder: "INQUIRY SUBJECT (e.g. Booking / Remix / Collaboration)",
      messagePlaceholder: "ENTER MESSAGE OR EVENT DETAILS...",
      submitButton: "TRANSMIT INQUIRY",
      successMessage: "INQUIRY TRANSMITTED SUCCESSFULLY. WILL RESPOND SHORTLY.",
    },
    directContacts: {
      managementEmail: "management@henryix.com",
      bookingEmail: "booking@henryix.com",
      location: "London, UK",
    },
  },

  // --------------------------------------------------------------------------
  // 8. INNER CIRCLE / NEWSLETTER SUBSCRIPTION FORM
  // --------------------------------------------------------------------------
  newsletter: {
    title: "THE INNER CIRCLE",
    description: "Subscribe for exclusive mix downloads, secret gig announcements, and unreleased tracks.",
    placeholder: "ENTER EMAIL ADDRESS...",
    buttonText: "JOIN",
    successMessage: "CONFIRMED — YOU'RE ON THE LIST.",
  },

  // --------------------------------------------------------------------------
  // 9. EMAIL PREFERENCES & ALERTS
  // --------------------------------------------------------------------------
  preferences: {
    badge: "EMAIL PREFERENCES",
    title: "CUSTOMISE YOUR ALERTS",
    description: "Choose which updates you want to receive from HENRY IX. Changes apply immediately.",
    emailLabel: "YOUR EMAIL ADDRESS",
    emailPlaceholder: "name@example.com",
    categories: [
      {
        id: "live_broadcasts",
        topicId: "dec54150-820f-48cc-9eb9-4794292aa12a",
        label: "Live Streams",
        description: "Alerts when HENRY IX goes live with direct streaming links.",
        badge: "REAL-TIME",
      },
      {
        id: "mix_releases",
        topicId: "af6698e1-6563-4a55-9854-55bc19bff560",
        label: "New Mixes",
        description: "New DJ sets, SoundCloud releases, and audio drops.",
        badge: "MONTHLY",
      },
      {
        id: "events_tickets",
        topicId: "e8ac67a8-2a02-4963-b453-f3ea343d531d",
        label: "Gigs & Tickets",
        description: "London and international tour dates, set times, and presale access.",
        badge: "PRIORITY",
      },
      {
        id: "inner_circle",
        topicId: "98394367-88e0-4f79-b6b4-a00549410ed1",
        label: "VIP / Inner Circle",
        description: "Exclusive unreleased edits, guestlist invites, and direct announcements.",
        badge: "EXCLUSIVE",
      },
    ],
    saveButton: "SAVE PREFERENCES",
    savingButton: "SAVING...",
    savedMessage: "Preferences saved successfully.",
    unsubscribeAllButton: "UNSUBSCRIBE FROM ALL",
    backToHome: "RETURN TO HOME",
  },

  // --------------------------------------------------------------------------
  // 10. UNSUBSCRIBE
  // --------------------------------------------------------------------------
  unsubscribe: {
    badge: "UNSUBSCRIBE",
    title: "UNSUBSCRIBE FROM HENRY IX",
    description: "Confirm your email address below to stop receiving all updates.",
    emailLabel: "EMAIL ADDRESS",
    emailPlaceholder: "name@example.com",
    confirmButton: "CONFIRM UNSUBSCRIBE",
    processingButton: "UNSUBSCRIBING...",
    successTitle: "YOU HAVE BEEN UNSUBSCRIBED",
    successMessage: "You will no longer receive emails from HENRY IX.",
    undoButton: "UNDO & RE-SUBSCRIBE",
    preferencesLinkText: "Prefer fewer emails? Manage your preferences instead",
  },

  // --------------------------------------------------------------------------
  // 11. FOOTER & LEGAL
  // --------------------------------------------------------------------------
  footer: {
    copyright: "© HENRY IX. ALL RIGHTS RESERVED.",
    tagline: "HIGH FIDELITY AUDIO DSP & PRO HARDWARE AESTHETICS.",
    links: [
      { label: "PRIVACY POLICY", href: "/privacy" },
      { label: "TERMS", href: "/privacy" },
      { label: "PREFERENCES", href: "/preferences" },
      { label: "UNSUBSCRIBE", href: "/unsubscribe" },
    ],
  },
};

export default siteContent;
