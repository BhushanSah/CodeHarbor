import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../Navbar";
import "./issueDetailPage.css";

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

const IssueDetailPage = () => {
  const { id, issueId } = useParams();
  const navigate = useNavigate();

  const [repository, setRepository] = useState(null);
  const [issue, setIssue] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const loadIssuePage = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const [repositoryResponse, issueResponse] = await Promise.all([
          axios.get(`http://localhost:3000/repo/id/${id}`),
          axios.get(`http://localhost:3000/issue/${issueId}`),
        ]);

        setRepository(repositoryResponse.data);
        setIssue(issueResponse.data);

        setTitle(issueResponse.data.title || "");
        setDescription(issueResponse.data.description || "");
      } catch (err) {
        console.error(
          "Could not load issue:",
          err.response?.status,
          err.response?.data || err.message
        );

        setErrorMessage(
          err.response?.data?.error || "Could not load this issue."
        );
      } finally {
        setLoading(false);
      }
    };

    loadIssuePage();
  }, [id, issueId]);

  const updateIssue = async (updates) => {
    try {
      setSaving(true);
      setActionError("");

      const response = await axios.put(
        `http://localhost:3000/issue/update/${issueId}`,
        updates
      );

      setIssue(response.data.issue);

      setTitle(response.data.issue.title || "");
      setDescription(response.data.issue.description || "");

      return response.data.issue;
    } catch (err) {
      console.error(
        "Could not update issue:",
        err.response?.status,
        err.response?.data || err.message
      );

      setActionError(
        err.response?.data?.error || "Could not update this issue."
      );

      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setActionError("Issue title is required.");
      return;
    }

    if (!description.trim()) {
      setActionError("Issue description is required.");
      return;
    }

    const updatedIssue = await updateIssue({
      title: title.trim(),
      description: description.trim(),
    });

    if (updatedIssue) {
      setEditing(false);
    }
  };

  const handleStatusChange = async () => {
    if (!issue) return;

    const nextStatus = issue.status === "open" ? "closed" : "open";

    await updateIssue({
      status: nextStatus,
    });
  };

  const handleDelete = async () => {
    const shouldDelete = window.confirm(
      "Delete this issue permanently?"
    );

    if (!shouldDelete) return;

    try {
      setSaving(true);
      setActionError("");

      await axios.delete(
        `http://localhost:3000/issue/delete/${issueId}`
      );

      navigate(`/repo/${id}/issues`);
    } catch (err) {
      console.error(
        "Could not delete issue:",
        err.response?.status,
        err.response?.data || err.message
      );

      setActionError(
        err.response?.data?.error || "Could not delete this issue."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="issue-detail-page">
          <main className="issue-detail-layout">
            <p className="issue-detail-message">Loading issue...</p>
          </main>
        </div>
      </>
    );
  }

  if (errorMessage || !issue) {
    return (
      <>
        <Navbar />

        <div className="issue-detail-page">
          <main className="issue-detail-layout">
            <Link
              to={`/repo/${id}/issues`}
              className="issue-detail-back-link"
            >
              ← Back to issues
            </Link>

            <p className="issue-detail-message issue-detail-message--error">
              {errorMessage || "Issue not found."}
            </p>
          </main>
        </div>
      </>
    );
  }

  const isOpen = issue.status === "open";

  return (
    <>
      <Navbar />

      <div className="issue-detail-page">
        <main className="issue-detail-layout">
          <Link
            to={`/repo/${id}/issues`}
            className="issue-detail-back-link"
          >
            ← Back to {repository?.name || "repository"} issues
          </Link>

          <section className="issue-detail-header">
            <div className="issue-detail-title-area">
              <div
                className={`issue-detail-icon ${
                  isOpen
                    ? "issue-detail-icon--open"
                    : "issue-detail-icon--closed"
                }`}
              >
                {isOpen ? <OpenIssueIcon /> : <ClosedIssueIcon />}
              </div>

              <div>
                <p className="issue-detail-eyebrow">
                  Issue #{issue._id.slice(-6)}
                </p>

                <h1>{issue.title}</h1>

                <p className="issue-detail-meta">
                  Created {formatDate(issue.createdAt)} ·{" "}
                  <span
                    className={`issue-detail-status issue-detail-status--${issue.status}`}
                  >
                    {issue.status}
                  </span>
                </p>
              </div>
            </div>

            <div className="issue-detail-actions">
              <button
                type="button"
                className="issue-detail-secondary-button"
                onClick={() => {
                  setEditing((currentValue) => !currentValue);
                  setActionError("");
                }}
                disabled={saving}
              >
                {editing ? "Cancel edit" : "Edit issue"}
              </button>

              <button
                type="button"
                className="issue-detail-status-button"
                onClick={handleStatusChange}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : isOpen
                    ? "Close issue"
                    : "Reopen issue"}
              </button>
            </div>
          </section>

          {actionError && (
            <p className="issue-detail-action-error">{actionError}</p>
          )}

          {editing ? (
            <form
              className="issue-detail-edit-form"
              onSubmit={handleSaveEdit}
            >
              <label>
                Title

                <input
                  type="text"
                  value={title}
                  maxLength="140"
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>

              <label>
                Description

                <textarea
                  value={description}
                  rows="10"
                  maxLength="10000"
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                />
              </label>

              <div className="issue-detail-form-actions">
                <button
                  type="button"
                  className="issue-detail-secondary-button"
                  onClick={() => {
                    setEditing(false);
                    setTitle(issue.title || "");
                    setDescription(issue.description || "");
                    setActionError("");
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="issue-detail-status-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          ) : (
            <section className="issue-detail-body-card">
              <h2>Description</h2>

              <p>{issue.description}</p>
            </section>
          )}

          <section className="issue-detail-discussion">
            <h2>Discussion</h2>

            <p>
              Comments will be added in the next version of the Issues
              feature.
            </p>
          </section>

          <section className="issue-detail-danger-zone">
            <div>
              <h2>Delete issue</h2>

              <p>
                This permanently removes the issue from the repository.
              </p>
            </div>

            <button
              type="button"
              className="issue-detail-delete-button"
              onClick={handleDelete}
              disabled={saving}
            >
              Delete issue
            </button>
          </section>
        </main>
      </div>
    </>
  );
};

export default IssueDetailPage;