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
import Test from "./pages/test";
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
import Specialities from "./pages/Specialities/Specialities";
import AddSpecialities from "./pages/Specialities/AddSpecialities";
import EditSpecialities from "./pages/Specialities/EditSpecialities";
import Appointments from "./pages/Appointments/Appointments";
import Posts from "./pages/Post/Post";
import Clips from "./pages/Clips/Clips";
import UploadCSV from "./pages/ServiceCategory/UploadCSV.jsx";


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
					<Route path="/addUser" element={<AddUser />} />
					<Route path="/viewUser/:id" element={<ViewCustomer />} />
					<Route path="/test" element={<Test />} />
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
					<Route path="/add-service-categories" element={<AddServiceCategory />} />
					<Route path="/edit-service-categories/:id" element={<EditServiceCategory />} />
					<Route path="/view-service-categories/:id" element={<ViewSericeCategory />} />
					<Route path="/blogs" element={<Blogs />} />
					<Route path="/add-blogs" element={<AddBlog />} />
					<Route path="/view-blog/:id" element={<ViewBlog />} />
					<Route path="/edit-blog/:id" element={<EditBlog />} />
					<Route path="/blogs-categories" element={<BlogCategory />} />
					<Route path="/add-blogs-categories" element={<AddBlogCategory />} />
					<Route path="/edit-blogs-categories/:id" element={<EditBlogCategory />} />
					<Route path="/edit-blogs-categories/:id" element={<EditBlogCategory />} />
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
					
	
				</Route>
			</Routes>
		</Router>
	);
}

export default App;
