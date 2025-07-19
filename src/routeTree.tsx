import {
  createRootRoute,
  createRoute,
  Outlet,
  useParams,
} from "@tanstack/react-router";
import React from "react";
import { FrontPage } from "./routes/frontPage";
import { OilFieldMapList } from "./routes/oilFieldMapList";
import { Application } from "./routes/application";
import { OilfieldName, Slugify } from "./data";
import { ProductionTable } from "./components/tables/productionTable";
import { OilFieldMap } from "./components/map/oilFieldMap";
import { FlatApplication } from "./components/app/flatApplication";
import { OilfieldMap } from "./routes/oilfieldMap";

export const routeTree = createRootRoute({
  component: Application,
});
export const mapRoute = createRoute({
  path: "/map",
  getParentRoute: () => routeTree,
  component: () => (
    <div>
      <OilFieldMap />
      <Outlet />
    </div>
  ),
});

routeTree.addChildren([
  createRoute({
    path: "/",
    getParentRoute: () => routeTree,
    component: FrontPage,
  }),
  mapRoute.addChildren([
    createRoute({
      path: "/",
      getParentRoute: () => mapRoute,
      component: OilFieldMapList,
    }),
    createRoute({
      path: "$slug",
      getParentRoute: () => mapRoute,
      component: () => {
        const slug = useParams({ strict: false }).slug as Slugify<OilfieldName>;
        return <OilfieldMap slug={slug} />;
      },
    }),
  ]),
  createRoute({
    path: "/emissions",
    getParentRoute: () => routeTree,
    component: FlatApplication,
  }),
  createRoute({
    path: "/production",
    getParentRoute: () => routeTree,
    component: ProductionTable,
  }),
  createRoute({
    path: "*",
    getParentRoute: () => routeTree,
    component: () => "Not found",
  }),
]);
