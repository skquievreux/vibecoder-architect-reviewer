import ApiViewerClient from './client';

export default async function ApiViewerPage({ params }: { params: Promise<{ name: string }> }) {
    const { name } = await params;
    return <ApiViewerClient name={name} />;
}
