import { createFileRoute } from "@tanstack/react-router";
import InvestmentsPage from "../pages/InvestmentsPage";

export const Route = createFileRoute("/investments")({
  component: InvestmentsPage,
});
