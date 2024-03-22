import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';

import CanvasPage from '@/pages/canvas';
import DocsPage from '@/pages/document';
import Explorer from '@/pages/explorer/Explorer.tsx';
import Home from '@/pages/home/Home.tsx';

export const router = createBrowserRouter(
  createRoutesFromElements([
    <Route path="/" element={<Home />} />,
    <Route path="/explorer/:file?" element={<Explorer />} />,
    <Route path="/canvas/:file?" element={<CanvasPage />} />,
    <Route path="/document/:file?" element={<DocsPage />} />,
  ]),
);
