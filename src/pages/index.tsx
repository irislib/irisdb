import { Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';

import Explorer from "@/pages/explorer/Explorer.tsx";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Explorer />} />,
  ),
);
