// API utility functions

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api`;

export const api = {
  referral: {
    recordClick: async (agentId: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/referral/click/${agentId}`, {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to record referral click: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error recording referral click:', error);
        throw error;
      }
    },
  },
};