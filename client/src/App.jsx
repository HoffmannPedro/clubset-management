import { useAuth, AuthProvider } from './context/AuthContext';
import AdminPanel from './components/admin/AdminPanel';
import Login from './pages/Login';

// Componente Wrapper para decidir qué mostrar
const MainApp = () => {
    const { user } = useAuth();

    // Si hay usuario, mostramos el Panel. Si no, el Login.
    return user ? <AdminPanel /> : <Login />;
};

function App() {
    return (
        <AuthProvider>
            <MainApp />
        </AuthProvider>
    );
}

export default App;