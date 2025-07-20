import React, { useState } from "react";
import { OilFieldMap } from "../components/map/oilFieldMap";
import { OilFieldMapList } from "./oilFieldMapList";
import { useRouter } from "@tanstack/react-router";
import { Dialog } from "../components/ui/dialog";
import { PhaseOutDialog } from "../components/phaseout/phaseOutDialog";

export function PhaseOutRoute() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  return (
    <div className="oilfield-map">
      <Dialog open={open} onClose={() => router.navigate({ to: "/emissions" })}>
        <PhaseOutDialog close={() => setOpen(false)} />
      </Dialog>
      <OilFieldMap />
      <div className="details">
        <OilFieldMapList />
      </div>
    </div>
  );
}
