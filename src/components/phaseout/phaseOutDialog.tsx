import React, { FormEvent, useContext, useState } from "react";
import { ApplicationContext } from "../../applicationContext";
import { OilfieldName, PhaseOutSchedule } from "../../data";

export function PhaseOutDialog({ close }: { close: () => void }) {
  const { year, nextYear, fullData, phaseOut, setPhaseOut } =
    useContext(ApplicationContext);

  const [draft, setDraft] = useState<PhaseOutSchedule>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPhaseOut((phaseOut) => ({ ...phaseOut, ...draft }));
    nextYear();
    close();
  }
  function toggle(field: OilfieldName, checked: boolean) {
    if (!checked)
      setDraft((d) =>
        Object.fromEntries(Object.entries(d).filter(([f, _]) => f !== field)),
      );
    else setDraft((d) => ({ ...d, [field]: year }));
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Velg felter for avvikling i {year}</h2>
      {Object.keys(fullData).map((k) => (
        <li>
          <label>
            <input
              disabled={k in phaseOut}
              type="checkbox"
              onChange={(e) => toggle(k, e.target.checked)}
              checked={!!draft[k]}
            />
            {k}
          </label>
        </li>
      ))}
      <button>Lagre</button>
    </form>
  );
}
