/** @format */

import { BrowserRouter as Router, Routes, Route } from "react-router";
import { ConfigProvider } from "antd";
import { antdTheme } from "./config/theme";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";
import ChangePassword from "./pages/Sidebar/Settings/ChangePassword/ChangePassword";
import MainLayout from "./components/MainLayout";
import AdminUser from "./pages/AdminManagement/AdminUser";
import ViewAdmin from "./pages/AdminManagement/ViewAdmin";
import AddAdmin from "./pages/AdminManagement/AddAdmin";
import LoginLogs from "./pages/Sidebar/LoginActivity/LoginLogs";
import Error401 from "./pages/ErrorPages/Error401";
import Professionals from "./pages/Professionals/Professionals";
import ViewProfessionals from "./pages/Professionals/ViewProfessionals";
import Specialities from "./pages/Specialities/Specialities";
import AddSpecialities from "./pages/Specialities/AddSpecialities";
import EditSpecialities from "./pages/Specialities/EditSpecialities";
import ProfessionalForm from "./pages/ProfessionalForm/ProfessionalForm";
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
import NewsletterSubscribers from "./pages/Newsletter/NewsletterSubscribers";
import FeatureRequests from "./pages/FeatureRequests/FeatureRequests";
import SearchTerms from "./pages/SearchTerms/SearchTerms";
import HomeSettings from "./pages/HomeSettings/HomeSettings";
import ProfilePages from "./pages/ProfilePages/ProfilePages";
import NewBrandPage from "./pages/ProfilePages/NewBrandPage";
import EditProfilePage from "./pages/ProfilePages/EditProfilePage";
import ProfilePageAnalytics from "./pages/ProfilePages/ProfilePageAnalytics";
import MagazineIssues from "./pages/Magazine/MagazineIssues";
import IssueForm from "./pages/Magazine/IssueForm";
import WatchSeries from "./pages/Watch/WatchSeries";
import WatchVideos from "./pages/Watch/WatchVideos";
import EditVideo from "./pages/Watch/EditVideo";
import DirectoryApplications from "./pages/DirectoryApplications/DirectoryApplications";
import AddDirectoryListing from "./pages/DirectoryApplications/AddDirectoryListing";
import EditDirectoryListing from "./pages/DirectoryApplications/EditDirectoryListing";
import ViewDirectoryApplication from "./pages/DirectoryApplications/ViewDirectoryApplication";
import AccessPricing from "./pages/AccessPricing/AccessPricing";
import AccessSubscriptions from "./pages/AccessSubscriptions/AccessSubscriptions";

// Colours come from the tokens in index.css, which index.tsx loads before this module runs.
const theme = antdTheme();
// antd's static message() / notification() calls render outside the app's tree; give them the same theme.
ConfigProvider.config({ holderRender: (children) => <ConfigProvider theme={theme}>{children}</ConfigProvider> });

function App() {
  return (
    <ConfigProvider theme={theme}>
    <Router>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/error401" element={<Error401 />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/reset-password" element={<ChangePassword />} />
          <Route path="/professionals" element={<Professionals />} />
          <Route
            path="/viewProfessionals/:id"
            element={<ViewProfessionals />}
          />
          <Route path="/adminList" element={<AdminUser />} />
          <Route path="/viewAdmin" element={<ViewAdmin />} />
          <Route path="/addAdmin" element={<AddAdmin />} />

          <Route path="/loginLogs" element={<LoginLogs />} />

          <Route path="/specialities" element={<Specialities />} />
          <Route path="/add-specialities" element={<AddSpecialities />} />
          <Route path="/edit-specialities/:id" element={<EditSpecialities />} />

          <Route path="/form" element={<ProfessionalForm />} />
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
          {/* The admin's order email links straight to one order. */}
          <Route path="/access-orders/:id" element={<AccessOrders />} />
          <Route path="/access-subscriptions" element={<AccessSubscriptions />} />
          <Route path="/access-pricing" element={<AccessPricing />} />
          <Route path="/ads" element={<Ads />} />
          <Route path="/add-ad" element={<AddAd />} />
          <Route path="/edit-ad/:id" element={<AddAd />} />
          <Route path="/view-ad/:id" element={<ViewAd />} />
          <Route path="/access-analytics" element={<AccessCardAnalytics />} />
          <Route path="/partner-inquiries" element={<PartnerInquiries />} />
          <Route path="/view-partner-inquiry/:id" element={<ViewPartnerInquiry />} />
          <Route path="/feature-requests" element={<FeatureRequests />} />
          <Route path="/newsletter" element={<NewsletterSubscribers />} />
          <Route path="/home-page" element={<HomeSettings />} />
          <Route path="/search-terms" element={<SearchTerms />} />
          <Route path="/pages" element={<ProfilePages />} />
          <Route path="/pages/new" element={<NewBrandPage />} />
          <Route path="/pages/:userId" element={<EditProfilePage />} />
          <Route path="/pages/:userId/analytics" element={<ProfilePageAnalytics />} />
          <Route path="/magazine" element={<MagazineIssues />} />
          <Route path="/magazine/add" element={<IssueForm />} />
          <Route path="/magazine/edit/:id" element={<IssueForm />} />
          <Route path="/watch/videos" element={<WatchVideos />} />
          <Route path="/watch/videos/:id" element={<EditVideo />} />
          <Route path="/watch/series" element={<WatchSeries />} />
          <Route path="/directory-applications" element={<DirectoryApplications />} />
          <Route path="/directory-applications/add" element={<AddDirectoryListing />} />
          <Route path="/directory-applications/edit/:id" element={<EditDirectoryListing />} />
          <Route path="/directory-applications/:id" element={<ViewDirectoryApplication />} />
        </Route>
      </Routes>
    </Router>
    </ConfigProvider>
  );
}

export default App;
