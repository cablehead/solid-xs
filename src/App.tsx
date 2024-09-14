import { Component, createResource, ErrorBoundary, Suspense } from "solid-js";

const fetchData = async () => {
  const response = await fetch("/api");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.text();
};

const App: Component = () => {
  const [data] = createResource(fetchData);

  return (
    <div>
      <h1>Solid App with Fetch</h1>
      <ErrorBoundary
        fallback={(err) => <p style={{ color: "red" }}>Error: {err.message}</p>}
      >
        <Suspense fallback={<p>Loading...</p>}>
          <p>Response from server: {data()}</p>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default App;
