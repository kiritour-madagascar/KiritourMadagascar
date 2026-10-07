import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Tours from "../pages/Tours";
import TourDetails from "../pages/TourDetails";
import SearchResultList from "../pages/SearchResultList";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Booked from "../pages/Booked";
import MyAccount from "../Dashboard/UserAccount/MyAccount";
import Bookings from "../Dashboard/AdminPanel/Bookings";
import AdminTours from "../Dashboard/AdminPanel/AdminTours";
import CreateTours from "../Dashboard/AdminPanel/CreateTours";
import UpdateTours from "../Dashboard/AdminPanel/UpdateTour";
import FAQ from "../pages/FAQ";
import TermsPage from "../pages/TermsPage";
import PrivacyPage from "../pages/PrivacyPage";
import BookingConditionsPage from "../pages/BookingConditionsPage";
import Blog from "../pages/Blog";
import BlogPost from "../pages/BlogPost";

const Router = () => {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />

      <Route path="/tours" element={<Tours />} />
      <Route path="/tours/search" element={<SearchResultList />} />
      <Route path="/tours/:id" element={<TourDetails />} />

      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />

      {/* Blog */}
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User */}
      <Route path="/my-account" element={<MyAccount />} />
      <Route path="/booked" element={<Booked />} />

      {/* Admin */}
      <Route path="/all-booking" element={<Bookings />} />
      <Route path="/all-tours" element={<AdminTours />} />
      <Route path="/create" element={<CreateTours />} />
      <Route path="/update-tour/:id" element={<UpdateTours />} />

      {/* Legal pages */}
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route
        path="/booking-conditions"
        element={<BookingConditionsPage />}
      />
    </Routes>
  );
};

export default Router;

