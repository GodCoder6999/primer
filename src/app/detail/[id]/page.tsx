import React from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold">Media Detail Page</h1>
      <p className="mt-2 text-gray-400">Media ID: {id}</p>
    </div>
  );
}
