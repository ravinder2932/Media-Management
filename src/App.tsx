import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ShareDownload } from './components/ShareFile/ShareDownload';
import { LoginForm } from './components/auth/LoginForm';
import { useAuthStore } from './store/useAuthStore';
import { ToastContainer } from './components/ui/ToastContainer';
import { Footer } from './components/ui/Footer';
import { Dashboard } from './components/Dashboard';
import { FileList } from './components/FileList';
import { FileUpload } from './components/FileUpload/FileUpload';
import { UserManagement } from './components/admin/UserManagement';
import { AuditLogs } from './components/admin/AuditLogs';
import { QuickShare } from './components/QuickShare';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/Tabs';

function MainApp() {
  const currentUser = useAuthStore(state => state.currentUser);
  
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 w-[95%] md:w-[85%] mx-auto py-8">
          <LoginForm />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Media Organize Portal</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {currentUser.name}
              </span>
              <button
                onClick={() => useAuthStore.getState().logout()}
                className="text-sm text-red-600 hover:text-red-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-[95%] md:w-[85%] mx-auto py-8">
        <Tabs defaultValue="dashboard">
          <TabsList className="mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            {currentUser.permissions.upload && (
              <TabsTrigger value="upload">Upload</TabsTrigger>
            )}
            <TabsTrigger value="quick-share">Quick Share</TabsTrigger>
            {currentUser.role === 'super_admin' && (
              <>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="audit">Audit Logs</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="files">
            <FileList />
          </TabsContent>

          {currentUser.permissions.upload && (
            <TabsContent value="upload">
              <FileUpload />
            </TabsContent>
          )}

          <TabsContent value="quick-share">
            <QuickShare />
          </TabsContent>

          {currentUser.role === 'super_admin' && (
            <>
              <TabsContent value="users">
                <UserManagement />
              </TabsContent>
              <TabsContent value="audit">
                <AuditLogs />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>

      <Footer />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/share/:id" element={<ShareDownload />} />
        <Route path="/*" element={<MainApp />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}