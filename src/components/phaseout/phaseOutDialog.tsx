import React, { FormEvent, useContext } from "react";
import { ApplicationContext } from "../../applicationContext";

export function PhaseOutDialog({ close }: { close: () => void }) {
  const { year, fullData } = useContext(ApplicationContext);
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    close();
  }
  return (
    <form onSubmit={handleSubmit}>
      <h2>Velg felter for avvikling i {year}</h2>
      {Object.keys(fullData).map((k) => (
        <li>
          <input type="checkbox" />
          {k}
        </li>
      ))}
      <button>Lagre</button>
    </form>
  );
}
