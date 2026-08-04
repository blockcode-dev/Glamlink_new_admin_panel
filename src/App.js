/** @format */

import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";
import ChangePassword from "./pages/Sidebar/Settings/ChangePassword/ChangePassword";
import Forgotpassword from "./pages/Forgotpassword";
import MainLayout from "./components/MainLayout";
import AdminList from "./pages/AdminList";
import User from "./pages/Customer/User";
import AddUser from "./pages/Customer/AddUser";
import ViewCustomer from "./pages/Customer/ViewCustomer";
import AdminUser from "./pages/AdminManagement/AdminUser";
import ViewAdmin from "./pages/AdminManagement/ViewAdmin";
import AddAdmin from "./pages/AdminManagement/AddAdmin";
import EditAdmin from "./pages/AdminManagement/EditAdmin";
import LoginLogs from "./pages/Sidebar/LoginActivity/LoginLogs";
import Settings from "./pages/Sidebar/Settings/Settings";
import Service from "./pages/Services/Service";
import AddService from "./pages/Services/AddService";
import EditService from "./pages/Services/EditService";
import ViewService from "./pages/Services/ViewService";
import TermsAndConditions from "./pages/Content/TermsConditions/TermsAndConditions";
import AddTermsAndConditions from "./pages/Content/TermsConditions/AddTermsAndConditions";
import EditTermsAndConditions from "./pages/Content/TermsConditions/EditTermsAndConditions";
import Support from "./pages/Content/Support/Support";
import EditSupport from "./pages/Content/Support/EditSupport";
import AddSupport from "./pages/Content/Support/AddSupport";
import AboutUs from "./pages/Content/AboutUs/AboutUs";
import AddAboutUs from "./pages/Content/AboutUs/AddAboutUs";
import EditAboutUs from "./pages/Content/AboutUs/EditAboutUs";
import Error401 from "./pages/ErrorPages/Error401";
import ServiceCategory from "./pages/ServiceCategory/ServiceCategory";
import AddServiceCategory from "./pages/ServiceCategory/AddServiceCategroy";
import EditServiceCategory from "./pages/ServiceCategory/EditServiceCategory";
import ViewSericeCategory from "./pages/ServiceCategory/ViewSericeCategory";
import Blogs from "./pages/Blogs/Blogs";
import AddBlog from "./pages/Blogs/AddBlog";
import ViewBlog from "./pages/Blogs/ViewBlog";
import EditBlog from "./pages/Blogs/EditBlog";
import BlogCategory from "./pages/BlogCategory/BlogCategory";
import AddBlogCategory from "./pages/BlogCategory/AddBlogCategory";
import EditBlogCategory from "./pages/BlogCategory/EditBlogCategory";
import Professionals from "./pages/Professionals/Professionals";
import ViewProfessionals from "./pages/Professionals/ViewProfessionals.jsx";
import Specialities from "./pages/Specialities/Specialities";
import AddSpecialities from "./pages/Specialities/AddSpecialities";
import EditSpecialities from "./pages/Specialities/EditSpecialities";
import Appointments from "./pages/Appointments/Appointments";
import Posts from "./pages/Post/Post";
import Clips from "./pages/Clips/Clips";
import UploadCSV from "./pages/ServiceCategory/UploadCSV.jsx";
import UserPost from "./pages/Customer/Data/UserPost.jsx";
import UserFollower from "./pages/Customer/Data/UserFollower.jsx";
import UserFollowing from "./pages/Customer/Data/UserFollowing.jsx";
import UserClips from "./pages/Customer/Data/UserClips.jsx";
import PostLiked from "./pages/Customer/Data/PostLiked.jsx";
import PostComment from "./pages/Customer/Data/PostComment.jsx";
import ClipsLiked from "./pages/Customer/Data/ClipsLiked.jsx";
import ClipsCommented from "./pages/Customer/Data/ClipsCommented.jsx";
import ReviewsGiven from "./pages/Customer/Data/ReviewsGiven.jsx";
import ReviewsTaken from "./pages/Customer/Data/ReviewsTaken.jsx";
import UserBookings from "./pages/Customer/Data/UserBookings.jsx";
import ProfessionalBooking from "./pages/Customer/Data/ProfessionalBooking.jsx";
import UserService from "./pages/Customer/Data/UserService.jsx";
import Availability from "./pages/Customer/Data/Availability.jsx";
import ProductCategory from "./pages/Ecommerce/ProductCategory/ProductCategory.jsx";
import EditProductCategory from "./pages/Ecommerce/ProductCategory/EditProductCategory.jsx";
import AddProductCategory from "./pages/Ecommerce/ProductCategory/AddProductCategory.jsx";
import Product from "./pages/Ecommerce/Product/Product.jsx";
import ViewProduct from "./pages/Ecommerce/Product/ViewProduct.jsx";
import Ratings from "./pages/Ecommerce/Product/Rating.jsx";
import Orders from "./pages/Ecommerce/Order/Orders.jsx";
import ViewOrder from "./pages/Ecommerce/Order/ViewOrder.jsx";
import PromotionRequest from "./pages/PromotionRequest/PromotionRequest.jsx";
import ProfessionalForm from "./pages/ProfessionalForm/ProfessionalForm.jsx";
import Banner from "./pages/Banner/Banner.jsx";
import Faq from "./pages/Content/FAQ/Faq.jsx";
import CreateFaq from "./pages/Content/FAQ/CreateFaq.jsx";
import EditFaq from "./pages/Content/FAQ/EditFaq.jsx";
import Referral from "./pages/Referral/Referral.jsx";
import RewardRules from "./pages/RewardRules/RewardRules.jsx";
import BusinessCard from "./pages/BusinessCard/BusinessCard.jsx";
import JournalCategory from "./pages/Journal/JournalCategory/JournalCategory.jsx";
import Authors from "./pages/Journal/Authors/Authors.jsx";
import Journal from "./pages/Journal/Journal/Journal.jsx";
import AddJournal from "./pages/Journal/Journal/AddJournal.jsx";
import EditJournal from "./pages/Journal/Journal/EditJournal.jsx";
import Directroy from "./pages/Directory/Directroy.jsx";
import CreateBusinessCard from "./pages/BusinessCard/CreateBusinessCard.jsx";
import EditBusinessCard from "./pages/BusinessCard/EditBusinessCard.jsx";
import PodcastSchedule from "./pages/Podcast/PodcastSchedule.jsx";
import AddPodcastSchedule from "./pages/Podcast/AddPodcastSchedule.jsx";
import EditPodcastSchedule from "./pages/Podcast/EditPodcastSchedule.jsx";
import TestBusinessCardPayment from "./pages/BusinessCard/TestBusinessCardPayment.jsx";
import RazorpayTest from "./pages/RazorpayTest.jsx";
import Education from "./pages/Journal/Discover/Eductaion/Eduction.jsx";
import AddEducation from "./pages/Journal/Discover/Eductaion/AddEduction.jsx";
import EditEducation from "./pages/Journal/Discover/Eductaion/EditEducation.jsx";
import Event from "./pages/Journal/Discover/Event/Event.jsx";
import AddEvent from "./pages/Journal/Discover/Event/AddEvent.jsx";
import EditEvent from "./pages/Journal/Discover/Event/EditEvent.jsx";
import Shop from "./pages/Journal/Discover/Shop/Shop.jsx";
import AddShop from "./pages/Journal/Discover/Shop/AddShop.jsx";
import EditShop from "./pages/Journal/Discover/Shop/EditShop.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/forgot-password" element={<Forgotpassword />} />
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
          <Route path="/addUser" element={<AddUser />} />
          <Route path="/viewUser/:id" element={<ViewCustomer />} />
          <Route path="adminUser" element={<AdminList />} />
          <Route path="/adminList" element={<AdminUser />} />
          <Route path="/viewAdmin" element={<ViewAdmin />} />
          <Route path="/addAdmin" element={<AddAdmin />} />
          <Route path="/editAdmin/:id" element={<EditAdmin />} />
          <Route path="/loginLogs" element={<LoginLogs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/services" element={<Service />} />
          <Route path="/addService" element={<AddService />} />
          <Route path="/editService/:id" element={<EditService />} />
          <Route path="/viewService/:id" element={<ViewService />} />
          <Route path="/service-categories" element={<ServiceCategory />} />
          <Route
            path="/add-service-categories"
            element={<AddServiceCategory />}
          />
          <Route
            path="/edit-service-categories/:id"
            element={<EditServiceCategory />}
          />
          <Route
            path="/view-service-categories/:id"
            element={<ViewSericeCategory />}
          />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/add-blogs" element={<AddBlog />} />
          <Route path="/view-blog/:id" element={<ViewBlog />} />
          <Route path="/edit-blog/:id" element={<EditBlog />} />
          <Route path="/blogs-categories" element={<BlogCategory />} />
          <Route path="/add-blogs-categories" element={<AddBlogCategory />} />
          <Route
            path="/edit-blogs-categories/:id"
            element={<EditBlogCategory />}
          />
          <Route
            path="/edit-blogs-categories/:id"
            element={<EditBlogCategory />}
          />
          <Route path="/specialities" element={<Specialities />} />
          <Route path="/add-specialities" element={<AddSpecialities />} />
          <Route path="/edit-specialities/:id" element={<EditSpecialities />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/posts-list" element={<Posts />} />
          <Route path="/clips-list" element={<Clips />} />
          <Route path="/termsAndConditions" element={<TermsAndConditions />} />
          <Route
            path="/addTermsAndConditions"
            element={<AddTermsAndConditions />}
          />
          <Route
            path="/editTermsAndConditions"
            element={<EditTermsAndConditions />}
          />
          <Route path="/support" element={<Support />} />
          <Route path="/editSupport/:id" element={<EditSupport />} />
          <Route path="/addSupport" element={<AddSupport />} />
          <Route path="/aboutUs" element={<AboutUs />} />
          <Route path="/addAboutUs" element={<AddAboutUs />} />
          <Route path="/editAboutUs" element={<EditAboutUs />} />
          <Route path="/UploadCSV" element={<UploadCSV category_id={3} />} />
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
          <Route path="/view-order/:id" element={<ViewOrder />} />
          <Route path="/promotion-request" element={<PromotionRequest />} />
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
          <Route
            path="/test-business-card-payment"
            element={<TestBusinessCardPayment />}
          />
          <Route path="/razorpay" element={<RazorpayTest />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
