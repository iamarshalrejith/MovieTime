import React from "react";

const Spinner = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="h-8 w-8 border-4 border-indigo-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Spinner;
