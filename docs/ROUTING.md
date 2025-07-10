````markdown
# File-Based Routing with TanStack Router

This guide explains how to set up and use file-based routing in a React project using TanStack Router and Vite.

## 1. Installation

First, you need to install the necessary packages:

```bash
npm install @tanstack/react-router
npm install -D @tanstack/router-vite-plugin @vitejs/plugin-react
```

## 2. Vite Configuration

Next, configure Vite to use the TanStack Router and React plugins.

**`vite.config.ts`**

```typescript
import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
});
```

## 3. Directory Structure

Create a `routes` directory inside your `src` folder. This is where you will define your application's routes. The file structure within this directory maps directly to the URL structure of your application.

```
src/
  routes/
    __root.tsx
    index.lazy.tsx
    about.tsx
    test.tsx
```

## 4. Creating Routes

### Root Route

The `__root.tsx` file defines the root layout of your application. All other routes will be rendered within this layout.

**`src/routes/__root.tsx`**

```tsx
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import React from "react";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="&.active:font-bold">
          Home
        </Link>
        <Link to="/about" className="&.active:font-bold">
          About
        </Link>
        <Link to="/test" className="&.active:font-bold">
          Test
        </Link>
      </div>
      <hr />
      <Outlet />
    </>
  ),
});
```

### Index Route

The `index.lazy.tsx` file corresponds to the root URL (`/`). The `.lazy` extension indicates that this route component will be lazy-loaded.

**`src/routes/index.lazy.tsx`**

```tsx
import { createLazyFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
    </div>
  );
}
```

### Static Routes

Static routes are created by adding files to the `routes` directory. For example, `about.tsx` creates the `/about` route.

**`src/routes/about.tsx`**

```tsx
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return <div className="p-2">Hello from About!</div>;
}
```

**`src/routes/test.tsx`**
This route imports and renders the `TestPage` component.

```tsx
import { createFileRoute } from "@tanstack/react-router";
import TestPage from "../pages/TestPage/TestPage";

export const Route = createFileRoute("/test")({
  component: TestPage,
});
```

## 5. Main Application File

Finally, update your main application file to use the generated route tree.

**`src/main.tsx`**

```tsx
import React from "react";
import { createRoot } from "react-dom/client";
import "./application.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Set up a Router instance
const router = createRouter({
  routeTree,
  basepath: "/phase-out-village",
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app")!;
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );
}
```

This setup provides a powerful and type-safe way to handle routing in your React application.
````
