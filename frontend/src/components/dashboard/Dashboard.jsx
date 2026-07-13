import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Navbar from "../Navbar";
import API_BASE_URL from "../../api";

const RepoIcon = () => (
  <svg
    className="repo-icon"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 2.5A1.5 1.5 0 0 1 4.5 1h6A1.5 1.5 0 0 1 12 2.5v11.3a.5.5 0 0 1-.8.4L8 12.3l-3.2 1.9a.5.5 0 0 1-.8-.4V2.5Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    className="search-icon"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="M11 11l3.5 3.5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const RepoCard = ({ repo, onSelect }) => (
  <button
    type="button"
    className="repo-card"
    onClick={() => onSelect(repo._id)}
  >
    <div className="repo-card-header">
      <RepoIcon />

      <h4 className="repo-name">{repo.name}</h4>

      {repo.visibility && (
        <span className={`badge badge--${repo.visibility}`}>
          {repo.visibility}
        </span>
      )}
    </div>

    {repo.description && (
      <p className="repo-description">{repo.description}</p>
    )}

    <div className="repo-meta">
      {repo.language && (
        <span className="repo-meta-item">
          <span className="lang-dot" />
          {repo.language}
        </span>
      )}

      {typeof repo.stars === "number" && (
        <span className="repo-meta-item">★ {repo.stars}</span>
      )}
    </div>
  </button>
);

const Dashboard = () => {
  const navigate = useNavigate();

  const [repositories, setRepositories] = useState([]);
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [loadingRepos, setLoadingRepos] = useState(true);
  const [loadingSuggested, setLoadingSuggested] = useState(true);

  const [repoError, setRepoError] = useState("");
  const [suggestedError, setSuggestedError] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchRepositories = async () => {
      if (!userId) {
        setLoadingRepos(false);
        return;
      }

      try {
        const res = await axios.get(
          `${API_BASE_URL}/repo/user/${userId}`
        );

        setRepositories(
          Array.isArray(res.data) ? res.data : res.data.repositories || []
        );
      } catch (err) {
        console.error(
          "Could not fetch your repositories:",
          err.response?.status,
          err.response?.data || err.message
        );

        setRepoError(
          err.response?.data?.message ||
            "Could not load your repositories."
        );
      } finally {
        setLoadingRepos(false);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/repo/public`);

        setSuggestedRepositories(
          Array.isArray(res.data) ? res.data : res.data.repositories || []
        );
      } catch (err) {
        console.error(
          "Could not fetch suggested repositories:",
          err.response?.status,
          err.response?.data || err.message
        );

        setSuggestedError(
          err.response?.data?.message ||
            "Could not load suggested repositories."
        );
      } finally {
        setLoadingSuggested(false);
      }
    };

    fetchRepositories();
    fetchSuggestedRepositories();
  }, []);

  const searchResults = useMemo(() => {
    const cleanedQuery = searchQuery.trim().toLowerCase();

    if (!cleanedQuery) {
      return repositories;
    }

    return repositories.filter((repo) => {
      const name = repo.name?.toLowerCase() || "";
      const description = repo.description?.toLowerCase() || "";

      return (
        name.includes(cleanedQuery) ||
        description.includes(cleanedQuery)
      );
    });
  }, [searchQuery, repositories]);

  const openRepository = (repoId) => {
    navigate(`/repo/${repoId}`);
  };

  return (
    <>
    <Navbar/>
    <div className="dashboard-page">
      <section className="dash-layout">
        <aside className="dash-aside">
          <h3 className="dash-heading">Suggested Repositories</h3>

          {loadingSuggested ? (
            <p className="dash-empty">Loading repositories...</p>
          ) : suggestedError ? (
            <p className="dash-empty">{suggestedError}</p>
          ) : suggestedRepositories.length === 0 ? (
            <p className="dash-empty">No suggested repositories yet.</p>
          ) : (
            <div className="repo-list">
              {suggestedRepositories.map((repo) => (
                <RepoCard
                  key={repo._id}
                  repo={repo}
                  onSelect={openRepository}
                />
              ))}
            </div>
          )}
        </aside>

        <main className="dash-main">
          <div className="dash-main-header">
            <div>
              <h3 className="dash-heading">Your Repositories</h3>
              {/* <p className="dash-empty">
                {repositories.length} repository
                {repositories.length === 1 ? "" : "ies"}
              </p> */}
            </div>
          </div>

          <div id="search" className="dash-search">
            <SearchIcon />

            <input
              type="text"
              value={searchQuery}
              placeholder="Find a repository..."
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dash-search-input"
            />
          </div>

          {loadingRepos ? (
            <p className="dash-empty">Loading your repositories...</p>
          ) : repoError ? (
            <p className="dash-empty">{repoError}</p>
          ) : repositories.length === 0 ? (
            <p className="dash-empty">
              You have no repositories yet. Create one to get started.
            </p>
          ) : searchResults.length === 0 ? (
            <p className="dash-empty">
              No repositories match “{searchQuery}”.
            </p>
          ) : (
            <div className="repo-list repo-grid">
              {searchResults.map((repo) => (
                <RepoCard
                  key={repo._id}
                  repo={repo}
                  onSelect={openRepository}
                />
              ))}
            </div>
          )}
        </main>
        <aside className="dash-aside">
          <h3 className="dash-heading">Quick Start</h3>

          <div className="quick-start-card">
            <p>Start tracking a project with CodeHarbor.</p>

            <ol className="quick-start-list">
              <li>Create a repository</li>
              <li>Connect your local folder</li>
              <li>Push your first commit</li>
            </ol>

            <button
              type="button"
              className="quick-start-button"
              onClick={() => navigate("/docs")}
            >
              View CLI docs →
            </button>
          </div>
        </aside>
      </section>
    </div>
    </>
  );
};

export default Dashboard;