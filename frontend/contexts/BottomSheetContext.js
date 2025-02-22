import React, { createContext, useState, useContext } from "react";

const BottomSheetContext = createContext({
  isBottomSheetOpen: false,
  setIsBottomSheetOpen: () => {},
});

export const BottomSheetProvider = ({ children }) => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  return (
    <BottomSheetContext.Provider
      value={{ isBottomSheetOpen, setIsBottomSheetOpen }}
    >
      {children}
    </BottomSheetContext.Provider>
  );
};

export const useBottomSheet = () => useContext(BottomSheetContext);
