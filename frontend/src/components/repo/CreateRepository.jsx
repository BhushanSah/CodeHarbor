import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";
import "./createRepository.css";
import Navbar from "../Navbar";
import API_BASE_URL from "../../api";

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

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M10.5 3.5 6 8l4.5 4.5M6.3 8H14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CreateRepository = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const owner = currentUser || localStorage.getItem("userId");

  const handleCreateRepository = async (e) => {
    e.preventDefault();

    const cleanName = name.trim();

    if (!owner) {
      navigate("/auth");
      return;
    }

    if (!cleanName) {
      setErrorMessage("Repository name is required.");
      return;
    }

    if (!/^[A-Za-z0-9._-]+$/.test(cleanName)) {
      setErrorMessage(
        "Use letters, numbers, periods, hyphens, or underscores only."
      );
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const res = await axios.post(
        `${API_BASE_URL}/repo/create`,
        {
          owner,
          name: cleanName,
          description: description.trim(),
          visibility,
          content: [],
        }
      );

      const repoId =
        res.data.repoID ||
        res.data.repositoryId ||
        res.data._id;

      if (repoId) {
        navigate(`/repo/${repoId}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Create repository error:", err);

      setErrorMessage(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Could not create the repository. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar/>
    <div className="new-repo-page">
      <main className="new-repo-layout">
        <Link to="/" className="new-repo-back">
          <ArrowLeftIcon />
          Back to dashboard
        </Link>

        <div className="new-repo-grid">
          <section className="new-repo-card">
            <div className="new-repo-heading">
              <div className="new-repo-heading-icon">
                <RepoIcon />
              </div>

              <div>
                <p className="new-repo-eyebrow">CodeHarbor workspace</p>
                <h1>Create a new repository</h1>
                <p>
                  Set up a place for your code, commits, files, and issues.
                </p>
              </div>
            </div>

            <form
              className="new-repo-form"
              onSubmit={handleCreateRepository}
              noValidate
            >
              <div className="new-repo-field">
                <label htmlFor="repository-name">
                  Repository name
                </label>

                <div className="new-repo-name-control">
                  <span>Your workspace /</span>

                  <input
                    id="repository-name"
                    type="text"
                    value={name}
                    placeholder="my-project"
                    autoComplete="off"
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrorMessage("");
                    }}
                  />
                </div>

                <p className="new-repo-hint">
                  Choose a short name using letters, numbers, hyphens,
                  underscores, or periods.
                </p>
              </div>

              <div className="new-repo-field">
                <label htmlFor="repository-description">
                  Description <span>Optional</span>
                </label>

                <textarea
                  id="repository-description"
                  value={description}
                  placeholder="What is this repository for?"
                  rows="4"
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <fieldset className="new-repo-fieldset">
                <legend>Visibility</legend>

                <label
                  className={`visibility-choice ${
                    visibility === "public" ? "is-selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={visibility === "public"}
                    onChange={() => setVisibility("public")}
                  />

                  <GlobeIcon />

                  <span className="visibility-copy">
                    <strong>Public</strong>
                    <small>Anyone can view this repository.</small>
                  </span>
                </label>

                <label
                  className={`visibility-choice ${
                    visibility === "private" ? "is-selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={visibility === "private"}
                    onChange={() => setVisibility("private")}
                  />

                  <LockIcon />

                  <span className="visibility-copy">
                    <strong>Private</strong>
                    <small>Only you can view this repository.</small>
                  </span>
                </label>
              </fieldset>

              {errorMessage && (
                <p className="new-repo-error" role="alert">
                  {errorMessage}
                </p>
              )}

              <div className="new-repo-actions">
                <Link to="/" className="new-repo-cancel">
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="new-repo-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      Creating repository...
                    </>
                  ) : (
                    "Create repository"
                  )}
                </button>
              </div>
            </form>
          </section>

          <aside className="new-repo-help">
            <h2>Before you create</h2>

            <div className="new-repo-help-item">
              <span>01</span>
              <p>
                Give your repository a clear name that explains the project.
              </p>
            </div>

            <div className="new-repo-help-item">
              <span>02</span>
              <p>
                Use public visibility for work you want others to discover.
              </p>
            </div>

            <div className="new-repo-help-item">
              <span>03</span>
              <p>
                You can connect your CodeHarbor CLI and push files after creating it.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
    </>
  );
};

export default CreateRepository;