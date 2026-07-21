import React from 'react'
import { BrowserRouter, Route, Routes} from 'react-router-dom'
import Layout from './components/Layout';
import Collections from './Pages/Collections';
import Create from './Pages/Create';
import ExplorePage from './Pages/ExplorePage';
import PostDetailPage from './Pages/PostDetailPage';
import FavouritesPage from './Pages/FavouritesPage';
import AccountPage from './Pages/AccountPage';
function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/"  element={<Layout />}>
      <Route path="/explore" element={<ExplorePage />}/>
      <Route path="/favorites" element={<FavouritesPage />}/>
      <Route path="/collections" element={<Collections />}/>
      <Route path="/create" element={<Create />}/>
      <Route path="/post/:id" element={<PostDetailPage />} />
      <Route path="/account" element={<AccountPage />} />
     </Route>
    </Routes>
    </BrowserRouter>
  )
}

export default App;
