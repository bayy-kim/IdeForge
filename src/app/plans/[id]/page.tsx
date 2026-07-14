import { PlanWizardClient } from "./plan-wizard-client";

export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PlanWizardClient planId={id} />;
}
