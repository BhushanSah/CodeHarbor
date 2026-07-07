import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import Navbar from "../Navbar";
import "./issuesPage.css";

const OpenIssueIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="5.8" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="M8 4.5v4M8 11.2h.01"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const ClosedIssueIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="5.8" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="m5.5 8 1.6 1.6L10.7 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const formatDate = (date) => {
  if (!date) return "recently";

  try {
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "recently";
  }
};

const IssuesPage = () => {
  const { id } = useParams();

  const [repository, setRepository] = useState(null);
  const [issues, setIssues] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [creatingIssue, setCreatingIssue] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const loadIssuesPage = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const [repoResponse, issuesResponse] = await Promise.all([
          axios.get(`http://localhost:3000/repo/id/${id}`),
          axios.get(`http://localhost:3000/issue/all/${id}`),
        ]);

        setRepository(repoResponse.data);
        setIssues(issuesResponse.data.issues || []);
      } catch (err) {
        console.error(
          "Could not load issues:",
          err.response?.status,
          err.response?.data || err.message
        );

        setErrorMessage(
          err.response?.data?.error ||
            "Could not load repository issues."
        );
      } finally {
        setLoading(false);
      }
    };

    loadIssuesPage();
  }, [id]);

  const handleCreateIssue = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setFormError("Issue title is required.");
      return;
    }

    if (!description.trim()) {
      setFormError("Issue description is required.");
      return;
    }

    try {
      setCreatingIssue(true);
      setFormError("");

      const response = await axios.post(
        `http://localhost:3000/issue/createIssue/${id}`,
        {
          title,
          description,
        }
      );

      setIssues((currentIssues) => [
        response.data.issue,
        ...currentIssues,
      ]);

      setTitle("");
      setDescription("");
      setShowForm(false);
    } catch (err) {
      console.error(
        "Could not create issue:",
        err.response?.status,
        err.response?.data || err.message
      );

      setFormError(
        err.response?.data?.error ||
          "Could not create this issue."
      );
    } finally {
      setCreatingIssue(false);
    }
  };

  const updateIssueStatus = async (issueId, newStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/issue/update/${issueId}`,
        {
          status: newStatus,
        }
      );

      setIssues((currentIssues) =>
        currentIssues.map((issue) =>
          issue._id === issueId ? response.data.issue : issue
        )
      );
    } catch (err) {
      console.error(
        "Could not update issue:",
        err.response?.status,
        err.response?.data || err.message
      );

      alert(
        err.response?.data?.error ||
          "Could not update this issue."
      );
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="issues-page">
          <main className="issues-layout">
            <p className="issues-message">Loading issues...</p>
          </main>
        </div>
      </>
    );
  }

  if (errorMessage) {
    return (
      <>
        <Navbar />

        <div className="issues-page">
          <main className="issues-layout">
            <Link to={`/repo/${id}`} className="issues-back-link">
              ← Back to repository
            </Link>

            <p className="issues-message issues-message--error">
              {errorMessage}
            </p>
          </main>
        </div>
      </>
    );
  }

  const openIssueCount = issues.filter(
    (issue) => issue.status === "open"
  ).length;

  const closedIssueCount = issues.length - openIssueCount;

  return (
    <>
      <Navbar />

      <div className="issues-page">
        <main className="issues-layout">
          <Link to={`/repo/${id}`} className="issues-back-link">
            ← Back to {repository?.name || "repository"}
          </Link>

          <header className="issues-header">
            <div>
              <p className="issues-eyebrow">Repository issues</p>

              <h1>
                {repository?.name || "Repository"}{" "}
                <span>{issues.length}</span>
              </h1>

              <p>
                Track bugs, improvements, and work that needs attention.
              </p>
            </div>

            <button
              type="button"
              className="issues-new-button"
              onClick={() => {
                setShowForm((currentValue) => !currentValue);
                setFormError("");
              }}
            >
              {showForm ? "Cancel" : "New issue"}
            </button>
          </header>

          {showForm && (
            <form className="issue-form" onSubmit={handleCreateIssue}>
              <label>
                Issue title

                <input
                  type="text"
                  value={title}
                  maxLength="140"
                  placeholder="Describe the problem briefly"
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>

              <label>
                Description

                <textarea
                  value={description}
                  rows="7"
                  maxLength="10000"
                  placeholder="Explain what happened, what you expected, or what should improve."
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                />
              </label>

              {formError && (
                <p className="issue-form-error">{formError}</p>
              )}

              <div className="issue-form-actions">
                <button
                  type="button"
                  className="issue-cancel-button"
                  onClick={() => {
                    setShowForm(false);
                    setTitle("");
                    setDescription("");
                    setFormError("");
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="issues-new-button"
                  disabled={creatingIssue}
                >
                  {creatingIssue ? "Creating..." : "Create issue"}
                </button>
              </div>
            </form>
          )}

          <section className="issues-toolbar">
            <span>
              {openIssueCount} open · {closedIssueCount} closed
            </span>
          </section>

          <section className="issues-list">
            {issues.length === 0 ? (
              <div className="issues-empty">
                <OpenIssueIcon />

                <h2>No issues yet</h2>

                <p>Create the first issue for this repository.</p>
              </div>
            ) : (
              issues.map((issue) => {
                const isOpen = issue.status === "open";

                return (
                  <article className="issue-card" key={issue._id}>
                    <div
                      className={`issue-status-icon ${
                        isOpen
                          ? "issue-status-icon--open"
                          : "issue-status-icon--closed"
                      }`}
                    >
                      {isOpen ? (
                        <OpenIssueIcon />
                      ) : (
                        <ClosedIssueIcon />
                      )}
                    </div>

                    <div className="issue-content">
                      <div className="issue-title-row">
                        <h2>{issue.title}</h2>

                        <span
                          className={`issue-status issue-status--${issue.status}`}
                        >
                          {issue.status}
                        </span>
                      </div>

                      <p className="issue-description">
                        {issue.description}
                      </p>

                      <p className="issue-meta">
                        #{issue._id.slice(-6)} · created{" "}
                        {formatDate(issue.createdAt)}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="issue-status-button"
                      onClick={() =>
                        updateIssueStatus(
                          issue._id,
                          isOpen ? "closed" : "open"
                        )
                      }
                    >
                      {isOpen ? "Close" : "Reopen"}
                    </button>
                  </article>
                );
              })
            )}
          </section>
        </main>
      </div>
    </>
  );
};

export default IssuesPage;