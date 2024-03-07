import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';

import Canvas from '@/pages/canvas/Canvas.tsx';
import Explorer from '@/pages/explorer/Explorer.tsx';

export const router = createBrowserRouter(
  createRoutesFromElements([
    <Route path="/" element={<Explorer />} />,
    <Route path="/canvas" element={<Canvas />} />,
  ]),
);
