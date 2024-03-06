import { Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';

import Explorer from "@/pages/explorer/Explorer.tsx";
import Canvas from "@/pages/canvas/Canvas.tsx";

export const router = createBrowserRouter(
  createRoutesFromElements([
    <Route path="/" element={<Explorer />} />,
    <Route path="/canvas" element={<Canvas />} />
  ]),
);
