import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";
import "./Profile.css";
import Navbar from "../Navbar";

const UserIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="5" r="2.8" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="M2.5 14c.3-3 2.5-4.7 5.5-4.7s5.2 1.7 5.5 4.7"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const RepoIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M3 2.5A1.5 1.5 0 0 1 4.5 1h6A1.5 1.5 0 0 1 12 2.5v11.3a.5.5 0 0 1-.8.4L8 12.3l-3.2 1.9a.5.5 0 0 1-.8-.4V2.5Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
    <path
      d="M2 8h12M8 2c1.8 1.7 2.7 3.7 2.7 6S9.8 12.3 8 14M8 2C6.2 3.7 5.3 5.7 5.3 8S6.2 12.3 8 14"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect
      x="3"
      y="7"
      width="10"
      height="7"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <path
      d="M5 7V5a3 3 0 0 1 6 0v2"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M6.5 3H4.2A1.2 1.2 0 0 0 3 4.2v7.6A1.2 1.2 0 0 0 4.2 13h2.3"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M9 5l3 3-3 3M12 8H6"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M6 3.5 10.5 8 6 12.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const formatDate = (value) => {
  if (!value) return "Recently";

  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Recently";
  }
};

const Profile = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const userId = currentUser || localStorage.getItem("userId");

  const [user, setUser] = useState(null);
  const [repositories, setRepositories] = useState([]);

  const [userLoading, setUserLoading] = useState(true);
  const [repoLoading, setRepoLoading] = useState(true);

  const [userError, setUserError] = useState("");
  const [repoError, setRepoError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setUserLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:3000/userProfile/${userId}`
        );

        console.log("User profile:", res.data);
        setUser(res.data);
      } catch (err) {
        console.error(
          "Could not load user profile:",
          err.response?.status,
          err.response?.data || err.message
        );

        setUserError(
          err.response?.data?.message ||
            "Could not load your profile."
        );
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  useEffect(() => {
    const fetchRepositories = async () => {
      if (!userId) {
        setRepoLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:3000/repo/user/${userId}`
        );

        const repoList = Array.isArray(res.data)
          ? res.data
          : res.data.repositories || [];

        console.log("Profile repositories:", repoList);
        setRepositories(repoList);
      } catch (err) {
        console.error(
          "Could not load profile repositories:",
          err.response?.status,
          err.response?.data || err.message
        );

        // No repositories is normal, so do not show it as an error.
        if (err.response?.status !== 404) {
          setRepoError(
            err.response?.data?.message ||
              "Could not load your repositories."
          );
        }
      } finally {
        setRepoLoading(false);
      }
    };

    fetchRepositories();
  }, [userId]);

  const username = user?.username || "CodeHarbor user";
  const email = user?.email || "Email unavailable";

  const avatarInitial = username.trim().charAt(0).toUpperCase() || "U";

  const publicRepoCount = repositories.filter(
    (repo) => repo.visibility !== "private"
  ).length;

  const privateRepoCount = repositories.filter(
    (repo) => repo.visibility === "private"
  ).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("email");

    setCurrentUser(null);
    navigate("/auth", { replace: true });
  };

  return (
    <>
    <Navbar/>
    <div className="profile-page">
      <main className="profile-layout">
        <aside className="profile-sidebar">
          <section className="profile-card">
            <div className="profile-avatar" aria-hidden="true">
              {userLoading ? "..." : avatarInitial}
            </div>

            <div className="profile-identity">
              <h1>{userLoading ? "Loading..." : username}</h1>
              <p>{userLoading ? "@loading" : `@${username}`}</p>
            </div>

            <p className="profile-bio">
              Building projects, tracking changes, and shipping ideas through
              CodeHarbor.
            </p>

            <div className="profile-contact">
              <UserIcon />
              <span>{userLoading ? "Loading email..." : email}</span>
            </div>

            {userError && (
              <p className="profile-error-message">{userError}</p>
            )}

            <div className="profile-stats">
              <div>
                <strong>{repositories.length}</strong>
                <span>Repositories</span>
              </div>

              <div>
                <strong>{publicRepoCount}</strong>
                <span>Public</span>
              </div>

              <div>
                <strong>{privateRepoCount}</strong>
                <span>Private</span>
              </div>
            </div>

            <button
              type="button"
              className="profile-logout"
              onClick={handleLogout}
            >
              <LogoutIcon />
              Sign out
            </button>
          </section>
        </aside>

        <section className="profile-content">
          <div className="profile-content-header">
            <div>
              <p className="profile-eyebrow">Your workspace</p>
              <h2>Repositories</h2>
            </div>
          </div>

          {repoLoading ? (
            <div className="profile-empty">
              <span className="spinner" aria-hidden="true" />
              Loading repositories...
            </div>
          ) : repoError ? (
            <div className="profile-empty profile-error">
              {repoError}
            </div>
          ) : repositories.length === 0 ? (
            <div className="profile-empty">
              <RepoIcon />
              <h3>No repositories yet</h3>
              <p>Create your first repository to start using CodeHarbor.</p>

              <Link to="/create" className="profile-create-button">
                Create repository
              </Link>
            </div>
          ) : (
            <div className="profile-repo-list">
              {repositories.map((repo) => (
                <Link
                  key={repo._id}
                  to={`/repo/${repo._id}`}
                  className="profile-repo-card"
                >
                  <div className="profile-repo-icon">
                    <RepoIcon />
                  </div>

                  <div className="profile-repo-info">
                    <div className="profile-repo-title">
                      <h3>{repo.name}</h3>

                      <span
                        className={`profile-visibility profile-visibility--${
                          repo.visibility || "public"
                        }`}
                      >
                        {repo.visibility === "private" ? (
                          <LockIcon />
                        ) : (
                          <GlobeIcon />
                        )}

                        {repo.visibility || "public"}
                      </span>
                    </div>

                    <p>
                      {repo.description || "No description provided."}
                    </p>

                    <span className="profile-repo-date">
                      Updated {formatDate(repo.updatedAt)}
                    </span>
                  </div>

                  <span className="profile-repo-arrow">
                    <ArrowIcon />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
    </>
  );
};

export default Profile;