````markdown
# File-Based Routing with TanStack Router

This guide explains how to set up and use file-based routing in a React project using TanStack Router and Vite.

## 1. Installation

First, you need to install the necessary packages:

```bash
npm install @tanstack/react-router
npm install -D @tanstack/router-vite-plugin
```
````

## 2. Vite Configuration

Next, configure Vite to use the TanStack Router plugin. This plugin automatically generates the route tree based on your file structure.

**`vite.config.ts`**

```typescript
import { defineConfig } from "vite";
import { tanstackRouter } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tanstackRouter()],
});
```

## 3. Directory Structure

Create a `routes` directory inside your `src` folder. This is where you will define your application's routes. The file structure within this directory maps directly to the URL structure of your application.

```
src/
  routes/
    __root.tsx
    index.lazy.tsx
    posts.tsx
    posts/$postId.tsx
```

## 4. Creating Routes

### Root Route

The `__root.tsx` file defines the root layout of your application. All other routes will be rendered within this layout.

**`src/routes/__root.tsx`**

```tsx
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="&.active:font-bold">
          Home
        </Link>
        {
          <Link to="/posts" className="&.active:font-bold">
            Posts
          </Link>
        }
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

export const Route = createLazyFileRoute("/")({
  component: () => <div>Hello from the index route!</div>,
});
```

### Nested Routes

You can create nested routes by creating subdirectories or using the `.` naming convention. For dynamic routes, use the `$` prefix.

**`src/routes/posts.tsx`**

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/posts")({
  component: () => <div>Select a post</div>,
});
```

**`src/routes/posts/$postId.tsx`**

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/posts/$postId")({
  component: PostComponent,
});

function PostComponent() {
  const { postId } = Route.useParams();
  return <div>Post ID: {postId}</div>;
}
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

## 6. Basic Usage

### Navigation

Use the `<Link>` component from `@tanstack/react-router` for client-side navigation.

```tsx
<Link to="/posts" params={{ postId: "123" }}>
  View Post 123
</Link>
```

### Accessing Route Parameters

Use the `useParams` hook from the current route to access dynamic route parameters.

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/posts/$postId")({
  component: PostComponent,
});

function PostComponent() {
  const { postId } = Route.useParams();
  return <div>Post ID: {postId}</div>;
}
```

This setup provides a powerful and type-safe way to handle routing in your React application.

```

```
