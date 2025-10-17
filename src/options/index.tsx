import ReactDOM from "react-dom/client";

function Options() {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Extension Settings</h1>
      <p>You can configure your extension here.</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<Options />);
