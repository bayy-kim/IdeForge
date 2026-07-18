import { StepperHeader } from "@/components/stepper-header";
import { PageTransition } from "@/components/motion";

export default async function PlanLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="min-h-screen">
      <StepperHeader planId={id} />
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
