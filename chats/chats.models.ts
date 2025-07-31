export interface Message {
    id: string;
    sender: string;
    text: string;
    timestamp: string;
  }
  
// In-memory message store
export const messages: Message[] = [];