import {Link, NavLink} from "react-router";
import {usePuterStore} from "~/lib/puter";
import ThemeToggle from "~/components/ThemeToggle";
import Brand from './Brand';

const Navbar = () => {
    const { auth } = usePuterStore();
    
    return (
        <nav className="navbar">
            <Brand />
            <div className="nav-actions">
                <NavLink to="/" end className="nav-link">My resumes</NavLink>
                <ThemeToggle />
                <Link to="/upload" className="primary-button w-fit">
                    <span aria-hidden="true">＋</span> Upload resume
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
