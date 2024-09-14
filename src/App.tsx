import { Component, createSignal, createEffect } from 'solid-js';

const App: Component = () => {
  const [data, setData] = createSignal<string | null>(null);
  const [error, setError] = createSignal<string | null>(null);

  createEffect(() => {
    fetch('/api')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(text => setData(text))
      .catch(err => setError(err.message));
  });

  return (
    <div>
      <h1>Solid App with Fetch</h1>
      {error() ? (
        <p style={{ color: 'red' }}>Error: {error()}</p>
      ) : data() ? (
        <p>Response from server: {data()}</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default App;
