import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "../ui/dialog";
import { PhaseOutDialog } from "./phaseOutDialog";
import { OilFieldMap } from "../map/oilFieldMap";
import { OilFieldMapList } from "../map/oilFieldMapList";

export function PhaseOutRoute() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  return (
    <div className="oilfield-map">
      <Dialog open={open} onClose={() => navigate("/production")}>
        <PhaseOutDialog close={() => setOpen(false)} />
      </Dialog>
      <OilFieldMap />
      <div className="details">
        <OilFieldMapList />
      </div>
    </div>
  );
}
