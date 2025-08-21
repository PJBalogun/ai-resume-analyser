import {Link} from "react-router";
import {usePuterStore} from "~/lib/puter";
import ThemeToggle from "~/components/ThemeToggle";

const Navbar = () => {
    const { auth } = usePuterStore();
    
    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">ResumeAI Pro</p>
            </Link>
            <div className="flex items-center gap-4">
                <ThemeToggle />
                <Link to="/upload" className="primary-button w-fit">
                    Upload Resume
                </Link>
                {auth.isAuthenticated && (
                    <button onClick={auth.signOut} className="logout-button">
                        <span>Logout</span>
                    </button>
                )}
            </div>
        </nav>
    )
}
export default Navbar
