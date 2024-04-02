import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';

import CanvasPage from '@/pages/canvas';
import DocsPage from '@/pages/document';
import Explorer from '@/pages/explorer/Explorer';
import SettingsPage from '@/pages/settings';
import Subscribe from '@/pages/subscription';
import Layout from '@/shared/components/Layout';

export const router = createBrowserRouter(
  createRoutesFromElements([
    <Route element={<Layout />}>
      <Route path="/" element={<DocsPage />} />
      <Route path="/explorer/:file?" element={<Explorer />} />
      <Route path="/canvas/:file?" element={<CanvasPage />} />
      <Route path="/document/:file?" element={<DocsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/subscribe" element={<Subscribe />} />
    </Route>,
  ]),
);
