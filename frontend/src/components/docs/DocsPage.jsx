import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Navbar";
import "./docsPage.css";

const CopyIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect
      x="5"
      y="5"
      width="8"
      height="8"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <path
      d="M11 5V3.8A1.8 1.8 0 0 0 9.2 2H3.8A1.8 1.8 0 0 0 2 3.8v5.4A1.8 1.8 0 0 0 3.8 11H5"
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

const CommandBlock = ({ command, copiedCommand, copyCommand }) => {
  return (
    <div className="docs-command">
      <code>{command}</code>

      <button type="button" onClick={() => copyCommand(command)}>
        <CopyIcon />
        {copiedCommand === command ? "Copied" : "Copy"}
      </button>
    </div>
  );
};

const DocsPage = () => {
  const [copiedCommand, setCopiedCommand] = useState("");

  const copyCommand = async (command) => {
    try {
      await navigator.clipboard.writeText(command);

      setCopiedCommand(command);

      setTimeout(() => {
        setCopiedCommand("");
      }, 1600);
    } catch (error) {
      console.error("Could not copy command:", error);
    }
  };

  return (
    <>
      <Navbar />

      <div className="docs-page">
        <main className="docs-layout">
          <section className="docs-hero">
            <Link to="/" className="new-repo-back">
              <ArrowLeftIcon />
              Back to dashboard
            </Link>

            <p className="docs-eyebrow">Documentation</p>

            <h1>CodeHarbor CLI</h1>

            <p>
              This page documents the current source-based CLI setup and the
              planned public CodeHarbor CLI workflow.
            </p>
          </section>

          <section className="docs-warning">
            <h2>Current CLI setup</h2>

            <p>
              CodeHarbor is currently installed from its source code rather
              than from npm. To use the CLI, clone the CodeHarbor repository,
              install the backend dependencies, and run <code>npm link</code>{" "}
              inside the backend folder.
            </p>

            <p>
              Running <code>npm link</code> creates the{" "}
              <code>codeharbor</code> command on your own computer and connects
              that command to your local cloned copy of CodeHarbor.
            </p>

            <p>
              Local commands such as <code>init</code>, <code>add</code>, and{" "}
              <code>commit</code> work from the project folder where you run
              them. Remote <code>push</code> and <code>pull</code> are
              currently part of the development workflow because they still
              depend on approved storage access.
            </p>
          </section>

          <section className="docs-section">
            <div className="docs-section-title">
              <span>Setup</span>

              <div>
                <h2>Install the CLI from source</h2>

                <p>
                  Clone the CodeHarbor repository, install backend
                  dependencies, and link the CLI command on your computer.
                </p>
              </div>
            </div>

            <CommandBlock
              command="git clone https://github.com/BhushanSah/CodeHarbor.git"
              copiedCommand={copiedCommand}
              copyCommand={copyCommand}
            />

            <CommandBlock
              command="cd CodeHarbor/backend"
              copiedCommand={copiedCommand}
              copyCommand={copyCommand}
            />

            <CommandBlock
              command="npm install"
              copiedCommand={copiedCommand}
              copyCommand={copyCommand}
            />

            <CommandBlock
              command="npm link"
              copiedCommand={copiedCommand}
              copyCommand={copyCommand}
            />

            <CommandBlock
              command="codeharbor --help"
              copiedCommand={copiedCommand}
              copyCommand={copyCommand}
            />
          </section>

          <section className="docs-section">
            <div className="docs-section-title">
              <span>01</span>

              <div>
                <h2>Create a repository</h2>

                <p>
                  Create a repository from the CodeHarbor website. Open its
                  repository page and copy the repository ID.
                </p>
              </div>
            </div>
          </section>

          <section className="docs-section">
            <div className="docs-section-title">
              <span>02</span>

              <div>
                <h2>Open a local project folder</h2>

                <p>
                  After linking the CLI, leave the CodeHarbor source folder and
                  open PowerShell or Terminal inside the project folder you want
                  CodeHarbor to track.
                </p>
              </div>
            </div>

            <CommandBlock
              command="cd path-to-your-project"
              copiedCommand={copiedCommand}
              copyCommand={copyCommand}
            />
          </section>

          <section className="docs-section">
            <div className="docs-section-title">
              <span>03</span>

              <div>
                <h2>Initialize and connect</h2>

                <p>
                  Initialization creates a hidden <code>.CodeHarbor</code>{" "}
                  folder. The remote command connects that local folder to a
                  repository created on the website.
                </p>
              </div>
            </div>

            <CommandBlock
              command="codeharbor init"
              copiedCommand={copiedCommand}
              copyCommand={copyCommand}
            />

            <CommandBlock
              command="codeharbor remote add origin <repository-id>"
              copiedCommand={copiedCommand}
              copyCommand={copyCommand}
            />
          </section>

          <section className="docs-section">
            <div className="docs-section-title">
              <span>Flow</span>

              <div>
                <h2>How files appear on the website</h2>

                <p>
                  The <code>codeharbor</code> command runs locally through the
                  CLI. When you run <code>codeharbor push</code>, the CLI reads
                  the repository ID saved in{" "}
                  <code>.CodeHarbor/config.json</code>, finds the local commits
                  inside <code>.CodeHarbor/commits</code>, and uploads those
                  files under that repository ID in storage. The CodeHarbor
                  website then asks the backend for files belonging to that
                  repository. The backend reads those stored files and sends
                  them back to the frontend, which is why pushed files appear
                  on the repository page.
                </p>
              </div>
            </div>
          </section>

          <section className="docs-section">
            <div className="docs-section-title">
              <span>04</span>

              <div>
                <h2>Stage, commit, and push</h2>

                <p>
                  Stage project files, create a local commit snapshot, and push
                  the snapshot to the connected CodeHarbor repository.
                </p>
              </div>
            </div>

            <CommandBlock
              command="codeharbor add ."
              copiedCommand={copiedCommand}
              copyCommand={copyCommand}
            />

            <CommandBlock
              command={'codeharbor commit -m "Initial commit"'}
              copiedCommand={copiedCommand}
              copyCommand={copyCommand}
            />

            <CommandBlock
              command="codeharbor push"
              copiedCommand={copiedCommand}
              copyCommand={copyCommand}
            />
          </section>

          <section className="docs-section">
            <div className="docs-section-title">
              <span>05</span>

              <div>
                <h2>Other commands</h2>

                <p>
                  Use these commands to retrieve or restore local commit
                  snapshots.
                </p>
              </div>
            </div>

            <div className="docs-extra-command">
              <CommandBlock
                command="codeharbor pull"
                copiedCommand={copiedCommand}
                copyCommand={copyCommand}
              />

              <p>
                Downloads stored commit snapshots into the local{" "}
                <code>.CodeHarbor/commits</code> folder.
              </p>
            </div>

            <div className="docs-extra-command">
              <CommandBlock
                command="codeharbor revert <commit-id>"
                copiedCommand={copiedCommand}
                copyCommand={copyCommand}
              />

              <p>Restores files from a previous local commit snapshot.</p>
            </div>
          </section>

          <section className="docs-section">
            <div className="docs-section-title">
              <span>Local files</span>

              <div>
                <h2>What initialization creates</h2>

                <p>
                  CodeHarbor stores local tracking data inside a hidden folder
                  in the selected project directory.
                </p>
              </div>
            </div>

            <pre className="docs-tree">{`.CodeHarbor/
    ├── config.json
    ├── staging/
    └── commits/
        └── <commit-id>/`}</pre>
          </section>

          <section className="docs-coming-soon">
            <p className="docs-eyebrow">Planned public workflow</p>

            <h2>Install and sign in from any computer</h2>

            <p>
              A future version will let users install CodeHarbor globally, sign
              in from the terminal, connect their own repositories, and push
              securely through the CodeHarbor backend.
            </p>

            <pre className="docs-future-command">{`npm install -g codeharbor-cli
                codeharbor login
                codeharbor init
                codeharbor remote add origin <repository-id>
                codeharbor add .
                codeharbor commit -m "Initial commit"
                codeharbor push`}</pre>
          </section>
        </main>
      </div>
    </>
  );
};

export default DocsPage;