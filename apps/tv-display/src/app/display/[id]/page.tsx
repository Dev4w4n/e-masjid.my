import { DisplayPage } from '@/routes/DisplayRoute';

export const runtime = 'edge';

interface DisplayByIdPageProps {
  params: Promise<{ id: string }>;
}

export default async function DisplayByIdPage({ params }: DisplayByIdPageProps) {
  const { id } = await params;
  return <DisplayPage displayId={id} />;
}
