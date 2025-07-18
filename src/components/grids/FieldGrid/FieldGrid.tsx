import React from "react";

interface Field {
  id: string;
  name: string;
  phasedOut: boolean;
}

const FieldGrid = ({
  fields,
  selectedFields,
  onSelectField,
}: {
  fields: Field[];
  selectedFields: string[];
  onSelectField: (id: string) => void;
}) => {
  return (
    <div className="field-grid">
      {fields.map((field) => (
        <div
          key={field.id}
          className={`field ${field.phasedOut ? "phased-out" : ""}`}
        >
          <input
            type="checkbox"
            checked={selectedFields.includes(field.id)}
            disabled={field.phasedOut}
            onChange={() => onSelectField(field.id)}
          />
          <span>{field.name}</span>
        </div>
      ))}
    </div>
  );
};

export default FieldGrid;
