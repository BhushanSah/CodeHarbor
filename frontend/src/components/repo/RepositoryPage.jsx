import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

const RepositoryPage = () => {
  const { id } = useParams();

  const [repository, setRepository] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchRepository = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/repo/id/${id}`
        );

        setRepository(res.data);
      } catch (err) {
        console.error("Could not fetch repository:", err);

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

  if (loading) {
    return <p>Loading repository...</p>;
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  if (!repository) {
    return <p>Repository not found.</p>;
  }

  return (
    <main>
      <Link to="/">← Back to dashboard</Link>

      <h1>{repository.name}</h1>

      <p>
        {repository.description || "No description provided."}
      </p>

      <p>Visibility: {repository.visibility}</p>

      <section>
        <h2>Files</h2>
        <p>No files loaded yet.</p>
      </section>

      <section>
        <h2>Issues</h2>
        <p>No issues loaded yet.</p>
      </section>

      <section>
        <h2>Commits</h2>
        <p>No commits loaded yet.</p>
      </section>
    </main>
  );
};

export default RepositoryPage;