/** @format */

import { useMemo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { ConfigProvider } from "antd";
import { antdTheme } from "./config/theme";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";
import ChangePassword from "./pages/Sidebar/Settings/ChangePassword/ChangePassword";
import MainLayout from "./components/MainLayout";
import User from "./pages/Customer/User";
import ViewCustomer from "./pages/Customer/ViewCustomer";
import AdminUser from "./pages/AdminManagement/AdminUser";
import ViewAdmin from "./pages/AdminManagement/ViewAdmin";
import AddAdmin from "./pages/AdminManagement/AddAdmin";
import LoginLogs from "./pages/Sidebar/LoginActivity/LoginLogs";
import Error401 from "./pages/ErrorPages/Error401";
import ServiceCategory from "./pages/ServiceCategory/ServiceCategory";
import AddServiceCategory from "./pages/ServiceCategory/AddServiceCategroy";
import EditServiceCategory from "./pages/ServiceCategory/EditServiceCategory";
import Professionals from "./pages/Professionals/Professionals";
import ViewProfessionals from "./pages/Professionals/ViewProfessionals";
import Specialities from "./pages/Specialities/Specialities";
import AddSpecialities from "./pages/Specialities/AddSpecialities";
import EditSpecialities from "./pages/Specialities/EditSpecialities";
import Appointments from "./pages/Appointments/Appointments";
import Posts from "./pages/Post/Post";
import Clips from "./pages/Clips/Clips";
import UserPost from "./pages/Customer/Data/UserPost";
import UserFollower from "./pages/Customer/Data/UserFollower";
import UserFollowing from "./pages/Customer/Data/UserFollowing";
import UserClips from "./pages/Customer/Data/UserClips";
import PostLiked from "./pages/Customer/Data/PostLiked";
import PostComment from "./pages/Customer/Data/PostComment";
import ClipsLiked from "./pages/Customer/Data/ClipsLiked";
import ClipsCommented from "./pages/Customer/Data/ClipsCommented";
import ReviewsGiven from "./pages/Customer/Data/ReviewsGiven";
import ReviewsTaken from "./pages/Customer/Data/ReviewsTaken";
import UserBookings from "./pages/Customer/Data/UserBookings";
import ProfessionalBooking from "./pages/Customer/Data/ProfessionalBooking";
import UserService from "./pages/Customer/Data/UserService";
import Availability from "./pages/Customer/Data/Availability";
import ProductCategory from "./pages/Ecommerce/ProductCategory/ProductCategory";
import EditProductCategory from "./pages/Ecommerce/ProductCategory/EditProductCategory";
import AddProductCategory from "./pages/Ecommerce/ProductCategory/AddProductCategory";
import Product from "./pages/Ecommerce/Product/Product";
import ViewProduct from "./pages/Ecommerce/Product/ViewProduct";
import Ratings from "./pages/Ecommerce/Product/Rating";
import Orders from "./pages/Ecommerce/Order/Orders";
import ProfessionalForm from "./pages/ProfessionalForm/ProfessionalForm";
import Banner from "./pages/Banner/Banner";
import Faq from "./pages/Content/FAQ/Faq";
import CreateFaq from "./pages/Content/FAQ/CreateFaq";
import EditFaq from "./pages/Content/FAQ/EditFaq";
import Referral from "./pages/Referral/Referral";
import RewardRules from "./pages/RewardRules/RewardRules";
import BusinessCard from "./pages/BusinessCard/BusinessCard";
import JournalCategory from "./pages/Journal/JournalCategory/JournalCategory";
import Authors from "./pages/Journal/Authors/Authors";
import Journal from "./pages/Journal/Journal/Journal";
import AddJournal from "./pages/Journal/Journal/AddJournal";
import EditJournal from "./pages/Journal/Journal/EditJournal";
import Directroy from "./pages/Directory/Directroy";
import CreateBusinessCard from "./pages/BusinessCard/CreateBusinessCard";
import EditBusinessCard from "./pages/BusinessCard/EditBusinessCard";
import PodcastSchedule from "./pages/Podcast/PodcastSchedule";
import AddPodcastSchedule from "./pages/Podcast/AddPodcastSchedule";
import EditPodcastSchedule from "./pages/Podcast/EditPodcastSchedule";
import Education from "./pages/Journal/Discover/Eductaion/Eduction";
import AddEducation from "./pages/Journal/Discover/Eductaion/AddEduction";
import EditEducation from "./pages/Journal/Discover/Eductaion/EditEducation";
import Event from "./pages/Journal/Discover/Event/Event";
import AddEvent from "./pages/Journal/Discover/Event/AddEvent";
import EditEvent from "./pages/Journal/Discover/Event/EditEvent";
import Shop from "./pages/Journal/Discover/Shop/Shop";
import AddShop from "./pages/Journal/Discover/Shop/AddShop";
import EditShop from "./pages/Journal/Discover/Shop/EditShop";
import AccessOrders from "./pages/BusinessCard/AccessOrders";
import Ads from "./pages/Ads/AdsList";
import AddAd from "./pages/Ads/AddAd";
import ViewAd from "./pages/Ads/Viewad";
import JournalTopics from "./pages/JournalTopics/JournalTopics";
import JournalFaq from "./pages/JournalFaq/JournalFaq";
import AddJournalTopic from "./pages/JournalTopics/AddJournalTopic";
import EditJournalTopic from "./pages/JournalTopics/EditJournalTopic";
import JournalTopicDetails from "./pages/JournalTopics/JournalTopicDetails";
import AccessCardAnalytics from "./pages/AccessCardAnalytics/AccessCardAnalytics";
import PartnerInquiries from "./pages/PartnerInquiries/PartnerInquiries";
import ViewPartnerInquiry from "./pages/PartnerInquiries/ViewPartnerInquiry";

function App() {
  // Colours come from the tokens in index.css (loaded before the app renders).
  const theme = useMemo(() => antdTheme(), []);
  return (
    <ConfigProvider theme={theme}>
    <Router>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/error401" element={<Error401 />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/reset-password" element={<ChangePassword />} />
          <Route path="/users" element={<User />} />
          <Route path="/professionals" element={<Professionals />} />
          <Route
            path="/viewProfessionals/:id"
            element={<ViewProfessionals />}
          />

          <Route path="/viewUser/:id" element={<ViewCustomer />} />
          <Route path="/adminList" element={<AdminUser />} />
          <Route path="/viewAdmin" element={<ViewAdmin />} />
          <Route path="/addAdmin" element={<AddAdmin />} />

          <Route path="/loginLogs" element={<LoginLogs />} />





          <Route path="/service-categories" element={<ServiceCategory />} />
          <Route
            path="/add-service-categories"
            element={<AddServiceCategory />}
          />
          <Route
            path="/edit-service-categories/:id"
            element={<EditServiceCategory />}
          />









          <Route path="/specialities" element={<Specialities />} />
          <Route path="/add-specialities" element={<AddSpecialities />} />
          <Route path="/edit-specialities/:id" element={<EditSpecialities />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/posts-list" element={<Posts />} />
          <Route path="/clips-list" element={<Clips />} />










          <Route path="/viewUserPost/:id" element={<UserPost />} />
          <Route path="/viewUserFollower/:id" element={<UserFollower />} />
          <Route path="/viewUserFollowing/:id" element={<UserFollowing />} />
          <Route path="/viewUserClips/:id" element={<UserClips />} />
          <Route path="/viewUserPostLikes/:id" element={<PostLiked />} />
          <Route path="/viewUserPostComment/:id" element={<PostComment />} />
          <Route path="/viewUserClipsLiked/:id" element={<ClipsLiked />} />
          <Route
            path="/viewUserClipsCommented/:id"
            element={<ClipsCommented />}
          />
          <Route path="/viewUserReviewsGiven/:id" element={<ReviewsGiven />} />
          <Route path="/viewUserReviewsTaken/:id" element={<ReviewsTaken />} />
          <Route path="/viewUserBookings/:id" element={<UserBookings />} />
          <Route
            path="/viewProfessionalBooking/:id"
            element={<ProfessionalBooking />}
          />
          <Route path="/viewUserService/:id" element={<UserService />} />
          <Route path="/viewAvailability/:id" element={<Availability />} />
          <Route path="/product-category" element={<ProductCategory />} />
          <Route
            path="/edit-product-category/:id"
            element={<EditProductCategory />}
          />
          <Route
            path="/add-product-category"
            element={<AddProductCategory />}
          />
          <Route path="/product-list" element={<Product />} />
          <Route path="/view-product/:id" element={<ViewProduct />} />
          <Route path="/product-rating/:id" element={<Ratings />} />
          <Route path="/orders" element={<Orders />} />


          <Route path="/form" element={<ProfessionalForm />} />
          <Route path="/banner" element={<Banner />} />
          <Route path="/faqs" element={<Faq />} />
          <Route path="/createFaq" element={<CreateFaq />} />
          <Route path="/editFaq/:id" element={<EditFaq />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/reward-rules" element={<RewardRules />} />
          <Route path="/digital-card" element={<BusinessCard />} />
          <Route path="/addBusinessCard" element={<CreateBusinessCard />} />
          <Route path="/editBusinessCard/:id" element={<EditBusinessCard />} />
          <Route path="/journal-categories" element={<JournalCategory />} />
          <Route path="/authors" element={<Authors />} />
          <Route path="/journals" element={<Journal />} />
          <Route path="/add-journal" element={<AddJournal />} />
          <Route path="/edit-journal/:id" element={<EditJournal />} />
          <Route path="/journal-topics" element={<JournalTopics />} />
          <Route path="/journal-topics/add" element={<AddJournalTopic />} />
          <Route
            path="/journal-topics/edit/:id"
            element={<EditJournalTopic />}
          />
          <Route path="/journal-topics/:id" element={<JournalTopicDetails />} />
          <Route path="/journal-faqs" element={<JournalFaq />} />
          <Route path="/education" element={<Education />} />
          <Route path="/add-education" element={<AddEducation />} />
          <Route path="/edit-education/:id" element={<EditEducation />} />
          <Route path="/events" element={<Event />} />
          <Route path="/add-event" element={<AddEvent />} />
          <Route path="/edit-event/:id" element={<EditEvent />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/add-shop" element={<AddShop />} />
          <Route path="/edit-shop/:id" element={<EditShop />} />
          <Route path="/directory" element={<Directroy />} />
          <Route path="/podcast-schedule" element={<PodcastSchedule />} />
          <Route
            path="/add-podcast-schedule"
            element={<AddPodcastSchedule />}
          />
          <Route
            path="/edit-podcast-schedule/:id"
            element={<EditPodcastSchedule />}
          />
          <Route path="/access-orders" element={<AccessOrders />} />
          <Route path="/ads" element={<Ads />} />
          <Route path="/add-ad" element={<AddAd />} />
          <Route path="/edit-ad/:id" element={<AddAd />} />
          <Route path="/view-ad/:id" element={<ViewAd />} />
          <Route path="/access-analytics" element={<AccessCardAnalytics />} />
          <Route path="/partner-inquiries" element={<PartnerInquiries />} />
          <Route path="/view-partner-inquiry/:id" element={<ViewPartnerInquiry />} />
        </Route>
      </Routes>
    </Router>
    </ConfigProvider>
  );
}

export default App;
