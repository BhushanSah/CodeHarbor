import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import "./repositoryPage.css";
import Navbar from "../Navbar";

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

const FileIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M4 1.8h5l3 3v9.4H4a1 1 0 0 1-1-1V2.8a1 1 0 0 1 1-1Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M9 1.8v3h3"
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

const ClockIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="5.8" stroke="currentColor" strokeWidth="1.3" />
    <path
      d="M8 4.5V8l2.4 1.5"
      stroke="currentColor"
      strokeWidth="1.3"
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

const RepositoryPage = () => {
  const { id } = useParams();

  const [repository, setRepository] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [s3Files, setS3Files] = useState([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [filesError, setFilesError] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState("");

  const [copiedCommand, setCopiedCommand] = useState(false);

  useEffect(() => {
    const fetchRepository = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const res = await axios.get(
          `http://localhost:3000/repo/id/${id}`
        );

        setRepository(res.data);
      } catch (err) {
        console.error(
          "Could not load repository:",
          err.response?.status,
          err.response?.data || err.message
        );

        setErrorMessage(
          err.response?.data?.message ||
            "Could not load this repository."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRepository();
  }, [id]);

  useEffect(() => {
    const fetchS3Files = async () => {
      try {
        setFilesLoading(true);
        setFilesError("");

        const token = localStorage.getItem("token");

        const config = token
          ? {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          : {};

        const res = await axios.get(
          `http://localhost:3000/repo/${id}/files`,
          config
        );

        setS3Files(res.data.files || []);
      } catch (err) {
        console.error(
          "Could not load S3 files:",
          err.response?.status,
          err.response?.data || err.message
        );

        setS3Files([]);

        setFilesError(
          err.response?.data?.message ||
            "Could not load files from AWS S3."
        );
      } finally {
        setFilesLoading(false);
      }
    };

    fetchS3Files();
  }, [id]);

  const openFile = async (file) => {
    try {
      setSelectedFile(file);
      setFileContent("");
      setFileError("");
      setFileLoading(true);

      const token = localStorage.getItem("token");

      const config = {
        params: {
          key: file.key,
        },
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      };

      const res = await axios.get(
        `http://localhost:3000/repo/${id}/file`,
        config
      );

      setFileContent(res.data.content || "");
    } catch (err) {
      console.error(
        "Could not open file:",
        err.response?.status,
        err.response?.data || err.message
      );

      setFileError(
        err.response?.data?.message ||
          "Could not open this file."
      );
    } finally {
      setFileLoading(false);
    }
  };

  const remoteCommand = `codeharbor remote add origin ${id}`;

  const handleCopyRemoteCommand = async () => {
    try {
      await navigator.clipboard.writeText(remoteCommand);

      setCopiedCommand(true);

      window.setTimeout(() => {
        setCopiedCommand(false);
      }, 1800);
    } catch (err) {
      console.error("Could not copy command:", err);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="repository-page">
          <main className="repository-layout">
            <div className="repository-loading">
              <span className="spinner" aria-hidden="true" />
              Loading repository...
            </div>
          </main>
        </div>
      </>
    );
  }

  if (errorMessage || !repository) {
    return (
      <>
        <Navbar />

        <div className="repository-page">
          <main className="repository-layout">
            <Link to="/" className="repository-back">
              <ArrowLeftIcon />
              Back to dashboard
            </Link>

            <div className="repository-error">
              {errorMessage || "Repository not found."}
            </div>
          </main>
        </div>
      </>
    );
  }

  const files = s3Files;
  const visibility = repository.visibility || "public";

  const issueCount = Array.isArray(repository.issues)
    ? repository.issues.length
    : 0;

  return (
    <>
      <Navbar />

      <div className="repository-page">
        <main className="repository-layout">
          <Link to="/" className="repository-back">
            <ArrowLeftIcon />
            Back to dashboard
          </Link>

          <section className="repository-header">
            <div className="repository-title-row">
              <div className="repository-title-icon">
                <RepoIcon />
              </div>

              <div>
                <p className="repository-eyebrow">Repository</p>

                <div className="repository-name-row">
                  <h1>{repository.name}</h1>

                  <span
                    className={`repository-visibility repository-visibility--${visibility}`}
                  >
                    {visibility === "private" ? <LockIcon /> : <GlobeIcon />}
                    {visibility}
                  </span>
                </div>
              </div>
            </div>

            <p className="repository-description">
              {repository.description || "No description provided."}
            </p>

            <div className="repository-summary">
              <span>
                <RepoIcon />
                {files.length} item{files.length === 1 ? "" : "s"}
              </span>

              <span>
                <ClockIcon />
                Updated {formatDate(repository.updatedAt)}
              </span>

              <span>Issues: {issueCount}</span>
            </div>
          </section>

          <section className="repository-content-grid">
            <div className="repository-main-column">
              <div className="repository-tabs">
                <Link
                  to={`/repo/${id}`}
                  className="repository-tab is-active"
                >
                  Code
                </Link>

                <Link
                  to={`/repo/${id}/issues`}
                  className="repository-tab"
                >
                  Issues
                  <span>{issueCount}</span>
                </Link>
              </div>

              <section className="repository-files-card">
                <div className="repository-files-header">
                  <div>
                    <h2>Files</h2>
                    <p>Files uploaded through CodeHarbor.</p>
                  </div>

                  <span className="repository-branch">main</span>
                </div>

                {filesLoading ? (
                  <div className="repository-empty-files">
                    <span className="spinner" aria-hidden="true" />
                    <p>Loading files from storage...</p>
                  </div>
                ) : filesError ? (
                  <div className="repository-empty-files">
                    <h3>Could not load files</h3>
                    <p>{filesError}</p>
                  </div>
                ) : files.length === 0 ? (
                  <div className="repository-empty-files">
                    <RepoIcon />
                    <h3>No pushed files yet</h3>
                    <p>
                      Commit and push files with the CodeHarbor CLI to see
                      them here.
                    </p>
                  </div>
                ) : (
                  <div className="repository-file-list">
                    {files.map((file) => (
                      <button
                        type="button"
                        className="repository-file-row"
                        key={file.key}
                        onClick={() => openFile(file)}
                      >
                        <span className="repository-file-icon">
                          <FileIcon />
                        </span>

                        <span className="repository-file-name">
                          {file.path}
                        </span>

                        <span className="repository-file-type">
                          {file.commitId
                            ? file.commitId.slice(0, 8)
                            : "S3"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {selectedFile && (
                <section className="repository-preview-card">
                  <div className="repository-preview-header">
                    <div>
                      <h2>{selectedFile.path}</h2>
                      <p>
                        Commit{" "}
                        {selectedFile.commitId?.slice(0, 8) || "unknown"}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="repository-preview-close"
                      onClick={() => {
                        setSelectedFile(null);
                        setFileContent("");
                        setFileError("");
                      }}
                    >
                      Close
                    </button>
                  </div>

                  {fileLoading ? (
                    <div className="repository-preview-message">
                      <span className="spinner" aria-hidden="true" />
                      Loading file...
                    </div>
                  ) : fileError ? (
                    <div className="repository-preview-message repository-preview-error">
                      {fileError}
                    </div>
                  ) : (
                    <pre className="repository-preview-code">
                      <code>{fileContent}</code>
                    </pre>
                  )}
                </section>
              )}
            </div>

            <aside className="repository-sidebar">
              <section className="repository-side-card">
                <h2>About</h2>

                <p>
                  {repository.description ||
                    "No description has been added yet."}
                </p>

                <div className="repository-side-details">
                  <div>
                    <span>Visibility</span>
                    <strong>{visibility}</strong>
                  </div>

                  <div>
                    <span>Created</span>
                    <strong>{formatDate(repository.createdAt)}</strong>
                  </div>

                  <div>
                    <span>Updated</span>
                    <strong>{formatDate(repository.updatedAt)}</strong>
                  </div>
                </div>
              </section>

              <section className="repository-side-card">
                <h2>Connect your CLI</h2>

                <p className="repository-next-step">
                  Run these commands inside the local folder you want to
                  connect to this repository.
                </p>

                <code>codeharbor init</code>

                <div className="repository-command">
                  <code>{remoteCommand}</code>

                  <button
                    type="button"
                    className="repository-copy-button"
                    onClick={handleCopyRemoteCommand}
                  >
                    {copiedCommand ? "Copied!" : "Copy"}
                  </button>
                </div>

                <p className="repository-command-hint">
                  Then stage, commit, and push your project:
                  <br />
                  <code>codeharbor add .</code>
                  <br />
                  <code>codeharbor commit -m "Initial commit"</code>
                  <br />
                  <code>codeharbor push</code>
                </p>
              </section>
            </aside>
          </section>
        </main>
      </div>
    </>
  );
};

export default RepositoryPage;