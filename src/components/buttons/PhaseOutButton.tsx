import React from "react";

interface PhaseOutButtonProps {
  selectedFields: number[];
  onPhaseOut: () => void;
}

const PhaseOutButton: React.FC<PhaseOutButtonProps> = ({
  selectedFields,
  onPhaseOut,
}) => {
  return (
    <button disabled={selectedFields.length === 0} onClick={onPhaseOut}>
      Phase Out Selected Fields
    </button>
  );
};

export default PhaseOutButton;
