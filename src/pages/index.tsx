import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';

import Canvas from '@/pages/canvas/Canvas.tsx';
import Explorer from '@/pages/explorer/Explorer.tsx';
import Home from '@/pages/home/Home.tsx';

export const router = createBrowserRouter(
  createRoutesFromElements([
    <Route path="/" element={<Home />} />,
    <Route path="/explorer/:user?/:file?" element={<Explorer />} />,
    <Route path="/canvas/:user?/:file?" element={<Canvas />} />,
  ]),
);
