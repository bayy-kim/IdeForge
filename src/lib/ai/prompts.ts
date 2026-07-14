import type { ClarifyingAnswer, TechChoice } from "@/lib/types";

function getSystemBase(lang: string) {
  if (lang === "en") {
    return "You are an experienced software product technical consultant helping indie developers and students design applications. Always answer in clear, practical English, without unnecessary pleasantries.";
  }
  return "Kamu adalah konsultan teknis produk software berpengalaman yang membantu developer indie dan pelajar merancang aplikasi. Jawab selalu dalam Bahasa Indonesia yang jelas dan praktis, tanpa basa-basi.";
}

export function techRecommendationPrompt(ideaText: string, lang: string = "id") {
  const system = getSystemBase(lang);
  const prompt = lang === "en"
    ? `App idea from user:
"""${ideaText}"""

Recommend the MOST PRACTICAL tech stack for this idea — prioritize technologies that are easy to learn, free to start, and popular (many references/community). Do not pick exotic technologies unless absolutely necessary.

Provide: frontend, backend, database, list of extras (maximum 3, e.g. auth provider, hosting, AI API), and a brief reasoning (2-3 sentences) why this combination fits the idea.`
    : `Ide aplikasi dari user:
"""${ideaText}"""

Rekomendasikan tech stack yang PALING PRAKTIS untuk ide ini — utamakan yang gampang dipelajari, gratis untuk mulai, dan populer (banyak referensi/komunitas). Jangan pilih teknologi eksotis kecuali benar-benar dibutuhkan.

Berikan: frontend, backend, database, daftar extras (maksimal 3, contoh: auth provider, hosting, AI API), dan reasoning singkat (2-3 kalimat) kenapa kombinasi ini cocok untuk ide tersebut.`;

  return { system, prompt };
}

export function clarifyingQuestionsPrompt(ideaText: string, techChoice: TechChoice | null, lang: string = "id") {
  const system = getSystemBase(lang);
  const techLine = techChoice
    ? (lang === "en"
      ? `Tech stack used: ${techChoice.frontend}, ${techChoice.backend}, ${techChoice.database}.`
      : `Tech stack yang dipakai: ${techChoice.frontend}, ${techChoice.backend}, ${techChoice.database}.`)
    : "";
    
  const prompt = lang === "en"
    ? `App idea from user:
"""${ideaText}"""
${techLine}

Read the idea above carefully, then determine 3-5 clarifying questions that are the MOST IMPORTANT and MOST RELEVANT for this specific idea — so the PRD created later will be accurate. Do not use generic topics that are always the same for all ideas.

Consider what is genuinely unclear about this idea. For example, if it's an internal application for an organization/community, questions about monetization are likely not relevant — but it might be more important to ask about membership size or who will be the admin. If it's a commercial product, questions about target users, scale, and business model might be more relevant. Fully adapt to the context of the idea.

Make questions SPECIFIC to the idea — drill into details that would significantly affect architecture decisions. Don't ask surface-level questions. Ask things like: "How many concurrent users do you expect in the first month?", "Does this app need offline support?", "Do users need to upload files/images?" rather than generic questions.

For each question, determine:
- type "choice" if the answer is naturally a brief option (create 3-4 sensible "options" for this context, and set allowCustom to true just in case)
- type "text" if it needs a free-form/descriptive answer
- For choice questions: if the user should be able to pick MULTIPLE options (not just one), set multi to true. For example, "Which platforms do you want to support?" could have multi:true because users may select both Web and Mobile.
- required: true if this question MUST be answered before proceeding (information critical to app architecture), false if optional

id must be unique, brief, in snake_case, and reflect the question content (not a generic name like "question_1").

Only mark questions as required if their answer truly affects the app architecture. 1-2 required questions is usually enough.`
    : `Ide aplikasi dari user:
"""${ideaText}"""
${techLine}

Baca baik-baik ide di atas, lalu tentukan sendiri 3-5 pertanyaan klarifikasi yang PALING PENTING dan PALING RELEVAN untuk ide spesifik ini — supaya PRD yang dibuat nanti akurat. Jangan pakai daftar topik generik yang selalu sama untuk semua ide.

Pertimbangkan apa yang benar-benar belum jelas dari ide ini. Contoh: kalau ini aplikasi internal untuk organisasi/komunitas, pertanyaan soal monetisasi kemungkinan tidak relevan — tapi mungkin lebih penting nanya soal jumlah anggota atau siapa yang akan jadi admin. Kalau ini produk komersial, pertanyaan soal target user, skala, dan model bisnis mungkin lebih relevan. Sesuaikan sepenuhnya dengan konteks ide-nya, jangan dipaksakan ke kategori yang sama tiap kali.

Buat pertanyaan SPESIFIK untuk ide ini — gali detail yang akan signifikan mempengaruhi keputusan arsitektur. Jangan tanya pertanyaan permukaan. Tanyakan seperti: "Kira-kira berapa user yang akan pakai di bulan pertama?", "Aplikasi ini perlu mode offline?", "Apakah user perlu upload file/gambar?" — bukan pertanyaan generik.

Untuk tiap pertanyaan, tentukan sendiri:
- type "choice" kalau jawabannya wajar berupa pilihan singkat (buat 3-4 "options" yang masuk akal untuk konteks ide ini, dan set allowCustom true untuk jaga-jaga)
- type "text" kalau butuh jawaban bebas/deskriptif
- Untuk pertanyaan choice: jika user harus bisa memilih LEBIH DARI SATU opsi (bukan hanya satu), set multi ke true. Contoh: "Platform apa yang ingin didukung?" bisa multi:true karena user mungkin pilih Web dan Mobile sekaligus.
- required: true kalau pertanyaan ini WAJIB dijawab sebelum lanjut (informasi penting untuk arsitektur aplikasi), false kalau opsional/boleh dilewati

id harus unik, singkat, format snake_case, dan mencerminkan isi pertanyaan (bukan nama generik seperti "question_1").

Tandai pertanyaan sebagai required hanya jika jawabannya benar-benar mempengaruhi arsitektur aplikasi. Cukup 1-2 pertanyaan required saja.`;

  return { system, prompt };
}

export function structurePrompt(
  ideaText: string,
  techChoice: TechChoice | null,
  answers: ClarifyingAnswer[],
  lang: string = "id",
) {
  const system = getSystemBase(lang);
  const answersBlock = answers
    .filter((a) => !a.skipped)
    .map((a) => `- ${a.question}: ${a.answer}`)
    .join("\n");

  const prompt = lang === "en"
    ? `App idea:
"""${ideaText}"""

Tech stack: ${techChoice ? `${techChoice.frontend}, ${techChoice.backend}, ${techChoice.database}` : "not determined"}

Clarification answers from user:
${answersBlock || "(none)"}

Create the app feature structure as a list of main features grouped into development PHASES (use numbers 1, 2, or 3 — phase 1 = core features mandatory for MVP, phase 2 = important features that can follow, phase 3 = advanced/nice-to-have features).

For each main feature, include 2-5 concrete sub-features (not long explanations, just short feature names, e.g. "Login & Logout", not sentences).

Also create:
- appName: a catchy short name for this app (can be different from user description, make it more interesting)
- summary: 1-2 sentence summary of this app

Generate 5-8 main features in total, distributed reasonably across the 3 phases (phase 1 should have the most).`
    : `Ide aplikasi:
"""${ideaText}"""

Tech stack: ${techChoice ? `${techChoice.frontend}, ${techChoice.backend}, ${techChoice.database}` : "belum ditentukan"}

Jawaban klarifikasi dari user:
${answersBlock || "(tidak ada)"}

Buat struktur fitur aplikasi ini dalam bentuk daftar fitur utama yang dikelompokkan ke FASE pengembangan (gunakan angka 1, 2, atau 3 — fase 1 = fitur inti wajib untuk MVP, fase 2 = fitur penting tapi bisa menyusul, fase 3 = fitur lanjutan/nice-to-have).

Untuk setiap fitur utama, sertakan 2-5 sub-fitur konkret (bukan penjelasan panjang, cukup nama fitur singkat, contoh: "Login & Logout", bukan kalimat).

Buat juga:
- appName: nama singkat yang catchy untuk aplikasi ini (boleh beda dari deskripsi user, buat lebih menarik)
- summary: 1-2 kalimat ringkasan aplikasi ini

Hasilkan 5-8 fitur utama total, tersebar wajar di 3 fase (fase 1 paling banyak).`;

  return { system, prompt };
}

export function prdPrompt(
  ideaText: string,
  techChoice: TechChoice | null,
  answers: ClarifyingAnswer[],
  structure: { appName: string; summary: string; features: { name: string; phase: number; subFeatures: { name: string }[] }[] },
  lang: string = "id",
) {
  const system = getSystemBase(lang);
  const answersBlock = answers
    .filter((a) => !a.skipped)
    .map((a) => `- ${a.question}: ${a.answer}`)
    .join("\n");

  const featuresBlock = structure.features
    .map(
      (f) =>
        lang === "en"
          ? `- [Phase ${f.phase}] ${f.name}: ${f.subFeatures.map((s) => s.name).join(", ")}`
          : `- [Fase ${f.phase}] ${f.name}: ${f.subFeatures.map((s) => s.name).join(", ")}`
    )
    .join("\n");

  const prompt = lang === "en"
    ? `Build a comprehensive PRD (Product Requirement Document) in Markdown format for the following application.

App Name: ${structure.appName}
Summary: ${structure.summary}
Initial User Idea: "${ideaText}"
Tech Stack: ${techChoice ? `${techChoice.frontend} (frontend), ${techChoice.backend} (backend), ${techChoice.database} (database)` : "not determined"}

Clarification Answers:
${answersBlock || "(none)"}

Feature Structure:
${featuresBlock}

Write the PRD using the following Markdown structure (use ## headings):
## 1. Background & Goals
## 2. Target Audience
## 3. Scope of Features (per phase, summarized — do not repeat every sub-feature detail, just summarize each phase)
## 4. Main User Flows (short step-by-step user flows)
## 5. Non-Functional Requirements (performance, security, scalability — match the scale of the target audience)
## 6. Success Metrics

Write in a professional but concise language, focus on actionable items, no fillers.`
    : `Buatkan PRD (Product Requirement Document) lengkap dalam format Markdown untuk aplikasi berikut.

Nama aplikasi: ${structure.appName}
Ringkasan: ${structure.summary}
Ide awal user: "${ideaText}"
Tech stack: ${techChoice ? `${techChoice.frontend} (frontend), ${techChoice.backend} (backend), ${techChoice.database} (database)` : "belum ditentukan"}

Jawaban klarifikasi user:
${answersBlock || "(tidak ada)"}

Struktur fitur yang sudah disepakati:
${featuresBlock}

Tulis PRD dengan struktur Markdown berikut (pakai heading ##):
## 1. Latar Belakang & Tujuan
## 2. Target Pengguna
## 3. Lingkup Fitur (per fase, ringkas — jangan ulangi detail sub-fitur satu-satu, cukup ringkasan tiap fase)
## 4. Alur Pengguna Utama (user flow singkat, langkah demi langkah)
## 5. Kebutuhan Non-Fungsional (performa, keamanan, skalabilitas — sesuaikan dengan skala target user)
## 6. Metrik Keberhasilan

Tulis dengan bahasa profesional tapi ringkas, fokus ke hal yang actionable, bukan filler.`;

  return { system, prompt };
}

export function folderStructurePrompt(
  structure: { appName: string; summary: string; features: { name: string; phase: number; subFeatures: { name: string }[] }[] },
  techChoice: TechChoice | null,
  lang: string = "id",
) {
  const system = lang === "en"
    ? "You are a senior software architect. Generate a practical project folder structure as Markdown."
    : "Kamu adalah arsitek software senior. Buatlah struktur folder project yang praktis dalam format Markdown.";

  const featuresBlock = structure.features
    .map(
      (f) =>
        lang === "en"
          ? `- [Phase ${f.phase}] ${f.name}: ${f.subFeatures.map((s) => s.name).join(", ")}`
          : `- [Fase ${f.phase}] ${f.name}: ${f.subFeatures.map((s) => s.name).join(", ")}`
    )
    .join("\n");

  const prompt = lang === "en"
    ? `App: ${structure.appName}
Summary: ${structure.summary}
Tech Stack: ${techChoice ? `${techChoice.frontend}, ${techChoice.backend}, ${techChoice.database}` : "not determined"}
Features:
${featuresBlock}

Based on the app above, generate a practical and detailed PROJECT FOLDER STRUCTURE AND PROGRAM ARCHITECTURE in Markdown format with two sections:

## Program Architecture
Describe the overall architecture (e.g. monolithic, modular, microservices), main layers/modules, and how data flows between components. Mention the tech stack decisions. 2-3 paragraphs.

## Folder Structure
Generate a complete recommended folder/file tree for a production project. Use Markdown code block with tree-like indentation. Include folders for: configuration, source code (frontend + backend if separate), database/migrations, tests, documentation, and deployment. Be specific — include actual likely file names (e.g. "src/app/page.tsx", "src/lib/db/schema.ts") based on the tech stack. Around 30-50 lines of tree.

Write in clear English, focus on practicality for a real project.`
    : `Aplikasi: ${structure.appName}
Ringkasan: ${structure.summary}
Tech stack: ${techChoice ? `${techChoice.frontend}, ${techChoice.backend}, ${techChoice.database}` : "belum ditentukan"}
Fitur:
${featuresBlock}

Berdasarkan aplikasi di atas, buat STRUKTUR FOLDER PROJECT DAN ARSITEKTUR PROGRAM yang praktis dan detail dalam format Markdown dengan dua bagian:

## Arsitektur Program
Deskripsikan arsitektur keseluruhan (misal: monolitik, modular, microservices), layer/modul utama, dan bagaimana data mengalir antar komponen. Sebutkan keputusan tech stack. 2-3 paragraf.

## Struktur Folder
Generate struktur folder/file lengkap yang direkomendasikan untuk project produksi. Gunakan Markdown code block dengan indentasi seperti tree. Sertakan folder untuk: konfigurasi, source code (frontend + backend jika terpisah), database/migrations, test, dokumentasi, dan deployment. Spesifik — sertakan nama file yang mungkin benar-benar ada (misal "src/app/page.tsx", "src/lib/db/schema.ts") berdasarkan tech stack. Sekitar 30-50 baris tree.

Tulis dalam Bahasa Indonesia yang jelas, fokus pada kepraktisan untuk project nyata.`;

  return { system, prompt };
}

export function landingPagePrompt(
  structure: { appName: string; summary: string; features: { name: string; phase: number }[] },
  lang: string = "id",
) {
  const system = lang === "en"
    ? "You are an experienced UI/UX designer and frontend developer creating production-quality landing pages, not just wireframes."
    : "Kamu adalah desainer UI/UX dan frontend developer berpengalaman yang membuat landing page production-quality, bukan sekadar wireframe.";
    
  const phase1Features = structure.features
    .filter((f) => f.phase === 1)
    .map((f) => f.name)
    .slice(0, 4)
    .join(", ");

  const prompt = lang === "en"
    ? `App: ${structure.appName}
Summary: ${structure.summary}
Key Features (Phase 1): ${phase1Features || "not determined"}

Create EXACTLY 3 different landing page concepts with distinct visual styles for this application (e.g., minimalist-modern, bold-playful/colorful, or corporate-professional — tailor styles to the app's character).

For EACH concept, generate:
- id: short snake_case
- styleName: short style name (2-3 words)
- styleDescription: 1 sentence explaining why this style fits the app
- html: ONE COMPLETE, self-contained HTML document (starting from <!DOCTYPE html> to </html>), with instructions:
  - MUST include <script src="https://cdn.tailwindcss.com"></script> inside the <head>
  - Styling ONLY using Tailwind utility classes (no custom <style> unless absolutely necessary)
  - Content: simple navbar with app name, hero section with headline + subheadline + CTA button, short section showcasing 3-4 key features, and a minimal footer
  - Headline and copy MUST be specific to this app (use appName and summary context), no placeholder or generic lorem ipsum
  - Responsive (use sm:/md: classes as needed), optimized for ~1000px screen width
  - Do not include explanatory comments outside the HTML, only raw HTML in this field.`
    : `Aplikasi: ${structure.appName}
Ringkasan: ${structure.summary}
Fitur unggulan (fase 1): ${phase1Features || "belum ditentukan"}

Buat TEPAT 3 konsep landing page yang berbeda gaya visualnya secara jelas untuk aplikasi ini (misal: minimalis-modern, bold-playful/berwarna, atau korporat-profesional — sesuaikan pilihan gaya dengan karakter aplikasi ini, jangan asal comot).

Untuk SETIAP konsep, hasilkan:
- id: snake_case singkat
- styleName: nama gaya singkat (2-3 kata)
- styleDescription: 1 kalimat kenapa gaya ini cocok untuk aplikasi ini
- html: SATU dokumen HTML LENGKAP dan mandiri (mulai dari <!DOCTYPE html> sampai </html>), dengan ketentuan:
  - WAJIB sertakan <script src="https://cdn.tailwindcss.com"></script> di dalam <head>
  - Styling HANYA pakai utility class Tailwind (jangan pakai <style> custom kecuali sangat perlu)
  - Isi: navbar sederhana dengan nama app, hero section dengan headline + subheadline + tombol CTA, section singkat menampilkan 3-4 fitur unggulan di atas, dan footer minimal
  - Headline dan copy HARUS spesifik untuk aplikasi ini (pakai appName dan konteks ringkasan), bukan lorem ipsum atau placeholder generik
  - Responsive (pakai class sm:/md: seperlunya), tapi optimalkan tampilan untuk lebar sekitar 1000px
  - Jangan sertakan komentar penjelasan di luar HTML, cukup HTML-nya saja di field ini`;

  return { system, prompt };
}

export function tasksPrompt(
  structure: { appName: string; features: { id: string; name: string; phase: number; subFeatures: { name: string }[] }[] },
  techChoice: TechChoice | null,
  lang: string = "id",
) {
  const system = getSystemBase(lang);
  const featuresBlock = structure.features
    .map(
      (f) =>
        `- id:"${f.id}" name:"${f.name}" phase:${f.phase} sub-features: ${f.subFeatures.map((s) => s.name).join(", ")}`,
    )
    .join("\n");

  const prompt = lang === "en"
    ? `App: ${structure.appName}
Tech stack: ${techChoice ? `${techChoice.frontend}, ${techChoice.backend}, ${techChoice.database}` : "not determined"}

Features List:
${featuresBlock}

Break down EVERY feature above into concrete technical tasks that a developer can immediately start working on. IMPORTANT: Each sub-feature listed under a feature MUST become its own task (at minimum one task per sub-feature). For example, if a feature "User Auth" has sub-features ["Login & Register", "Password Reset"], create at least 2 separate tasks for those. Then add 1-2 additional infrastructure/setup tasks per feature as needed (e.g. "Create database schema", "Set up API routes").

Each task must have a featureId matching its parent feature id, and the same phase. The description should contain 1 short technical sentence.`
    : `Aplikasi: ${structure.appName}
Tech stack: ${techChoice ? `${techChoice.frontend}, ${techChoice.backend}, ${techChoice.database}` : "belum ditentukan"}

Daftar fitur:
${featuresBlock}

Pecah SETIAP fitur di atas menjadi task teknis konkret yang bisa langsung dikerjakan developer. PENTING: Setiap sub-fitur yang tercantum di suatu fitur HARUS menjadi task-nya sendiri (minimal satu task per sub-fitur). Contoh: kalau fitur "Auth User" punya sub-fitur ["Login & Register", "Reset Password"], buat minimal 2 task terpisah untuk itu. Lalu tambahkan 1-2 task infrastruktur/setup tambahan per fitur sesuai kebutuhan (misal "Buat schema database", "Siapkan route API").

Setiap task harus punya featureId yang cocok dengan id fitur asalnya, dan phase yang sama dengan fase fitur tersebut. description berisi 1 kalimat detail teknis singkat.`;

  return { system, prompt };
}

export function finalPromptCompilePrompt(
  structure: { appName: string; summary: string },
  techChoice: TechChoice | null,
  prd: string,
  tasksCount: number,
  landingStyle?: { styleName: string; styleDescription: string } | null,
  lang: string = "id",
) {
  const system = lang === "en"
    ? "You write serious and specific technical prompts for an AI coding assistant (like Claude Code or Cursor) that will actually build this production application from scratch — not a prototype or demo. The prompt must be detailed and firm so the AI coding assistant knows exactly where to start without needing many clarifying questions."
    : "Kamu menulis prompt teknis yang SERIUS dan SPESIFIK untuk AI coding assistant (seperti Claude Code atau Cursor) yang akan benar-benar membangun aplikasi produksi ini dari nol — bukan prototipe atau demo. Prompt harus cukup detail dan tegas sehingga AI coding assistant langsung tahu persis harus mulai dari mana, tanpa perlu banyak bertanya balik.";

  const landingLine = landingStyle
    ? (lang === "en"
      ? `Chosen landing page visual direction: "${landingStyle.styleName}" — ${landingStyle.styleDescription}. Follow this visual direction when building the UI.`
      : `Arah desain landing page yang sudah dipilih: "${landingStyle.styleName}" — ${landingStyle.styleDescription}. Ikuti arah visual ini saat membangun UI.`)
    : "";

  const prompt = lang === "en"
    ? `Combine the following information into ONE comprehensive prompt in English, ready to be pasted into an AI coding assistant to build this project SERIOUSLY (production quality). Write in a firm and encouraging tone — instruct the AI coding assistant to actually implement each step thoroughly, including input validation and error handling, not just the happy path.

App Name: ${structure.appName}
Summary: ${structure.summary}
Tech Stack: ${techChoice ? `${techChoice.frontend}, ${techChoice.backend}, ${techChoice.database}` : "any, adapt"}
Number of detailed tasks: ${tasksCount}
${landingLine}

Complete PRD:
"""
${prd}
"""

The generated prompt MUST include, in order:
1. Short application context (what it is, for whom) and the tech stack that MUST be used (explicitly mention library names/versions)
2. Summary of Phase 1 (MVP) features scope only — do not mention Phase 2/3 yet
3. **Explicit and firm development order**, in numbered steps, with the default order: (1) project setup & initial config, (2) design database schema & create models, (3) build backend/API endpoints for Phase 1 features with input validation and error handling, (4) then build frontend/UI for Phase 1 and connect to API, (5) manual end-to-end testing of main flows. Briefly explain why this backend-first order is used (to clarify data contracts before UI is built), but if the stack suits a different order (e.g. full-stack framework where API and UI are combined), adjust the order and explain why.
4. Explicit instruction NOT to work on Phase 2/3 features before Phase 1 is fully functional
5. Short closing stating the AI coding assistant must confirm with the user before assuming major details not specified in the PRD

Format the output as a plain text prompt (no JSON, no wrapping markdown code block), ready to copy-paste, around 300-450 words.`
    : `Gabungkan informasi berikut menjadi SATU prompt komprehensif dalam Bahasa Indonesia, siap ditempel ke AI coding assistant untuk membangun project ini SECARA SERIUS (kualitas produksi, bukan sekadar contoh). Tulis dengan nada tegas dan meyakinkan — instruksikan AI coding assistant untuk benar-benar menyelesaikan tiap langkah dengan baik, termasuk penanganan error dan validasi input, bukan cuma happy-path.

Nama aplikasi: ${structure.appName}
Ringkasan: ${structure.summary}
Tech stack: ${techChoice ? `${techChoice.frontend}, ${techChoice.backend}, ${techChoice.database}` : "bebas, sesuaikan"}
Jumlah task yang sudah dirinci: ${tasksCount}
${landingLine}

PRD lengkap:
"""
${prd}
"""

Prompt yang kamu hasilkan HARUS mencakup, secara berurutan:
1. Konteks singkat aplikasi (apa itu, untuk siapa) dan tech stack yang WAJIB dipakai (sebut eksplisit versi/nama library-nya)
2. Ringkasan lingkup fitur fase 1 (MVP) saja — jangan sebutkan fase 2/3 dulu
3. **Urutan pengerjaan yang eksplisit dan tegas**, dalam bentuk langkah bernomor, dengan urutan default: (1) setup project & konfigurasi awal, (2) desain schema database dan buat modelnya, (3) bangun backend/API endpoint untuk fitur fase 1 lengkap dengan validasi input dan error handling, (4) baru bangun frontend/UI untuk fitur fase 1 dan hubungkan ke API, (5) testing manual alur utama end-to-end. Jelaskan SINGKAT kenapa urutan backend-dulu ini dipakai (supaya kontrak data jelas sebelum UI dibangun), tapi kalau tech stack yang dipakai lebih cocok dikerjakan berbeda (misal framework full-stack yang API dan UI-nya menyatu), sesuaikan urutannya dan jelaskan alasannya.
4. Instruksi eksplisit untuk TIDAK mengerjakan fitur fase 2/3 dulu sebelum fase 1 selesai dan berfungsi
5. Penutup singkat yang menegaskan AI coding assistant harus konfirmasi ke user sebelum mengasumsikan hal-hal besar yang belum jelas dari PRD

Format output sebagai teks prompt biasa (bukan JSON, bukan markdown code block pembungkus), siap copy-paste, panjang sekitar 300-450 kata.`;

  return { system, prompt };
}

export function requiredSkillsPrompt(
  plan: { ideaText: string; prd: string; folderStructure: string | null; structure: { appName: string; summary: string } },
  techChoice: TechChoice | null,
  lang: string = "id",
) {
  const system = lang === "en"
    ? "You are a senior developer environment expert. Based on the project requirements below, list all tools, runtimes, SDKs, libraries, and dependencies that must be installed before development can begin. Be specific with versions."
    : "Kamu adalah ahli environment developer senior. Berdasarkan requirement proyek di bawah, daftarkan semua tools, runtime, SDK, library, dan dependensi yang HARUS di-download/diinstall sebelum development bisa dimulai. Sebut versi spesifik.";

  const prompt = lang === "en"
    ? `App: ${plan.structure.appName}
Summary: ${plan.structure.summary}
Tech Stack: ${techChoice ? `${techChoice.frontend}, ${techChoice.backend}, ${techChoice.database}` : "not determined"}
${plan.folderStructure ? `\nFolder Structure:\n${plan.folderStructure}` : ""}

Full PRD:
"""
${plan.prd}
"""

Analyze the project above thoroughly, then generate a complete "Required Skills & Environment Setup" checklist in Markdown format with these sections:

## Runtime & Core Dependencies
List every runtime (Node.js, Python, Go, etc.), database (PostgreSQL, SQLite, etc.), and system tool (Git, Docker, etc.) with specific minimum versions. Include installation commands (e.g. "brew install postgresql@16", "nvm install 20").

## Frontend Dependencies
All npm/pip packages for the frontend with versions (e.g. "react@19", "next@15", "tailwindcss@4").

## Backend Dependencies
All packages/libraries for the backend with versions.

## VS Code Extensions (Recommended)
3-5 relevant extensions that help with this specific tech stack.

## Environment Variables
List all env vars that need to be configured (e.g. DATABASE_URL, API_KEY).

## Initial Setup Steps
Numbered steps to clone, install, configure, and run the project for the first time.

Write in clear English, be practical and specific.`
    : `Aplikasi: ${plan.structure.appName}
Ringkasan: ${plan.structure.summary}
Tech stack: ${techChoice ? `${techChoice.frontend}, ${techChoice.backend}, ${techChoice.database}` : "belum ditentukan"}
${plan.folderStructure ? `\nStruktur Folder:\n${plan.folderStructure}` : ""}

PRD lengkap:
"""
${plan.prd}
"""

Analisis proyek di atas secara menyeluruh, lalu buat daftar lengkap "Persiapan Environment & Skill yang Dibutuhkan" dalam format Markdown dengan bagian-bagian ini:

## Runtime & Dependensi Utama
Daftar semua runtime (Node.js, Python, Go, dll), database (PostgreSQL, SQLite, dll), dan system tool (Git, Docker, dll) dengan versi minimum spesifik. Sertakan perintah installasi (contoh: "brew install postgresql@16", "nvm install 20").

## Dependensi Frontend
Semua package npm/pip untuk frontend dengan versinya (contoh: "react@19", "next@15", "tailwindcss@4").

## Dependensi Backend
Semua package/library untuk backend dengan versinya.

## Ekstensi VS Code (Rekomendasi)
3-5 ekstensi relevan yang membantu untuk tech stack ini.

## Variable Environment
Daftar semua env var yang perlu dikonfigurasi (contoh: DATABASE_URL, API_KEY).

## Langkah Setup Awal
Langkah bernomor untuk clone, install, konfigurasi, dan menjalankan project pertama kali.

Tulis dalam Bahasa Indonesia yang jelas, praktis, dan spesifik.`;

  return { system, prompt };
}
