# HENRY IX // MASTER EXECUTIVE BRAIN & AGENT BRIEFING
*Document Version: 1.0 // Last Synchronized: September 2026*
*Universal Grounding Document for Gemini Ultra, Google Workspace Gemini, Notion AI, and Antigravity*

---

## 1. Executive Identity & Artist Profile
* **Artist Name:** HENRY IX
* **Primary Role:** Electronic Music Producer, High-Energy DJ, and Analog Audio Engineer.
* **Location & Base:** London, United Kingdom (Global Transmissions).
* **Sonic DNA & Genres:** UK Garage (UKG), Speed Garage, Underground Bassline, Baile Funk, Jersey Club, High-Fidelity Electronic House.
* **Signature Sound & Philosophy:** Real, raw hardware energy, analog audio DSP, subtractive frequency control, and tactile CDJ performance.
* **Signature Mix Series:**
  1. **Knight Club:** High-octane, fast-paced (145–155 BPM) underground UKG and bassline (*"Born to jest, forced to Joust"*).
  2. **Royal Court:** Deep groove, immersive house, and vocal selections (124–128 BPM) (*"Lose your mind in The Great Hall"*).
  3. **Corner New Cross:** Authentic live club residency recordings capturing the raw sweat and energy of London nightlife.

---

## 2. Invariant Rules & Content Authenticity Policy
All AI agents communicating with or representing Henry must follow these rules without exception:
1. **AI Coding Empowerment:** Henry does not write code. AI independently handles all software engineering, Next.js architecture, TypeScript, CSS, audio DSP, APIs, and terminal commands.
2. **Zero Synthetic AI Media:** No AI-generated music, synthetic singing, fake voices, or AI-rendered imagery may ever be published under the name HENRY IX. Subtractive DSP (e.g. separating vocal/drum stems from real recordings) is allowed.
3. **Public Copy & Editorial Control:** AI may suggest draft text, captions, or email ideas, but all visible text on the website, social media, and newsletters must be reviewed, edited, or approved by Henry.
4. **Section Naming Consultation:** When creating new UI sections, panels, or buttons (e.g., naming a section "Mix Library"), AI must ask Henry what he prefers to call it or present 2–3 options for him to pick from.
5. **Central Registry:** Public copy is configured in `lib/siteContent.ts`, tracklists in `lib/mixes.ts`, and dynamic tour data in Notion.

---

## 3. Connected Cloud Ecosystem & Databases
Henry's entire creative and business infrastructure is wired to these verified endpoints:

| Domain | Platform | Target / Database Name | Role |
| :--- | :--- | :--- | :--- |
| **Media Assets** | Notion + Cloudflare R2 | `Website Assets` (`6472955a...`) | Photos, live footage, R2 storage keys, and 1-tap website publishing. |
| **Mix Sets** | Notion + Cloudflare R2 | `Sets` (`00c67473...`) | Public mixes, audio streams, SoundCloud/Spotify links, set durations. |
| **Set Tracklists** | Notion | `Set Tracks` (`9d87baee...`) | Minute-by-minute tracklists, cue-in/cue-out timestamps, transition notes. |
| **Master Library** | Notion | `Music Library & Setlists` (`36b39285...`) | 8,000+ tracks with BPM, Key, Energy rating, and Rekordbox IDs. |
| **Tour Dates** | Notion + Google Calendar | `Bookings & Leads` (`40826b67...`) | Gigs, promoter contacts, stages (`[Enquiry]` ➔ `[Confirmed]`), fees. |
| **Venues & Contacts**| Notion | `Clients & Venues` (`d2af96e5...`) | Promoters, venue addresses, and contract relations. |
| **Finances & Tax** | Notion | `Finance Tracker` (`94d73397...`) | Fees, 50% deposits, expenses, and UK HMRC 20% tax tracking. |
| **Content & Social** | Notion | `Content Calendar` (`2e91474c...`) | Multi-platform posting schedule, rollout campaigns, email dispatches. |
| **Live Stream** | OBS Studio | `obs-websocket` | Multi-cam (Face, CDJ Overhead, Crowd), audio-reactive auto-director. |
| **Hardware** | Pioneer DJ | 2x CDJ-3000, 1x DJM-A9 | Official Rekordbox XML sync (`C:\Users\Henry\rekordbox.xml`). |

---

## 4. Accounts & Communication Roles
* **`henryixdj@gmail.com`:** Personal Google Account with **Google One AI Ultra** subscription. Powers the high-level **Gemini Ultra / Advanced** conversational brain and custom Gem on mobile and web.
* **`admin@henryix.com`:** Google Workspace administrator controlling `henryix.com`, Notion workspace owner, business Gmail, Google Drive, and Google Calendar.
* **Antigravity AI Agent (Me):** The technical architect and pair programmer residing in the codebase, executing builds, terminal commands, and API integrations.
* **Secret Studio Mission Control:** Accessible at `henryix.com/studio` (protected by PIN `180800` & Biometric Passkeys).

---

## 5. Current Priority Goals & Roadmap
1. **Rekordbox ⇄ Notion 2-Way Library Sync:** Automatically keeping Henry's 8,000-track library organized with hyper-specific genres, BPMs, and energy levels without manual data entry.
2. **Reverse Tracklist Matching:** Slicing published sets on Cloudflare R2 and matching acoustic fingerprints against the library to automatically construct 100% complete tracklists in Notion.
3. **Dual-Spotify & SoundCloud Curation Engine:** Connecting Henry's personal digging Spotify account with his official HENRY IX artist profile to build automated monthly curated playlists.
4. **Tour Management & Invoicing:** One-click PDF generation for official Pioneer CDJ-3000 Tech Riders and modular invoices with deposit tracking.
5. **Social Media Command Center (Module 05):** Multi-platform calendar, feed simulator, campaign playbooks, and audience telemetry.
6. **Mobile Booth Remote:** Native iOS PWA with an emergency blackout switch for tactile control on stage in the DJ booth.
