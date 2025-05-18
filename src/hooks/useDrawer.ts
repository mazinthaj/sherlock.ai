import { useState } from 'react';

export const useDrawer = () => {
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);

  const toggleRightDrawer = () => setRightDrawerOpen(prev => !prev);
  const closeRightDrawer = () => setRightDrawerOpen(false);

  return {
    rightDrawerOpen,
    toggleRightDrawer,
    closeRightDrawer
  };
};