import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In a real implementation, you would fetch agent data from your database
    // For now, returning mock data
    const agentData = {
      id: params.id,
      email: `agent${params.id}@example.com`,
      firstName: 'Agent',
      lastName: params.id.substring(0, 8),
    };

    return Response.json(agentData);
  } catch (error) {
    console.error('Error fetching agent:', error);
    return Response.json({ error: 'Failed to fetch agent' }, { status: 500 });
  }
}