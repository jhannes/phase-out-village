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
import { OilfieldName, oilfieldNames, Slugify } from "./data";

export const routeTree = createRootRoute({
  component: Application,
});
export const mapRoute = createRoute({
  path: "/map",
  getParentRoute: () => routeTree,
  component: () => <Outlet />,
});

routeTree.addChildren([
  createRoute({
    path: "/",
    getParentRoute: () => routeTree,
    component: FrontPage,
  }),
  createRoute({
    path: "*",
    getParentRoute: () => routeTree,
    component: () => "Not found",
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
        return <h3>Details for singe oilfield: {oilfieldNames[slug]}</h3>;
      },
    }),
  ]),
]);
