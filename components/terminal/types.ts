export type HistoryEntry = {
  type: 'command' | 'output';
  content: string;
};
