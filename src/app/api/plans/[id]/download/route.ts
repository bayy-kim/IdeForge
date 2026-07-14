import { NextRequest, NextResponse } from "next/server";
import { getPlan } from "@/lib/db/repo";
import JSZip from "jszip";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const plan = await getPlan(id);
  if (!plan) {
    return NextResponse.json({ error: "Plan tidak ditemukan." }, { status: 404 });
  }

  const name = plan.structure?.appName?.replace(/[^a-zA-Z0-9]/g, "-") || "project";
  const zip = new JSZip();

  const files: { path: string; content: string }[] = [];

  if (plan.prd) {
    files.push({ path: "PRD.md", content: plan.prd });
  }

  if (plan.folderStructure) {
    files.push({ path: "STRUKTUR-FOLDER.md", content: plan.folderStructure });
  }

  if (plan.finalPrompt) {
    files.push({ path: "PROMPT.md", content: plan.finalPrompt });
  }

  if (plan.requiredSkills) {
    files.push({ path: "PERSIAPAN-SKILL.md", content: plan.requiredSkills });
  }

  const readmeParts: string[] = [];
  readmeParts.push(`# ${plan.structure?.appName || "Aplikasi"}\n`);
  readmeParts.push(`${plan.structure?.summary || ""}\n`);

  if (plan.techChoice) {
    readmeParts.push(`\n## Tech Stack\n- Frontend: ${plan.techChoice.frontend}\n- Backend: ${plan.techChoice.backend}\n- Database: ${plan.techChoice.database}\n`);
    if (plan.techChoice.extras?.length) {
      readmeParts.push(`- Extras: ${plan.techChoice.extras.join(", ")}\n`);
    }
  }

  if (plan.ideaText) {
    readmeParts.push(`\n## Ide Awal\n${plan.ideaText}\n`);
  }

  if (plan.tasks?.length) {
    const done = plan.tasks.filter((t) => t.done);
    readmeParts.push(`\n## Progress\n- ${done.length}/${plan.tasks.length} task selesai\n`);
  }

  files.unshift({ path: "README.md", content: readmeParts.join("\n") });

  for (const f of files) {
    zip.file(f.path, f.content);
  }

  const buf = await zip.generateAsync({ type: "nodebuffer" });
  const bytes = new Uint8Array(buf);

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${name}.zip"`,
    },
  });
}
