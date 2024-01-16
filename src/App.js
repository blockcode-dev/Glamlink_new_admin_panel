import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";
import ChangePassword from "./pages/Sidebar/Settings/ChangePassword/ChangePassword";
import Forgotpassword from "./pages/Forgotpassword";
import MainLayout from "./components/MainLayout";
import AdminList from "./pages/AdminList";
import RoleList from "./pages/Roles/RoleList";
import AddRole from "./pages/Roles/AddRole";
import EditRole from "./pages/Roles/EditRole";
import Customers from "./pages/Customer/Customers";
import AddCustomer from "./pages/Customer/AddCustomer";
import ViewCustomer from "./pages/Customer/ViewCustomer";
import AdminUser from "./pages/AdminManagement/AdminUser";
import ViewAdmin from "./pages/AdminManagement/ViewAdmin";
import AddAdmin from "./pages/AdminManagement/AddAdmin";
import EditAdmin from "./pages/AdminManagement/EditAdmin";
import LoginLogs from "./pages/Sidebar/LoginActivity/LoginLogs"
import Settings from "./pages/Sidebar/Settings/Settings";
import FirebaseNotification from "./pages/FirebaseNotification/FirebaseNotification";
import FirebaseChat from "./pages/FirebaseChat/FirebaseChat";
import Service from "./pages/Services/Service/Service";
import AddService from "./pages/Services/Service/AddService";
import EditService from "./pages/Services/Service/EditService";
import ViewService from "./pages/Services/Service/ViewService";
import Bookings from "./pages/Services/Bookings/Bookings";
import GuestBookings from "./pages/Services/GuestBookings/GuestBookings";
import ProductList from "./pages/ECommerce/Product/ProductList";
import AddProduct from "./pages/ECommerce/Product/AddProduct";
import ViewProduct from "./pages/ECommerce/Product/ViewProduct";
import EditProduct from "./pages/ECommerce/Product/EditProduct";
import Orders from "./pages/ECommerce/Orders/Orders";
import TermsAndConditions from "./pages/Content/TermsConditions/TermsAndConditions";
import AddTermsAndConditions from "./pages/Content/TermsConditions/AddTermsAndConditions";
import EditTermsAndConditions from "./pages/Content/TermsConditions/EditTermsAndConditions";
import Support from "./pages/Content/Support/Support";
import EditSupport from "./pages/Content/Support/EditSupport";
import AddSupport from "./pages/Content/Support/AddSupport";
import AboutUs from "./pages/Content/AboutUs/AboutUs";
import AddAboutUs from "./pages/Content/AboutUs/AddAboutUs";
import EditAboutUs from "./pages/Content/AboutUs/EditAboutUs";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/forgot-password" element={<Forgotpassword />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/reset-password" element={<ChangePassword />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/addCustomer" element={<AddCustomer />} />
          <Route path="/viewCustomer/:id" element={<ViewCustomer />} />
          <Route path="adminUser" element={<AdminList />} />
          <Route path="/role-list" element={<RoleList />} />
          <Route path="/addRole" element={<AddRole />} />
          <Route path="/editRole/:id" element={<EditRole />} />
          <Route path="/adminList" element={<AdminUser />} />
          <Route path="/viewAdmin" element={<ViewAdmin />} />
          <Route path="/addAdmin" element={<AddAdmin />} />
          <Route path="/editAdmin/:id" element={<EditAdmin />} />
          <Route path="/loginLogs" element={<LoginLogs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<FirebaseNotification />} />
          <Route path="/chats" element={<FirebaseChat />} />
          <Route path="/services" element={<Service />} />
          <Route path="/addService" element={<AddService />} />
          <Route path="/editService" element={<EditService />} />
          <Route path="/viewService" element={<ViewService />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/guestBookings" element={<GuestBookings />} />
          <Route path="/productList" element={<ProductList />} />
          <Route path="/addProduct" element={<AddProduct />} />
          <Route path="/viewProduct" element={<ViewProduct />} />
          <Route path="/editProduct" element={<EditProduct />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/termsAndConditions" element={<TermsAndConditions />} />
          <Route path="/addTermsAndConditions" element={<AddTermsAndConditions />} />
          <Route path="/editTermsAndConditions" element={<EditTermsAndConditions />} />
          <Route path="/support" element={<Support />} />
          <Route path="/editSupport" element={<EditSupport />} />
          <Route path="/addSupport" element={<AddSupport />} />
          <Route path="/aboutUs" element={<AboutUs />} />
          <Route path="/addAboutUs" element={<AddAboutUs />} />
          <Route path="/editAboutUs" element={<EditAboutUs />} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
