import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Landing from './components/Landing/Landing';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import RePassword from './components/RePassword/RePassword';
import OtpPage from './components/OtpPage/OtpPage';
import RecoverPassword from './components/RecoverPassword/RecoverPassword';
import NewPassword from './components/NewPassword/NewPassword';
import Home from './components/Home/Home';
import Blog from './components/Blog/Blog';
import ProductDetails from './components/ProductDetails/ProductDetails';
import Shop from './components/Shop/Shop';

import Blogdetail from './components/Blogdetails/Blogdetail';
import PostDetails from './components/Home/Postdetails';
import HandicraftRecommendation from './components/Recommendation/recommend';
import HandicraftsHomePage from './components/Home2/home2';
import Profile from './components/Profile/Profile';
import Cart from './components/Cart/Cart'; // ✅ غيرت الاسم هنا
import { CartProvider } from "./Context/CartContext"; // عدّل المسار حسب مكان الملف
// استيراد السياقات الخاصة بـ Token و Cart
import TokenContextProvider from './Context/TokenContext';
import ChatApp from './components/Messages/Messages';
import AdminDashboard from './components/Admin Dashboard/admin'
import PopularArticles from './components/Admin Dashboard/popularArticles'
import AllHandicrafts from './components/Admin Dashboard/totalHandicrafts'
import TopUsers from './components/Admin Dashboard/topUsers'
import UsersManagement from './components/Admin Dashboard/allUsers'
import PopularCategories from './components/Admin Dashboard/totalCategory'
import UserActivityDetails from './components/Admin Dashboard/userActivity'
import EngagementSummary from './components/Admin Dashboard/EngagementSummary'
import RecommendationsPage from'./components/For You/RecommendationsPage'
import FavoritesPage from './components/Shop/FavoritesPage';
function App() {
  const routes = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <HandicraftsHomePage /> },
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
        { path: "repassword", element: <RePassword /> },
        { path: "otp", element: <OtpPage /> },
        { path: "recoverpassword", element: <RecoverPassword /> },
        { path: "newpassword", element: <NewPassword /> },
        { path: "home", element: <Home /> },
        { path: "blog", element: <Blog /> },
        { path: "product-details/:id", element: <ProductDetails /> },
        { path: "shop", element: <Shop /> },
        { path: "cart", element: <Cart /> }, // ✅ استخدم Cart هنا
        { path: "Blogdetails", element: <Blogdetail /> },
        { path: "post/:postId", element: <PostDetails /> },
        { path: "recommend", element: <HandicraftRecommendation /> },
        { path: "home2", element: <HandicraftsHomePage /> },
        { path: "profile/:id", element: <Profile /> },
        {path:"chat",element:<ChatApp/>},
        { path: "admin", element: <AdminDashboard /> },
        { path: "Populararticles", element: <PopularArticles /> },
         {path: "/handicrafts", element: <AllHandicrafts />,},
        {path:"/top-users" ,element:<TopUsers />},
        { path:"/users", element:<UsersManagement />} ,
        { path:"/allcat", element:<PopularCategories />} ,
        { path: "/users/:userId", element: <UserActivityDetails /> },
         { path:"/summary", element:<EngagementSummary />} ,

{path:"/foryou",element:<RecommendationsPage/>},

{path:"/favorites", element:<FavoritesPage />},

        { path: "*", element: <Navigate to="/login" replace /> },
      ],
    },
  ], { basename: "/graduation-pro-front" });

  return <RouterProvider router={routes} />;
}

export default App;
