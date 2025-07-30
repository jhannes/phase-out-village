import React, { useState } from "react";
import { Dialog } from "../ui/dialog";
import { useNavigate } from "react-router-dom";

export function FrontPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  return (
    <>
      <h1>Chill, baby! Chill!</h1>
      <div className="welcome">
        <Dialog open={open} onClose={() => navigate("/map")}>
          <h1>Er du mer klimaflink enn Arbeiderpartiet?</h1>

          <p>
            Visste du at produksjon av olje og gass står for{" "}
            <a
              href={
                "https://www.ssb.no/natur-og-miljo/forurensning-og-klima/statistikk/utslipp-til-luft"
              }
            >
              en fjerdedel av Norges utslipp av klimagasser
            </a>
            ? Fra 2025 til 2040 vil dette etter Sokkeldirektorats beregninger
            stå for 10 zillioner tonn med CO2. (TODO: kvalitetssikre tallet). Og
            da regner vi ikke med utslippene når olja og gassen brennes i
            utlandet.
          </p>

          <p>
            MDG har <a href="https://mdg.no/oljeplan">en plan</a> for å gradvis
            avvikle den mest forurensende produksjonen frem til 2040, samtidig
            som Norge beholder en stor andel av inntektene.
          </p>

          <p>Vil du prøve å se om du klarer å lage en like god plan?</p>

          <p>
            <button onClick={() => setOpen(false)}>Jeg er klar</button>
          </p>
        </Dialog>
      </div>
    </>
  );
}
